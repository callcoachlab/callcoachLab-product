import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Layers3,
  Mail,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { healthService } from '../services/healthService';
import { userService } from '../services/userService';
import { teamService } from '../services/teamService';
import { inviteService } from '../services/inviteService';
import { scorecardService } from '../services/scorecardService';
import { auditLogService } from '../services/auditLogService';
import { Card } from '../components/Card';
import { Spinner } from '../components/Spinner';

const listFromResponse = (response, key) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.[key])) return response[key];
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

const getId = (item) => item?._id || item?.id;

const formatDateTime = (value) => {
  if (!value) return 'Not recorded';
  return new Date(value).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const normalizeText = (value) => (
  value ? String(value).replaceAll('_', ' ').toLowerCase() : 'Unknown'
);

function MetricCard({ title, value, detail, icon, tone = 'blue' }) {
  const tones = {
    blue: 'bg-blue-50 text-blue-700 ring-blue-100',
    green: 'bg-green-50 text-green-700 ring-green-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
  };

  return (
    <Card className="shadow-sm ring-1 ring-gray-100">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-950">{value}</p>
        </div>
        <div className={`rounded-lg p-3 ring-1 ${tones[tone]}`}>
          {icon}
        </div>
      </div>
      <p className="mt-4 text-sm text-gray-600">{detail}</p>
    </Card>
  );
}

function ProgressRow({ label, value, total, tone = 'bg-blue-600' }) {
  const width = total ? Math.round((value / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">{value}</span>
      </div>
      <div className="h-2 rounded-full bg-gray-100">
        <div className={`h-2 rounded-full ${tone}`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user, workspace, fetchWorkspace } = useAuthStore();
  const [dashboardData, setDashboardData] = useState({
    users: [],
    teams: [],
    invites: [],
    scorecards: [],
    auditLogs: [],
  });
  const [apiHealth, setApiHealth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setLoadError('');

        const [workspaceResult, healthResult, usersResult, teamsResult, invitesResult, scorecardsResult, logsResult] = await Promise.allSettled([
          fetchWorkspace(),
          healthService.checkHealth(),
          userService.getUsers({ limit: 100 }),
          teamService.getTeams({ limit: 100 }),
          inviteService.getInvites({ limit: 100 }),
          scorecardService.getScorecards({ limit: 100 }),
          auditLogService.getAuditLogs({ page: 1, limit: 8 }),
        ]);

        if (!isMounted) return;

        setApiHealth(healthResult.status === 'fulfilled' ? healthResult.value : { status: 'offline' });
        setDashboardData({
          users: usersResult.status === 'fulfilled' ? listFromResponse(usersResult.value, 'users') : [],
          teams: teamsResult.status === 'fulfilled' ? listFromResponse(teamsResult.value, 'teams') : [],
          invites: invitesResult.status === 'fulfilled' ? listFromResponse(invitesResult.value, 'invites') : [],
          scorecards: scorecardsResult.status === 'fulfilled' ? listFromResponse(scorecardsResult.value, 'scorecards') : [],
          auditLogs: logsResult.status === 'fulfilled' ? listFromResponse(logsResult.value, 'auditLogs') : [],
        });

        const failedRequiredCalls = [workspaceResult, usersResult, teamsResult, invitesResult, scorecardsResult, logsResult]
          .filter((result) => result.status === 'rejected');
        if (failedRequiredCalls.length) {
          setLoadError('Some dashboard sections could not be refreshed.');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [fetchWorkspace]);

  const stats = useMemo(() => {
    const { users, teams, invites, scorecards, auditLogs } = dashboardData;
    const activeUsers = users.filter((item) => item.status === 'ACTIVE').length;
    const disabledUsers = users.filter((item) => item.status === 'DISABLED').length;
    const pendingInvites = invites.filter((item) => item.status === 'PENDING').length;
    const acceptedInvites = invites.filter((item) => item.status === 'ACCEPTED').length;
    const publishedScorecards = scorecards.filter((item) => item.isPublished).length;
    const draftScorecards = scorecards.length - publishedScorecards;
    const totalMembers = teams.reduce((sum, team) => sum + Number(team.memberCount || 0), 0);
    const teamsWithMembers = teams.filter((team) => Number(team.memberCount || 0) > 0).length;
    const roles = users.reduce((acc, item) => {
      const role = item.role || 'UNKNOWN';
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {});
    const recentActiveUsers = users
      .filter((item) => item.lastLoginAt)
      .sort((a, b) => new Date(b.lastLoginAt) - new Date(a.lastLoginAt))
      .slice(0, 4);
    const setupItems = [
      { label: 'Workspace profile', done: Boolean(workspace?.name || workspace?.workspace?.name) },
      { label: 'Teams created', done: teams.length > 0 },
      { label: 'Users active', done: activeUsers > 0 },
      { label: 'Scorecards published', done: publishedScorecards > 0 },
      { label: 'Invites sent', done: invites.length > 0 },
    ];
    const completedSetup = setupItems.filter((item) => item.done).length;

    return {
      activeUsers,
      disabledUsers,
      pendingInvites,
      acceptedInvites,
      publishedScorecards,
      draftScorecards,
      totalMembers,
      teamsWithMembers,
      roles,
      recentActiveUsers,
      recentLogs: auditLogs.slice(0, 5),
      setupItems,
      setupPercent: Math.round((completedSetup / setupItems.length) * 100),
    };
  }, [dashboardData, workspace]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" className="text-blue-600" />
      </div>
    );
  }

  const workspaceName = workspace?.name || workspace?.workspace?.name || 'Workspace';
  const totalUsers = dashboardData.users.length;
  const totalTeams = dashboardData.teams.length;
  const totalInvites = dashboardData.invites.length;
  const totalScorecards = dashboardData.scorecards.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-blue-700">{workspaceName}</p>
          <h2 className="mt-1 text-3xl font-bold text-gray-950">
            Good morning, {user?.name || user?.email || 'User'}
          </h2>
          <p className="mt-2 max-w-3xl text-gray-600">
            Your workspace has {stats.activeUsers} active users across {totalTeams} teams, with {stats.pendingInvites} pending invites and {stats.publishedScorecards} published scorecards ready for quality reviews.
          </p>
        </div>
        <div className={`flex w-fit items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium ${apiHealth?.status === 'offline' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
          <Activity className="h-4 w-4" aria-hidden="true" />
          API {apiHealth?.status === 'offline' ? 'Offline' : 'Healthy'}
        </div>
      </div>

      {loadError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {loadError}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Active Users"
          value={stats.activeUsers}
          detail={`${stats.disabledUsers} disabled of ${totalUsers} total users`}
          icon={<Users className="h-5 w-5" aria-hidden="true" />}
          tone="blue"
        />
        <MetricCard
          title="Teams"
          value={totalTeams}
          detail={`${stats.teamsWithMembers} teams have assigned members`}
          icon={<Layers3 className="h-5 w-5" aria-hidden="true" />}
          tone="green"
        />
        <MetricCard
          title="Pending Invites"
          value={stats.pendingInvites}
          detail={`${stats.acceptedInvites} accepted from ${totalInvites} invites`}
          icon={<Mail className="h-5 w-5" aria-hidden="true" />}
          tone="amber"
        />
        <MetricCard
          title="Published Scorecards"
          value={stats.publishedScorecards}
          detail={`${stats.draftScorecards} drafts from ${totalScorecards} scorecards`}
          icon={<ClipboardList className="h-5 w-5" aria-hidden="true" />}
          tone="violet"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
        <Card className="shadow-sm ring-1 ring-gray-100">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-950">Workspace Composition</h3>
              <p className="mt-1 text-sm text-gray-500">Live ratios from users, teams, invites, and scorecards</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-blue-600" aria-hidden="true" />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <ProgressRow label="Active users" value={stats.activeUsers} total={Math.max(totalUsers, 1)} tone="bg-blue-600" />
              <ProgressRow label="Teams with members" value={stats.teamsWithMembers} total={Math.max(totalTeams, 1)} tone="bg-green-600" />
              <ProgressRow label="Published scorecards" value={stats.publishedScorecards} total={Math.max(totalScorecards, 1)} tone="bg-violet-600" />
              <ProgressRow label="Accepted invites" value={stats.acceptedInvites} total={Math.max(totalInvites, 1)} tone="bg-amber-500" />
            </div>
            <div className="rounded-lg bg-gray-50 p-4">
              <h4 className="text-sm font-semibold text-gray-900">Role split</h4>
              <div className="mt-4 space-y-3">
                {['ADMIN', 'MANAGER', 'AGENT'].map((role) => (
                  <div key={role} className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{normalizeText(role)}</span>
                    <span className="font-semibold text-gray-950">{stats.roles[role] || 0}</span>
                  </div>
                ))}
              </div>
              <div className="mt-5 rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-sm text-gray-500">Average members per team</p>
                <p className="mt-1 text-2xl font-bold text-gray-950">
                  {totalTeams ? (stats.totalMembers / totalTeams).toFixed(1) : '0.0'}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="shadow-sm ring-1 ring-gray-100">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-950">Setup Progress</h3>
              <p className="mt-1 text-sm text-gray-500">{stats.setupPercent}% complete</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-green-700 ring-1 ring-green-100">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </div>
          </div>
          <div className="mb-5 h-3 rounded-full bg-gray-100">
            <div className="h-3 rounded-full bg-green-600" style={{ width: `${stats.setupPercent}%` }} />
          </div>
          <div className="space-y-3">
            {stats.setupItems.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3 rounded-lg border border-gray-100 px-3 py-2">
                <span className="text-sm font-medium text-gray-700">{item.label}</span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${item.done ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                  {item.done ? 'Done' : 'Open'}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="shadow-sm ring-1 ring-gray-100">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-950">Recent Activity</h3>
              <p className="mt-1 text-sm text-gray-500">Latest audit log entries</p>
            </div>
            <Clock3 className="h-5 w-5 text-gray-500" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            {stats.recentLogs.map((log) => (
              <div key={getId(log)} className="flex items-start justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium capitalize text-gray-950">{normalizeText(log.actionType || log.action)}</p>
                  <p className="mt-1 text-sm text-gray-500">
                    {log.actor?.email || log.user?.email || log.actorEmail || 'System'} on {log.targetType || log.entityType || 'workspace'}
                  </p>
                </div>
                <p className="shrink-0 text-right text-xs text-gray-500">{formatDateTime(log.createdAt)}</p>
              </div>
            ))}
            {stats.recentLogs.length === 0 && (
              <div className="rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                No audit activity found yet
              </div>
            )}
          </div>
        </Card>

        <Card className="shadow-sm ring-1 ring-gray-100">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-gray-950">Recent User Logins</h3>
              <p className="mt-1 text-sm text-gray-500">People who have signed in most recently</p>
            </div>
            <Users className="h-5 w-5 text-gray-500" aria-hidden="true" />
          </div>
          <div className="space-y-3">
            {stats.recentActiveUsers.map((item) => (
              <div key={getId(item)} className="flex items-center justify-between gap-4 border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-950">{item.name || 'Unnamed user'}</p>
                  <p className="truncate text-sm text-gray-500">{item.email}</p>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                    {item.role || 'USER'}
                  </span>
                  <p className="mt-1 text-xs text-gray-500">{formatDateTime(item.lastLoginAt)}</p>
                </div>
              </div>
            ))}
            {stats.recentActiveUsers.length === 0 && (
              <div className="rounded-lg bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                No user login history available
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
