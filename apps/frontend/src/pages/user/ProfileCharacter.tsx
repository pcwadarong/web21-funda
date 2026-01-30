import { css } from '@emotion/react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Modal } from '@/comp/Modal';
import { Button } from '@/components/Button';
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
  const [selectedId, setSelectedId] = useState<number | null | undefined>(undefined);
  const [pendingPurchaseId, setPendingPurchaseId] = useState<number | null>(null);

  const characters = useMemo(() => data?.characters ?? [], [data?.characters]);
  const selectedCharacterId =
    selectedId !== undefined ? selectedId : (data?.selectedCharacterId ?? null);

  useEffect(() => {
    if (selectedId !== undefined) {
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

  const handlePurchaseRequest = (characterId: number) => {
    setPendingPurchaseId(characterId);
  };

  const handleConfirmPurchase = async () => {
    if (pendingPurchaseId === null) {
      return;
    }

    try {
      await purchaseMutation.mutateAsync(pendingPurchaseId);
      showToast('캐릭터를 구매했습니다.');
      setPendingPurchaseId(null);
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
    <>
      <ProfileCharacterContainer
        characters={characters}
        selectedCharacterId={selectedCharacterId}
        isLoading={isLoading}
        onSelect={handleSelect}
        onPurchase={handlePurchaseRequest}
        onApply={handleApply}
        onClear={handleClear}
        onBack={handleBack}
      />
      {pendingPurchaseId !== null && (
        <Modal
          title="캐릭터 구매"
          content={
            <div css={modalContentStyle}>
              <div css={modalMessageStyle}>선택한 캐릭터를 구매하시겠습니까?</div>
              <Button type="button" onClick={handleConfirmPurchase} fullWidth>
                구매하기
              </Button>
            </div>
          }
          onClose={() => setPendingPurchaseId(null)}
          maxWidth={480}
        />
      )}
    </>
  );
};

const modalContentStyle = css`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0.5rem 0.25rem 0.75rem;
  align-items: center;
  text-align: center;
`;

const modalMessageStyle = css`
  font-size: 1rem;
  line-height: 1.5;
`;
