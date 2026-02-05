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
    refetchOnMount: 'always',
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
      queryClient.invalidateQueries({ queryKey: ['user', 'summary'] });
    },
  });
};

export const useProfileCharacterClear = () => {
  const queryClient = useQueryClient();

  return useMutation<ProfileCharacterApplyResult, Error, void>({
    mutationFn: () => profileCharacterService.clearCharacter(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: profileCharacterKeys.list() });
      queryClient.invalidateQueries({ queryKey: ['user', 'summary'] });
    },
  });
};
