import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';

import type { QuizResponse } from './dto/quiz-list.dto';
import { RoadmapService } from './roadmap.service';

@ApiTags('Steps')
@Controller('steps')
export class StepsController {
  constructor(private readonly roadmapService: RoadmapService) {}

  @Get(':stepId/quizzes')
  @ApiOperation({
    summary: '스텝별 퀴즈 목록 조회',
    description: '스텝 ID에 해당하는 퀴즈 목록을 반환한다.',
  })
  @ApiParam({ name: 'stepId', description: '스텝 ID', example: 10 })
  async getQuizzesByStepId(@Param('stepId', ParseIntPipe) stepId: number): Promise<QuizResponse[]> {
    return this.roadmapService.getQuizzesByStepId(stepId);
  }
}
