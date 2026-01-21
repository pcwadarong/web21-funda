import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

import type { UploadedQuizFile } from './dto/quizzes-upload.dto';
import { BackofficeService } from './backoffice.service';

@ApiTags('Admin')
@ApiBearerAuth('accessToken')
@Controller('admin')
@UseGuards(JwtAccessGuard, AdminGuard)
export class BackofficeController {
  constructor(private readonly backofficeService: BackofficeService) {}

  @Post('quizzes/upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '퀴즈 대량 업로드 (JSONL)',
    description: 'JSONL 파일을 통해 Field, Unit, Step, Quiz를 한 번에 계층적으로 업로드합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
      required: ['file'],
    },
  })
  @ApiCreatedResponse({
    description: '업로드 결과 요약',
    schema: {
      example: {
        processed: 10,
        fieldsCreated: 1,
        fieldsUpdated: 0,
        unitsCreated: 2,
        unitsUpdated: 1,
        stepsCreated: 5,
        stepsUpdated: 0,
        quizzesCreated: 10,
        quizzesUpdated: 0,
      },
    },
  })
  async uploadQuizzes(@UploadedFile() file: UploadedQuizFile) {
    if (!file) {
      throw new BadRequestException('업로드된 파일이 없습니다.');
    }

    return this.backofficeService.uploadQuizzesFromJsonl(file.buffer);
  }
}
