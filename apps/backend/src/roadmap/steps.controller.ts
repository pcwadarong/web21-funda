import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

import type { QuizResponse } from './dto/quiz-list.dto';
import { RoadmapService } from './roadmap.service';

@Controller('steps')
export class StepsController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get(':stepId/quizzes')
  async getQuizzesByStepId(@Param('stepId', ParseIntPipe) stepId: number): Promise<QuizResponse[]> {
    return this.roadmapService.getQuizzesByStepId(stepId);
  }
}
