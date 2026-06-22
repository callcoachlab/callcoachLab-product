/**
 * DashboardLayout.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * ✅ All auth logic, logout, routing, role-based filtering: UNCHANGED.
 * ✅ Only UI / layout / styling updated to match Call Coach 360° Figma design.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  ShieldPlus,
  ClipboardList,
  ScrollText,
  Settings,
  UploadCloud,
  LogOut,
  Phone,
  Bell,
  Calendar,
  ListChecks,
  Menu,
  X,
  Search,
  Sparkles,
  Plus,
  Activity,
  ChevronDown,
  Grid3X3,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';

/* ─── Nav item map — icon per route ─────────────────────────────────────── */
const ICON_MAP = {
  '/dashboard':  LayoutDashboard,
  '/teams':      Users,
  '/users':      Users,
  '/invites':    ShieldPlus,
  '/scorecards': ClipboardList,
  '/ingestion':  UploadCloud,
  '/audit-logs': ScrollText,
  '/settings':   Settings,
};

export function DashboardLayout({ children }) {
  /* ── All logic UNCHANGED ─────────────────────────────────────────────── */
  const { user, workspace, logout } = useAuthStore();
  const navigate  = useNavigate();
  const location  = useLocation();
  const toast     = useToast();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
      navigate('/login', { replace: true });
    } catch {
      toast.error('Logout failed');
    }
  };

  const menuItems = [
    { name: 'Dashboard',  path: '/dashboard',  icon: LayoutDashboard },
    { name: 'Teams',      path: '/teams',       icon: Users           },
    { name: 'Users',      path: '/users',       icon: Users           },
    { name: 'Invites',    path: '/invites',     icon: ShieldPlus      },
    { name: 'Scorecards', path: '/scorecards',  icon: ClipboardList   },
    { name: 'Ingestion',  path: '/ingestion',   icon: UploadCloud      },
    { name: 'Audit Logs', path: '/audit-logs',  icon: ScrollText      },
  ];

  /* Role-based filter — UNCHANGED */
  const filteredMenuItems = menuItems.filter((item) => {
    if (item.path === '/settings' && user?.role === 'AGENT') return false;
    return true;
  });

  /* Derived display values */
  const currentPath   = location.pathname;
  const userName      = user?.name || user?.email || 'User';
  const workspaceName = workspace?.name || workspace?.workspace?.name || 'Workspace';
  const userInitials  = userName.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  /* ── Shared sidebar inner content ───────────────────────────────────── */
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 shrink-0">
        <span className="text-[18px] font-bold tracking-tight text-gray-900">
          Call Coach{' '}
          <span style={{ color: '#22C55E' }}>360°</span>
        </span>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {filteredMenuItems.map((item) => {
          const Icon     = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => { navigate(item.path); setMobileOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-colors text-left"
              style={
                isActive
                  ? { backgroundColor: '#22C55E', color: '#fff' }
                  : { color: '#4B5563' }
              }
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = '#F3F4F6'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
              {item.name}
            </button>
          );
        })}
      </nav>

      {/* Bottom: Settings + Log Out */}
      <div className="px-3 pb-6 pt-2 shrink-0 space-y-0.5 border-t border-gray-100 mt-2">
        {user?.role !== 'AGENT' && (
          <button
            onClick={() => { navigate('/settings'); setMobileOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-gray-600 text-left transition-colors"
            style={{ color: currentPath === '/settings' ? '#fff' : '#4B5563',
                     backgroundColor: currentPath === '/settings' ? '#22C55E' : 'transparent' }}
            onMouseEnter={(e) => { if (currentPath !== '/settings') e.currentTarget.style.backgroundColor = '#F3F4F6'; }}
            onMouseLeave={(e) => { if (currentPath !== '/settings') e.currentTarget.style.backgroundColor = 'transparent'; }}
          >
            <Settings className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            Settings
          </button>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium text-left transition-colors"
          style={{ color: '#4B5563' }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F3F4F6'; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
          Log Out
        </button>
      </div>
    </div>
  );

  /* ── Render ──────────────────────────────────────────────────────────── */
  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ backgroundColor: '#F7F8FA', fontFamily: "'Inter', -apple-system, sans-serif" }}
    >
      {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
      <aside
        className="hidden lg:flex flex-col w-[200px] shrink-0 h-full bg-white border-r border-gray-100"
        style={{ boxShadow: '1px 0 0 0 #F3F4F6' }}
      >
        {renderSidebarContent()}
      </aside>

      {/* ── Mobile sidebar overlay ───────────────────────────────────────── */}
      {mobileOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          {/* Drawer */}
          <aside className="fixed inset-y-0 left-0 z-50 flex flex-col w-[220px] bg-white shadow-xl lg:hidden">
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <span className="text-[17px] font-bold text-gray-900">
                Call Coach <span style={{ color: '#22C55E' }}>360°</span>
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {renderSidebarContent()}
            </div>
          </aside>
        </>
      )}

      {/* ── Right: header + content ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Top header ──────────────────────────────────────────────────── */}
        <header className="h-14 shrink-0 bg-white border-b border-gray-100 flex items-center px-4 gap-3 z-20">
          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo area — visible on mobile since sidebar is hidden */}
          <span className="lg:hidden text-[15px] font-bold text-gray-900 shrink-0">
            Call Coach <span style={{ color: '#22C55E' }}>360°</span>
          </span>

          {/* Breadcrumb — desktop */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {(() => {
              const Icon = ICON_MAP[currentPath] || LayoutDashboard;
              const label = filteredMenuItems.find((i) => i.path === currentPath)?.name
                         || (currentPath === '/settings' ? 'Settings' : 'Dashboard');
              return (
                <>
                  <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                  <span className="text-[13px] font-medium text-gray-700">{label}</span>
                </>
              );
            })()}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-xs ml-2 lg:ml-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search"
                aria-label="Search"
                className="w-full pl-8 pr-3 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg outline-none transition-colors"
                style={{ fontFamily: 'inherit' }}
                onFocus={(e) => { e.target.style.borderColor = '#22C55E'; e.target.style.boxShadow = '0 0 0 2px #DCFCE7'; }}
                onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* AI button */}
          <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
            <Sparkles className="h-3.5 w-3.5" style={{ color: '#22C55E' }} />
            AI
          </button>

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1.5">
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <Plus className="h-3.5 w-3.5" /> New
            </button>

            <button
              aria-label="Notifications"
              className="h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Bell className="h-4 w-4" />
            </button>

            <button
              aria-label="App grid"
              className="h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>

            {/* User avatar + name */}
            <div className="flex items-center gap-2 ml-1 cursor-pointer group">
              <div
                className="h-8 w-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                style={{ background: 'linear-gradient(135deg,#34D399,#0D9488)' }}
                aria-label={`Logged in as ${userName}`}
              >
                {userInitials}
              </div>
              <div className="hidden md:block text-right leading-tight">
                <p className="text-[12px] font-semibold text-gray-800 truncate max-w-[100px]">{userName}</p>
                <p className="text-[10px] text-gray-400 truncate max-w-[100px]">{workspaceName}</p>
              </div>
              <ChevronDown className="h-3 w-3 text-gray-400 hidden md:block" />
            </div>

            {/* Logout — visible on mobile where sidebar is hidden */}
            <button
              onClick={handleLogout}
              className="lg:hidden ml-1 text-[12px] font-medium text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        {/* ── Page content ────────────────────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>

      </div>
    </div>
  );
}
