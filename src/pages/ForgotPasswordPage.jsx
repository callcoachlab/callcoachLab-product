import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useToast } from '../hooks/useToast';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const toast = useToast();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setIsLoading(true);
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      toast.success('Password reset instructions sent.');
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Could not send reset instructions.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-950">Reset your password</h1>
        <p className="mt-2 text-sm text-slate-600">Enter your account email and we will send a reset link.</p>
        {isSubmitted ? (
          <div className="mt-6 rounded-lg bg-green-50 p-4 text-sm text-green-800">
            Check your email for the reset link.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <Input
              label="Work Email Address"
              type="email"
              required
              fullWidth
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button type="submit" fullWidth loading={isLoading}>Send Reset Link</Button>
          </form>
        )}
        <Link to="/login" className="mt-6 inline-block text-sm font-medium text-blue-600 hover:underline">
          Back to login
        </Link>
      </div>
    </div>
  );
}
