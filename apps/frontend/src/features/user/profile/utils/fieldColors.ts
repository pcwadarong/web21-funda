import type { Theme } from '@/styles/theme';

/**
 * 필드별 색상 팔레트
 *
 * @param {Theme} theme 테마 객체
 * @returns {string[]} 색상 배열 (8개)
 */
const getPalette = (theme: Theme): string[] => [
  theme.colors.primary.dark,
  theme.colors.primary.main,
  theme.colors.primary.light,
  theme.colors.primary.semilight,
  theme.colors.grayscale[900],
  theme.colors.grayscale[700],
  theme.colors.grayscale[500],
  theme.colors.grayscale[300],
];

/**
 * 필드 인덱스에 따라 색상을 반환한다.
 * 한 컬러는 하나의 필드만 사용한다.
 *
 * @param {number} index 필드의 인덱스 (0부터 시작)
 * @param {Theme} theme 테마 객체
 * @returns {string} 색상 코드
 */
export const getFieldColorByIndex = (index: number, theme: Theme): string => {
  const palette = getPalette(theme);
  const colorIndex = index % palette.length;
  const color = palette[colorIndex];
  return color ?? palette[0] ?? '#000000';
};
