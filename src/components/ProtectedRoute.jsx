import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasAccessToken = Boolean(localStorage.getItem('accessToken'));

  if (!isAuthenticated || !hasAccessToken) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function GuestRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hasAccessToken = Boolean(localStorage.getItem('accessToken'));

  if (isAuthenticated && hasAccessToken) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
