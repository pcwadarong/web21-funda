/**
 * Fisher-Yates 알고리즘을 사용하여 배열을 랜덤하게 섞습니다.
 * @param array 섞을 배열
 * @returns 섞인 새 배열
 */
export const shuffleArray = async <T>(array: T[]): Promise<T[]> =>
  new Promise(resolve => {
    setTimeout(() => {
      const shuffled = [...array];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      resolve(shuffled);
    }, 0);
  });
