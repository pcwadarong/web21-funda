import { Navigate, useParams } from 'react-router-dom';

import { useAuthUser } from '@/store/authStore';

export const Profile = () => {
  const { userId } = useParams();
  const user = useAuthUser();

  if (!userId && user?.id) return <Navigate to={`/profile/${user.id}`} replace />;
  if (!userId && !user) return <Navigate to="/login" replace />;

  return (
    <div>
      <h1>Profile Page: {userId}</h1>
    </div>
  );
};
