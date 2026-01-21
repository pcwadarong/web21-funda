import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RankingGroup } from './entities/ranking-group.entity';
import { RankingGroupMember } from './entities/ranking-group-member.entity';
import { RankingTier } from './entities/ranking-tier.entity';
import { RankingTierRule } from './entities/ranking-tier-rule.entity';
import { RankingWeek } from './entities/ranking-week.entity';
import { RankingWeeklySnapshot } from './entities/ranking-weekly-snapshot.entity';
import { RankingWeeklyXp } from './entities/ranking-weekly-xp.entity';
import { RankingService } from './ranking.service';
import { RankingEvaluationService } from './ranking-evaluation.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RankingWeek,
      RankingTier,
      RankingTierRule,
      RankingGroup,
      RankingGroupMember,
      RankingWeeklyXp,
      RankingWeeklySnapshot,
    ]),
  ],
  providers: [RankingService, RankingEvaluationService],
  exports: [RankingService],
})
export class RankingModule {}
