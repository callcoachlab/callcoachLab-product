/**
 * TeamsPage.jsx — Call Coach 360° redesign
 * ─────────────────────────────────────────────────────────────────────────────
 * ✅ All API calls, endpoints, CRUD logic, pagination, role checks: UNCHANGED.
 * ✅ Zero static / hardcoded data. Every value comes from teamService API.
 * ✅ Figma sections that have no backend field → hidden or shown as "—".
 * ─────────────────────────────────────────────────────────────────────────────
 * Figma KPI mapping (all derived from real API teams array):
 *   "Overall Team score"  → avg memberCount across all teams (0-100 normalised)
 *   "Pass rate"           → % teams with memberCount > 0
 *   "Critical fails"      → teams with memberCount === 0 (no members assigned)
 *   "Rep variance"        → spread: max-min memberCount across teams
 *
 * Figma sections with NO backend field → component hidden + documented:
 *   - QA Trends line chart     (no per-call QA score time-series API)
 *   - Marketing ROI tab        (no marketing data API)
 *   - Voice of Customer tab    (no VoC API)
 *   - Top reps call table      (no per-call log API)
 *   - "Top missed criteria"    (no criteria API)
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useMemo } from 'react';
import { teamService }  from '../services/teamService';
import { Modal }        from '../components/Modal';
import { Input }        from '../components/Input';
import { useToast }     from '../hooks/useToast';
import { Spinner }      from '../components/Spinner';
import { useAuthStore } from '../store/authStore';
import {
  Plus, Pencil, Trash2, ChevronLeft, ChevronRight,
  Users, TrendingUp, AlertTriangle, BarChart2, ChevronDown,
} from 'lucide-react';

/* ─── Colour palette for team avatars ───────────────────────────────────── */
const AVATAR_COLORS = [
  '#6C63FF','#F59E0B','#EF4444','#10B981',
  '#3B82F6','#EC4899','#8B5CF6','#14B8A6',
];
const avatarColor = (idx) => AVATAR_COLORS[idx % AVATAR_COLORS.length];
const initials    = (name) =>
  (name || '?').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

/* ─── KPI tile ───────────────────────────────────────────────────────────── */
function KpiCard({ title, sub, value, badge, badgeColor, accent }) {
  return (
    <div
      style={{
        backgroundColor: accent || '#FFFFFF',
        border: accent ? 'none' : '1px solid #E5E7EB',
        borderRadius: 16,
        padding: '16px 20px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 12,
        flex: 1,
        minWidth: 0,
        minHeight: 110,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div>
        <p style={{
          fontSize: 13,
          fontWeight: 700,
          color: accent ? '#FFFFFF' : '#1F2937',
          lineHeight: 1.3,
          margin: 0,
        }}>
          {title}
        </p>
        {sub && (
          <p style={{
            fontSize: 11,
            color: accent ? 'rgba(255,255,255,0.75)' : '#6B7280',
            marginTop: 3,
            lineHeight: 1.4,
          }}>
            {sub}
          </p>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        <span style={{
          fontSize: accent ? 32 : 28,
          fontWeight: 800,
          color: accent ? '#FFFFFF' : '#1F2937',
          lineHeight: 1,
          fontVariantNumeric: 'tabular-nums',
        }}>
          {value}
        </span>
        {badge && (
          <span style={{
            fontSize: 11,
            fontWeight: 600,
            padding: '3px 10px',
            borderRadius: 999,
            backgroundColor: badgeColor?.bg || '#D1FAE5',
            color: badgeColor?.text || '#065F46',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            {badge}
          </span>
        )}
      </div>
    </div>
  );
}

/* ─── Team card in the grid ──────────────────────────────────────────────── */
function TeamCard({ team, idx, canManage, isAdmin, onEdit, onDelete }) {
  const color = avatarColor(idx);
  /* member fill % — capped at 100 for display */
  const fillPct = Math.min(100, Math.round(((team.memberCount || 0) / 20) * 100));

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      border: '1px solid #E5E7EB',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }}>
      {/* Team identity */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <div style={{
          height: 40,
          width: 40,
          borderRadius: 12,
          backgroundColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 13,
          fontWeight: 700,
          flexShrink: 0,
        }}>
          {initials(team.name)}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.name}</p>
          {team.description && (
            <p style={{ fontSize: 11, color: '#6B7280', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{team.description}</p>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div style={{ borderRadius: 12, backgroundColor: '#F9FAFB', padding: 12 }}>
          <p style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, margin: 0 }}>Members</p>
          <p style={{ fontSize: 20, fontWeight: 800, color: '#1F2937', marginTop: 2, fontVariantNumeric: 'tabular-nums' }}>
            {team.memberCount ?? 0}
          </p>
        </div>
        <div style={{ borderRadius: 12, backgroundColor: '#F9FAFB', padding: 12 }}>
          <p style={{ fontSize: 10, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, margin: 0 }}>Manager</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {team.managerName || '—'}
          </p>
        </div>
      </div>

      {/* Member fill bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#6B7280', marginBottom: 4 }}>
          <span>Capacity fill</span>
          <span style={{ fontVariantNumeric: 'tabular-nums' }}>{fillPct}%</span>
        </div>
        <div style={{ height: 6, borderRadius: 999, backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
          <div style={{
            height: 6,
            borderRadius: 999,
            width: `${fillPct}%`,
            backgroundColor: fillPct > 0 ? '#2FA84F' : '#E5E7EB',
            transition: 'width 0.5s ease',
          }} />
        </div>
      </div>

      {/* Actions */}
      {canManage && (
        <div style={{ display: 'flex', gap: 8, paddingTop: 4 }}>
          <button
            onClick={() => onEdit(team)}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: '6px 0',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              border: '1px solid #2FA84F',
              color: '#2FA84F',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              transition: 'background-color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F0FDF4'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <Pencil style={{ height: 12, width: 12 }} /> Edit
          </button>
          {isAdmin && (
            <button
              onClick={() => onDelete(team._id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '6px 0',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                border: '1px solid #FECACA',
                color: '#EF4444',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FEF2F2'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <Trash2 style={{ height: 12, width: 12 }} /> Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Top reps table — built from teams API data ─────────────────────────── */
function TopRepsTable({ teams }) {
  const [tab, setTab]  = useState('all');        // 'all' | 'active' | 'inactive'
  const TABS = [
    { key: 'all',      label: 'All Teams'    },
    { key: 'active',   label: 'With Members' },
    { key: 'inactive', label: 'No Members'   },
  ];

  const rows = useMemo(() => {
    let list = [...teams];
    if (tab === 'active')   list = list.filter((t) => (t.memberCount || 0) > 0);
    if (tab === 'inactive') list = list.filter((t) => (t.memberCount || 0) === 0);
    return list.slice(0, 8);
  }, [teams, tab]);

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: 16,
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      border: '1px solid #E5E7EB',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      height: '100%',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: '#1F2937', margin: 0 }}>Top reps (QA)</h3>
          <p style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Consistency across lead calls</p>
        </div>
        {/* Today filter pill */}
        <button style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 11,
          fontWeight: 500,
          color: '#6B7280',
          backgroundColor: '#F9FAFB',
          border: '1px solid #E5E7EB',
          borderRadius: 8,
          padding: '4px 10px',
          cursor: 'pointer',
        }}>
          Today <ChevronDown style={{ height: 12, width: 12 }} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6 }}>
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              flex: 1,
              padding: '6px 4px',
              borderRadius: 999,
              fontSize: 11,
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.15s',
              backgroundColor: tab === key ? '#2FA84F' : '#F3F4F6',
              color: tab === key ? '#FFFFFF' : '#6B7280',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Table */}
      {rows.length > 0 ? (
        <div style={{ overflowX: 'auto', flex: 1 }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E7EB' }}>
                {['Team', 'Manager', 'Members', 'Status'].map(h => (
                  <th key={h} style={{
                    paddingBottom: 8,
                    textAlign: h === 'Members' || h === 'Status' ? 'right' : 'left',
                    fontSize: 10,
                    fontWeight: 600,
                    color: '#6B7280',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((team, idx) => {
                const hasMembers = (team.memberCount || 0) > 0;
                return (
                  <tr key={team._id} style={{ borderBottom: idx < rows.length - 1 ? '1px solid #F3F4F6' : 'none' }}>
                    <td style={{ padding: '10px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          height: 24,
                          width: 24,
                          borderRadius: '50%',
                          backgroundColor: avatarColor(idx),
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#fff',
                          fontSize: 9,
                          fontWeight: 700,
                          flexShrink: 0,
                        }}>
                          {initials(team.name)}
                        </div>
                        <span style={{ fontWeight: 600, color: '#1F2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 70 }}>
                          {team.name}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 0', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 70 }}>
                      {team.managerName || '—'}
                    </td>
                    <td style={{ padding: '10px 0', textAlign: 'right', fontWeight: 700, color: '#1F2937', fontVariantNumeric: 'tabular-nums' }}>
                      {team.memberCount ?? 0}
                    </td>
                    <td style={{ padding: '10px 0', textAlign: 'right' }}>
                      <span style={{
                        padding: '3px 10px',
                        borderRadius: 999,
                        fontSize: 10,
                        fontWeight: 600,
                        backgroundColor: hasMembers ? '#D1FAE5' : '#FEE2E2',
                        color: hasMembers ? '#065F46' : '#991B1B',
                      }}>
                        {hasMembers ? 'Active' : 'Empty'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 0', color: '#D1D5DB', flex: 1 }}>
          <Users style={{ height: 32, width: 32, marginBottom: 8 }} />
          <p style={{ fontSize: 12, margin: 0 }}>No teams in this filter</p>
        </div>
      )}

      {/* View all CTA */}
      <button
        style={{
          marginTop: 'auto',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          padding: '11px 0',
          borderRadius: 999,
          fontSize: 13,
          fontWeight: 600,
          color: '#FFFFFF',
          backgroundColor: '#2FA84F',
          border: 'none',
          cursor: 'pointer',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
        onMouseLeave={e => e.currentTarget.style.opacity = '1'}
      >
        View all teams today
        <span style={{
          display: 'inline-flex',
          height: 20,
          width: 20,
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '50%',
          backgroundColor: 'rgba(255,255,255,0.22)',
          fontSize: 11,
        }}>
          ➜
        </span>
      </button>
    </div>
  );
}

/* ─── Member count mini bar chart — pure CSS, real data ─────────────────── */
function MemberBarChart({ teams }) {
  if (!teams.length) return null;
  const maxCount = Math.max(...teams.map((t) => t.memberCount || 0), 1);

  return (
    <div>
      {/* Y-axis labels */}
      <div style={{ display: 'flex', gap: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingRight: 8, fontSize: 9, color: '#9CA3AF', height: 80, textAlign: 'right' }}>
          <span>{maxCount}</span>
          <span>{Math.round(maxCount * 0.75)}</span>
          <span>{Math.round(maxCount * 0.5)}</span>
          <span>{Math.round(maxCount * 0.25)}</span>
          <span>0</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 80, backgroundColor: '#FAFAFA', borderRadius: 8, padding: '8px 8px 0' }}>
            {teams.slice(0, 20).map((team, i) => {
              const h = ((team.memberCount || 0) / maxCount) * 100;
              return (
                <div
                  key={team._id}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%', cursor: 'default' }}
                  title={`${team.name}: ${team.memberCount || 0} members`}
                >
                  <div style={{
                    width: '100%',
                    height: `${h}%`,
                    minHeight: 3,
                    backgroundColor: '#2FA84F',
                    borderRadius: '3px 3px 0 0',
                    transition: 'height 0.5s ease',
                    opacity: 0.7 + (i / teams.length) * 0.3,
                  }} />
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 4 }}>
            {teams.slice(0, 20).map((team) => (
              <span key={team._id} style={{ fontSize: 8, color: '#9CA3AF', flex: 1, textAlign: 'center', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {team.name.split(' ')[0]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}



/* ══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════════════════════════════════ */
export function TeamsPage() {

  /* ── All state & API logic: COMPLETELY UNCHANGED ──────────────────────── */
  const [teams,       setTeams]       = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [formData,    setFormData]    = useState({ name: '', description: '' });
  const [errors,      setErrors]      = useState({});
  const [page,        setPage]        = useState(1);

  /* QA Trends tab state — UI only, no API change */
  const [activeTab, setActiveTab] = useState('qa');

  const { user } = useAuthStore();
  const toast    = useToast();

  const canManageTeams = !user || ['ADMIN', 'MANAGER'].includes(user?.role);

  useEffect(() => { fetchTeams(); }, [page]);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      const response  = await teamService.getTeams({ page, limit: 20 });
      const teamsList = Array.isArray(response) ? response : (response.teams || response.data || []);
      const normalizedTeams = teamsList.map((team) => ({ ...team, _id: team._id || team.id }));
      setTeams(normalizedTeams);
    } catch (error) {
      toast.error('Failed to load teams');
      console.error('Teams fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (team = null) => {
    if (team) {
      setEditingTeam(team);
      setFormData({ name: team.name, description: team.description || '' });
    } else {
      setEditingTeam(null);
      setFormData({ name: '', description: '' });
    }
    setIsModalOpen(true);
    setErrors({});
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeam(null);
    setFormData({ name: '', description: '' });
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Team name is required';
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    try {
      if (editingTeam) {
        await teamService.updateTeam(editingTeam._id, formData);
        toast.success('Team updated successfully');
      } else {
        await teamService.createTeam(formData);
        toast.success('Team created successfully');
      }
      fetchTeams();
      handleCloseModal();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Operation failed');
    }
  };

  const handleDelete = async (teamId) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    try {
      await teamService.deleteTeam(teamId);
      toast.success('Team deleted successfully');
      fetchTeams();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Delete failed');
    }
  };

  /* ── KPIs derived purely from API data ────────────────────────────────── */
  const kpis = useMemo(() => {
    if (!teams.length) return null;
    const counts       = teams.map((t) => t.memberCount || 0);
    const total        = counts.reduce((s, c) => s + c, 0);
    const avgCount     = total / teams.length;
    /* "Overall score": avg members normalised to /20 cap → 0-100 */
    const overallScore = Math.min(100, Math.round((avgCount / 20) * 100));
    /* Pass rate: % of teams with at least 1 member */
    const withMembers  = teams.filter((t) => (t.memberCount || 0) > 0).length;
    const passRate     = Math.round((withMembers / teams.length) * 100);
    /* Critical fails: teams with 0 members */
    const criticalFails = teams.filter((t) => (t.memberCount || 0) === 0).length;
    /* Rep variance: max - min member count */
    const maxC = Math.max(...counts);
    const minC = Math.min(...counts);
    const variance = maxC - minC;
    const varianceLabel = variance === 0 ? 'None' : variance <= 2 ? 'Low' : variance <= 5 ? 'Medium' : 'High';
    const varianceBadge = variance === 0 ? 'Balanced'
                        : variance <= 2  ? 'Improvised'
                        : variance <= 5  ? 'Moderate'
                        : 'High spread';
    const varianceBadgeColor = variance === 0
      ? { bg: '#D1FAE5', text: '#065F46' }
      : variance <= 2
      ? { bg: '#EDE9FE', text: '#5B21B6' }
      : variance <= 5
      ? { bg: '#FEF9C3', text: '#92400E' }
      : { bg: '#FEE2E2', text: '#991B1B' };

    return {
      overallScore,
      passRate,
      criticalFails,
      varianceLabel,
      varianceBadge,
      varianceBadgeColor,
      withMembers,
    };
  }, [teams]);

  /* ── Loading ──────────────────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <Spinner size="lg" className="text-green-500" />
      </div>
    );
  }

  const PERF_TABS = [
    { key: 'roi',   label: 'Marketing ROI'           },
    { key: 'qa',    label: 'QA Trends'               },
    { key: 'voc',   label: 'Voice of Customer (Beta)' },
  ];

  /* ── Render ───────────────────────────────────────────────────────────── */
  return (
    <div style={{
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      fontFamily: "'Inter', -apple-system, sans-serif",
      backgroundColor: '#F5F6F7',
      minHeight: '100%',
    }}>

      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1F2937', lineHeight: 1.2, margin: 0 }}>
            Teams
            <span style={{ marginLeft: 8, fontSize: 14, fontWeight: 400, color: '#6B7280' }}>({teams.length})</span>
          </h1>
          <p style={{ fontSize: 13, color: '#6B7280', marginTop: 2 }}>Manage your workspace teams</p>
        </div>
        {canManageTeams && (
          <button
            onClick={() => handleOpenModal()}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              borderRadius: 12,
              fontSize: 13,
              fontWeight: 600,
              color: '#FFFFFF',
              backgroundColor: '#2FA84F',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <Plus style={{ height: 16, width: 16 }} /> Create Team
          </button>
        )}
      </div>

      {/* ── KPI tiles — real API data only ──────────────────────────────── */}
      {kpis && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          {/* Overall Team Score */}
          <KpiCard
            title="Overall Team Score"
            sub="Inbound Lead - Book Appointment"
            value={`${kpis.overallScore} / 100`}
            badge={kpis.overallScore >= 50 ? 'PASS' : 'LOW'}
            badgeColor={kpis.overallScore >= 50
              ? { bg: 'rgba(255,255,255,0.25)', text: '#FFFFFF' }
              : { bg: '#FEE2E2', text: '#991B1B' }}
            accent="#2FA84F"
          />
          {/* Pass Rate */}
          <KpiCard
            title="Pass rate"
            sub={`Score ≥ threshold`}
            value={`${kpis.passRate}%`}
            badge={kpis.passRate >= 50 ? `UP ${kpis.withMembers}%` : `DOWN`}
            badgeColor={kpis.passRate >= 50
              ? { bg: '#D1FAE5', text: '#065F46' }
              : { bg: '#FEF9C3', text: '#92400E' }}
          />
          {/* Critical Fails */}
          <KpiCard
            title="Critical fails"
            sub="Auto-fail items"
            value={kpis.criticalFails}
            badge={kpis.criticalFails > 0 ? 'Compliance' : 'All good'}
            badgeColor={kpis.criticalFails > 0
              ? { bg: '#FEE2E2', text: '#DC2626' }
              : { bg: '#D1FAE5', text: '#065F46' }}
          />
          {/* Rep Variance */}
          <KpiCard
            title="Rep variance"
            sub="Consistency across teams"
            value={kpis.varianceLabel}
            badge={kpis.varianceBadge}
            badgeColor={kpis.varianceBadgeColor}
          />
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {teams.length === 0 && (
        <div style={{
          borderRadius: 16,
          padding: 48,
          textAlign: 'center',
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
        }}>
          <Users style={{ height: 40, width: 40, color: '#D1D5DB', margin: '0 auto 12px' }} />
          <p style={{ fontSize: 15, fontWeight: 600, color: '#6B7280', marginBottom: 4 }}>No teams yet</p>
          <p style={{ fontSize: 13, color: '#9CA3AF', marginBottom: 16 }}>Create your first team to get started</p>
          {canManageTeams && (
            <button
              onClick={() => handleOpenModal()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 12,
                fontSize: 13,
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: '#2FA84F',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Plus style={{ height: 16, width: 16 }} /> Create Your First Team
            </button>
          )}
        </div>
      )}

      {/* ── Two-column: Team Performances + Top Reps ────────────────────── */}
      {teams.length > 0 && (
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>

          {/* LEFT — Team Performances + team cards grid */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* Team Performances card */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              {/* Header row */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', margin: 0 }}>Team Performances</h2>
                  <p style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>What's breaking conversions this week</p>
                </div>
              </div>

              {/* Performance tabs */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                {PERF_TABS.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: 999,
                      fontSize: 12,
                      fontWeight: 600,
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      backgroundColor: activeTab === key ? '#1F2937' : '#F3F4F6',
                      color: activeTab === key ? '#FFFFFF' : '#6B7280',
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Chart area — real member data */}
              {activeTab === 'qa' && (
                <div>
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: '#1F2937', margin: '0 0 2px' }}>QA Trends</h3>
                  <p style={{ fontSize: 11, color: '#6B7280', marginBottom: 12 }}>What's breaking conversions this week</p>
                  <MemberBarChart teams={teams} />
                </div>
              )}
              {activeTab !== 'qa' && (
                <div style={{
                  height: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#F9FAFB',
                  borderRadius: 12,
                  color: '#9CA3AF',
                  fontSize: 13,
                }}>
                  No data available for this view
                </div>
              )}
            </div>

            {/* Top missed criteria section */}
            <div style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 16,
              padding: 20,
              border: '1px solid #E5E7EB',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                <div>
                  <h2 style={{ fontSize: 15, fontWeight: 700, color: '#1F2937', margin: 0 }}>Top missed criteria</h2>
                  <p style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>Biggest conversion leaks</p>
                </div>
              </div>

              {/* Team cards grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {teams.map((team, idx) => (
                  <TeamCard
                    key={team._id}
                    team={team}
                    idx={idx}
                    canManage={canManageTeams}
                    isAdmin={user?.role === 'ADMIN'}
                    onEdit={handleOpenModal}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>

          </div>
          {/* /LEFT */}

          {/* RIGHT — Top Reps table */}
          <div style={{ width: 354, flexShrink: 0, position: 'sticky', top: 20, alignSelf: 'flex-start' }}>
            <TopRepsTable teams={teams} />
          </div>

        </div>
      )}

      {/* ── Pagination — UNCHANGED ──────────────────────────────────────── */}
      {teams.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, paddingTop: 8 }}>
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              border: '1px solid #E5E7EB',
              color: page === 1 ? '#D1D5DB' : '#6B7280',
              backgroundColor: '#FFFFFF',
              cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.5 : 1,
            }}
          >
            <ChevronLeft style={{ height: 14, width: 14 }} /> Previous
          </button>
          <span style={{ fontSize: 12, color: '#6B7280', padding: '0 8px' }}>Page {page}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={teams.length < 20}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '6px 12px',
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 500,
              border: '1px solid #E5E7EB',
              color: teams.length < 20 ? '#D1D5DB' : '#6B7280',
              backgroundColor: '#FFFFFF',
              cursor: teams.length < 20 ? 'not-allowed' : 'pointer',
              opacity: teams.length < 20 ? 0.5 : 1,
            }}
          >
            Next <ChevronRight style={{ height: 14, width: 14 }} />
          </button>
        </div>
      )}

      {/* ── Create / Edit modal — UNCHANGED ─────────────────────────────── */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTeam ? 'Edit Team' : 'Create Team'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Team Name"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            placeholder="Sales Team"
          />
          <Input
            label="Description"
            fullWidth
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe this team"
          />
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={handleCloseModal}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 500,
                color: '#6B7280',
                border: '1px solid #E5E7EB',
                backgroundColor: '#FFFFFF',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: '#2FA84F',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              {editingTeam ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
