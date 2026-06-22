import { useEffect, useState } from 'react';
import { auditLogService } from '../services/auditLogService';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Input } from '../components/Input';
import { Spinner } from '../components/Spinner';
import { useToast } from '../hooks/useToast';

const listFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.auditLogs)) return response.auditLogs;
  if (Array.isArray(response?.logs)) return response.logs;
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

const formatLabel = (value) => {
  if (!value) return 'N/A';
  return value
    .toString()
    .toLowerCase()
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getModuleStyle = (moduleName) => {
  const styles = {
    AUTH: { background: '#DBEAFE', color: '#1E40AF' },
    AUTHENTICATION: { background: '#DBEAFE', color: '#1E40AF' },
    TEAM: { background: '#F3E8FF', color: '#6B21A8' },
    TEAMS: { background: '#F3E8FF', color: '#6B21A8' },
    USER: { background: '#DCFCE7', color: '#166534' },
    USERS: { background: '#DCFCE7', color: '#166534' },
    CALL: { background: '#FEF3C7', color: '#92400E' },
    CALLS: { background: '#FEF3C7', color: '#92400E' },
    SCORECARD: { background: '#FCE7F3', color: '#9D174D' },
    SCORECARDS: { background: '#FCE7F3', color: '#9D174D' },
    SETTINGS: { background: '#E0F2FE', color: '#075985' },
    INVITE: { background: '#ECFCCB', color: '#3F6212' },
    WORKSPACE: { background: '#FFEDD5', color: '#9A3412' },
  };
  const key = (moduleName || '').toString().toUpperCase();
  return styles[key] || { background: '#F3F4F6', color: '#374151' };
};

const getStatusBadgeStyle = (status) => {
  const key = (status || '').toString().toUpperCase();
  const styles = {
    SUCCESS: { background: '#DCFCE7', color: '#166534' },
    SUCCEEDED: { background: '#DCFCE7', color: '#166534' },
    OK: { background: '#DCFCE7', color: '#166534' },
    WARNING: { background: '#FEF3C7', color: '#92400E' },
    PENDING: { background: '#FEF3C7', color: '#92400E' },
    FAILED: { background: '#FEE2E2', color: '#991B1B' },
    ERROR: { background: '#FEE2E2', color: '#991B1B' },
  };
  return styles[key] || { background: '#F3F4F6', color: '#374151' };
};

const formatRelativeTime = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} min${diffMin === 1 ? '' : 's'} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
};

const isSameDay = (dateString, reference) => {
  if (!dateString) return false;
  const date = new Date(dateString);
  return (
    date.getFullYear() === reference.getFullYear() &&
    date.getMonth() === reference.getMonth() &&
    date.getDate() === reference.getDate()
  );
};

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [actionType, setActionType] = useState('');
  const [appliedActionType, setAppliedActionType] = useState('');
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchLogs();
  }, [page, appliedActionType]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await auditLogService.getAuditLogs({
        page,
        limit: 50,
        ...(appliedActionType ? { actionType: appliedActionType } : {}),
      });
      setLogs(listFromResponse(response));
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilter = (event) => {
    event.preventDefault();
    setPage(1);
    setAppliedActionType(actionType.trim());
  };

  const handleClear = () => {
    setActionType('');
    setAppliedActionType('');
    setPage(1);
  };

  // ---- Derived data (all from `logs`, no static values) ----
  const now = new Date();

  const totalEvents = logs.length;

  const actorKey = (log) => log.actor?.email || log.user?.email || log.actorEmail || null;

  const activeUsersToday = new Set(
    logs.filter((log) => isSameDay(log.createdAt, now) && actorKey(log)).map((log) => actorKey(log))
  ).size;

  const criticalEvents = logs.filter((log) => {
    const status = (log.status || '').toString().toUpperCase();
    return status === 'FAILED' || status === 'ERROR' || status === 'CRITICAL';
  }).length;

  const todaysActivity = logs.filter((log) => isSameDay(log.createdAt, now)).length;

  const statCards = [
    { label: 'Total Events', value: totalEvents, accent: '#22C55E', accentBg: '#DCFCE7' },
    { label: 'Active Users', value: activeUsersToday, accent: '#3B82F6', accentBg: '#DBEAFE' },
    { label: 'Critical Events', value: criticalEvents, accent: '#EF4444', accentBg: '#FEE2E2' },
    { label: "Today's Activity", value: todaysActivity, accent: '#F59E0B', accentBg: '#FEF3C7' },
  ];

  // Most active user
  const actorCounts = {};
  logs.forEach((log) => {
    const key = actorKey(log);
    if (!key) return;
    actorCounts[key] = (actorCounts[key] || 0) + 1;
  });
  const mostActiveUser = Object.entries(actorCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

  // Most used module
  const moduleCounts = {};
  logs.forEach((log) => {
    const key = log.targetType || log.entityType || log.module || null;
    if (!key) return;
    moduleCounts[key] = (moduleCounts[key] || 0) + 1;
  });
  const mostUsedModuleEntry = Object.entries(moduleCounts).sort((a, b) => b[1] - a[1])[0];
  const mostUsedModule = mostUsedModuleEntry ? formatLabel(mostUsedModuleEntry[0]) : 'N/A';

  // Peak activity hour
  const hourCounts = {};
  logs.forEach((log) => {
    if (!log.createdAt) return;
    const hour = new Date(log.createdAt).getHours();
    hourCounts[hour] = (hourCounts[hour] || 0) + 1;
  });
  const peakHourEntry = Object.entries(hourCounts).sort((a, b) => b[1] - a[1])[0];
  const peakActivityTime = peakHourEntry
    ? new Date(0, 0, 0, Number(peakHourEntry[0])).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
    : 'N/A';

  // Recent critical events
  const recentCriticalEvents = logs
    .filter((log) => {
      const status = (log.status || '').toString().toUpperCase();
      return status === 'FAILED' || status === 'ERROR' || status === 'CRITICAL';
    })
    .slice(0, 3);

  // Recent activity feed
  const recentLogs = [...logs]
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 6);

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-4 w-80 animate-pulse rounded-lg bg-gray-100" />
          </div>
          <div className="flex gap-2">
            <div className="h-10 w-48 animate-pulse rounded-full bg-gray-100" />
            <div className="h-10 w-32 animate-pulse rounded-full bg-gray-200" />
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="h-11 w-11 animate-pulse rounded-xl bg-gray-100" />
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-100" />
                <div className="h-6 w-12 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="space-y-4 lg:col-span-3">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
              <div className="mt-4 h-10 w-full animate-pulse rounded-xl bg-gray-50" />
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm">
              {[0, 1, 2, 3, 4].map((row) => (
                <div key={row} className="flex items-center gap-4 border-b border-gray-50 px-6 py-4 last:border-0">
                  <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-1/4 animate-pulse rounded bg-gray-50" />
                  </div>
                  <div className="h-6 w-16 animate-pulse rounded-full bg-gray-100" />
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
              <div className="mt-4 space-y-3">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="h-3 w-full animate-pulse rounded bg-gray-50" />
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
              <div className="mt-4 space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-8 w-8 shrink-0 animate-pulse rounded-full bg-gray-100" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-3/4 animate-pulse rounded bg-gray-100" />
                      <div className="h-2.5 w-1/3 animate-pulse rounded bg-gray-50" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Audit Logs</h2>
          <p className="mt-1.5 text-gray-500">
            Monitor and track all system activities across your workspace.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <div className="relative">
            <svg
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
            <input
              type="text"
              placeholder="Search logs..."
              className="w-48 rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-sm text-gray-900 transition focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Export Logs
          </Button>
          <button
            type="button"
            onClick={fetchLogs}
            title="Refresh"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition hover:bg-gray-50 hover:text-gray-700"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
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

      {/* Main two-column layout */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        {/* Left: filters + table */}
        <div className="space-y-4 lg:col-span-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-3 text-sm font-semibold text-gray-900">Activity History</p>
            <form onSubmit={handleFilter} className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="flex-1">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Action Type
                </span>
                <Input
                  value={actionType}
                  onChange={(event) => setActionType(event.target.value)}
                  placeholder="e.g. WORKSPACE_UPDATED"
                  fullWidth
                  className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm focus:border-green-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-green-100"
                />
              </div>
              <Button
                type="submit"
                className="rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600"
              >
                Apply Filter
              </Button>
              <Button
                type="button"
                variant="ghost"
                onClick={handleClear}
                className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                Clear
              </Button>
            </form>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Timestamp</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">User</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Action</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Module</th>
                    <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">Status</th>
                    <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => {
                    const logId = log._id || log.id;
                    const email = log.actor?.email || log.user?.email || log.actorEmail || null;
                    const name = log.actor?.name || log.user?.name || null;
                    const initials = getInitials(name, email);
                    const palette = avatarColorFor(email || name || logId);
                    const moduleName = log.targetType || log.entityType || log.module || null;
                    const actionLabel = log.actionType || log.action || 'N/A';
                    const createdAt = log.createdAt ? new Date(log.createdAt) : null;

                    return (
                      <tr key={logId} className="transition hover:bg-gray-50/60">
                        <td className="whitespace-nowrap px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">
                            {createdAt ? createdAt.toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {createdAt ? createdAt.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) : ''}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {email ? (
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                                style={{ backgroundColor: palette.bg, color: palette.text }}
                              >
                                {initials}
                              </div>
                              <div>
                                {name && <div className="text-sm font-semibold text-gray-900">{name}</div>}
                                <div className="text-sm text-gray-500">{email}</div>
                              </div>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">System</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                          {formatLabel(actionLabel)}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {moduleName ? (
                            <span
                              className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                              style={getModuleStyle(moduleName)}
                            >
                              {formatLabel(moduleName)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">N/A</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {log.status ? (
                            <span
                              className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                              style={getStatusBadgeStyle(log.status)}
                            >
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ backgroundColor: getStatusBadgeStyle(log.status).color }}
                              />
                              {formatLabel(log.status)}
                            </span>
                          ) : (
                            <span className="text-sm text-gray-400">—</span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedLog(log)}
                            className="rounded-full bg-gray-50 px-3.5 py-1.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-100"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                            <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25Z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">No audit activity found</p>
                            <p className="mt-1 text-sm text-gray-500">
                              Activity records will appear here once users start interacting with the platform.
                            </p>
                          </div>
                          <Button
                            type="button"
                            onClick={fetchLogs}
                            className="mt-1 rounded-full bg-green-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-600"
                          >
                            Refresh Logs
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={logs.length < 50}
              onClick={() => setPage(page + 1)}
              className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        </div>

        {/* Right: insights + recent activity */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-gray-900">Activity Overview</p>
            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-gray-500">Most Active User</dt>
                <dd className="truncate font-medium text-gray-900" title={mostActiveUser}>{mostActiveUser}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-gray-500">Most Used Module</dt>
                <dd className="font-medium text-gray-900">{mostUsedModule}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-gray-500">Peak Activity Time</dt>
                <dd className="font-medium text-gray-900">{peakActivityTime}</dd>
              </div>
              <div>
                <dt className="mb-2 text-gray-500">Recent Critical Events</dt>
                <dd>
                  {recentCriticalEvents.length > 0 ? (
                    <ul className="space-y-2">
                      {recentCriticalEvents.map((log) => (
                        <li key={log._id || log.id} className="flex items-center justify-between gap-2 text-xs">
                          <span className="truncate font-medium text-gray-700">
                            {formatLabel(log.actionType || log.action || 'N/A')}
                          </span>
                          <span
                            className="rounded-full px-2 py-0.5 font-semibold"
                            style={getStatusBadgeStyle(log.status)}
                          >
                            {formatLabel(log.status)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-gray-400">No critical events</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-gray-900">Recent Activity</p>
            {recentLogs.length > 0 ? (
              <ul className="space-y-4">
                {recentLogs.map((log) => {
                  const logId = log._id || log.id;
                  const email = log.actor?.email || log.user?.email || log.actorEmail || null;
                  const name = log.actor?.name || log.user?.name || null;
                  const initials = getInitials(name, email);
                  const palette = avatarColorFor(email || name || logId);
                  const actionLabel = log.actionType || log.action || 'N/A';

                  return (
                    <li key={logId} className="flex items-start gap-3">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                        style={{ backgroundColor: palette.bg, color: palette.text }}
                      >
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{name || email || 'System'}</span>{' '}
                          {formatLabel(actionLabel).toLowerCase()}
                        </p>
                        <p className="mt-0.5 text-xs text-gray-400">{formatRelativeTime(log.createdAt)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* Audit details drawer */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-gray-900/30"
            onClick={() => setSelectedLog(null)}
          />
          <div className="relative flex h-full w-full max-w-md flex-col bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <p className="text-lg font-bold text-gray-900">Event Details</p>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <div className="space-y-5">
                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Event Information</p>
                  <dl className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-gray-500">Event ID</dt>
                      <dd className="truncate font-medium text-gray-900">{selectedLog._id || selectedLog.id || 'N/A'}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-gray-500">Timestamp</dt>
                      <dd className="font-medium text-gray-900">
                        {selectedLog.createdAt ? new Date(selectedLog.createdAt).toLocaleString() : 'N/A'}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-gray-500">User</dt>
                      <dd className="truncate font-medium text-gray-900">
                        {selectedLog.actor?.email || selectedLog.user?.email || selectedLog.actorEmail || 'System'}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-gray-500">Action</dt>
                      <dd className="font-medium text-gray-900">
                        {formatLabel(selectedLog.actionType || selectedLog.action || 'N/A')}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-gray-500">Module</dt>
                      <dd className="font-medium text-gray-900">
                        {formatLabel(selectedLog.targetType || selectedLog.entityType || selectedLog.module || 'N/A')}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-gray-500">Status</dt>
                      <dd>
                        {selectedLog.status ? (
                          <span
                            className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold"
                            style={getStatusBadgeStyle(selectedLog.status)}
                          >
                            {formatLabel(selectedLog.status)}
                          </span>
                        ) : 'N/A'}
                      </dd>
                    </div>
                  </dl>
                </section>

                {(selectedLog.previousValue || selectedLog.before) && (
                  <section>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Previous Value</p>
                    <pre className="overflow-x-auto rounded-xl bg-gray-50 p-3 text-xs text-gray-700">
                      {JSON.stringify(selectedLog.previousValue || selectedLog.before, null, 2)}
                    </pre>
                  </section>
                )}

                {(selectedLog.newValue || selectedLog.after) && (
                  <section>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">New Value</p>
                    <pre className="overflow-x-auto rounded-xl bg-gray-50 p-3 text-xs text-gray-700">
                      {JSON.stringify(selectedLog.newValue || selectedLog.after, null, 2)}
                    </pre>
                  </section>
                )}

                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Metadata</p>
                  <dl className="space-y-2 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-gray-500">Browser</dt>
                      <dd className="truncate font-medium text-gray-900">{selectedLog.userAgent || selectedLog.browser || 'N/A'}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-gray-500">Device</dt>
                      <dd className="truncate font-medium text-gray-900">{selectedLog.device || 'N/A'}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-gray-500">IP Address</dt>
                      <dd className="font-medium text-gray-900">{selectedLog.ipAddress || selectedLog.ip || 'N/A'}</dd>
                    </div>
                  </dl>
                </section>

                <section>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">Raw Event</p>
                  <pre className="overflow-x-auto rounded-xl bg-gray-50 p-3 text-xs text-gray-700">
                    {JSON.stringify(selectedLog, null, 2)}
                  </pre>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
