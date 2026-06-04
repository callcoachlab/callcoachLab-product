import { useEffect, useState } from 'react';
import { inviteService } from '../services/inviteService';
import { teamService } from '../services/teamService';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import { useToast } from '../components/Toast';

const emptyInvite = { email: '', role: 'AGENT', teamIds: [] };

const listFromResponse = (response, key) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.[key])) return response[key];
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

export function InvitesPage() {
  const [invites, setInvites] = useState([]);
  const [teams, setTeams] = useState([]);
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formRows, setFormRows] = useState([emptyInvite]);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchData();
  }, [status, page]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [inviteResponse, teamResponse] = await Promise.all([
        inviteService.getInvites({ page, limit: 20, ...(status ? { status } : {}) }),
        teamService.getTeams({ limit: 100 }),
      ]);
      setInvites(listFromResponse(inviteResponse, 'invites'));
      setTeams(listFromResponse(teamResponse, 'teams'));
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to load invites');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRow = (index, key, value) => {
    setFormRows((rows) => rows.map((row, rowIndex) => (
      rowIndex === index ? { ...row, [key]: value } : row
    )));
  };

  const toggleTeam = (index, teamId) => {
    setFormRows((rows) => rows.map((row, rowIndex) => {
      if (rowIndex !== index) return row;
      const teamIds = row.teamIds.includes(teamId)
        ? row.teamIds.filter((id) => id !== teamId)
        : [...row.teamIds, teamId];
      return { ...row, teamIds };
    }));
  };

  const handleCreateInvites = async (event) => {
    event.preventDefault();
    const invitesToSend = formRows.filter((row) => row.email.trim());
    if (!invitesToSend.length) {
      toast.error('Add at least one email address');
      return;
    }

    try {
      setIsSaving(true);
      await inviteService.createInvites(invitesToSend);
      toast.success('Invites sent successfully');
      setIsModalOpen(false);
      setFormRows([emptyInvite]);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to send invites');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAction = async (inviteId, action) => {
    try {
      if (action === 'resend') {
        await inviteService.resendInvite(inviteId);
        toast.success('Invite resent');
      } else {
        await inviteService.revokeInvite(inviteId);
        toast.success('Invite revoked');
      }
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Invite action failed');
    }
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
          <h2 className="text-3xl font-bold text-gray-900">Invites</h2>
          <p className="mt-1 text-gray-600">Send, resend, revoke, and review workspace invitations</p>
        </div>
        <div className="flex gap-3">
          <select
            value={status}
            onChange={(event) => { setStatus(event.target.value); setPage(1); }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="ACCEPTED">Accepted</option>
            <option value="REVOKED">Revoked</option>
            <option value="EXPIRED">Expired</option>
          </select>
          <Button onClick={() => setIsModalOpen(true)}>Create Invites</Button>
        </div>
      </div>

      <Card padding={false}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {invites.map((invite) => {
                const inviteId = invite._id || invite.id;
                return (
                  <tr key={inviteId}>
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{invite.email}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{invite.role}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{invite.status}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">
                      {invite.createdAt ? new Date(invite.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleAction(inviteId, 'resend')}>
                          Resend
                        </Button>
                        <Button size="sm" variant="danger" onClick={() => handleAction(inviteId, 'revoke')}>
                          Revoke
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {invites.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">No invites found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
          Previous
        </Button>
        <span className="flex items-center px-3 text-sm text-gray-600">Page {page}</span>
        <Button variant="outline" disabled={invites.length < 20} onClick={() => setPage((current) => current + 1)}>
          Next
        </Button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Invites" size="xl">
        <form onSubmit={handleCreateInvites} className="space-y-4">
          {formRows.map((row, index) => (
            <div key={index} className="rounded-lg border border-gray-200 p-4">
              <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                <Input
                  label="Email"
                  type="email"
                  fullWidth
                  value={row.email}
                  onChange={(event) => updateRow(index, 'email', event.target.value)}
                  placeholder="agent@example.com"
                />
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={row.role}
                    onChange={(event) => updateRow(index, 'role', event.target.value)}
                    className="block w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="AGENT">Agent</option>
                    <option value="MANAGER">Manager</option>
                  </select>
                </div>
              </div>
              {teams.length > 0 && (
                <div className="mt-4">
                  <p className="mb-2 text-sm font-medium text-gray-700">Teams</p>
                  <div className="flex flex-wrap gap-2">
                    {teams.map((team) => {
                      const teamId = team._id || team.id;
                      const selected = row.teamIds.includes(teamId);
                      return (
                        <button
                          key={teamId}
                          type="button"
                          onClick={() => toggleTeam(index, teamId)}
                          className={`rounded-lg border px-3 py-1.5 text-sm ${selected ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-300 text-gray-700'}`}
                        >
                          {team.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-between gap-3">
            <Button type="button" variant="outline" onClick={() => setFormRows([...formRows, emptyInvite])}>
              Add Row
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button type="submit" loading={isSaving}>Send Invites</Button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
