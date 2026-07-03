import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { teamService } from '../services/teamService';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { useToast } from '../hooks/useToast';
import { Spinner } from '../components/Spinner';
import { useAuthStore } from '../store/authStore';

const listFromResponse = (response, key) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.[key])) return response[key];
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const getInitials = (name, email) => {
  const source = name || email || '';
  if (!source) return '?';
  const parts = source.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
};

const AVATAR_COLORS = [
  { bg: '#DCFCE7', text: '#166534' },
  { bg: '#DBEAFE', text: '#1E40AF' },
  { bg: '#FEF3C7', text: '#92400E' },
  { bg: '#F3E8FF', text: '#6B21A8' },
  { bg: '#FEE2E2', text: '#991B1B' },
  { bg: '#E0F2FE', text: '#075985' },
];

const avatarColorFor = (seed) => {
  if (!seed) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export function UsersPage() {
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ role: 'AGENT', status: 'ACTIVE', teamIds: [] });
  const [filterForm, setFilterForm] = useState({ role: '', status: '', teamId: '' });
  const [filters, setFilters] = useState({});

  const { user: currentUser } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const canManageUsers = !currentUser || ['ADMIN'].includes(currentUser?.role);

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const [usersData, teamsData] = await Promise.all([
        userService.getUsers(filters),
        teamService.getTeams({ limit: 100 }),
      ]);
      setUsers(listFromResponse(usersData, 'users'));
      setTeams(listFromResponse(teamsData, 'teams'));
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setFormData({
      role: user.role || 'AGENT',
      status: user.status || 'ACTIVE',
      teamIds: user.teamIds || [],
    });
  };

  const handleCloseEdit = () => {
    setEditingUser(null);
    setFormData({ role: 'AGENT', status: 'ACTIVE', teamIds: [] });
  };

  const toggleTeam = (teamId) => {
    setFormData((current) => ({
      ...current,
      teamIds: current.teamIds.includes(teamId)
        ? current.teamIds.filter((id) => id !== teamId)
        : [...current.teamIds, teamId],
    }));
  };

  const handleUpdateUser = async (event) => {
    event.preventDefault();
    try {
      await userService.updateUser(editingUser._id || editingUser.id, formData);
      toast.success('User updated successfully');
      handleCloseEdit();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to update user');
    }
  };

  const handleStatusAction = async (user) => {
    const userId = user._id || user.id;
    try {
      if (user.status === 'ACTIVE') {
        await userService.disableUser(userId);
        toast.success('User disabled');
      } else {
        await userService.enableUser(userId);
        toast.success('User enabled');
      }
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Status update failed');
    }
  };

  const getStatusBadgeStyle = (status) => {
    const styles = {
      ACTIVE: { background: '#DCFCE7', color: '#166534' },
      DISABLED: { background: '#FEE2E2', color: '#991B1B' },
      PENDING_VERIFICATION: { background: '#FEF3C7', color: '#92400E' },
      EMAIL_VERIFIED: { background: '#DBEAFE', color: '#1E40AF' },
    };
    return styles[status] || { background: '#F3F4F6', color: '#374151' };
  };

  const getRoleBadgeStyle = (role) => {
    const styles = {
      ADMIN: { background: '#F3E8FF', color: '#6B21A8' },
      MANAGER: { background: '#DBEAFE', color: '#1E40AF' },
      AGENT: { background: '#DCFCE7', color: '#166534' },
    };
    return styles[role] || { background: '#F3F4F6', color: '#374151' };
  };

  const formatLabel = (value) => {
    if (!value) return 'N/A';
    return value
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const handleFilter = (event) => {
    event.preventDefault();
    setFilters(Object.fromEntries(Object.entries(filterForm).filter(([, value]) => value)));
  };

  const clearFilters = () => {
    setFilterForm({ role: '', status: '', teamId: '' });
    setFilters({});
  };

  // Derived stats (computed live from current data — no static values)
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.status === 'ACTIVE').length;
  const pendingUsers = users.filter((user) =>
    user.status === 'PENDING_VERIFICATION' || user.status === 'EMAIL_VERIFIED'
  ).length;
  const teamAssignments = users.reduce((sum, user) => sum + (user.teamIds?.length || 0), 0);

  const teamNameById = teams.reduce((map, team) => {
    const id = team._id || team.id;
    map[id] = team.name;
    return map;
  }, {});

  const statCards = [
    { label: 'Total Users', value: totalUsers, accent: '#22C55E', accentBg: '#DCFCE7' },
    { label: 'Active Users', value: activeUsers, accent: '#22C55E', accentBg: '#DCFCE7' },
    { label: 'Pending Invites', value: pendingUsers, accent: '#F59E0B', accentBg: '#FEF3C7' },
    { label: 'Teams Assigned', value: teamAssignments, accent: '#3B82F6', accentBg: '#DBEAFE' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-4 w-72 animate-pulse rounded-lg bg-gray-100" />
          </div>
          <div className="h-10 w-32 animate-pulse rounded-full bg-gray-200" />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
              <div className="mt-3 h-8 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex h-40 items-center justify-center">
            <Spinner size="lg" className="text-green-600" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">
            Good morning, {currentUser?.name || 'Admin'}
          </h2>
          <p className="mt-1.5 text-gray-500">
            Manage your workspace users. View, manage and organize users across all teams.
          </p>
        </div>
        {canManageUsers && (
          <Button
            onClick={() => navigate('/invites')}
            className="shrink-0 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600 hover:shadow"
          >
            + Manage Invites
          </Button>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
              style={{ backgroundColor: stat.accentBg }}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: stat.accent }} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <form onSubmit={handleFilter} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto_auto] md:items-end">
          <label>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Role</span>
            <select
              value={filterForm.role}
              onChange={(event) => setFilterForm({ ...filterForm, role: event.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
            >
              <option value="">All roles</option>
              <option value="AGENT">Agent</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Status</span>
            <select
              value={filterForm.status}
              onChange={(event) => setFilterForm({ ...filterForm, status: event.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">Team</span>
            <select
              value={filterForm.teamId}
              onChange={(event) => setFilterForm({ ...filterForm, teamId: event.target.value })}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
            >
              <option value="">All teams</option>
              {teams.map((team) => (
                <option key={team._id || team.id} value={team._id || team.id}>{team.name}</option>
              ))}
            </select>
          </label>
          <Button
            type="submit"
            className="rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600"
          >
            Filter
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={clearFilters}
            className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Clear
          </Button>
        </form>
      </div>

      {/* Users table */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">User</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Role</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Teams</th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Last Login</th>
                {canManageUsers && (
                  <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((user) => {
                const id = user._id || user.id;
                const initials = getInitials(user.name, user.email);
                const palette = avatarColorFor(user.email || user.name || id);
                const userTeamNames = (user.teamIds || [])
                  .map((tid) => teamNameById[tid])
                  .filter(Boolean);

                return (
                  <tr key={id} className="transition hover:bg-gray-50/60">
                    <td className="whitespace-nowrap px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold"
                          style={{ backgroundColor: palette.bg, color: palette.text }}
                        >
                          {initials}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">{user.name || 'Unnamed user'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                        style={getRoleBadgeStyle(user.role)}
                      >
                        {formatLabel(user.role)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                        style={getStatusBadgeStyle(user.status)}
                      >
                        <span
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: getStatusBadgeStyle(user.status).color }}
                        />
                        {formatLabel(user.status)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {userTeamNames.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {userTeamNames.slice(0, 2).map((name) => (
                            <span
                              key={name}
                              className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
                            >
                              {name}
                            </span>
                          ))}
                          {userTeamNames.length > 2 && (
                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-500">
                              +{userTeamNames.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">
                          {(user.teamIds?.length || 0)} teams
                        </span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                    </td>
                    {canManageUsers && (
                      <td className="whitespace-nowrap px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(user)}
                            className="rounded-full bg-green-50 px-3.5 py-1.5 text-xs font-semibold text-green-700 transition hover:bg-green-100"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusAction(user)}
                            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                              user.status === 'ACTIVE'
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                            }`}
                          >
                            {user.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td colSpan={canManageUsers ? 6 : 5} className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                        </svg>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">No users found</p>
                      <p className="text-sm text-gray-500">Invite your first team member to get started.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit modal */}
      <Modal isOpen={Boolean(editingUser)} onClose={handleCloseEdit} title="Edit User" size="lg">
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
              <select
                value={formData.role}
                onChange={(event) => setFormData({ ...formData, role: event.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
              >
                <option value="AGENT">Agent</option>
                <option value="MANAGER">Manager</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Status</label>
              <select
                value={formData.status}
                onChange={(event) => setFormData({ ...formData, status: event.target.value })}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
              >
                <option value="ACTIVE">Active</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>
          </div>

          {teams.length > 0 && (
            <div>
              <p className="mb-2 text-sm font-medium text-gray-700">Teams</p>
              <div className="flex flex-wrap gap-2">
                {teams.map((team) => {
                  const teamId = team._id || team.id;
                  const selected = formData.teamIds.includes(teamId);
                  return (
                    <button
                      key={teamId}
                      type="button"
                      onClick={() => toggleTeam(teamId)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition ${
                        selected
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {team.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCloseEdit}
              className="rounded-full border border-gray-200 px-5 py-2.5 font-medium text-gray-600 transition hover:bg-gray-50"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full bg-green-500 px-5 py-2.5 font-medium text-white transition hover:bg-green-600"
            >
              Save User
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
