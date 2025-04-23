import { useAuthStore } from '@/lib/store';
import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';

export default function PublicRoute({ children }: PropsWithChildren) {
  const { user } = useAuthStore();

  if (user) return <Navigate to="/" />;
  return children;
}
