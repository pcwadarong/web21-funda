import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import { User } from 'src/users/entities';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  private transporter: nodemailer.Transporter;

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

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async handleStreakRemindBatch() {
    const fiveDaysAgo = new Date();
    fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

    const twoDaysAgo = new Date();
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    // 가입 5일 경과 & streak 0 & 수신동의 & (메일 보낸 적 없거나 2일 경과)
    const targets = await this.userRepository
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

    // 순차 발송 (초당 발송 제한)
    for (const user of targets) {
      await this.sendCustomMail(user);

      // 초당 5통 제한을 위해 각 발송 사이에 200ms 대기
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  private async sendCustomMail(user: User) {
    try {
      // 수신 거부 링크
      const unsubscribeLink = `${process.env.CLIENT_ORIGIN}/unsubscribe?email=${user.email}`; //TODO: 암호화

      await this.transporter.sendMail({
        from: `"Funda" <${this.configService.get('MAIL_USER')}>`,
        to: user.email!,
        subject: `${user.displayName || '회원'}님, 오늘 퀴즈 한 번 풀어볼까요? 🔥`,
        html: `
         <div style="font-family: sans-serif; text-align: center;">
            <h2>안녕하세요, ${user.displayName}님!</h2>
            <p>혹시 어려운 점이 있으셨나요?</p>
            <p>오늘 단 하나의 퀴즈만 풀어도 <b>연속 1일차</b>가 시작됩니다!</p>
            <div style="margin: 30px 0;">
              <a href="${process.env.CLIENT_ORIGIN}/quiz" 
                 style="background: #6559EA; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
                 지금 바로 퀴즈 풀기
              </a>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;">
            <p style="font-size: 12px; color: #999;">
              본 메일은 수신 동의를 하신 분들께 발송됩니다. <br>
              더 이상 알림을 원하지 않으시면 <a href="${unsubscribeLink}">수신 거부</a>를 눌러주세요.
            </p>
          </div>
          `,
      });

      await this.userRepository.update(user.id, {
        lastRemindEmailSentAt: new Date(),
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Failed to send mail to ${user.id}: ${errorMessage}`);
    }
  }
}
