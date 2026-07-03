import { useEffect, useRef, useState } from 'react';
import { CircleAlert, CheckCircle, Languages, Loader2 } from 'lucide-react';
import { Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';

const industryOptions = [
  { value: 'dental', label: 'Dental' },
  { value: 'skin', label: 'Skin' },
  { value: 'hair', label: 'Hair' },
  { value: 'chiro', label: 'Chiro' },
  { value: 'sales', label: 'Sales' },
  { value: 'other', label: 'Other' },
];

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'pa', label: 'Punjabi' },
];

export default function CallCoach360Setup() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { createWorkspace, verifyEmail, isAuthenticated, isLoading } = useAuthStore();
  const verificationToken = searchParams.get('token');
  const [isVerifying, setIsVerifying] = useState(Boolean(verificationToken));
  const [verificationError, setVerificationError] = useState('');
  const verifiedTokenRef = useRef(null);
  const [formData, setFormData] = useState({
    workspaceName: '',
    industryType: 'dental',
    timezone: 'Asia/Kolkata',
    languagesEnabled: ['en'],
    name: '',
  });

  useEffect(() => {
    const token = verificationToken;
    if (!token || verifiedTokenRef.current === token) return;
    verifiedTokenRef.current = token;

    const verify = async () => {
      try {
        setIsVerifying(true);
        setVerificationError('');
        await verifyEmail(token);
        toast.success('Email verified. Log in to continue.');
        navigate('/login', { replace: true });
      } catch (error) {
        const message = error.response?.data?.error?.message || 'Email verification failed';
        setVerificationError(message);
        toast.error(message);
      } finally {
        setIsVerifying(false);
      }
    };

    verify();
  }, [navigate, toast, verificationToken, verifyEmail]);

  const toggleLanguage = (language) => {
    setFormData((current) => {
      const languagesEnabled = current.languagesEnabled.includes(language)
        ? current.languagesEnabled.filter((item) => item !== language)
        : [...current.languagesEnabled, language];

      return {
        ...current,
        languagesEnabled: languagesEnabled.length ? languagesEnabled : ['en'],
      };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!localStorage.getItem('setupToken')) {
      toast.error('Verify your email first, then use the setup link again.');
      return;
    }

    try {
      await createWorkspace(formData);
      toast.success('Workspace created successfully.');
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Workspace setup failed');
    }
  };

  if (verificationToken) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-50 text-green-700">
            {verificationError ? <CircleAlert className="h-6 w-6 text-red-600" /> : <Loader2 className="h-6 w-6 animate-spin" />}
          </div>
          <h1 className="text-2xl font-bold text-slate-950">Verify your email</h1>
          <p className="mt-2 text-sm text-slate-600">
            {verificationError || 'Confirming your email address. You will be sent to login when it is complete.'}
          </p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!localStorage.getItem('setupToken')) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-green-700">Call Coach Lab</p>
            <h1 className="text-2xl font-bold text-slate-950">Workspace setup</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1 text-sm font-medium text-green-700">
            {isVerifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            {isVerifying ? 'Verifying email' : 'M0 onboarding'}
          </div>
        </div>
      </div>

      <main className="mx-auto grid max-w-5xl gap-8 px-6 py-10 lg:grid-cols-[1fr_360px]">
        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold text-slate-950">Create your workspace</h2>
            <p className="mt-1 text-sm text-slate-600">
              This matches the API contract for <span className="font-mono">POST /workspaces/setup</span>.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Workspace name</span>
              <input
                required
                minLength={2}
                maxLength={100}
                value={formData.workspaceName}
                onChange={(event) => setFormData({ ...formData, workspaceName: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600"
                placeholder="Sunshine Dental"
              />
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">Industry</span>
              <select
                value={formData.industryType}
                onChange={(event) => setFormData({ ...formData, industryType: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600"
              >
                {industryOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label>
              <span className="mb-1 block text-sm font-medium text-slate-700">Timezone</span>
              <input
                value={formData.timezone}
                onChange={(event) => setFormData({ ...formData, timezone: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600"
                placeholder="Asia/Kolkata"
              />
            </label>

            <label className="sm:col-span-2">
              <span className="mb-1 block text-sm font-medium text-slate-700">Admin display name</span>
              <input
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600"
                placeholder="Dr. Priya Sharma"
              />
            </label>
          </div>

          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-700">
              <Languages className="h-4 w-4" />
              Languages enabled
            </div>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((option) => {
                const selected = formData.languagesEnabled.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => toggleLanguage(option.value)}
                    className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                      selected ? 'border-green-600 bg-green-50 text-green-700' : 'border-slate-300 text-slate-700'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || isVerifying}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {(isLoading || isVerifying) && <Loader2 className="h-4 w-4 animate-spin" />}
            Create workspace
          </button>
        </form>

        <aside className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-950">Onboarding flow</h2>
          <ol className="mt-4 space-y-4 text-sm text-slate-600">
            <li><span className="font-mono text-slate-900">1.</span> Register account and verify email.</li>
            <li><span className="font-mono text-slate-900">2.</span> Store the returned setup token.</li>
            <li><span className="font-mono text-slate-900">3.</span> Create workspace and receive access token.</li>
          </ol>
        </aside>
      </main>
    </div>
  );
}
