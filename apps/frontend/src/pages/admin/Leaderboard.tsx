import { useState } from 'react';

import { AdminLeaderboardContainer } from '@/features/admin/components/AdminLeaderboardContainer';
import { useAdminWeeklyRanking } from '@/hooks/queries/adminLeaderboardQueries';
import type { AdminWeeklyRankingParams } from '@/services/adminService';

interface AdminLeaderboardFilters {
  tierName: string;
  groupIndex: string;
}

const createEmptyFilters = (): AdminLeaderboardFilters => ({
  tierName: '',
  groupIndex: '',
});

export const AdminLeaderboard = () => {
  const [filters, setFilters] = useState<AdminLeaderboardFilters>(createEmptyFilters);
  const [appliedFilters, setAppliedFilters] = useState<AdminWeeklyRankingParams | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const {
    data: weeklyRanking,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useAdminWeeklyRanking(appliedFilters);

  const errorMessage =
    error instanceof Error ? error.message : error ? '랭킹 정보를 불러오지 못했습니다.' : null;

  const updateFilter = (field: keyof AdminLeaderboardFilters, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const applyFilters = () => {
    const tierNameText = filters.tierName.trim();
    const groupIndexText = filters.groupIndex.trim();

    if (!tierNameText || !groupIndexText) {
      setFormError('티어와 그룹 번호를 선택해주세요.');
      return;
    }

    const groupIndex = Number(groupIndexText);

    if (!Number.isInteger(groupIndex) || groupIndex <= 0) {
      setFormError('그룹 번호를 다시 선택해주세요.');
      return;
    }

    setFormError(null);
    setAppliedFilters({
      tierName: tierNameText,
      groupIndex,
      weekKey: null,
    });
  };

  return (
    <AdminLeaderboardContainer
      weeklyRanking={weeklyRanking ?? null}
      isLoading={isLoading}
      errorMessage={errorMessage}
      onRefresh={appliedFilters ? () => refetch() : undefined}
      isRefreshing={isFetching}
      filters={filters}
      onFilterChange={updateFilter}
      onApplyFilters={applyFilters}
      formError={formError}
      hasAppliedFilters={appliedFilters !== null}
    />
  );
};
