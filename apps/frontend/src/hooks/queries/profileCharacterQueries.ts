import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  ProfileCharacterApplyResult,
  ProfileCharacterListResult,
  ProfileCharacterPurchaseResult,
} from '@/features/profile-character/types';
import { profileCharacterService } from '@/services/profileCharacterService';

export const profileCharacterKeys = {
  list: () => ['profile', 'characters'] as const,
};

export const useProfileCharacters = () =>
  useQuery<ProfileCharacterListResult, Error>({
    queryKey: profileCharacterKeys.list(),
    queryFn: () => profileCharacterService.getMyProfileCharacters(),
    staleTime: 1000 * 60,
  });

export const useProfileCharacterPurchase = () => {
  const queryClient = useQueryClient();

  return useMutation<ProfileCharacterPurchaseResult, Error, number>({
    mutationFn: characterId => profileCharacterService.purchaseCharacter(characterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileCharacterKeys.list() });
    },
  });
};

export const useProfileCharacterApply = () => {
  const queryClient = useQueryClient();

  return useMutation<ProfileCharacterApplyResult, Error, number>({
    mutationFn: characterId => profileCharacterService.applyCharacter(characterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileCharacterKeys.list() });
    },
  });
};
