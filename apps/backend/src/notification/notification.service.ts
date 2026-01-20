import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/entities';
import { Brackets, Repository } from 'typeorm';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

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
      await this.sendMail(user);

      // 초당 5통 제한을 위해 각 발송 사이에 200ms 대기
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  private async sendMail(user: User) {
    try {
      // TODO: 실제 서비스 호출
      console.log(`Sending mail to ${user.email}`);

      // 발송 성공 후 기록 업데이트
      await this.userRepository.update(user.id, {
        lastRemindEmailSentAt: new Date(),
      });
    } catch (error) {
      console.error(`Failed to send mail to ${user.id}:`, error);
    }
  }
}
