import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useToast } from '../hooks/useToast';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const token = searchParams.get('token');
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!token) {
      toast.error('Reset token is missing.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    try {
      setIsLoading(true);
      await authService.resetPassword(token, formData.password);
      toast.success('Password reset successfully. Please log in.');
      navigate('/login', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Password reset failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Choose new password</h1>
        {!token ? (
          <p className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700">This reset link is missing its token.</p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="New Password"
              type="password"
              minLength={8}
              required
              fullWidth
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
            />
            <Input
              label="Confirm New Password"
              type="password"
              minLength={8}
              required
              fullWidth
              value={formData.confirmPassword}
              onChange={(event) => setFormData({ ...formData, confirmPassword: event.target.value })}
            />
            <Button type="submit" fullWidth loading={isLoading}>Reset Password</Button>
          </form>
        )}
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-blue-600 hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}
