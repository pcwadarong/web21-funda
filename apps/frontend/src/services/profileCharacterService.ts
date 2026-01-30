import type {
  ProfileCharacterApplyResult,
  ProfileCharacterListResult,
  ProfileCharacterPurchaseResult,
} from '@/features/profile-character/types';

import { apiFetch } from './api';

export const profileCharacterService = {
  /**
   * 내 프로필 캐릭터 목록을 가져옵니다.
   */
  async getMyProfileCharacters(): Promise<ProfileCharacterListResult> {
    return apiFetch.get<ProfileCharacterListResult>('/profiles/me/characters');
  },

  /**
   * 프로필 캐릭터를 구매합니다.
   */
  async purchaseCharacter(characterId: number): Promise<ProfileCharacterPurchaseResult> {
    return apiFetch.post<ProfileCharacterPurchaseResult>(
      `/profiles/me/characters/${characterId}/purchase`,
    );
  },

  /**
   * 프로필 캐릭터를 적용합니다.
   */
  async applyCharacter(characterId: number): Promise<ProfileCharacterApplyResult> {
    return apiFetch.post<ProfileCharacterApplyResult>(
      `/profiles/me/characters/${characterId}/apply`,
    );
  },
};
