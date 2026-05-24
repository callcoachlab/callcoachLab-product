import { Navigate, useSearchParams } from 'react-router-dom';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  return <Navigate to={token ? `/setup?token=${encodeURIComponent(token)}` : '/login'} replace />;
}
