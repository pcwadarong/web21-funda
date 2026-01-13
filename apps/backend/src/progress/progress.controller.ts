import { Body, Controller, Param, ParseIntPipe, Post } from '@nestjs/common';

import { CompleteStepAttemptDto } from './dto/complete-step-attempt.dto';
import { StartStepAttemptDto } from './dto/start-step-attempt.dto';
import { ProgressService } from './progress.service';

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Post('steps/:stepId/start')
  async startStep(
    @Param('stepId', ParseIntPipe) stepId: number,
    @Body() body: StartStepAttemptDto,
  ) {
    const attempt = await this.progressService.startStepAttempt({
      userId: body.userId,
      stepId,
      startedAt: body.startedAt,
    });

    return {
      result: {
        stepAttemptId: attempt.id,
      },
      message: '스텝 풀이를 시작했습니다.',
    };
  }

  @Post('steps/:stepId/complete')
  async completeStep(
    @Param('stepId', ParseIntPipe) stepId: number,
    @Body() body: CompleteStepAttemptDto,
  ) {
    const completion = await this.progressService.completeStepAttempt({
      userId: body.userId,
      stepId,
      finishedAt: body.finishedAt,
    });

    return {
      result: completion,
      message: '스텝 풀이를 완료했습니다.',
    };
  }
}
