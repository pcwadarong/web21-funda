import { useParams } from 'react-router-dom';

export const QuizResult = () => {
  const { unitId, stepId } = useParams<{ unitId: string; stepId: string }>();
  return (
    <div>
      Quiz Result Page - Unit ID: {unitId}, Step ID: {stepId}
    </div>
  );
};
