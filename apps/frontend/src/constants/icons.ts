import ArrowLeft from '@/assets/arrow-left.svg?react';
import Check from '@/assets/check.svg?react';
import Algorithm from '@/assets/field-icons/algorithm.svg?react';
import Backend from '@/assets/field-icons/backend.svg?react';
import Cloud from '@/assets/field-icons/cloud.svg?react';
import ComputerScience from '@/assets/field-icons/computer-science.svg?react';
import Data from '@/assets/field-icons/data.svg?react';
import Frontend from '@/assets/field-icons/frontend.svg?react';
import Game from '@/assets/field-icons/game.svg?react';
import Mobile from '@/assets/field-icons/mobile.svg?react';
import Lock from '@/assets/lock.svg?react';
import Logo from '@/assets/logo.svg?react';
import NextArrow from '@/assets/next-arrow.svg?react';
import Book from '@/assets/sidebar-icons/book.svg?react';
import Diamond from '@/assets/sidebar-icons/diamond.svg?react';
import Fire from '@/assets/sidebar-icons/fire.svg?react';
import Heart from '@/assets/sidebar-icons/heart.svg?react';
import Learn from '@/assets/sidebar-icons/learn.svg?react';
import Profile from '@/assets/sidebar-icons/profile.svg?react';
import Ranking from '@/assets/sidebar-icons/ranking.svg?react';
import Setting from '@/assets/sidebar-icons/setting.svg?react';
import Streak from '@/assets/sidebar-icons/streak.svg?react';
import Star from '@/assets/star.svg?react';
import Start from '@/assets/start.svg?react';
import Vector from '@/assets/vector.svg?react';

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
  ArrowLeft,
  NextArrow,
  Start,
  Lock,
  Star,
  Vector,
  Fire,
  Logo,
  Learn,
  Profile,
  Ranking,
  Setting,
  Streak,
  Diamond,
  Heart,
  Book,
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
