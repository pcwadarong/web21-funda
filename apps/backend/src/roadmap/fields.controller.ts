import { Controller, Get, Param } from '@nestjs/common';

import type { FieldUnitsResponse } from './dto/field-units.dto';
import { RoadmapService } from './roadmap.service';

@Controller('fields')
export class FieldsController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get(':fieldSlug/units')
  async getUnitsByFieldSlug(@Param('fieldSlug') fieldSlug: string): Promise<FieldUnitsResponse> {
    return this.roadmapService.getUnitsByFieldSlug(fieldSlug);
  }
}
