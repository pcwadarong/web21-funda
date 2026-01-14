import { Body, Controller, Param, ParseIntPipe, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

import { ProgressService } from './progress.service';

@ApiTags('Progress')
@ApiBearerAuth()
@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('steps/:stepId/start')
  @ApiOperation({
    summary: '스텝 풀이 시작',
    description:
      '스텝 시도 정보를 생성한다. 인증된 사용자 기준으로 서버가 attemptNo/총 퀴즈 수를 채워 반환한다.',
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
  @UseGuards(JwtAccessGuard)
  async startStep(
    @Param('stepId', ParseIntPipe) stepId: number,
    @Req() req: Request & { user?: JwtPayload },
  ) {
    const userId = req.user?.sub;
    if (userId === undefined || userId === null) {
      throw new Error('사용자 정보를 확인할 수 없습니다.');
    }

    const attempt = await this.progressService.startStepAttempt({
      userId,
      stepId,
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
  @ApiBody({
    description: '옵션: 완료 처리할 stepAttemptId (없으면 최신 진행 중 시도 사용)',
    schema: {
      type: 'object',
      properties: {
        stepAttemptId: {
          type: 'integer',
          example: 12,
          description: '명시적으로 완료할 스텝 시도 ID',
        },
      },
      required: [],
    },
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
  @UseGuards(JwtAccessGuard)
  async completeStep(
    @Param('stepId', ParseIntPipe) stepId: number,
    @Body() body: { stepAttemptId?: number },
    @Req() req: Request & { user?: JwtPayload },
  ) {
    const userId = req.user?.sub;
    if (userId === undefined || userId === null) {
      throw new Error('사용자 정보를 확인할 수 없습니다.');
    }

    const completion = await this.progressService.completeStepAttempt({
      userId,
      stepId,
      stepAttemptId: body.stepAttemptId,
    });

    return {
      result: completion,
      message: '스텝 풀이를 완료했습니다.',
    };
  }
}
