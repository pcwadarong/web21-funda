import { useParams } from 'react-router-dom';

export const Leaderboard = () => {
  const { groupId } = useParams<{ groupId: string }>();
  return <div>Leaderboard Page - Group ID: {groupId}</div>;
};
