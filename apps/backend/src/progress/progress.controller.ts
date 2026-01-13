import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { CompleteStepAttemptDto } from './dto/complete-step-attempt.dto';
import { StartStepAttemptDto } from './dto/start-step-attempt.dto';
import { ProgressService } from './progress.service';

@ApiTags('Progress')
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('steps/:stepId/start')
  @ApiOperation({
    summary: '스텝 풀이 시작',
    description:
      '스텝 시도 정보를 생성한다. FE는 stepId와 userId, startedAt(옵션)을 전달하면 서버가 attemptNo/총 퀴즈 수를 채워 반환한다.',
  })
  @ApiOkResponse({
    description: '스텝 시도 생성 성공',
    schema: {
      example: {
        success: true,
        code: 200,
        message: '스텝 풀이를 시작했습니다.',
        result: {
          stepAttemptId: 10,
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: '스텝 정보를 찾을 수 없습니다.' })
  async startStep(
    @Param('stepId', ParseIntPipe) stepId: number,
    @Body() body: StartStepAttemptDto,
  ) {
    const attempt = await this.progressService.startStepAttempt({
      userId: body.userId,
      stepId,
      startedAt: body.startedAt,
    });

    return {
      result: {
        stepAttemptId: attempt.id,
      },
      message: '스텝 풀이를 시작했습니다.',
    };
  }

  @Post('steps/:stepId/complete')
  @ApiOperation({
    summary: '스텝 풀이 완료',
    description:
      '진행 중인 시도(in_progress)를 완료 상태로 변경하고 점수/XP/성공률/소요 시간을 계산해 반환한다.',
  })
  @ApiOkResponse({
    description: '스텝 풀이 완료',
    schema: {
      example: {
        success: true,
        code: 200,
        message: '스텝 풀이를 완료했습니다.',
        result: {
          score: 9,
          experience: 9,
          correctCount: 2,
          totalQuizzes: 4,
          answeredQuizzes: 3,
          successRate: 50,
          durationSeconds: 120,
          firstSolve: false,
        },
      },
    },
  })
  @ApiBadRequestResponse({ description: '진행 중인 스텝 시도를 찾을 수 없습니다.' })
  @ApiNotFoundResponse({ description: '스텝 정보를 찾을 수 없습니다.' })
  async completeStep(
    @Param('stepId', ParseIntPipe) stepId: number,
    @Body() body: CompleteStepAttemptDto,
  ) {
    const completion = await this.progressService.completeStepAttempt({
      userId: body.userId,
      stepId,
      finishedAt: body.finishedAt,
    });

    return {
      result: completion,
      message: '스텝 풀이를 완료했습니다.',
    };
  }
}
