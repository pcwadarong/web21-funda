import { BadRequestException, Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

import { RankingTierName } from './entities/ranking-tier.enum';
import { RankingQueryService } from './ranking-query.service';

@ApiTags('Admin')
@ApiBearerAuth('accessToken')
@Controller('admin/ranking')
@UseGuards(JwtAccessGuard, AdminGuard)
export class AdminRankingController {
  constructor(private readonly rankingQueryService: RankingQueryService) {}

  @Get('weekly')
  @ApiOperation({
    summary: '관리자 주간 랭킹 조회',
    description: '티어/그룹 기준으로 주간 랭킹을 조회한다.',
  })
  @ApiOkResponse({
    description: '관리자 주간 랭킹 조회 성공',
  })
  async getWeeklyRankingByGroup(
    @Query('tierName') tierNameRaw?: string,
    @Query('groupIndex') groupIndexRaw?: string,
    @Query('weekKey') weekKey?: string,
  ) {
    if (!tierNameRaw || !groupIndexRaw) {
      throw new BadRequestException('tierName과 groupIndex는 필수입니다.');
    }

    const groupIndex = Number(groupIndexRaw);

    if (!Number.isInteger(groupIndex) || groupIndex <= 0) {
      throw new BadRequestException('groupIndex 형식이 올바르지 않습니다.');
    }

    if (weekKey && !this.isValidWeekKey(weekKey)) {
      throw new BadRequestException('weekKey 형식이 올바르지 않습니다.');
    }

    const tierName = this.parseTierName(tierNameRaw);
    const result = await this.rankingQueryService.getWeeklyRankingByTierName(
      tierName,
      groupIndex,
      weekKey ?? null,
    );

    return {
      result,
      message: '관리자 주간 랭킹을 조회했습니다.',
    };
  }

  private isValidWeekKey(weekKey: string): boolean {
    // 주차 키 포맷을 제한해 잘못된 조회를 미리 차단한다.
    return /^\d{4}-\d{2}$/.test(weekKey);
  }

  private parseTierName(tierNameRaw: string): RankingTierName {
    const candidates = Object.values(RankingTierName);
    const normalized = tierNameRaw.trim().toUpperCase();
    const matched = candidates.find(value => value === normalized);

    if (!matched) {
      throw new BadRequestException('tierName 형식이 올바르지 않습니다.');
    }

    return matched as RankingTierName;
  }
}
