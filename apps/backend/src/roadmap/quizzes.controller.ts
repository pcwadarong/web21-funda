import { Body, Controller, Param, ParseIntPipe, Post, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import type { JwtPayload } from '../auth/types/jwt-payload.type';

import type { QuizSubmissionRequest, QuizSubmissionResponse } from './dto/quiz-submission.dto';
import { RoadmapService } from './roadmap.service';

@ApiTags('Quizzes')
@ApiBearerAuth()
@Controller('quizzes')
export class QuizzesController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Post(':quizId/submissions')
  @ApiOperation({
    summary: '퀴즈 정답 제출',
    description: '퀴즈 정답을 제출하고 채점 결과를 반환한다. 로그인 사용자는 풀이 기록이 저장된다.',
  })
  @ApiParam({ name: 'quizId', description: '퀴즈 ID', example: 101 })
  @ApiBody({
    description: '제출 답안',
    examples: {
      mcq: {
        summary: '객관식/코드',
        value: {
          type: 'MCQ',
          selection: { option_id: 'c1' },
        },
      },
      matching: {
        summary: '매칭',
        value: {
          type: 'MATCHING',
          selection: {
            pairs: [{ left: '<header>', right: '문서/섹션의 머리글 영역' }],
          },
        },
      },
    },
  })
  async submitQuiz(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Body() payload: QuizSubmissionRequest,
    @Req() req: Request & { user?: JwtPayload },
  ): Promise<QuizSubmissionResponse> {
    return this.roadmapService.submitQuiz(quizId, payload, req.user?.sub ?? null);
  }
}
