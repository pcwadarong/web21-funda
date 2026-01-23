export interface ScoreWeights {
  baseScorePerQuiz: number;
  correctBonus: number;
  wrongBonus: number;
  difficultyMultiplier: number;
  speedBonus: number;
}

export const DEFAULT_SCORE_WEIGHTS: ScoreWeights = {
  baseScorePerQuiz: 3,
  correctBonus: 1,
  wrongBonus: 0,
  difficultyMultiplier: 0,
  speedBonus: 0,
};

/**
 * 풀이 로그 1건 기준으로 점수를 계산한다.
 *
 * @param params.isCorrect 정답 여부
 * @param params.weights 점수 가중치(없으면 기본값)
 * @returns 계산된 점수
 */
export const calculateScorePerSolve = (params: {
  isCorrect: boolean;
  weights?: Partial<ScoreWeights>;
}): number => {
  const weights = { ...DEFAULT_SCORE_WEIGHTS, ...(params.weights ?? {}) };
  const correctnessBonus = params.isCorrect ? weights.correctBonus : weights.wrongBonus;

  return weights.baseScorePerQuiz + correctnessBonus;
};
