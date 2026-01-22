import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Quiz } from '../roadmap/entities/quiz.entity';

import { AiAskController } from './ai-ask.controller';
import { AiAskService } from './ai-ask.service';
import { AiQuestionAnswer } from './entities/ai-question-answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AiQuestionAnswer, Quiz])],
  controllers: [AiAskController],
  providers: [AiAskService],
})
export class AiAskModule {}
