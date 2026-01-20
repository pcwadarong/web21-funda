import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
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

    return this.userRepository
      .createQueryBuilder('user')
      .where('user.currentStreak = :streak', { streak: 0 })
      .andWhere('user.isEmailSubscribed = :subscribed', { subscribed: true })
      .andWhere('user.email IS NOT NULL')
      .andWhere('user.createdAt <= :fiveDaysAgo', { fiveDaysAgo })
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
    const unsubscribeLink = `${clientOrigin}/unsubscribe?email=${encodeURIComponent(user.email!)}`;

    return {
      subject: randomSubjectFn!(name),
      html: getRemindMailHtml(name, randomContent!, quizLink, unsubscribeLink),
    };
  }
}
