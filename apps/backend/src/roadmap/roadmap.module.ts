import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Field, Quiz, Step, Unit } from './entities';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';

@Module({
  imports: [TypeOrmModule.forFeature([Field, Unit, Step, Quiz])],
  controllers: [RoadmapController],
  providers: [RoadmapService],
  exports: [TypeOrmModule],
})
export class RoadmapModule {}
