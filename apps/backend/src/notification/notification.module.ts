import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities';

import { NotificationService } from './notification.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [NotificationService],
})
export class NotificationModule {}
