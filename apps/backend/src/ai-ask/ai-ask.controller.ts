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
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import { JwtOptionalGuard } from '../auth/guards/jwt-optional.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

import { AiQuestionListQueryDto } from './dto/ai-question-list-query.dto';
import { CreateAiQuestionDto } from './dto/create-ai-question.dto';
import { AiAskService } from './ai-ask.service';

@ApiTags('Quizzes')
@ApiBearerAuth()
@Controller('quizzes')
export class AiAskController {
  constructor(private readonly aiAskService: AiAskService) {}

  @Get(':quizId/ai-questions')
  @UseGuards(JwtOptionalGuard)
  @ApiOperation({
    summary: 'AI 질문 목록 조회',
    description: '퀴즈별로 저장된 AI 질문/답변 목록을 최신순으로 조회한다.',
  })
  @ApiParam({ name: 'quizId', description: '퀴즈 ID', example: 101 })
  @ApiOkResponse({
    description: 'AI 질문 목록 조회 성공',
    schema: {
      example: [
        {
          id: 1,
          quizId: 101,
          question: '이 문제에서 O(1)로 풀 수 있는 이유가 뭐야?',
          answer: '해설...',
          status: 'completed',
          createdAt: '2026-01-21T13:00:00Z',
          isMine: true,
        },
      ],
    },
  })
  @ApiNotFoundResponse({ description: '퀴즈 정보를 찾을 수 없습니다.' })
  async getAiQuestions(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Query() query: AiQuestionListQueryDto,
    @Req() req: Request & { user?: JwtPayload },
  ) {
    const userId = req.user?.sub ?? null;
    return this.aiAskService.getAiQuestions(quizId, userId, query);
  }

  @Post(':quizId/ai-questions')
  @UseGuards(JwtAccessGuard)
  @ApiOperation({
    summary: 'AI 질문 생성',
    description: 'AI에게 전달할 질문을 저장하고 처리 상태를 반환한다.',
  })
  @ApiParam({ name: 'quizId', description: '퀴즈 ID', example: 101 })
  @ApiBody({ type: CreateAiQuestionDto })
  @ApiOkResponse({
    description: 'AI 질문 생성 성공',
    schema: {
      example: {
        id: 2,
        quizId: 101,
        question: '이 문제에서 O(1)로 풀 수 있는 이유가 뭐야?',
        answer: null,
        status: 'pending',
        createdAt: '2026-01-21T13:05:00Z',
        isMine: true,
      },
    },
  })
  @ApiBadRequestResponse({ description: '질문 내용이 비어 있습니다.' })
  @ApiNotFoundResponse({ description: '퀴즈 정보를 찾을 수 없습니다.' })
  async createAiQuestion(
    @Param('quizId', ParseIntPipe) quizId: number,
    @Body() dto: CreateAiQuestionDto,
    @Req() req: Request & { user?: JwtPayload },
  ) {
    const userId = req.user?.sub;
    if (userId === undefined || userId === null) {
      throw new Error('사용자 정보를 확인할 수 없습니다.');
    }

    return this.aiAskService.createAiQuestion(quizId, userId, dto);
  }
}
