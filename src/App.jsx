import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { TeamsPage } from './pages/TeamsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { InvitesPage } from './pages/InvitesPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ScorecardsPage } from './pages/ScorecardsPage';
import { IngestionPage } from './pages/IngestionPage';
import { VerifyEmailPage } from './pages/VerifyEmailPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AcceptInvitePage } from './pages/AcceptInvitePage';
import { DashboardLayout } from './components/DashboardLayout';
import { GuestRoute, ProtectedRoute } from './components/ProtectedRoute';
import { useAuthStore } from './store/authStore';
import { Toast } from './components/Toast';
import './App.css';
import CallCoach360Setup from './ui/Setup';

function HomeRedirect() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated) && Boolean(localStorage.getItem('accessToken'));
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
}

function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        <Route path="/" element={<HomeRedirect />} />

        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/accept-invite" element={<AcceptInvitePage />} />
        </Route>

        <Route
          path='/setup'
          element={<CallCoach360Setup/>}
        />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
          <Route path="/teams" element={<DashboardLayout><TeamsPage /></DashboardLayout>} />
          <Route path="/users" element={<DashboardLayout><UsersPage /></DashboardLayout>} />
          <Route path="/invites" element={<DashboardLayout><InvitesPage /></DashboardLayout>} />
          <Route path="/scorecards" element={<DashboardLayout><ScorecardsPage /></DashboardLayout>} />
          <Route path="/ingestion" element={<DashboardLayout><IngestionPage /></DashboardLayout>} />
          <Route path="/audit-logs" element={<DashboardLayout><AuditLogsPage /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
