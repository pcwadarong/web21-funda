import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Quiz } from '../roadmap/entities/quiz.entity';

import { AiQuestionAnswer } from './entities/ai-question-answer.entity';
import { AiAskController } from './ai-ask.controller';
import { AiAskService } from './ai-ask.service';
import { AiAskClovaService } from './ai-ask-clova.service';

@Module({
  imports: [TypeOrmModule.forFeature([AiQuestionAnswer, Quiz])],
  controllers: [AiAskController],
  providers: [AiAskService, AiAskClovaService],
})
export class AiAskModule {}
