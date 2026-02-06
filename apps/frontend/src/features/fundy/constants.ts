import type { FundyAnimationConfig } from '@/feat/fundy/types';

export type AnimKey = keyof FundyAnimationConfig;

export const FACE_EXPRESSIONS: AnimKey[] = ['smile', 'smileSoft', 'bigSmile', 'wink', 'angry'];

export const MOUTH_OPTIONS = [
  { key: 'openMouth', value: false, label: '다물기', icon: '🤐' },
  { key: 'openMouth', value: 'a', label: '"아" 발음', icon: '👄' },
  { key: 'openMouth', value: 'o', label: '"오" 발음', icon: '⭕' },
] as const;

export const CONTROL_CATEGORIES = [
  {
    title: '얼굴 애니메이션',
    items: [
      { key: 'smile', value: true, label: '웃기', icon: '😊' },
      { key: 'bigSmile', value: true, label: '활짝 웃기', icon: '😆' },
      { key: 'wink', value: true, label: '윙크하기', icon: '😉' },
      { key: 'angry', value: true, label: '화난 표정', icon: '😠' },
    ],
  },
  {
    title: '기타 설정',
    items: [
      { key: 'blink', value: true, label: '눈 깜빡임 자동', icon: '👁️' },
      { key: 'lookAt', value: true, label: '시선 추적', icon: '👀' },
    ],
  },
] as const;
