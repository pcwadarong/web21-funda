import { useParams } from 'react-router-dom';

export const Profile = () => {
  const { userId } = useParams<{ userId: string }>();
  return <div>Profile Page - User ID: {userId}</div>;
};
