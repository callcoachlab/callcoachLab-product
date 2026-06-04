import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/userService';
import { teamService } from '../services/teamService';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { Spinner } from '../components/Spinner';
import { useAuthStore } from '../store/authStore';

const listFromResponse = (response, key) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.[key])) return response[key];
  if (Array.isArray(response?.data)) return response.data;
  return [];
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

  const getRoleBadgeColor = (role) => {
    const colors = {
      ADMIN: 'bg-purple-100 text-purple-800',
      MANAGER: 'bg-blue-100 text-blue-800',
      AGENT: 'bg-green-100 text-green-800',
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      DISABLED: 'bg-red-100 text-red-800',
      PENDING_VERIFICATION: 'bg-yellow-100 text-yellow-800',
      EMAIL_VERIFIED: 'bg-blue-100 text-blue-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleFilter = (event) => {
    event.preventDefault();
    setFilters(Object.fromEntries(Object.entries(filterForm).filter(([, value]) => value)));
  };

  const clearFilters = () => {
    setFilterForm({ role: '', status: '', teamId: '' });
    setFilters({});
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Users</h2>
          <p className="mt-1 text-gray-600">Manage workspace users, roles, teams, and account access</p>
        </div>
        {canManageUsers && (
          <Button onClick={() => navigate('/invites')}>
            Manage Invites
          </Button>
        )}
      </div>

      <Card>
        <form onSubmit={handleFilter} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto_auto] md:items-end">
          <label>
            <span className="mb-1 block text-sm font-medium text-gray-700">Role</span>
            <select
              value={filterForm.role}
              onChange={(event) => setFilterForm({ ...filterForm, role: event.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">All roles</option>
              <option value="AGENT">Agent</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium text-gray-700">Status</span>
            <select
              value={filterForm.status}
              onChange={(event) => setFilterForm({ ...filterForm, status: event.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </label>
          <label>
            <span className="mb-1 block text-sm font-medium text-gray-700">Team</span>
            <select
              value={filterForm.teamId}
              onChange={(event) => setFilterForm({ ...filterForm, teamId: event.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2"
            >
              <option value="">All teams</option>
              {teams.map((team) => (
                <option key={team._id || team.id} value={team._id || team.id}>{team.name}</option>
              ))}
            </select>
          </label>
          <Button type="submit">Filter</Button>
          <Button type="button" variant="ghost" onClick={clearFilters}>Clear</Button>
        </form>
      </Card>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Teams</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Last Login</th>
                {canManageUsers && (
                  <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {users.map((user) => (
                <tr key={user._id || user.id}>
                  <td className="whitespace-nowrap px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name || 'Unnamed user'}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                      {user.role || 'N/A'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(user.status)}`}>
                      {user.status || 'N/A'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {user.teamIds?.length || 0} teams
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                  </td>
                  {canManageUsers && (
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleOpenEdit(user)}>
                          Edit
                        </Button>
                        <Button size="sm" variant={user.status === 'ACTIVE' ? 'danger' : 'secondary'} onClick={() => handleStatusAction(user)}>
                          {user.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={canManageUsers ? 6 : 5} className="px-6 py-12 text-center text-gray-500">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={Boolean(editingUser)} onClose={handleCloseEdit} title="Edit User" size="lg">
        <form onSubmit={handleUpdateUser} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
              <select
                value={formData.role}
                onChange={(event) => setFormData({ ...formData, role: event.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className={`rounded-lg border px-3 py-1.5 text-sm ${selected ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700'}`}
                    >
                      {team.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={handleCloseEdit}>Cancel</Button>
            <Button type="submit">Save User</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
