import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Report } from './entities/report.entity';

@Injectable()
export class ReportService {
  constructor(@InjectRepository(Report) private repo: Repository<Report>) {}

  async create(quizId: number, report_description: string) {
    const entity = this.repo.create({ quizId, report_description });
    return await this.repo.save(entity);
  }
}
