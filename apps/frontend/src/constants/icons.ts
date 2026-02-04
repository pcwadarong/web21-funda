import ArrowLeft from '@/assets/arrow-left.svg?react';
import Check from '@/assets/check.svg?react';
import CheckCircle from '@/assets/check-circle.svg?react';
import Copy from '@/assets/copy.svg?react';
import Edit from '@/assets/edit.svg?react';
import Algorithm from '@/assets/field-icons/algorithm.svg?react';
import Backend from '@/assets/field-icons/backend.svg?react';
import Cloud from '@/assets/field-icons/cloud.svg?react';
import ComputerScience from '@/assets/field-icons/computer-science.svg?react';
import Data from '@/assets/field-icons/data.svg?react';
import Frontend from '@/assets/field-icons/frontend.svg?react';
import Game from '@/assets/field-icons/game.svg?react';
import Mobile from '@/assets/field-icons/mobile.svg?react';
import Github from '@/assets/github.svg?react';
import Google from '@/assets/google.svg?react';
import Brain from '@/assets/landing-icons/brain.svg?react';
import GraphDown from '@/assets/landing-icons/graph-down.svg?react';
import GraphUp from '@/assets/landing-icons/graph-up.svg?react';
import Lightning from '@/assets/landing-icons/lightning.svg?react';
import Lock from '@/assets/lock.svg?react';
import Logo from '@/assets/logo.svg?react';
import Logout from '@/assets/logout.svg?react';
import Minus from '@/assets/minus.svg?react';
import NextArrow from '@/assets/next-arrow.svg?react';
import Notebook from '@/assets/notebook.svg?react';
import Refresh from '@/assets/refresh.svg?react';
import Report from '@/assets/report.svg?react';
import RoundStar from '@/assets/round-star.svg?react';
import Send from '@/assets/send.svg?react';
import Sheet from '@/assets/sheet.svg?react';
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
import Star from '@/assets/star.svg?react';
import Start from '@/assets/start.svg?react';
import TierBronze from '@/assets/tier-icons/tier-bronze.svg?react';
import TierGold from '@/assets/tier-icons/tier-gold.svg?react';
import TierMaster from '@/assets/tier-icons/tier-master.svg?react';
import TierRuby from '@/assets/tier-icons/tier-ruby.svg?react';
import TierSapphire from '@/assets/tier-icons/tier-sapphire.svg?react';
import TierSilver from '@/assets/tier-icons/tier-silver.svg?react';
import Timer from '@/assets/timer.svg?react';
import Graph from '@/assets/upward-graph.svg?react';
import Xp from '@/assets/xp.svg?react';

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
  TierBronze,
  TierSilver,
  TierGold,
  TierSapphire,
  TierRuby,
  TierMaster,
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
