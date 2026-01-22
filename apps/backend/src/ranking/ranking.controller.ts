import { BadRequestException, Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

import { RankingQueryService } from './ranking-query.service';

@ApiTags('Ranking')
@ApiBearerAuth()
@Controller('ranking')
export class RankingController {
  constructor(private readonly rankingQueryService: RankingQueryService) {}

  @Get('me')
  @ApiOperation({
    summary: '내 티어 조회',
    description: '현재 사용자 기준으로 티어 정보를 반환한다.',
  })
  @ApiOkResponse({
    description: '내 티어 조회 성공',
  })
  @UseGuards(JwtAccessGuard)
  async getMyTier(@Req() req: Request & { user?: JwtPayload }) {
    const userId = req.user?.sub;
    if (userId === undefined || userId === null) {
      throw new Error('사용자 정보를 확인할 수 없습니다.');
    }

    const result = await this.rankingQueryService.getMyTier(userId);

    return {
      result,
      message: '내 티어 정보를 조회했습니다.',
    };
  }

  @Get('weekly')
  @ApiOperation({
    summary: '주간 랭킹 조회',
    description: '사용자가 속한 경쟁 그룹 기준으로 주간 랭킹을 반환한다.',
  })
  @ApiOkResponse({
    description: '주간 랭킹 조회 성공',
  })
  @UseGuards(JwtAccessGuard)
  async getWeeklyRanking(
    @Req() req: Request & { user?: JwtPayload },
    @Query('weekKey') weekKey?: string,
  ) {
    const userId = req.user?.sub;
    if (userId === undefined || userId === null) {
      throw new Error('사용자 정보를 확인할 수 없습니다.');
    }

    if (weekKey && !this.isValidWeekKey(weekKey)) {
      throw new BadRequestException('weekKey 형식이 올바르지 않습니다.');
    }

    const result = await this.rankingQueryService.getWeeklyRanking(userId, weekKey ?? null);

    return {
      result,
      message: '주간 랭킹을 조회했습니다.',
    };
  }

  private isValidWeekKey(weekKey: string): boolean {
    // 주차 키 포맷을 제한해 잘못된 조회를 미리 차단한다.
    return /^\d{4}-\d{2}$/.test(weekKey);
  }
}
