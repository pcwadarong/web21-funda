import { useParams } from 'react-router-dom';

export const Quiz = () => {
  const { unitId, stepId } = useParams<{ unitId: string; stepId: string }>();
  return (
    <div>
      Quiz Page - Unit ID: {unitId}, Step ID: {stepId}
    </div>
  );
};
