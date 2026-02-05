interface GoalInfoParams {
  id: string;
  label: string;
  current: number;
  target: number;
}

export interface TodayGoalsParams {
  perfectScore: GoalInfoParams;
  totalXP: GoalInfoParams;
  rewardGranted: boolean;
}

const totalXPTarget = 90;
const perfectScoreTarget = 2;

export const DEFAULT_TODAY_GOALS: TodayGoalsParams = {
  totalXP: {
    id: 'xp',
    label: `${totalXPTarget} XP 획득하기`,
    current: 0,
    target: totalXPTarget,
  },
  perfectScore: {
    id: 'lessons',
    label: `${perfectScoreTarget}개의 퀴즈 만점 받기`,
    current: 0,
    target: perfectScoreTarget,
  },
  rewardGranted: false,
};
