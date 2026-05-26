import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { TeamsPage } from './pages/TeamsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { CreateScorecardPage } from './pages/ScoreCard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { InvitesPage } from './pages/InvitesPage';
import { AuditLogsPage } from './pages/AuditLogsPage';
import { ScorecardsPage } from './pages/ScorecardsPage';
import { DashboardLayout } from './components/DashboardLayout';
import { Toast } from './components/Toast';
import './App.css';
import CallCoach360Setup from './ui/Setup';
import CallsDashboard from './pages/CallsDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/setup" element={<CallCoach360Setup />} />

        {/* Protected Routes */}
        {/* <Route element={<ProtectedRoute />}> */}
          <Route path="/dashboard" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
          <Route path="/teams" element={<DashboardLayout><TeamsPage /></DashboardLayout>} />
          <Route path="/users" element={<DashboardLayout><UsersPage /></DashboardLayout>} />
          <Route path="/invites" element={<DashboardLayout><InvitesPage /></DashboardLayout>} />
          <Route path="/scorecards" element={<DashboardLayout><ScorecardsPage /></DashboardLayout>} />
          <Route path="/audit-logs" element={<DashboardLayout><AuditLogsPage /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
          <Route path="/scorecards/new" element={<CreateScorecardPage />} />
          <Route path="/manager" element={<ManagerDashboard />} />
          {/* Calls — has its own built-in sidebar and header, no DashboardLayout */}
          <Route path="/calls" element={<CallsDashboard />} />
          <Route path="/admin" element={<AdminDashboard />} />
        {/* </Route> */}

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/calls" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;