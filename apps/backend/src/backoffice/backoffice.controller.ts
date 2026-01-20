import { Controller, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAccessGuard } from '../auth/guards/jwt-access.guard';

import type { UploadSummary } from './dto/quizzes-upload.dto';
import { BackofficeService } from './backoffice.service';

@Controller('admin/quizzes')
@UseGuards(JwtAccessGuard, AdminGuard)
export class BackofficeController {
  constructor(private readonly backofficeService: BackofficeService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file?: { buffer?: Buffer }): Promise<{ summary: UploadSummary }> {
    const summary = await this.backofficeService.uploadQuizzesFromJsonl(
      file?.buffer ?? Buffer.from(''),
    );
    return { summary };
  }
}
