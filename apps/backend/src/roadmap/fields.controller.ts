import { Controller, Get, Param } from '@nestjs/common';

import type { FieldListResponse } from './dto/field-list.dto';
import type { FieldRoadmapResponse } from './dto/field-roadmap.dto';
import type { FieldUnitsResponse } from './dto/field-units.dto';
import type { FirstUnitResponse } from './dto/first-unit.dto';
import { RoadmapService } from './roadmap.service';

@Controller('fields')
export class FieldsController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get()
  async getFields(): Promise<FieldListResponse> {
    return this.roadmapService.getFields();
  }

  @Get(':fieldSlug/units')
  async getUnitsByFieldSlug(@Param('fieldSlug') fieldSlug: string): Promise<FieldUnitsResponse> {
    return this.roadmapService.getUnitsByFieldSlug(fieldSlug);
  }

  @Get(':fieldSlug/roadmap')
  async getRoadmapByFieldSlug(
    @Param('fieldSlug') fieldSlug: string,
  ): Promise<FieldRoadmapResponse> {
    return this.roadmapService.getRoadmapByFieldSlug(fieldSlug);
  }

  @Get(':fieldSlug/units/first')
  async getFirstUnitByFieldSlug(@Param('fieldSlug') fieldSlug: string): Promise<FirstUnitResponse> {
    return this.roadmapService.getFirstUnitByFieldSlug(fieldSlug);
  }
}
