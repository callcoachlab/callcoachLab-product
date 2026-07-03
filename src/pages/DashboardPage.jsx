/**
 * DashboardPage.jsx — Call Coach 360°
 * ─────────────────────────────────────────────────────────────────────────────
 * ✅ No sidebar / header — those live in DashboardLayout.
 * ✅ All API calls, endpoints, auth, business logic: UNCHANGED.
 * ✅ No fake/static data rendered to users.
 *    Fields with no API source show empty-state placeholders ("—", "N/A", 0).
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useEffect, useMemo, useState } from 'react';
import { Calendar, ChevronDown, MapPin, BarChart2, Clock } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { userService }     from '../services/userService';
import { teamService }     from '../services/teamService';
import { inviteService }   from '../services/inviteService';
import { scorecardService } from '../services/scorecardService';
import { auditLogService } from '../services/auditLogService';
import { Spinner } from '../components/Spinner';

/* ─── UI-only constants (filter labels, column headers) ─────────────────── */
const SOURCE_FILTERS = ['Ads', 'LSA', 'Web', 'Ref', 'Meta'];
const AVATAR_COLORS  = ['#6C63FF', '#F59E0B', '#EF4444', '#10B981', '#3B82F6'];

/* ─── Helpers (UNCHANGED) ────────────────────────────────────────────────── */
const listFromResponse = (response, key) => {
  if (Array.isArray(response))          return response;
  if (Array.isArray(response?.[key]))   return response[key];
  if (Array.isArray(response?.data))    return response.data;
  return [];
};
const getId       = (item) => item?._id || item?.id;
const getInitials = (str)  =>
  (str || 'U').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
const todayLabel  = () =>
  new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

/* ══════════════════════════════════════════════════════════════════════════
   SHARED EMPTY STATE
══════════════════════════════════════════════════════════════════════════ */
function EmptyState({ icon, message }) {
  const Icon = icon;

  return (
    <div className="flex flex-col items-center justify-center py-6 gap-2 text-gray-300">
      <Icon className="h-8 w-8" />
      <p className="text-[11px] text-center leading-snug">{message}</p>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   LEFT — CHART AREA
   Chart bars / source table are UI scaffolding only.
   Real data will plug in once a marketing/ROI API exists.
══════════════════════════════════════════════════════════════════════════ */
function MarketingROIChart({ activeFilter, onFilterChange }) {
  return (
    <div>
      {/* Title row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h2 className="text-[15px] font-semibold text-gray-900">
            Marketing ROI{' '}
            <span className="text-gray-400 font-normal text-sm">(Quality by source)</span>
          </h2>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Qualified &amp; booked performance across lead sources
          </p>
        </div>
        <button className="flex items-center gap-1 text-xs text-gray-500 border border-gray-200 rounded-lg px-2.5 py-1.5 hover:bg-gray-50 shrink-0">
          2 months <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Source filter pills */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        {SOURCE_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => onFilterChange(f)}
            className="px-3 py-1 rounded-full text-xs font-medium transition-colors"
            style={
              activeFilter === f
                ? { backgroundColor: '#22C55E', color: '#fff' }
                : { backgroundColor: '#F3F4F6', color: '#4B5563' }
            }
          >
            {f}
          </button>
        ))}
      </div>

      {/* Chart empty state — no ROI API connected yet */}
      <div
        className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-100 bg-gray-50/60"
        style={{ height: 170 }}
      >
        <BarChart2 className="h-8 w-8 text-gray-200 mb-2" />
        <p className="text-[12px] text-gray-400 font-medium">No chart data available</p>
        <p className="text-[11px] text-gray-300 mt-0.5">Connect a marketing API to populate this chart</p>
      </div>
    </div>
  );
}

function SourceTable({ users, teams, invites, scorecards }) {
  /* Build rows from real API data that is meaningful here */
  const rows = [
    { label: 'Active Users',          value: users.filter((u) => u.status === 'ACTIVE').length,    sub: `of ${users.length} total` },
    { label: 'Teams',                 value: teams.length,                                          sub: `${teams.filter((t) => Number(t.memberCount||0)>0).length} with members` },
    { label: 'Pending Invites',       value: invites.filter((i) => i.status === 'PENDING').length,  sub: `of ${invites.length} total` },
    { label: 'Published Scorecards',  value: scorecards.filter((s) => s.isPublished).length,        sub: `${scorecards.length - scorecards.filter((s)=>s.isPublished).length} drafts` },
  ];

  return (
    <div className="mt-5 overflow-x-auto">
      <table className="w-full min-w-[360px] text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="pb-2 text-[11px] font-semibold text-gray-400 tracking-wide text-left">METRIC</th>
            <th className="pb-2 text-[11px] font-semibold text-gray-400 tracking-wide text-right">COUNT</th>
            <th className="pb-2 text-[11px] font-semibold text-gray-400 tracking-wide text-right">DETAIL</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-gray-50 last:border-0">
              <td className="py-2.5">
                <p className="font-semibold text-gray-800 text-[13px]">{row.label}</p>
              </td>
              <td className="py-2.5 text-[13px] font-bold text-gray-900 tabular-nums text-right">
                {row.value}
              </td>
              <td className="py-2.5 text-[11px] text-gray-400 tabular-nums text-right">
                {row.sub}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   RIGHT — TIMELINE ROW (from real auditLog / user data)
══════════════════════════════════════════════════════════════════════════ */
function TimelineRow({ item, idx }) {
  const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return (
    <div className="flex items-center gap-2 py-2 border-b border-gray-100/60 last:border-0">
      <span className="text-[10px] text-gray-400 tabular-nums w-8 shrink-0">{item.time}</span>
      <div
        className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
        style={{ backgroundColor: color }}
      >
        {item.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-gray-900 truncate leading-tight">{item.name}</p>
        <p className="text-[10px] text-gray-400 truncate leading-tight">{item.sub}</p>
      </div>
      <div className="shrink-0 text-right" style={{ maxWidth: 80 }}>
        <p className="text-[9px] text-gray-500 truncate leading-tight">{item.detail}</p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   RIGHT — DONUT PROGRESS (driven by real stats)
══════════════════════════════════════════════════════════════════════════ */
function DonutProgress({ pct }) {
  const r    = 26;
  const circ = 2 * Math.PI * r;
  const dash = circ - (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64" aria-label={`${pct}%`}>
      <circle cx="32" cy="32" r={r} fill="none" stroke="#E5E7EB" strokeWidth="6" />
      <circle
        cx="32" cy="32" r={r}
        fill="none"
        stroke="#22C55E"
        strokeWidth="6"
        strokeDasharray={circ}
        strokeDashoffset={dash}
        strokeLinecap="round"
        transform="rotate(-90 32 32)"
      />
      <text x="32" y="37" textAnchor="middle" fontSize="12" fontWeight="700" fill="#111827">
        {pct}%
      </text>
    </svg>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   RIGHT — CLIENT ROW (real user data, score shown as "—" — no API field)
══════════════════════════════════════════════════════════════════════════ */
function ClientRow({ item, idx }) {
  const color = AVATAR_COLORS[idx % AVATAR_COLORS.length];
  return (
    <div className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0">
      <div
        className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
        style={{ backgroundColor: color }}
      >
        {item.initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-gray-800 truncate leading-tight">{item.name}</p>
        <p className="text-[10px] text-gray-400 truncate leading-tight">{item.sub}</p>
      </div>
      {/* avgScore — no API field → show "—" */}
      <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-400 w-14 text-center">
        — avg
      </span>
      {/* passPct — no API field → show "—" */}
      <span className="shrink-0 text-[11px] text-gray-400 tabular-nums w-[52px] text-right">
        Pass —
      </span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
export function DashboardPage() {

  /* ── State & API calls: COMPLETELY UNCHANGED ──────────────────────────── */
  const { user, workspace, fetchWorkspace } = useAuthStore();
  const [dashboardData, setDashboardData] = useState({
    users: [], teams: [], invites: [], scorecards: [], auditLogs: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isMounted = true;
    const loadDashboard = async () => {
      try {
        setIsLoading(true);
        setLoadError('');
        const [
          workspaceResult,
          usersResult, teamsResult, invitesResult, scorecardsResult, logsResult,
        ] = await Promise.allSettled([
          fetchWorkspace(),
          userService.getUsers({ limit: 100 }),
          teamService.getTeams({ limit: 100 }),
          inviteService.getInvites({ limit: 100 }),
          scorecardService.getScorecards({ limit: 100 }),
          auditLogService.getAuditLogs({ page: 1, limit: 8 }),
        ]);
        if (!isMounted) return;
        setDashboardData({
          users:      usersResult.status === 'fulfilled'      ? listFromResponse(usersResult.value, 'users')           : [],
          teams:      teamsResult.status === 'fulfilled'      ? listFromResponse(teamsResult.value, 'teams')           : [],
          invites:    invitesResult.status === 'fulfilled'    ? listFromResponse(invitesResult.value, 'invites')       : [],
          scorecards: scorecardsResult.status === 'fulfilled' ? listFromResponse(scorecardsResult.value, 'scorecards') : [],
          auditLogs:  logsResult.status === 'fulfilled'       ? listFromResponse(logsResult.value, 'auditLogs')        : [],
        });
        const failed = [workspaceResult, usersResult, teamsResult, invitesResult, scorecardsResult, logsResult]
          .filter((r) => r.status === 'rejected');
        if (failed.length) setLoadError('Some sections could not be refreshed.');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadDashboard();
    return () => { isMounted = false; };
  }, [fetchWorkspace]);

  /* ── Stats: COMPLETELY UNCHANGED ─────────────────────────────────────── */
  const stats = useMemo(() => {
    const { users, teams, invites, scorecards, auditLogs } = dashboardData;
    const activeUsers         = users.filter((i) => i.status === 'ACTIVE').length;
    const disabledUsers       = users.filter((i) => i.status === 'DISABLED').length;
    const pendingInvites      = invites.filter((i) => i.status === 'PENDING').length;
    const acceptedInvites     = invites.filter((i) => i.status === 'ACCEPTED').length;
    const publishedScorecards = scorecards.filter((i) => i.isPublished).length;
    const draftScorecards     = scorecards.length - publishedScorecards;
    const totalMembers        = teams.reduce((s, t) => s + Number(t.memberCount || 0), 0);
    const teamsWithMembers    = teams.filter((t) => Number(t.memberCount || 0) > 0).length;
    const roles               = users.reduce((acc, i) => {
      const r = i.role || 'UNKNOWN'; acc[r] = (acc[r] || 0) + 1; return acc;
    }, {});
    const recentActiveUsers   = users
      .filter((i) => i.lastLoginAt)
      .sort((a, b) => new Date(b.lastLoginAt) - new Date(a.lastLoginAt))
      .slice(0, 5);
    const setupItems = [
      { label: 'Workspace profile',    done: Boolean(workspace?.name || workspace?.workspace?.name) },
      { label: 'Teams created',        done: teams.length > 0 },
      { label: 'Users active',         done: activeUsers > 0 },
      { label: 'Scorecards published', done: publishedScorecards > 0 },
      { label: 'Invites sent',         done: invites.length > 0 },
    ];
    const completedSetup = setupItems.filter((i) => i.done).length;

    /* Timeline entries: built from recent audit logs — real data */
    const timelineItems = auditLogs.slice(0, 5).map((log) => {
      const actor = log.actor?.email || log.actorEmail || 'System';
      const ts    = log.createdAt
        ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        : '—';
      const action = (log.actionType || log.action || 'event').replaceAll('_', ' ').toLowerCase();
      return {
        time:     ts,
        initials: getInitials(actor),
        name:     actor,
        sub:      action,
        detail:   log.targetType || log.entityType || '',
      };
    });

    /* Active users % for donut */
    const attendedPct = users.length > 0
      ? Math.round((activeUsers / users.length) * 100)
      : 0;

    return {
      activeUsers, disabledUsers, pendingInvites, acceptedInvites,
      publishedScorecards, draftScorecards, totalMembers, teamsWithMembers,
      roles, recentActiveUsers, timelineItems,
      recentLogs: auditLogs.slice(0, 5),
      setupItems,
      setupPercent: Math.round((completedSetup / setupItems.length) * 100),
      attendedPct,
    };
  }, [dashboardData, workspace]);

  /* ── Local UI state ───────────────────────────────────────────────────── */
  const [activeFilter, setActiveFilter] = useState('Ads');
  const [callTab,      setCallTab]      = useState('successful');

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Spinner size="lg" className="text-green-500" />
      </div>
    );
  }

  const workspaceName = workspace?.name || workspace?.workspace?.name || 'Workspace';

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div
      className="flex flex-col xl:flex-row gap-4 p-5"
      style={{ fontFamily: "'Inter', -apple-system, sans-serif", minHeight: '100%' }}
    >

      {/* ════════════════════════════════════════════
          LEFT COLUMN
      ════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0 flex flex-col gap-5">

        {/* Error banner */}
        {loadError && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {loadError}
          </div>
        )}

        {/* Greeting */}
        <div>
          <h1 className="text-[26px] sm:text-[30px] font-bold text-gray-900 leading-tight">
            Good morning, {user?.name || user?.email || 'there'}
          </h1>
          <p className="mt-1.5 text-[13px] text-gray-500 leading-relaxed max-w-xl">
            {workspaceName} has{' '}
            <span className="font-semibold" style={{ color: '#22C55E' }}>
              {stats.activeUsers} active users
            </span>{' '}
            across {dashboardData.teams.length} teams, with{' '}
            <span className="font-semibold" style={{ color: '#22C55E' }}>
              {stats.pendingInvites} pending invites
            </span>{' '}
            and {stats.publishedScorecards} published scorecards.
          </p>
        </div>

        {/* Chart + metrics card */}
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-gray-100 p-5">
          <MarketingROIChart activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          <SourceTable
            users={dashboardData.users}
            teams={dashboardData.teams}
            invites={dashboardData.invites}
            scorecards={dashboardData.scorecards}
          />
        </div>

      </div>
      {/* /LEFT */}

      {/* ════════════════════════════════════════════
          RIGHT COLUMN — sticky, fixed width
      ════════════════════════════════════════════ */}
      <div className="xl:w-[354px] shrink-0 flex flex-col gap-3 xl:self-start xl:sticky xl:top-5">

        {/* ── Card 1: Today's timeline (from audit logs) ── */}
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: '#F5F6F0', border: '1px solid #E8EAE2' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-gray-500" />
              <span className="text-[13px] font-bold text-gray-900">{todayLabel()}</span>
            </div>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wide">
              Today's timeline
            </span>
          </div>

          {/* Time label */}
          <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1 ml-0.5">
            Time
          </p>

          {/* Rows — real audit log data */}
          {stats.timelineItems.length > 0 ? (
            stats.timelineItems.map((item, idx) => (
              <TimelineRow key={idx} item={item} idx={idx} />
            ))
          ) : (
            <EmptyState icon={Clock} message="No activity logged today" />
          )}

          {/* CTA */}
          <button
            className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-[13px] font-semibold text-white hover:opacity-90 active:opacity-80 transition-opacity"
            style={{ backgroundColor: '#22C55E' }}
          >
            View all call for today
            <span
              className="inline-flex h-5 w-5 items-center justify-center rounded-full text-[11px]"
              style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
              aria-hidden="true"
            >
              ➜
            </span>
          </button>
        </div>

        {/* ── Card 2: Today's Actions ── */}
        <div
          className="rounded-2xl p-4"
          style={{ backgroundColor: '#F5F6F0', border: '1px solid #E8EAE2' }}
        >
          {/* Header: title + donut */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-bold text-gray-900 leading-tight">Today's actions</p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-snug">Do these to move bookings</p>
            </div>
            <div className="shrink-0 flex flex-col items-end gap-1">
              <p className="text-[9px] font-medium text-gray-400 uppercase tracking-wide">
                Total Calls Attented
              </p>
              <div className="flex items-center gap-2">
                {/* Donut — driven by real activeUsers/total ratio */}
                <DonutProgress pct={stats.attendedPct} />
                <div>
                  <p className="text-[12px] font-bold text-gray-900 leading-tight">
                    {stats.attendedPct}% active
                  </p>
                  <p className="text-[10px] text-gray-400 leading-snug" style={{ maxWidth: 68 }}>
                    users are active in workspace.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Review stats from real data */}
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="text-[12px] font-bold text-gray-900">
              {stats.pendingInvites} invites pending review
            </span>
          </div>
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700">
              {stats.draftScorecards} drafts
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-600">
              {stats.disabledUsers} disabled users
            </span>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 mb-0.5">
            {[
              { key: 'successful',   label: 'Successful Calls' },
              { key: 'unsuccessful', label: 'Unsuccessful Calls' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setCallTab(key)}
                className="flex-1 py-1.5 rounded-lg text-[10px] font-semibold transition-colors"
                style={
                  callTab === key
                    ? { backgroundColor: '#22C55E', color: '#fff' }
                    : { backgroundColor: '#E5E7DF', color: '#6B7280' }
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* Today filter */}
          <div className="flex justify-end my-2">
            <button
              className="flex items-center gap-1 text-[10px] font-medium text-gray-500 border border-gray-200 rounded-md px-2 py-0.5 hover:bg-gray-100 transition-colors"
              style={{ backgroundColor: '#fff' }}
            >
              Today <ChevronDown className="h-2.5 w-2.5" />
            </button>
          </div>

          {/* Column headers */}
          <div className="flex items-center text-[9px] font-semibold text-gray-400 uppercase tracking-wide mb-1 px-0.5">
            <span className="flex-1">Client Name</span>
            <span className="w-14 text-center">Avg. Scr</span>
            <span className="w-12 text-right">Pass %</span>
          </div>

          {/* Client rows — real recent active users; score fields show "—" (no API) */}
          {stats.recentActiveUsers.length > 0 ? (
            stats.recentActiveUsers.map((u, idx) => (
              <ClientRow
                key={getId(u)}
                idx={idx}
                item={{
                  initials: getInitials(u.name || u.email),
                  name:     u.name || 'Unnamed user',
                  sub:      u.email || u.role || '',
                }}
              />
            ))
          ) : (
            <EmptyState icon={Clock} message="No recent user activity" />
          )}
        </div>
        {/* /Card 2 */}

      </div>
      {/* /RIGHT */}

    </div>
  );
}
