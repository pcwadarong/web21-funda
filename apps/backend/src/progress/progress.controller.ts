import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import type { Request } from 'express';

import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { RedisService } from '../common/redis/redis.service';
import type { QuizResponse } from '../roadmap/dto/quiz-list.dto';

import { ProgressService } from './progress.service';

const REVIEW_QUEUE_LIMIT_MAX = 10;

class SyncStepHistoryDto {
  @IsArray()
  @IsInt({ each: true })
  stepIds!: number[];
}

class ReviewQueueQueryDto {
  @IsOptional()
  @IsString()
  fieldSlug?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(REVIEW_QUEUE_LIMIT_MAX)
  limit?: number;
}

@ApiTags('Progress')
@ApiBearerAuth()
@Controller('progress')
export class ProgressController {
  constructor(
    private readonly progressService: ProgressService,
    private readonly redisService: RedisService,
  ) {}

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

  @Post('steps/sync')
  @ApiOperation({
    summary: '비로그인 풀이 기록 동기화',
    description: '비로그인 상태에서 localStorage에 저장된 step 풀이 기록을 DB에 동기화한다.',
  })
  @ApiBody({
    description: '동기화할 step ID 목록',
    schema: {
      type: 'object',
      properties: {
        stepIds: {
          type: 'array',
          items: { type: 'integer' },
          example: [1, 2, 3],
        },
      },
      required: ['stepIds'],
    },
  })
  @ApiOkResponse({
    description: '동기화 완료',
    schema: {
      example: {
        success: true,
        code: 200,
        message: '풀이 기록을 동기화했습니다.',
        result: {
          syncedCount: 3,
        },
      },
    },
  })
  @UseGuards(JwtAccessGuard)
  async syncStepHistory(
    @Body() body: SyncStepHistoryDto,
    @Req() req: Request & { user?: JwtPayload },
  ) {
    const userId = req.user?.sub;
    if (userId === undefined || userId === null) {
      throw new Error('사용자 정보를 확인할 수 없습니다.');
    }

    const result = await this.progressService.syncStepStatuses(userId, body.stepIds);

    return {
      result,
      message: '풀이 기록을 동기화했습니다.',
    };
  }

  @Post('steps/:stepId/complete-guest')
  @ApiOperation({
    summary: '비로그인 사용자 스텝 완료',
    description: '비로그인 사용자가 스텝을 완료하면 step_id를 Redis에 저장한다.',
  })
  @ApiOkResponse({
    description: '스텝 완료 저장',
    schema: {
      example: {
        success: true,
      },
    },
  })
  async completeGuestStep(
    @Param('stepId', ParseIntPipe) stepId: number,
    @Req() req: Request & { cookies?: Record<string, string> },
  ) {
    const clientId = req.cookies?.client_id;
    if (!clientId) {
      return { success: false };
    }

    // Redis에서 기존 step_ids 조회
    const currentStepsData = await this.redisService.get(`step_ids:${clientId}`);
    const stepIds = currentStepsData ? (currentStepsData as number[]) : [];

    // 중복 확인 후 추가
    if (!stepIds.includes(stepId)) {
      stepIds.push(stepId);
    }

    // Redis에 저장 (30일 TTL)
    await this.redisService.set(`step_ids:${clientId}`, stepIds, 30 * 24 * 60 * 60);

    return { success: true };
  }

  @Get('reviews')
  @ApiOperation({
    summary: '복습 노트 대상 퀴즈 조회',
    description: '사용자의 복습 대상 퀴즈 목록을 조회한다.',
  })
  @ApiQuery({
    name: 'fieldSlug',
    required: false,
    description: '복습 퀴즈를 필드 기준으로 조회할 때 사용한다.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: `복습 퀴즈 최대 반환 개수(최대 ${REVIEW_QUEUE_LIMIT_MAX}개).`,
  })
  @ApiOkResponse({
    description: '복습 노트 조회 성공',
    schema: {
      example: {
        success: true,
        code: 200,
        result: [
          {
            id: 101,
            type: 'MCQ',
            content: {
              question: 'HTML 문서 상단의 <!DOCTYPE html> 선언의 가장 핵심적인 목적은?',
              options: [
                { id: 'c1', text: '문서의 제목을 자동 생성한다' },
                { id: 'c2', text: '문서의 언어를 지정한다' },
              ],
            },
          },
        ],
      },
    },
  })
  @UseGuards(JwtAccessGuard)
  async getReviewQueue(
    @Req() req: Request & { user?: JwtPayload },
    @Query() query: ReviewQueueQueryDto,
  ): Promise<QuizResponse[]> {
    const userId = req.user?.sub;
    if (userId === undefined || userId === null) {
      throw new Error('사용자 정보를 확인할 수 없습니다.');
    }

    return this.progressService.getReviewQueue(userId, {
      fieldSlug: query.fieldSlug,
      limit: query.limit,
    });
  }
}
