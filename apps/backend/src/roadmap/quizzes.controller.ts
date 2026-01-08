import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';

import type { QuizSubmissionRequest, QuizSubmissionResponse } from './dto/quiz-submission.dto';
import { RoadmapService } from './roadmap.service';

@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Post(':quizId/submissions')
  async submitQuiz(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Body() payload: QuizSubmissionRequest,
  ): Promise<QuizSubmissionResponse> {
    return this.roadmapService.submitQuiz(quizId, payload);
  }
}
