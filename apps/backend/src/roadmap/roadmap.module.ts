import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Field, Quiz, Step, Unit } from './entities';
import { FieldsController } from './fields.controller';
import { RoadmapController } from './roadmap.controller';
import { RoadmapService } from './roadmap.service';
import { StepsController } from './steps.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Field, Unit, Step, Quiz])],
  controllers: [RoadmapController, FieldsController, StepsController],
  providers: [RoadmapService],
  exports: [TypeOrmModule],
})
export class RoadmapModule {}
