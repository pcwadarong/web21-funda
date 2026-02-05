import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { ServicePreparationContainer } from '@/feat/error/components/ServicePreparationContainer';

export const ServicePreparation = () => {
  const navigate = useNavigate();

  const handleGoMain = useCallback(() => {
    navigate('/learn');
  }, [navigate]);

  return <ServicePreparationContainer onGoMain={handleGoMain} />;
};
