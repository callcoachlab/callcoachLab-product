import { useState } from 'react';

// ─── Mock service ─────────────────────────────────────────────────────────────
const scorecardService = {
  create: async (data) => {
    await new Promise((r) => setTimeout(r, 900));
    return { scorecard: { _id: 'mock_' + Date.now(), ...data } };
  },
};

// ─── Constants ────────────────────────────────────────────────────────────────
const CALL_TYPES = ['Inbound', 'Outbound', 'Follow-up', 'Discovery', 'Support'];
const SCORING_MODES = ['Points-based', 'Percentage', 'Pass / Fail'];
const PASS_THRESHOLDS = ['50%', '60%', '70%', '75%', '80%', '85%', '90%'];

const DEFAULT_SECTION = (id) => ({ id, name: 'New Section', criteria: [] });
const DEFAULT_CRITERION = (id) => ({
  id, label: '', question: '', type: 'Yes/No',
  points: 10, autoScore: false, criticalFail: false, allowNA: false,
});

let _id = 1;
const uid = () => `id_${_id++}`;

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepBadge({ number, label, active, done }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all
          ${done
            ? 'bg-green-500 border-green-500 text-white'
            : active
            ? 'bg-green-500 border-green-500 text-white'
            : 'bg-transparent border-gray-300 text-gray-400'}`}
      >
        {done
          ? <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
          : number}
      </div>
      <span className={`text-sm ${active ? 'font-semibold text-gray-900' : done ? 'font-medium text-gray-500' : 'text-gray-400'}`}>
        {label}
      </span>
    </div>
  );
}

function Chevron() {
  return <span className="text-gray-300 text-sm select-none px-2">{'<'}</span>;
}

// ─── Toggle component ─────────────────────────────────────────────────────────
function Toggle({ label, value, onChange }) {
  return (
    <div className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-3 py-2">
      <span className="text-xs text-gray-600 mr-2 leading-snug">{label}</span>
      <button type="button" onClick={() => onChange(!value)}
        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors shrink-0 ${value ? 'bg-green-500' : 'bg-gray-200'}`}>
        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${value ? 'translate-x-4' : 'translate-x-1'}`} />
      </button>
    </div>
  );
}

// ─── Criterion row (Step 2) ───────────────────────────────────────────────────
function CriterionRow({ criterion, index, onUpdate, onRemove, canRemove }) {
  const [expanded, setExpanded] = useState(false);
  const typeColors = {
    'Yes/No': 'bg-blue-100 text-blue-700',
    'Scale 1-5': 'bg-purple-100 text-purple-700',
    'Scale 1-10': 'bg-indigo-100 text-indigo-700',
    'Text': 'bg-gray-100 text-gray-600',
  };
  return (
    <div className={`transition-colors ${expanded ? 'bg-green-50/40' : 'bg-white hover:bg-gray-50/60'}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-xs text-gray-300 w-4 shrink-0">{index + 1}</span>
        <input type="text" value={criterion.label} onChange={(e) => onUpdate('label', e.target.value)}
          placeholder="Criterion label…"
          className="flex-1 text-sm text-gray-800 bg-transparent border-0 outline-none placeholder-gray-300 min-w-0" />
        <select value={criterion.type} onChange={(e) => onUpdate('type', e.target.value)}
          className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 outline-none cursor-pointer ${typeColors[criterion.type] || 'bg-gray-100 text-gray-600'}`}>
          <option>Yes/No</option>
          <option>Scale 1-5</option>
          <option>Scale 1-10</option>
          <option>Text</option>
        </select>
        <div className="flex items-center gap-1">
          <input type="number" value={criterion.points} onChange={(e) => onUpdate('points', e.target.value)}
            className="w-12 text-xs text-center border border-gray-200 rounded-md py-1 focus:outline-none focus:ring-1 focus:ring-green-400 bg-white" min={0} />
          <span className="text-xs text-gray-400">pts</span>
        </div>
        {criterion.criticalFail && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">Critical</span>}
        {criterion.autoScore && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Auto</span>}
        <button onClick={() => setExpanded(v => !v)} className="text-gray-300 hover:text-gray-500 transition-colors shrink-0">
          <svg className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {canRemove && (
          <button onClick={onRemove} className="text-gray-200 hover:text-red-400 transition-colors shrink-0">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-green-100 pt-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Audit question (shown to reviewer)</label>
            <input type="text" value={criterion.question} onChange={(e) => onUpdate('question', e.target.value)}
              placeholder="e.g. Did the agent ask about timeline/urgency?"
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 bg-white" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Toggle label="Auto-score this item" value={criterion.autoScore} onChange={(v) => onUpdate('autoScore', v)} />
            <Toggle label="Critical fail (auto-fail if missed)" value={criterion.criticalFail} onChange={(v) => onUpdate('criticalFail', v)} />
            <Toggle label="Allow N/A (not applicable)" value={criterion.allowNA} onChange={(v) => onUpdate('allowNA', v)} />
          </div>
        </div>
      )}
    </div>
  );
}

// ─── STEP 1: Select Template ──────────────────────────────────────────────────
function StepSelectTemplate({ onNext }) {
  const [selected, setSelected] = useState(null);
  const [aiScript, setAiScript] = useState('');
  const [showAiInput, setShowAiInput] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const options = [
    {
      id: 'template',
      title: 'Use a Template',
      desc: 'Recommended for SMB teams',
      icon: (
        <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      id: 'blank',
      title: 'Start Blank',
      desc: 'Build from scratch',
      icon: (
        <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
    {
      id: 'ai',
      title: 'Generate with AI',
      desc: 'Paste script/checklist → auto-draft',
      icon: (
        <svg className="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
        </svg>
      ),
    },
  ];

  const handleSelect = (id) => {
    setSelected(id);
    setShowAiInput(id === 'ai');
  };

  const handleAiGenerate = async () => {
    if (!aiScript.trim()) return;
    setAiLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setAiLoading(false);
    onNext({ startMode: 'ai', aiScript });
  };

  return (
    <div>
      {/* Three cards — NO outer wrapper, sit directly on cream background */}
      <div className="grid grid-cols-3 gap-8 mb-10">
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <button
              key={opt.id}
              onClick={() => handleSelect(opt.id)}
              className={`relative flex flex-col text-left rounded-2xl border transition-all duration-150 bg-white
                ${isSelected
                  ? 'border-green-500 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'}`}
              style={{ height: '229px' }}
            >
              {/* Green circle badge — top left */}
              <div className="p-5 pb-0">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold">
                  1
                </div>
              </div>

              {/* Icon — vertically centered in remaining space */}
              <div className="flex-1 flex items-center px-5 py-2">
                {opt.icon}
              </div>

              {/* Title + desc — pinned to bottom */}
              <div className="px-5 pb-4">
                <div className="font-semibold text-gray-900 text-sm mb-0.5">{opt.title}</div>
                <div className="text-xs text-gray-400">{opt.desc}</div>
              </div>

              {isSelected && (
                <div className="absolute inset-0 border-2 border-green-500 rounded-2xl pointer-events-none" />
              )}
            </button>
          );
        })}
      </div>

      {showAiInput && (
        <div className="mb-6 bg-gray-50 border border-gray-200 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-5 h-5 bg-green-500 rounded flex items-center justify-center">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <span className="text-sm font-semibold text-gray-800">Paste your call script or checklist</span>
            <span className="ml-auto text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">AI Draft — coming soon</span>
          </div>
          <textarea value={aiScript} onChange={(e) => setAiScript(e.target.value)}
            placeholder="Paste your sales script, call checklist, or SOPs here…"
            rows={5}
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 resize-none focus:outline-none focus:ring-2 focus:ring-green-500 bg-white text-gray-700 placeholder-gray-400" />
          <div className="flex justify-end mt-3">
            <button onClick={handleAiGenerate} disabled={!aiScript.trim() || aiLoading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
              {aiLoading
                ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Generating…</>
                : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>Generate Draft</>}
            </button>
          </div>
        </div>
      )}

      {selected && selected !== 'ai' && (
        <div className="flex justify-end">
          <button onClick={() => onNext({ startMode: selected })}
            className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors">
            Continue →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── STEP 2: Build ────────────────────────────────────────────────────────────
function StepBuild({ onNext, onBack }) {
  const [title, setTitle] = useState('');
  const [callType, setCallType] = useState('');
  const [passThreshold, setPassThreshold] = useState('');
  const [scoringMode, setScoringMode] = useState('');
  const [sections, setSections] = useState([{
    ...DEFAULT_SECTION(uid()),
    name: 'Opening & Rapport',
    criteria: [DEFAULT_CRITERION(uid())],
  }]);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Scorecard title is required';
    if (!callType) e.callType = 'Required';
    if (!passThreshold) e.passThreshold = 'Required';
    if (!scoringMode) e.scoringMode = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const addSection = () => setSections(p => [...p, { ...DEFAULT_SECTION(uid()), criteria: [DEFAULT_CRITERION(uid())] }]);
  const removeSection = (sId) => setSections(p => p.filter(s => s.id !== sId));
  const updateSectionName = (sId, name) => setSections(p => p.map(s => s.id === sId ? { ...s, name } : s));
  const addCriterion = (sId) => setSections(p => p.map(s => s.id === sId ? { ...s, criteria: [...s.criteria, DEFAULT_CRITERION(uid())] } : s));
  const removeCriterion = (sId, cId) => setSections(p => p.map(s => s.id === sId ? { ...s, criteria: s.criteria.filter(c => c.id !== cId) } : s));
  const updateCriterion = (sId, cId, field, value) => setSections(p => p.map(s => s.id === sId ? { ...s, criteria: s.criteria.map(c => c.id === cId ? { ...c, [field]: value } : c) } : s));

  const totalPoints = sections.reduce((sum, s) => sum + s.criteria.reduce((cs, c) => cs + (Number(c.points) || 0), 0), 0);

  return (
    <div className="space-y-5">
      <div>
        <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); setErrors(p => ({ ...p, title: '' })); }}
          placeholder="Score Card Title"
          className={`w-full text-3xl font-bold bg-transparent border-0 border-b-2 outline-none pb-2 transition-colors placeholder-gray-300
            ${errors.title ? 'border-red-400 text-red-700' : 'border-gray-200 focus:border-green-500 text-gray-900'}`} />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
        <p className="text-sm text-gray-400 mt-2">
          Call Coach 360° is a Score card builder that <span className="text-green-600 font-semibold">works like a doc.</span>{' '}
          Type <code className="bg-gray-100 px-1 rounded">/</code> to insert form blocks and{' '}
          <code className="bg-gray-100 px-1 rounded">@</code> to mention question answers.
        </p>
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Call Type', value: callType, setter: setCallType, key: 'callType', options: CALL_TYPES },
          { label: 'Pass Threshold', value: passThreshold, setter: setPassThreshold, key: 'passThreshold', options: PASS_THRESHOLDS },
          { label: 'Scoring Mode', value: scoringMode, setter: setScoringMode, key: 'scoringMode', options: SCORING_MODES },
        ].map(({ label, value, setter, key, options }) => (
          <div key={key}>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{label}</label>
            <select value={value} onChange={(e) => { setter(e.target.value); setErrors(p => ({ ...p, [key]: '' })); }}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 bg-white
                ${errors[key] ? 'border-red-400' : 'border-gray-300'}`}>
              <option value="">Select…</option>
              {options.map(o => <option key={o}>{o}</option>)}
            </select>
            {errors[key] && <p className="text-xs text-red-500 mt-1">{errors[key]}</p>}
          </div>
        ))}
      </div>
      <div className="border-t border-dashed border-gray-200" />
      <div className="space-y-4">
        {sections.map((section, sIdx) => (
          <div key={section.id} className="border border-gray-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b border-gray-200">
              <span className="text-xs font-bold text-gray-400 w-4">{sIdx + 1}</span>
              <input type="text" value={section.name} onChange={(e) => updateSectionName(section.id, e.target.value)}
                className="flex-1 text-sm font-semibold text-gray-800 bg-transparent border-0 outline-none" placeholder="Section name…" />
              <span className="text-xs text-gray-400">{section.criteria.length} criteria</span>
              {sections.length > 1 && (
                <button onClick={() => removeSection(section.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            <div className="divide-y divide-gray-100">
              {section.criteria.map((c, cIdx) => (
                <CriterionRow key={c.id} criterion={c} index={cIdx}
                  onUpdate={(field, value) => updateCriterion(section.id, c.id, field, value)}
                  onRemove={() => removeCriterion(section.id, c.id)}
                  canRemove={section.criteria.length > 1} />
              ))}
            </div>
            <div className="px-4 py-2.5 bg-gray-50 border-t border-gray-100">
              <button onClick={() => addCriterion(section.id)}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-600 transition-colors font-medium">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                Add criterion
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <button onClick={addSection}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-green-700 hover:bg-green-50 border border-dashed border-gray-300 hover:border-green-400 rounded-lg transition-all">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add section
        </button>
        <div className="text-sm text-gray-500">Total points: <span className="font-bold text-gray-900">{totalPoints}</span></div>
      </div>
      <div className="flex justify-between pt-2 border-t border-gray-100">
        <button onClick={onBack} className="px-5 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors">← Back</button>
        <button onClick={() => { if (validate()) onNext({ title, callType, passThreshold, scoringMode, sections }); }}
          className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-lg transition-colors">
          Continue →
        </button>
      </div>
    </div>
  );
}

// ─── STEP 3: Test & Publish ───────────────────────────────────────────────────
function StepPublish({ wizardData, onBack, onPublish, isPublishing }) {
  const { title, callType, passThreshold, scoringMode, sections = [] } = wizardData;
  const totalCriteria = sections.reduce((s, sec) => s + sec.criteria.length, 0);
  const totalPoints = sections.reduce((sum, s) => sum + s.criteria.reduce((cs, c) => cs + (Number(c.points) || 0), 0), 0);
  const criticalFails = sections.reduce((sum, s) => sum + s.criteria.filter(c => c.criticalFail).length, 0);
  const autoScored = sections.reduce((sum, s) => sum + s.criteria.filter(c => c.autoScore).length, 0);
  const [activeSection, setActiveSection] = useState(sections[0]?.id || null);
  const [activeCriterion, setActiveCriterion] = useState(sections[0]?.criteria[0] || null);

  return (
    <div className="space-y-5 ">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Sections', value: sections.length, color: 'text-blue-600' },
          { label: 'Criteria', value: totalCriteria, color: 'text-gray-900' },
          { label: 'Total Points', value: totalPoints, color: 'text-green-600' },
          { label: 'Critical Fails', value: criticalFails, color: 'text-red-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-4" style={{ minHeight: '280px' }}>
        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-1.5">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Select Parameters</h4>
          {sections.map(sec => (
            <button key={sec.id} onClick={() => { setActiveSection(sec.id); setActiveCriterion(sec.criteria[0] || null); }}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${activeSection === sec.id ? 'bg-green-500 text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
              {sec.name}
            </button>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">
            {sections.find(s => s.id === activeSection)?.name || 'Section'}
          </h4>
          <div className="space-y-2">
            {sections.find(s => s.id === activeSection)?.criteria.map(c => (
              <button key={c.id} onClick={() => setActiveCriterion(c)}
                className={`w-full text-left p-3 rounded-lg border transition-all
                  ${activeCriterion?.id === c.id ? 'border-green-400 bg-green-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <div className="text-sm font-medium text-gray-800 mb-1.5">
                  {c.label || <span className="text-gray-400 italic">Unlabeled</span>}
                </div>
                <div className="flex flex-wrap gap-1">
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">{c.type}</span>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{c.points} pts</span>
                  {c.autoScore && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Auto</span>}
                  {c.criticalFail && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Critical</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Edit criterion</h4>
          {activeCriterion ? (
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 block mb-1">Label</label>
                <div className="text-sm font-medium text-gray-800">{activeCriterion.label || '—'}</div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1">Audit question</label>
                <div className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2">{activeCriterion.question || '—'}</div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><label className="text-xs text-gray-400 block mb-1">Type</label><span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{activeCriterion.type}</span></div>
                <div><label className="text-xs text-gray-400 block mb-1">Points</label><span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{activeCriterion.points} pts</span></div>
              </div>
              <div className="space-y-2 pt-1">
                {[
                  { label: 'Auto-score this item', value: activeCriterion.autoScore },
                  { label: 'Critical fail (auto-fail if missed)', value: activeCriterion.criticalFail },
                  { label: 'Allow N/A (not applicable)', value: activeCriterion.allowNA },
                ].map(f => (
                  <div key={f.label} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <span className="text-xs text-gray-600">{f.label}</span>
                    <div className={`w-8 h-4 rounded-full ${f.value ? 'bg-green-400' : 'bg-gray-200'}`} />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400 italic">Select a criterion to preview</p>
          )}
        </div>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="grid grid-cols-4 gap-4 text-sm">
          {[
            { label: 'Title', value: title },
            { label: 'Call Type', value: callType },
            { label: 'Pass Threshold', value: passThreshold },
            { label: 'Auto-scored', value: `${autoScored} / ${totalCriteria}` },
          ].map(item => (
            <div key={item.label}>
              <span className="text-gray-400 text-xs block mb-0.5">{item.label}</span>
              <span className="font-semibold text-gray-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between pt-2 border-t border-gray-100">
        <button onClick={onBack} disabled={isPublishing}
          className="px-5 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-300 hover:border-gray-400 rounded-lg transition-colors disabled:opacity-50">
          ← Back
        </button>
        <button onClick={onPublish} disabled={isPublishing}
          className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold rounded-lg transition-colors">
          {isPublishing
            ? <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Publishing…</>
            : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>Publish Scorecard</>}
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function CreateScorecardPage() {
  const [step, setStep] = useState(1);
  const [wizardData, setWizardData] = useState({});
  const [isPublishing, setIsPublishing] = useState(false);

  const handleStep1 = (data) => { setWizardData(p => ({ ...p, ...data })); setStep(2); };
  const handleStep2 = (data) => { setWizardData(p => ({ ...p, ...data })); setStep(3); };

  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      await scorecardService.create(wizardData);
      alert('Scorecard published successfully!');
    } catch {
      alert('Failed to publish scorecard. Please try again.');
    } finally {
      setIsPublishing(false);
    }
  };

  const STEPS = [
    { number: 1, label: 'Select Template' },
    { number: 2, label: 'Start Building' },
    { number: 3, label: 'Test & Publish' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#EEEDE8' }}>

      {/* ── Centered logo — no bg, no border ── */}
      <header className="py-5 text-center">
        <span className="text-lg font-semibold text-gray-900 tracking-tight">
          Call Coach <span className="text-green-500">360°</span>
        </span>
      </header>

      {/* ── Page body ── */}
      <main className="flex-1 p-20 ">

        {/* Title */}
        <div className="flex flex-col gap-4 mb-4">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight leading-tight">
            Create New Score Card
          </h1>
          <p className="text-sm text-gray-500">
            Start creating new score card to audit call with{' '}
            <span className="text-green-600 font-semibold">Call Coach 360°</span>
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-[10px] mb-10">
          {STEPS.map((s, i) => (
            <div key={s.number} className="flex items-center gap-1">
              <StepBadge
                number={s.number}
                label={s.label}
                active={step === s.number}
                done={step > s.number}
              />
              {i < STEPS.length - 1 && <Chevron />}
            </div>
          ))}
        </div>

        {/* Step 1: cards directly on cream — NO white card wrapper */}
        {step === 1 && <StepSelectTemplate onNext={handleStep1} />}

        {/* Steps 2 & 3: inside white card */}
        {step === 2 && (
          <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #E5E4DF' }}>
            <StepBuild wizardData={wizardData} onNext={handleStep2} onBack={() => setStep(1)} />
          </div>
        )}
        {step === 3 && (
          <div className="bg-white rounded-2xl p-8" style={{ border: '1px solid #E5E4DF' }}>
            <StepPublish wizardData={wizardData} onBack={() => setStep(2)} onPublish={handlePublish} isPublishing={isPublishing} />
          </div>
        )}

      </main>
    </div>
  );
}

export default CreateScorecardPage;