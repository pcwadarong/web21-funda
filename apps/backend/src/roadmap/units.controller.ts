import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

import type { UnitOverviewResponse } from './dto/unit-overview.dto';
import { UpdateUnitOverviewDto } from './dto/unit-overview.dto';
import { RoadmapService } from './roadmap.service';

@ApiTags('Units')
@Controller('units')
export class UnitsController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get(':unitId/overview')
  @ApiOperation({
    summary: '유닛 개요 조회',
    description: '유닛 ID에 해당하는 개요(마크다운)를 반환한다.',
  })
  @ApiParam({ name: 'unitId', description: '유닛 ID', example: 1 })
  async getUnitOverview(
    @Param('unitId', ParseIntPipe) unitId: number,
  ): Promise<UnitOverviewResponse> {
    return this.roadmapService.getUnitOverview(unitId);
  }

  @Put(':unitId/overview')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '유닛 개요 수정',
    description: '유닛 ID에 해당하는 개요(마크다운)를 수정한다.',
  })
  @ApiParam({ name: 'unitId', description: '유닛 ID', example: 1 })
  @ApiBody({ type: UpdateUnitOverviewDto })
  @UseGuards(JwtAccessGuard, AdminGuard)
  async updateUnitOverview(
    @Param('unitId', ParseIntPipe) unitId: number,
    @Body() dto: UpdateUnitOverviewDto,
  ): Promise<UnitOverviewResponse> {
    return this.roadmapService.updateUnitOverview(unitId, dto.overview);
  }

  @Delete(':unitId/overview')
  @ApiBearerAuth('accessToken')
  @ApiOperation({
    summary: '유닛 개요 삭제',
    description: '유닛 ID에 해당하는 개요를 삭제한다.',
  })
  @ApiParam({ name: 'unitId', description: '유닛 ID', example: 1 })
  @UseGuards(JwtAccessGuard, AdminGuard)
  async deleteUnitOverview(
    @Param('unitId', ParseIntPipe) unitId: number,
  ): Promise<UnitOverviewResponse> {
    return this.roadmapService.updateUnitOverview(unitId, null);
  }
}
