import { useParams } from 'react-router-dom';

export const Overview = () => {
  const { unitId } = useParams<{ unitId: string }>();
  return <div>Overview Page - Unit ID: {unitId}</div>;
};
