import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { ProfileCharacterContainer } from '@/feat/user/components/profile-character/ProfileCharacterContainer';
import {
  useProfileCharacterApply,
  useProfileCharacterClear,
  useProfileCharacterPurchase,
  useProfileCharacters,
} from '@/hooks/queries/profileCharacterQueries';
import { useAuthUser } from '@/store/authStore';
import { useToast } from '@/store/toastStore';

/**
 * 프로필 캐릭터 구매/적용 페이지
 */
export const ProfileCharacter = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const authUser = useAuthUser();
  const { data, isLoading, error } = useProfileCharacters();
  const purchaseMutation = useProfileCharacterPurchase();
  const applyMutation = useProfileCharacterApply();
  const clearMutation = useProfileCharacterClear();
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const characters = useMemo(() => data?.characters ?? [], [data?.characters]);
  const selectedCharacterId = selectedId ?? data?.selectedCharacterId ?? null;

  useEffect(() => {
    if (selectedId !== null) {
      return;
    }

    if (data?.selectedCharacterId) {
      setSelectedId(data.selectedCharacterId);
    }
  }, [data?.selectedCharacterId, selectedId]);

  const handleBack = () => {
    if (authUser?.id) {
      navigate(`/profile/${authUser.id}`, { state: { refetch: true } });
      return;
    }

    navigate(-1);
  };

  const handleSelect = (characterId: number) => {
    setSelectedId(prevSelected => (prevSelected === characterId ? null : characterId));
  };

  const handlePurchase = async (characterId: number) => {
    try {
      await purchaseMutation.mutateAsync(characterId);
      showToast('캐릭터를 구매했습니다.');
    } catch (purchaseError) {
      showToast((purchaseError as Error).message);
    }
  };

  const handleApply = async (characterId: number) => {
    try {
      await applyMutation.mutateAsync(characterId);
      showToast('캐릭터를 적용했습니다.');
    } catch (applyError) {
      showToast((applyError as Error).message);
    }
  };

  const handleClear = async () => {
    try {
      await clearMutation.mutateAsync();
      setSelectedId(null);
      showToast('기본 프로필로 되돌렸습니다.');
    } catch (clearError) {
      showToast((clearError as Error).message);
    }
  };

  useEffect(() => {
    if (!error) {
      return;
    }

    showToast('캐릭터 목록을 불러오지 못했습니다.');
  }, [error, showToast]);

  return (
    <ProfileCharacterContainer
      characters={characters}
      selectedCharacterId={selectedCharacterId}
      isLoading={isLoading}
      onSelect={handleSelect}
      onPurchase={handlePurchase}
      onApply={handleApply}
      onClear={handleClear}
      onBack={handleBack}
    />
  );
};
