import { useEffect, useState, useMemo } from 'react';
import { scorecardService } from '../services/scorecardService';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { Spinner } from '../components/Spinner';
import { useToast } from '../hooks/useToast';

// ─── Constants ────────────────────────────────────────────────────────────────

const defaultSections = [
  {
    name: 'Greeting',
    weight: 20,
    criteria: [{ label: 'Did agent greet warmly?', weight: 10, required: true }],
  },
];

const emptyForm = {
  name: '',
  description: '',
  callType: 'Compliance',
  isPublished: false,
  sectionsText: JSON.stringify(defaultSections, null, 2),
};

const listFromResponse = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.scorecards)) return response.scorecards;
  if (Array.isArray(response?.data)) return response.data;
  return [];
};

// ─── Greeting helper ──────────────────────────────────────────────────────────
function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// Derives a consistent accent colour from a string (name / callType).
const BADGE_PALETTES = [
  { bg: '#3B5BDB', text: '#fff' }, // indigo
  { bg: '#F59F00', text: '#fff' }, // amber
  { bg: '#C2255C', text: '#fff' }, // pink
  { bg: '#2F9E44', text: '#fff' }, // green
  { bg: '#7048E8', text: '#fff' }, // violet
  { bg: '#1098AD', text: '#fff' }, // teal
];

function badgePalette(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return BADGE_PALETTES[Math.abs(hash) % BADGE_PALETTES.length];
}

function initials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');
}

// ─── ScoreCard Card ────────────────────────────────────────────────────────────

function ScorecardCard({ scorecard, onEdit, onDelete, isSelected, onSelect }) {
  const palette = badgePalette(scorecard.name || '');
  const abbr = initials(scorecard.name || '');

  return (
    <div
      onClick={() => onSelect(scorecard._id || scorecard.id)}
      className="group relative flex flex-col cursor-pointer transition-all duration-200"
      style={{
        backgroundColor: isSelected ? '#BFE3FF' : '#FFFFFF',
        border: isSelected ? '1.5px solid #4EA1FF' : '1px solid #D1D5DB',
        borderRadius: '12px',
        padding: '20px',
        minHeight: '148px',
      }}
    >
      {/* Action icons — visible when selected */}
      {isSelected && (
        <div className="absolute right-4 top-4 flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(scorecard); }}
            title="Edit"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors"
            style={{ backgroundColor: '#6B7280' }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.414-6.414a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.94l-3.415 1.138 1.138-3.415A4 4 0 019 13z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(scorecard._id || scorecard.id); }}
            title="Delete"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors"
            style={{ backgroundColor: '#EF4444' }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      {/* Hover action icons — visible on hover when NOT selected */}
      {!isSelected && (
        <div className="absolute right-4 top-4 flex items-center gap-1.5 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(scorecard); }}
            title="Edit"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors"
            style={{ backgroundColor: '#6B7280' }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.414-6.414a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.94l-3.415 1.138 1.138-3.415A4 4 0 019 13z" />
            </svg>
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(scorecard._id || scorecard.id); }}
            title="Delete"
            className="flex h-7 w-7 items-center justify-center rounded-full text-white transition-colors"
            style={{ backgroundColor: '#EF4444' }}
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}

      {/* Badge */}
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold mb-auto"
        style={{ backgroundColor: palette.bg, color: palette.text }}
      >
        {abbr || '?'}
      </div>

      {/* Title & description — bottom-aligned */}
      <div className="mt-4">
        <h3
          className="text-sm font-bold leading-snug"
          style={{ color: isSelected ? '#1D4ED8' : '#111827' }}
        >
          {scorecard.name}
        </h3>
        {scorecard.description && (
          <p
            className="mt-1 text-xs leading-relaxed line-clamp-2"
            style={{ color: isSelected ? '#3B82F6' : '#8A8A8A' }}
          >
            {scorecard.description}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Empty state ───────────────────────────────────────────────────────────────

function EmptyState({ onCreate }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-20 text-center"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px dashed #D1D5DB',
        borderRadius: '12px',
      }}
    >
      <div
        className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
        style={{ backgroundColor: '#F3F4F6' }}
      >
        <svg className="h-6 w-6" style={{ color: '#9CA3AF' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <p className="mb-1 text-sm font-semibold" style={{ color: '#111827' }}>No scorecards yet</p>
      <p className="mb-6 text-xs" style={{ color: '#8A8A8A' }}>Create your first scorecard to start auditing calls.</p>
      <button
        onClick={onCreate}
        className="flex items-center gap-2 text-sm font-semibold text-white transition-colors"
        style={{
          backgroundColor: '#35B957',
          borderRadius: '999px',
          padding: '10px 20px',
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2da34e'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#35B957'}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        Create Scorecard
      </button>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export function ScorecardsPage({ user } = {}) {
  const [scorecards, setScorecards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingScorecard, setEditingScorecard] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [sort, setSort] = useState('Date');
  const [selectedId, setSelectedId] = useState(null);
  const toast = useToast();
  const greeting = useMemo(() => getGreeting(), []);
  const displayName = user?.name || user?.firstName || user?.email?.split('@')[0] || '';

  useEffect(() => {
    fetchScorecards();
  }, []);

  const fetchScorecards = async () => {
    try {
      setIsLoading(true);
      const response = await scorecardService.getScorecards();
      setScorecards(listFromResponse(response));
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Failed to load scorecards');
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (scorecard = null) => {
    setEditingScorecard(scorecard);
    setFormData(
      scorecard
        ? {
            name: scorecard.name || '',
            description: scorecard.description || '',
            callType: scorecard.callType || 'Compliance',
            isPublished: Boolean(scorecard.isPublished),
            sectionsText: JSON.stringify(
              scorecard.sections?.length ? scorecard.sections : defaultSections,
              null,
              2,
            ),
          }
        : emptyForm,
    );
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingScorecard(null);
    setFormData(emptyForm);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim() || !formData.callType.trim()) {
      toast.error('Name and call type are required');
      return;
    }

    try {
      setIsSaving(true);
      const sections = JSON.parse(formData.sectionsText || '[]');
      const payload = {
        name: formData.name,
        callType: formData.callType,
        isPublished: formData.isPublished,
      };
      if (editingScorecard) {
        await scorecardService.updateScorecard(editingScorecard._id || editingScorecard.id, {
          ...payload,
          description: formData.description,
          sections,
        });
        toast.success('Scorecard updated');
      } else {
        await scorecardService.createScorecard(payload);
        toast.success('Scorecard created');
      }
      closeModal();
      fetchScorecards();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || error.message || 'Scorecard save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (scorecardId) => {
    if (!confirm('Delete this scorecard?')) return;
    try {
      await scorecardService.deleteScorecard(scorecardId);
      toast.success('Scorecard deleted');
      fetchScorecards();
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Scorecard delete failed');
    }
  };

  const handleSelect = (id) => {
    setSelectedId((prev) => (prev === id ? null : id));
  };

  // ── Sort logic (client-side, no API change) ──
  const sorted = [...scorecards].sort((a, b) => {
    if (sort === 'Name') return (a.name || '').localeCompare(b.name || '');
    if (sort === 'Status') return Number(b.isPublished) - Number(a.isPublished);
    return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
  });

  // ── Loading ──
  if (isLoading) {
    return (
      <div
        className="flex h-64 items-center justify-center"
        style={{ backgroundColor: '#F5F6F0' }}
      >
        <Spinner size="lg" className="text-green-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F5F6F0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>

        {/* ── Page Header ── */}
        <div
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          style={{ marginBottom: '28px' }}
        >
          <div>
            <h1
              className="font-bold"
              style={{
                fontSize: '28px',
                lineHeight: '1.2',
                color: '#111827',
                letterSpacing: '-0.3px',
              }}
            >
              {greeting}{displayName ? `, ${displayName}` : ''}
            </h1>
            <p
              className="mt-1"
              style={{ fontSize: '13px', color: '#8A8A8A' }}
            >
              Choose the fastest way to start auditing
            </p>
          </div>

          {/* Create new score card button */}
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 font-semibold text-white transition-all flex-shrink-0"
            style={{
              backgroundColor: '#35B957',
              borderRadius: '999px',
              padding: '10px 18px',
              fontSize: '13px',
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(53, 185, 87, 0.3)',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2da34e'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#35B957'}
          >
            {/* Green circle plus icon */}
            <span
              className="flex items-center justify-center rounded-full"
              style={{
                width: '22px',
                height: '22px',
                backgroundColor: 'rgba(255,255,255,0.25)',
                flexShrink: 0,
              }}
            >
              <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </span>
            Create new score card
          </button>
        </div>

        {/* ── Main Content Card ── */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '18px',
            padding: '24px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
          }}
        >
          {/* Section header */}
          <div
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            style={{ marginBottom: '20px' }}
          >
            <h2
              className="font-semibold"
              style={{ fontSize: '15px', color: '#111827' }}
            >
              Existing Score Card templates
            </h2>

            {/* Sort controls */}
            <div className="flex items-center gap-2">
              {['Date', 'Name'].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSort(opt)}
                  className="flex items-center gap-1 font-medium transition-colors"
                  style={{
                    border: `1px solid ${sort === opt ? '#111827' : '#D1D5DB'}`,
                    borderRadius: '8px',
                    padding: '5px 12px',
                    fontSize: '12px',
                    color: sort === opt ? '#111827' : '#6B7280',
                    backgroundColor: sort === opt ? '#F9FAFB' : '#FFFFFF',
                    cursor: 'pointer',
                  }}
                >
                  <svg
                    width="11"
                    height="11"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    style={{ opacity: 0.6 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M6 12h12M9 17h6" />
                  </svg>
                  Sort : {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Grid or empty */}
          {sorted.length === 0 ? (
            <EmptyState onCreate={() => openModal()} />
          ) : (
            <div
              className="grid grid-cols-1"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(1, 1fr)',
                gap: '16px',
              }}
            >
              <style>{`
                @media (min-width: 640px) {
                  .scorecard-grid { grid-template-columns: repeat(2, 1fr) !important; }
                }
                @media (min-width: 1024px) {
                  .scorecard-grid { grid-template-columns: repeat(3, 1fr) !important; }
                }
              `}</style>
              <div
                className="scorecard-grid"
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(1, 1fr)',
                  gap: '16px',
                  gridColumn: '1 / -1',
                }}
              >
                {sorted.map((scorecard) => (
                  <ScorecardCard
                    key={scorecard._id || scorecard.id}
                    scorecard={scorecard}
                    onEdit={openModal}
                    onDelete={handleDelete}
                    isSelected={selectedId === (scorecard._id || scorecard.id)}
                    onSelect={handleSelect}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Create / Edit Modal ── */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingScorecard ? 'Edit Scorecard' : 'Create Scorecard'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(event) => setFormData({ ...formData, name: event.target.value })}
            placeholder="Compliance Check"
            required
            fullWidth
          />
          <Input
            label="Description"
            value={formData.description}
            onChange={(event) => setFormData({ ...formData, description: event.target.value })}
            placeholder="Scorecard for inbound appointment calls"
            fullWidth
          />
          <Input
            label="Call Type"
            value={formData.callType}
            onChange={(event) => setFormData({ ...formData, callType: event.target.value })}
            placeholder="Compliance"
            required
            fullWidth
          />
          <label className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 p-3">
            <input
              type="checkbox"
              checked={formData.isPublished}
              onChange={(event) => setFormData({ ...formData, isPublished: event.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-green-500 focus:ring-green-400"
            />
            <span className="text-sm font-medium text-gray-800">Publish scorecard</span>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-gray-700">Sections JSON</span>
            <textarea
              value={formData.sectionsText}
              onChange={(event) => setFormData({ ...formData, sectionsText: event.target.value })}
              rows={8}
              className="block w-full rounded-xl border border-gray-200 px-3 py-2 font-mono text-sm focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-300"
            />
          </label>
          <div className="flex justify-end gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" loading={isSaving}>
              {editingScorecard ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
