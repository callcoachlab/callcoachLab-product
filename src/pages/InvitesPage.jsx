import { useEffect, useState } from 'react';
import { inviteService } from '../services/inviteService';
import { teamService } from '../services/teamService';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import { useToast } from '../hooks/useToast';

const emptyInvite = { email: '', role: 'AGENT', teamIds: [] };

const listFromResponse = (response, key) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.[key])) return response[key];
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const STATUS_CONFIG = {
  PENDING:  { label: 'Pending',  bg: 'bg-amber-50',   text: 'text-amber-700',  dot: 'bg-amber-400'  },
  ACCEPTED: { label: 'Accepted', bg: 'bg-green-50',   text: 'text-green-700',  dot: 'bg-green-500'  },
  REVOKED:  { label: 'Revoked',  bg: 'bg-red-50',     text: 'text-red-600',    dot: 'bg-red-400'    },
  EXPIRED:  { label: 'Expired',  bg: 'bg-gray-100',   text: 'text-gray-500',   dot: 'bg-gray-400'   },
};

const ROLE_LABELS = {
  AGENT:   'Agent',
  MANAGER: 'Manager',
  ADMIN:   'Admin',
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.EXPIRED;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${cfg.bg} ${cfg.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function AvatarInitials({ name, email }) {
  const initials = name
    ? name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : (email || '?')[0].toUpperCase();
  const colors = ['bg-violet-100 text-violet-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-amber-100 text-amber-700', 'bg-pink-100 text-pink-700'];
  const color = colors[(initials.charCodeAt(0) || 0) % colors.length];
  return (
    <span className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${color}`}>
      {initials}
    </span>
  );
}

function StatCard({ label, value, icon, accent }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white px-5 py-4 shadow-sm">
      <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 leading-none">{value ?? '—'}</p>
        <p className="mt-0.5 text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

const FILTER_TABS = [
  { value: '', label: 'All' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'ACCEPTED', label: 'Accepted' },
  { value: 'REVOKED', label: 'Revoked' },
  { value: 'EXPIRED', label: 'Expired' },
];

export function InvitesPage() {
  const [invites, setInvites]       = useState([]);
  const [teams, setTeams]           = useState([]);
  const [status, setStatus]         = useState('');
  const [search, setSearch]         = useState('');
  const [page, setPage]             = useState(1);
  const [isLoading, setIsLoading]   = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formRows, setFormRows]     = useState([emptyInvite]);
  const [isSaving, setIsSaving]     = useState(false);
  const [stats, setStats]           = useState({ total: 0, pending: 0, accepted: 0, expired: 0 });
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
      const inviteList = listFromResponse(inviteResponse, 'invites');
      setInvites(inviteList);
      setTeams(listFromResponse(teamResponse, 'teams'));

      // Derive stats from response meta or fallback to counting list
      const meta = inviteResponse?.meta || inviteResponse?.pagination || {};
      setStats({
        total:    meta.totalMembers    ?? inviteResponse?.totalMembers    ?? inviteList.length,
        pending:  meta.pendingCount    ?? inviteResponse?.pendingCount    ?? inviteList.filter((i) => i.status === 'PENDING').length,
        accepted: meta.acceptedCount   ?? inviteResponse?.acceptedCount   ?? inviteList.filter((i) => i.status === 'ACCEPTED').length,
        expired:  meta.expiredCount    ?? inviteResponse?.expiredCount    ?? inviteList.filter((i) => i.status === 'EXPIRED').length,
      });
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to load invites');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRow = (index, key, value) => {
    setFormRows((rows) => rows.map((row, i) => (i === index ? { ...row, [key]: value } : row)));
  };

  const toggleTeam = (index, teamId) => {
    setFormRows((rows) => rows.map((row, i) => {
      if (i !== index) return row;
      const teamIds = row.teamIds.includes(teamId)
        ? row.teamIds.filter((id) => id !== teamId)
        : [...row.teamIds, teamId];
      return { ...row, teamIds };
    }));
  };

  const handleCreateInvites = async (event) => {
    event.preventDefault();
    const invitesToSend = formRows.filter((row) => row.email.trim());
    if (!invitesToSend.length) { toast.error('Add at least one email address'); return; }
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

  const filteredInvites = invites.filter((inv) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (inv.email || '').toLowerCase().includes(q) || (inv.name || '').toLowerCase().includes(q);
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" className="text-green-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">

      {/* ── Header ── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Team Invitations</h1>
          <p className="mt-1 text-sm text-gray-500">Invite new team members and manage pending invitations.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-600 active:bg-green-700 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Send Invite
        </button>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Team Members"
          value={stats.total}
          accent="bg-blue-50 text-blue-500"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-13.5 2.72a9.094 9.094 0 01-3.741-.479 3 3 0 014.682-2.72M15 9.75a3 3 0 11-6 0 3 3 0 016 0zm5.25 2.25a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zM3.75 12a2.25 2.25 0 114.5 0 2.25 2.25 0 01-4.5 0z" />
            </svg>
          }
        />
        <StatCard
          label="Pending Invites"
          value={stats.pending}
          accent="bg-amber-50 text-amber-500"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Accepted This Month"
          value={stats.accepted}
          accent="bg-green-50 text-green-600"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          label="Expired Invites"
          value={stats.expired}
          accent="bg-red-50 text-red-500"
          icon={
            <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          }
        />
      </div>

      {/* ── Main two-column layout ── */}
      <div className="flex flex-col gap-5 xl:flex-row">

        {/* ── Left: Table (70%) ── */}
        <div className="min-w-0 flex-1">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">

            {/* Table header */}
            <div className="flex flex-col gap-3 border-b border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-base font-semibold text-gray-900">Invited Members</h2>
              {/* Search */}
              <div className="relative">
                <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 15.803 7.5 7.5 0 0015.803 15.803z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name or email"
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-green-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100 sm:w-60"
                />
              </div>
            </div>

            {/* Filter tabs */}
            <div className="flex gap-1 overflow-x-auto border-b border-gray-100 px-5">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => { setStatus(tab.value); setPage(1); }}
                  className={`shrink-0 border-b-2 px-3 py-3 text-sm font-medium transition-colors ${
                    status === tab.value
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/60">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Member</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Role</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Date Sent</th>
                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredInvites.map((invite) => {
                    const inviteId = invite._id || invite.id;
                    const isPending = invite.status === 'PENDING';
                    return (
                      <tr key={inviteId} className="group hover:bg-gray-50/60 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <AvatarInitials name={invite.name} email={invite.email} />
                            <div className="min-w-0">
                              {invite.name && (
                                <p className="truncate font-medium text-gray-900">{invite.name}</p>
                              )}
                              <p className="truncate text-gray-500">{invite.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-gray-600">
                          {ROLE_LABELS[invite.role] || invite.role}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5">
                          <StatusBadge status={invite.status} />
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-gray-500">
                          {invite.createdAt ? new Date(invite.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {isPending && (
                              <button
                                onClick={() => handleAction(inviteId, 'resend')}
                                title="Resend"
                                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-green-300 hover:text-green-700 transition-colors"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                                </svg>
                                Resend
                              </button>
                            )}
                            {isPending && (
                              <button
                                onClick={() => handleAction(inviteId, 'revoke')}
                                title="Revoke"
                                className="inline-flex items-center gap-1 rounded-lg border border-red-100 bg-red-50 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-100 transition-colors"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                Revoke
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredInvites.length === 0 && (
                    <tr>
                      <td colSpan="5" className="px-6 py-16 text-center">
                        <div className="mx-auto flex max-w-xs flex-col items-center gap-3">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100">
                            <svg className="h-7 w-7 text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-semibold text-gray-700">No invitations found</p>
                            <p className="mt-1 text-xs text-gray-400">Start by inviting your first team member.</p>
                          </div>
                          <button
                            onClick={() => setIsModalOpen(true)}
                            className="rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 transition-colors"
                          >
                            Invite Member
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
              <span className="text-xs text-gray-400">{filteredInvites.length} result{filteredInvites.length !== 1 ? 's' : ''}</span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                >
                  Previous
                </button>
                <span className="text-xs text-gray-500 font-medium px-1">Page {page}</span>
                <button
                  disabled={invites.length < 20}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: sidebar cards (30%) ── */}
        <div className="flex w-full flex-col gap-5 xl:w-72 xl:shrink-0">

          {/* Quick Invite card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Send New Invitation</h3>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Email Address</label>
                <input
                  type="email"
                  value={formRows[0].email}
                  onChange={(e) => updateRow(0, 'email', e.target.value)}
                  placeholder="teammate@company.com"
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm placeholder:text-gray-400 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Role</label>
                <select
                  value={formRows[0].role}
                  onChange={(e) => updateRow(0, 'role', e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                >
                  <option value="AGENT">Agent</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
              {teams.length > 0 && (
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-600">Assign to Teams</label>
                  <div className="flex flex-wrap gap-1.5">
                    {teams.slice(0, 6).map((team) => {
                      const teamId = team._id || team.id;
                      const selected = formRows[0].teamIds.includes(teamId);
                      return (
                        <button
                          key={teamId}
                          type="button"
                          onClick={() => toggleTeam(0, teamId)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                            selected
                              ? 'border-green-400 bg-green-50 text-green-700'
                              : 'border-gray-200 text-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {team.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  if (formRows[0].email.trim()) {
                    setIsModalOpen(true);
                  } else {
                    toast.error('Enter an email address first');
                  }
                }}
                className="mt-1 w-full rounded-xl bg-green-500 py-2.5 text-sm font-semibold text-white hover:bg-green-600 active:bg-green-700 transition-colors"
              >
                Send Invite
              </button>
              <button
                onClick={() => setIsModalOpen(true)}
                className="w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Invite Multiple Members
              </button>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold text-gray-900">Recent Invitation Activity</h3>
            {invites.length === 0 ? (
              <p className="text-xs text-gray-400">No recent activity.</p>
            ) : (
              <ol className="relative border-l border-gray-100 pl-4 space-y-4">
                {invites.slice(0, 5).map((invite) => {
                  const inviteId = invite._id || invite.id;
                  const cfg = STATUS_CONFIG[invite.status] || STATUS_CONFIG.EXPIRED;
                  const verb = invite.status === 'ACCEPTED'
                    ? 'accepted the invitation'
                    : invite.status === 'REVOKED'
                    ? 'invite was revoked'
                    : invite.status === 'EXPIRED'
                    ? 'invitation expired'
                    : 'was invited';
                  return (
                    <li key={inviteId} className="relative">
                      <span className={`absolute -left-[1.125rem] top-1 flex h-3 w-3 items-center justify-center rounded-full ring-2 ring-white ${cfg.dot}`} />
                      <p className="text-xs text-gray-700 leading-snug">
                        <span className="font-medium">{invite.name || invite.email}</span>{' '}
                        <span className="text-gray-500">{verb}</span>
                      </p>
                      {invite.createdAt && (
                        <time className="mt-0.5 block text-[10px] text-gray-400">
                          {new Date(invite.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </time>
                      )}
                    </li>
                  );
                })}
              </ol>
            )}
          </div>
        </div>
      </div>

      {/* ── Create Invites Modal ── */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Send Invitations" size="xl">
        <form onSubmit={handleCreateInvites} className="space-y-4">
          {formRows.map((row, index) => (
            <div key={index} className="rounded-xl border border-gray-200 bg-gray-50/50 p-4">
              <div className="grid gap-3 md:grid-cols-[1fr_160px]">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Email Address</label>
                  <Input
                    type="email"
                    fullWidth
                    value={row.email}
                    onChange={(e) => updateRow(index, 'email', e.target.value)}
                    placeholder="agent@example.com"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Role</label>
                  <select
                    value={row.role}
                    onChange={(e) => updateRow(index, 'role', e.target.value)}
                    className="block w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                  >
                    <option value="AGENT">Agent</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              {teams.length > 0 && (
                <div className="mt-3">
                  <p className="mb-2 text-xs font-medium text-gray-600">Assign to Teams</p>
                  <div className="flex flex-wrap gap-1.5">
                    {teams.map((team) => {
                      const teamId = team._id || team.id;
                      const selected = row.teamIds.includes(teamId);
                      return (
                        <button
                          key={teamId}
                          type="button"
                          onClick={() => toggleTeam(index, teamId)}
                          className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition-colors ${
                            selected
                              ? 'border-green-400 bg-green-50 text-green-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                          }`}
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
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={() => setFormRows([...formRows, emptyInvite])}
              className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add Row
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-60 transition-colors"
              >
                {isSaving && <Spinner size="sm" className="text-white" />}
                Send Invites
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
