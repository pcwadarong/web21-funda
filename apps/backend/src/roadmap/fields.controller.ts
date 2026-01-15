import { Controller, Get, Param, Req, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';

import { OptionalJwtAccessGuard } from '../auth/guards/optional-jwt-access.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';

import type { FieldListResponse } from './dto/field-list.dto';
import type { FieldRoadmapResponse } from './dto/field-roadmap.dto';
import type { FieldUnitsResponse } from './dto/field-units.dto';
import type { FirstUnitResponse } from './dto/first-unit.dto';
import { RoadmapService } from './roadmap.service';

@ApiTags('Fields')
@Controller('fields')
export class FieldsController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get()
  @ApiOperation({ summary: '분야 목록 조회', description: '전체 분야 리스트를 반환한다.' })
  async getFields(): Promise<FieldListResponse> {
    return this.roadmapService.getFields();
  }

  @Get(':fieldSlug/units')
  @ApiOperation({
    summary: '필드별 유닛/스텝 조회',
    description: '필드에 속한 유닛과 스텝 정보를 반환한다.',
  })
  @ApiParam({ name: 'fieldSlug', description: '필드 슬러그', example: 'fe' })
  @UseGuards(OptionalJwtAccessGuard)
  async getUnitsByFieldSlug(
    @Param('fieldSlug') fieldSlug: string,
    @Req() req: Request & { user?: JwtPayload },
  ): Promise<FieldUnitsResponse> {
    const userId = req.user?.sub ?? null;
    return this.roadmapService.getUnitsByFieldSlug(fieldSlug, userId);
  }

  @Get(':fieldSlug/roadmap')
  @ApiOperation({
    summary: '필드별 로드맵(유닛) 조회',
    description: '필드에 속한 유닛 목록만 반환한다.',
  })
  @ApiParam({ name: 'fieldSlug', description: '필드 슬러그', example: 'fe' })
  @UseGuards(OptionalJwtAccessGuard)
  async getRoadmapByFieldSlug(
    @Param('fieldSlug') fieldSlug: string,
    @Req() req: Request & { user?: JwtPayload },
  ): Promise<FieldRoadmapResponse> {
    const userId = req.user?.sub ?? null;
    return this.roadmapService.getRoadmapByFieldSlug(fieldSlug, userId);
  }

  @Get(':fieldSlug/units/first')
  @ApiOperation({
    summary: '필드 첫 유닛 조회',
    description: '필드의 첫 번째 유닛과 스텝 정보를 반환한다.',
  })
  @ApiParam({ name: 'fieldSlug', description: '필드 슬러그', example: 'fe' })
  async getFirstUnitByFieldSlug(@Param('fieldSlug') fieldSlug: string): Promise<FirstUnitResponse> {
    return this.roadmapService.getFirstUnitByFieldSlug(fieldSlug);
  }
}
