import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useToast } from '../components/Toast';

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const token = searchParams.get('token');
  const { acceptInvite, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({ name: '', password: '', confirmPassword: '' });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      toast.error('Invite token is missing.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      await acceptInvite(token, formData.password, formData.name);
      toast.success('Invitation accepted. Welcome to your workspace.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Could not accept invitation.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Accept invitation</h1>
        <p className="mt-2 text-sm text-slate-600">Create your account details to join the workspace.</p>
        {!token ? (
          <p className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">This invitation link is missing its token.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Display Name"
              required
              fullWidth
              value={formData.name}
              onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            />
            <Input
              label="Password"
              type="password"
              minLength={8}
              required
              fullWidth
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
            />
            <Input
              label="Confirm Password"
              type="password"
              minLength={8}
              required
              fullWidth
              value={formData.confirmPassword}
              onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })}
            />
            <Button type="submit" fullWidth loading={isLoading}>Accept Invite</Button>
          </form>
        )}
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-blue-600 hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}
