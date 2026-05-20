import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { TeamsPage } from './pages/TeamsPage';
import { UsersPage } from './pages/UsersPage';
import { SettingsPage } from './pages/SettingsPage';
import { CreateScorecardPage } from './pages/ScoreCard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { DashboardLayout } from './components/DashboardLayout';
import { Toast } from './components/Toast';
import './App.css';
import CallCoach360Setup from './ui/Setup';

function App() {
  // Auth gating is temporarily disabled for now.
  // const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter>
      <Toast />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route
          path='/setup'
          element={<CallCoach360Setup/>}
        />

        {/* Protected Routes */}
        {/* <Route element={<ProtectedRoute />}> */}
          <Route path="/dashboard" element={<DashboardLayout><DashboardPage /></DashboardLayout>} />
          <Route path="/teams" element={<DashboardLayout><TeamsPage /></DashboardLayout>} />
          <Route path="/users" element={<DashboardLayout><UsersPage /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
          <Route path="/scorecards/new" element={<CreateScorecardPage />} />
        {/* </Route> */}

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
