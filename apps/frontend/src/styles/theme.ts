import { borderRadius, colors } from '@/styles/token';
import { typography } from '@/styles/typography';

export const lightTheme = {
  colors: colors.light,
  typography,
  borderRadius,
};

export const darkTheme = {
  colors: colors.dark,
  typography,
  borderRadius,
};

export type Theme = typeof lightTheme;
