import Algorithm from '@/assets/field-icons/algorithm.svg?react';
import Backend from '@/assets/field-icons/backend.svg?react';
import Cloud from '@/assets/field-icons/cloud.svg?react';
import ComputerScience from '@/assets/field-icons/computer-science.svg?react';
import Data from '@/assets/field-icons/data.svg?react';
import Frontend from '@/assets/field-icons/frontend.svg?react';
import Game from '@/assets/field-icons/game.svg?react';
import Mobile from '@/assets/field-icons/mobile.svg?react';
import ArrowLeft from '@/assets/icons/arrow-left.svg?react';
import Check from '@/assets/icons/check.svg?react';
import CheckCircle from '@/assets/icons/check-circle.svg?react';
import Copy from '@/assets/icons/copy.svg?react';
import Edit from '@/assets/icons/edit.svg?react';
import Github from '@/assets/icons/github.svg?react';
import Google from '@/assets/icons/google.svg?react';
import Lock from '@/assets/icons/lock.svg?react';
import Logo from '@/assets/icons/logo.svg?react';
import Logout from '@/assets/icons/logout.svg?react';
import Minus from '@/assets/icons/minus.svg?react';
import NextArrow from '@/assets/icons/next-arrow.svg?react';
import Notebook from '@/assets/icons/notebook.svg?react';
import Refresh from '@/assets/icons/refresh.svg?react';
import Report from '@/assets/icons/report.svg?react';
import RoundStar from '@/assets/icons/round-star.svg?react';
import Send from '@/assets/icons/send.svg?react';
import Sheet from '@/assets/icons/sheet.svg?react';
import Star from '@/assets/icons/star.svg?react';
import Start from '@/assets/icons/start.svg?react';
import Timer from '@/assets/icons/timer.svg?react';
import Graph from '@/assets/icons/upward-graph.svg?react';
import Xp from '@/assets/icons/xp.svg?react';
import Brain from '@/assets/landing-icons/brain.svg?react';
import GraphDown from '@/assets/landing-icons/graph-down.svg?react';
import GraphUp from '@/assets/landing-icons/graph-up.svg?react';
import Lightning from '@/assets/landing-icons/lightning.svg?react';
import Battle from '@/assets/sidebar-icons/battle.svg?react';
import Book from '@/assets/sidebar-icons/book.svg?react';
import Diamond from '@/assets/sidebar-icons/diamond.svg?react';
import Fire from '@/assets/sidebar-icons/fire.svg?react';
import Heart from '@/assets/sidebar-icons/heart.svg?react';
import Learn from '@/assets/sidebar-icons/learn.svg?react';
import Profile from '@/assets/sidebar-icons/profile.svg?react';
import Ranking from '@/assets/sidebar-icons/ranking.svg?react';
import Search from '@/assets/sidebar-icons/search.svg?react';
import Setting from '@/assets/sidebar-icons/setting.svg?react';
import Streak from '@/assets/sidebar-icons/streak.svg?react';

export const IconMap = {
  ArrowLeft,
  Check,
  Algorithm,
  Backend,
  Cloud,
  CheckCircle,
  ComputerScience,
  Data,
  Edit,
  Frontend,
  Game,
  Mobile,
  Github,
  Google,
  Lock,
  Logo,
  Logout,
  Minus,
  NextArrow,
  Refresh,
  Report,
  RoundStar,
  Send,
  Sheet,
  Book,
  Diamond,
  Heart,
  Learn,
  Profile,
  Ranking,
  Search,
  Setting,
  Streak,
  Star,
  Start,
  Timer,
  Graph,
  Brain,
  GraphDown,
  GraphUp,
  Lightning,
  Battle,
  Xp,
  Copy,
  Notebook,
  Fire,
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
