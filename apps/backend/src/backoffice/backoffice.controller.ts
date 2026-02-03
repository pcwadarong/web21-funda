import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
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

import type { ProfileCharacterUploadSummary } from './dto/profile-characters-upload.dto';
import type { UploadedQuizFile } from './dto/quizzes-upload.dto';
import { BackofficeService } from './backoffice.service';

@ApiTags('Admin')
@ApiBearerAuth('accessToken')
@Controller('admin')
@UseGuards(JwtAccessGuard, AdminGuard)
export class BackofficeController {
  constructor(private readonly backofficeService: BackofficeService) {}

  @Post('quizzes/upload')
  @UseInterceptors(FilesInterceptor('file'))
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
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
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
  async uploadQuizzes(@UploadedFiles() files: UploadedQuizFile[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('업로드된 파일이 없습니다.');
    }

    const summary = {
      processed: 0,
      fieldsCreated: 0,
      fieldsUpdated: 0,
      unitsCreated: 0,
      unitsUpdated: 0,
      stepsCreated: 0,
      stepsUpdated: 0,
      quizzesCreated: 0,
      quizzesUpdated: 0,
    };

    for (const file of files) {
      const fileSummary = await this.backofficeService.uploadQuizzesFromJsonl(file.buffer);
      summary.processed += fileSummary.processed;
      summary.fieldsCreated += fileSummary.fieldsCreated;
      summary.fieldsUpdated += fileSummary.fieldsUpdated;
      summary.unitsCreated += fileSummary.unitsCreated;
      summary.unitsUpdated += fileSummary.unitsUpdated;
      summary.stepsCreated += fileSummary.stepsCreated;
      summary.stepsUpdated += fileSummary.stepsUpdated;
      summary.quizzesCreated += fileSummary.quizzesCreated;
      summary.quizzesUpdated += fileSummary.quizzesUpdated;
    }

    return summary;
  }

  @Post('units/overview/upload')
  @UseInterceptors(FilesInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '유닛 개요 대량 업로드 (JSONL)',
    description: 'JSONL 파일을 통해 유닛 개요(overview)를 일괄 업데이트합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
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
        unitsUpdated: 9,
        unitsNotFound: 1,
      },
    },
  })
  async uploadUnitOverviews(@UploadedFiles() files: UploadedQuizFile[]) {
    if (!files || files.length === 0) {
      throw new BadRequestException('업로드된 파일이 없습니다.');
    }

    const summary = {
      processed: 0,
      unitsUpdated: 0,
      unitsNotFound: 0,
    };

    for (const file of files) {
      const fileSummary = await this.backofficeService.uploadUnitOverviewsFromJsonl(file.buffer);
      summary.processed += fileSummary.processed;
      summary.unitsUpdated += fileSummary.unitsUpdated;
      summary.unitsNotFound += fileSummary.unitsNotFound;
    }

    return summary;
  }

  @Post('profile-characters')
  @ApiOperation({
    summary: '프로필 캐릭터 단일 등록',
    description: '이미지 URL과 가격 정보를 받아 프로필 캐릭터를 등록합니다.',
  })
  @ApiCreatedResponse({
    description: '단일 등록 결과',
    schema: {
      example: {
        id: 10,
        created: true,
        updated: false,
      },
    },
  })
  async createProfileCharacter(
    @Body()
    payload: {
      imageUrl: string;
      priceDiamonds: number;
      description?: string | null;
      isActive?: boolean;
    },
  ) {
    return this.backofficeService.createProfileCharacter(payload);
  }

  @Post('profile-characters/upload')
  @UseInterceptors(FilesInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({
    summary: '프로필 캐릭터 대량 업로드 (JSONL)',
    description: 'JSONL 파일을 통해 프로필 캐릭터를 일괄 업서트합니다.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
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
        charactersCreated: 8,
        charactersUpdated: 2,
      },
    },
  })
  async uploadProfileCharacters(
    @UploadedFiles() files: UploadedQuizFile[],
  ): Promise<ProfileCharacterUploadSummary> {
    if (!files || files.length === 0) {
      throw new BadRequestException('업로드된 파일이 없습니다.');
    }

    const summary: ProfileCharacterUploadSummary = {
      processed: 0,
      charactersCreated: 0,
      charactersUpdated: 0,
    };

    for (const file of files) {
      const fileSummary = await this.backofficeService.uploadProfileCharactersFromJsonl(
        file.buffer,
      );
      summary.processed += fileSummary.processed;
      summary.charactersCreated += fileSummary.charactersCreated;
      summary.charactersUpdated += fileSummary.charactersUpdated;
    }

    return summary;
  }
}
