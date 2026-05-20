import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, LayoutDashboard, ScrollText, Settings, ShieldPlus, Users } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';
import { useToast } from '../components/Toast';

export function DashboardLayout({ children }) {
  const { user, workspace, logout } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch {
      toast.error('Logout failed');
    }
  };

  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Teams', path: '/teams', icon: Users },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Invites', path: '/invites', icon: ShieldPlus },
    { name: 'Scorecards', path: '/scorecards', icon: ClipboardList },
    { name: 'Audit Logs', path: '/audit-logs', icon: ScrollText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (item.path === '/settings' && user?.role === 'AGENT') {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="border-b bg-white shadow-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="text-gray-600 hover:text-gray-900 lg:hidden"
              aria-label="Toggle navigation"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">CoachLab</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name || user?.email || 'Workspace Admin'}</p>
              <p className="text-xs text-gray-500">{workspace?.name || workspace?.workspace?.name || 'Workspace'}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed z-30 h-[calc(100vh-73px)] w-64 bg-white shadow-sm transition-transform duration-300 lg:static lg:translate-x-0`}
        >
          <nav className="space-y-2 p-4">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = window.location.pathname === item.path;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                  <span className="font-medium">{item.name}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
