import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import { User } from 'src/users/entities';
import { Brackets, Repository } from 'typeorm';

import { getRemindMailHtml, REMIND_MAIL_VARIANTS } from './constants/mail-templates';

/**
 * 유저 알림 관련 비즈니스 로직을 처리하는 서비스입니다.
 */
@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
    });
  }

  /**
   * 매일 새벽 2시, 가입 후 활동이 없는 유저에게 리마인드 메일을 발송하는 배치 작업입니다.
   * 가입 5일 경과, 스트릭 0, 이메일 수신 동의 유저를 대상으로 이틀 간격 발송합니다.
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM, {
    timeZone: 'Asia/Seoul',
  })
  async handleStreakRemindBatch(): Promise<void> {
    try {
      const targets = await this.fetchTargetUsers();

      for (const user of targets) {
        await this.sendRemindMail(user);
        // 초당 발송 제한을 위해 200ms 대기 (초당 최대 5통)
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    } catch (error: unknown) {
      this.logger.error(
        'Failed to execute streak reminder batch',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  /**
   * 배송 대상 유저를 DB에서 조회합니다.
   * @private
   */
  private async fetchTargetUsers(): Promise<User[]> {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    return this.userRepository
      .createQueryBuilder('user')
      .where('user.currentStreak = :streak', { streak: 0 })
      .andWhere('user.isEmailSubscribed = :subscribed', { subscribed: true })
      .andWhere('user.email IS NOT NULL')
      .andWhere('user.createdAt <= :fiveDaysAgo', { fiveDaysAgo })
      .andWhere('user.lastLoginAt >= :fourteenDaysAgo', { fourteenDaysAgo })
      .andWhere(
        new Brackets(qb => {
          qb.where('user.lastRemindEmailSentAt IS NULL').orWhere(
            'user.lastRemindEmailSentAt <= :twoDaysAgo',
            { twoDaysAgo },
          );
        }),
      )
      .getMany();
  }

  /**
   * 단일 유저에게 개인화된 리마인드 메일을 발송합니다.
   * @param user 발송 대상 유저 객체
   * @private
   */
  private async sendRemindMail(user: User): Promise<void> {
    if (!user.email) return;

    try {
      const { subject, html } = this.generateMailContent(user);

      await this.transporter.sendMail({
        from: `"Funda" <${this.configService.get('MAIL_USER')}>`,
        to: user.email,
        subject,
        html,
      });

      await this.userRepository.update(user.id, {
        lastRemindEmailSentAt: new Date(),
      });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      this.logger.error(`Failed to send mail to User(${user.id}): ${message}`);
    }
  }

  /**
   * 랜덤하게 제목과 내용을 선택하여 개인화된 메일 컨텐츠를 생성합니다.
   * @param user 유저 정보
   * @private
   */
  private generateMailContent(user: User): { subject: string; html: string } {
    const clientOrigin = this.configService.get<string>('CLIENT_ORIGIN') ?? '';
    const name = user.displayName || '회원';

    // 무작위로 제목과 내용 선택
    const randomSubjectFn =
      REMIND_MAIL_VARIANTS.SUBJECTS[
        Math.floor(Math.random() * REMIND_MAIL_VARIANTS.SUBJECTS.length)
      ];
    const randomContent =
      REMIND_MAIL_VARIANTS.CONTENTS[
        Math.floor(Math.random() * REMIND_MAIL_VARIANTS.CONTENTS.length)
      ];

    const quizLink = `${clientOrigin}/quiz`;
    const unsubscribeToken = this.generateUnsubscribeToken(user.email!);
    const unsubscribeLink = `${clientOrigin}/unsubscribe?email=${encodeURIComponent(user.email!)}&token=${encodeURIComponent(unsubscribeToken)}`;

    return {
      subject: randomSubjectFn!(name),
      html: getRemindMailHtml(name, randomContent!, quizLink, unsubscribeLink),
    };
  }

  /**
   * 구독 해지를 위한 일회용 토큰을 생성합니다.
   * @param email 유저 이메일 주소
   * @returns JWT 토큰 문자열
   */
  generateUnsubscribeToken(email: string): string {
    const secret = this.configService.get<string>('JWT_ACCESS_SECRET', 'local-access-secret');
    const payload = {
      email,
      type: 'unsubscribe',
    };
    // 토큰은 7일간 유효
    return this.jwtService.sign(payload, {
      secret,
      expiresIn: '7d',
    });
  }

  /**
   * 구독 해지 토큰을 검증합니다.
   * @param token 검증할 토큰
   * @param email 검증할 이메일 주소
   * @throws UnauthorizedException 토큰이 유효하지 않거나 이메일이 일치하지 않는 경우
   */
  async verifyUnsubscribeToken(token: string, email: string): Promise<void> {
    try {
      const secret = this.configService.get<string>('JWT_ACCESS_SECRET', 'local-access-secret');
      const payload = this.jwtService.verify<{ email: string; type: string }>(token, {
        secret,
      });

      if (payload.type !== 'unsubscribe') throw new UnauthorizedException('Invalid token type');
      if (payload.email !== email) throw new UnauthorizedException('Email mismatch');
    } catch (error) {
      if (error instanceof UnauthorizedException) throw error;

      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  /**
   * 특정 이메일을 가진 유저의 구독을 해지합니다.
   * @param email 구독 해지할 이메일 주소
   */
  async unsubscribeUser(email: string): Promise<void> {
    await this.userRepository.update(
      { email }, // 조건: 해당 이메일을 가진 유저
      { isEmailSubscribed: false }, // 변경할 내용
    );
    this.logger.log('User unsubscribed via email-based request.');
  }
}
