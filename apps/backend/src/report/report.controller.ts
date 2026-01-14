import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';

import { CreateReportDto } from './dto/create-report.dto';
import { ReportService } from './report.service';

@Controller('quizzes')
export class ReportController {
  constructor(private readonly service: ReportService) {}

  @Post(':quizId/reports')
  async create(@Param('quizId', ParseIntPipe) quizId: number, @Body() dto: CreateReportDto) {
    const saved = await this.service.create(quizId, dto.report_description);
    return saved;
  }
}
