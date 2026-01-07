import Check from '@/assets/check.svg?react';
import Algorithm from '@/assets/field-icons/algorithm.svg?react';
import Backend from '@/assets/field-icons/backend.svg?react';
import Cloud from '@/assets/field-icons/cloud.svg?react';
import ComputerScience from '@/assets/field-icons/computer-science.svg?react';
import Data from '@/assets/field-icons/data.svg?react';
import Frontend from '@/assets/field-icons/frontend.svg?react';
import Game from '@/assets/field-icons/game.svg?react';
import Mobile from '@/assets/field-icons/mobile.svg?react';

export const IconMap = {
  Algorithm,
  Backend,
  Cloud,
  ComputerScience,
  Data,
  Frontend,
  Game,
  Mobile,
  Check,
} as const;

export type IconMapTypes = keyof typeof IconMap;

export const IconSizes = {
  xl: 36,
  lg: 24,
  md: 20,
  sm: 16,
  xs: 12,
};

export type IconSizeTypes = keyof typeof IconSizes;
