import { useAuthStore } from '@/lib/stores/use-auth-store';
import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

type ProtectedRouteProps = PropsWithChildren & {
  permission: 'member' | 'admin';
}

export default function ProtectedRoute({ permission='member', children }: ProtectedRouteProps) {
  const { user } = useAuthStore();

  if (!user) return <Navigate to="/auth" />;
  if (permission === 'admin' && !user.isAdmin) return <Navigate to="/" />;

  return children;
}
