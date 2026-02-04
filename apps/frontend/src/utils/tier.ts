import type { IconMapTypes } from '@/constants/icons';

/**
 * 티어 이름에 맞는 아이콘 키를 반환한다.
 *
 * @param {string | null | undefined} tierName - 티어 이름
 * @returns {IconMapTypes | null} 아이콘 키
 */
export const getTierIconName = (tierName?: string | null): IconMapTypes | null => {
  if (!tierName) return null;

  switch (tierName) {
    case 'BRONZE':
      return 'TierBronze';
    case 'SILVER':
      return 'TierSilver';
    case 'GOLD':
      return 'TierGold';
    case 'SAPPHIRE':
      return 'TierSapphire';
    case 'RUBY':
      return 'TierRuby';
    case 'MASTER':
      return 'TierMaster';
    default:
      return null;
  }
};
