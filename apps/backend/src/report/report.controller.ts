import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';

import { CreateReportDto } from './dto/create-report.dto';
import { ReportService } from './report.service';

@ApiTags('Quizzes')
@Controller('quizzes')
export class ReportController {
  constructor(private readonly service: ReportService) {}

  @Post(':quizId/reports')
  @ApiOperation({
    summary: '퀴즈 신고 제출',
    description: '문제가 있는 퀴즈에 대해 제공된 옵션 중 하나를 선택하여 신고를 접수합니다.',
  })
  @ApiParam({
    name: 'quizId',
    description: '신고할 퀴즈의 ID',
    example: 1,
  })
  @ApiBody({
    type: CreateReportDto,
    examples: {
      '복수 선택 케이스': {
        value: { report_description: '문제/해설에 오타가 있어요, 정답이 잘못된 것 같아요' },
        description: '여러 사유를 쉼표로 구분하여 보낼 때',
      },
      '단일 선택 케이스': {
        value: { report_description: '문제/해설에 오타가 있어요' },
        description: '하나의 사유만 보낼 때',
      },
    },
  })
  @ApiCreatedResponse({
    description: '신고가 성공적으로 접수됨',
    schema: {
      example: {
        id: 1,
        quizId: 10,
        report_description: '문제/해설에 오타가 있어요',
        createdAt: '2026-01-21T13:00:00Z',
      },
    },
  })
  @ApiNotFoundResponse({
    description: '해당 ID의 퀴즈를 찾을 수 없음',
  })
  @ApiBadRequestResponse({
    description: '잘못된 요청 데이터 (사유 누락 등)',
  })
  @ApiInternalServerErrorResponse({
    description: '서버 내부 오류',
  })
  async create(@Param('quizId', ParseIntPipe) quizId: number, @Body() dto: CreateReportDto) {
    const saved = await this.service.create(quizId, dto.report_description);
    return saved;
  }
}
