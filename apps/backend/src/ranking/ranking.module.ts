import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RankingGroup } from './entities/ranking-group.entity';
import { RankingGroupMember } from './entities/ranking-group-member.entity';
import { RankingTier } from './entities/ranking-tier.entity';
import { RankingWeek } from './entities/ranking-week.entity';
import { RankingWeeklyXp } from './entities/ranking-weekly-xp.entity';
import { RankingService } from './ranking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RankingWeek,
      RankingTier,
      RankingGroup,
      RankingGroupMember,
      RankingWeeklyXp,
    ]),
  ],
  providers: [RankingService],
  exports: [RankingService],
})
export class RankingModule {}
