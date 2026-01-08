import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import type { UploadSummary } from './dto/quizzes-upload.dto';
import { BackofficeService } from './backoffice.service';

@Controller('admin/quizzes')
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
