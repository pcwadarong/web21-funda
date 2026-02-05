import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { OverviewContainer } from '@/feat/learn/components/OverviewContainer';
import { useUnitOverview } from '@/hooks/queries/unitQueries';

export const Overview = () => {
  const navigate = useNavigate();
  const { unitId: unitIdParam } = useParams<{ unitId: string }>();

  const parsedUnitId = useMemo(() => {
    if (!unitIdParam) return null;
    const value = Number(unitIdParam);
    if (!Number.isInteger(value) || value <= 0) return null;
    return value;
  }, [unitIdParam]);

  const { data, isLoading, error } = useUnitOverview(parsedUnitId);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <OverviewContainer
      unitId={parsedUnitId}
      data={data}
      isLoading={isLoading}
      error={error}
      onBack={handleBack}
    />
  );
};
