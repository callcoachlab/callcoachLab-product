import { useState } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────
const C = {
  green: "#22C55E", greenLight: "#DCFCE7",
  pink: "#EC4899", indigo: "#6366F1", blue: "#3B82F6",
  amber: "#F59E0B", amberLight: "#FEF3C7", amberText: "#D97706",
  orange: "#F97316", orangeLight: "#FFEDD5", orangeText: "#C2410C",
  red: "#EF4444", redLight: "#FEE2E2", redText: "#DC2626",
  violet: "#7C3AED", violetLight: "#EDE9FE",
  g50: "#F9FAFB", g100: "#F3F4F6", g200: "#E5E7EB",
  g400: "#9CA3AF", g500: "#6B7280", g700: "#374151", g900: "#111827",
  white: "#FFFFFF",
};

// ─── DATA ────────────────────────────────────────────────
const CHART_DATA = {
  Ads:  [28,32,35,30,40,38,42,36,44,48,52,55,50,60,58,63,65,62,68,72,70,66,64,60,58,55,52],
  LSA:  [15,18,20,17,22,25,20,24,28,30,26,32,30,28,34,36,32,38,35,40,38,36,34,32,30,28,26],
  Web:  [10,12,14,11,16,18,15,19,22,20,18,24,22,20,26,25,22,28,26,30,28,26,24,22,20,18,16],
  Ref:  [8,10,9,11,13,12,14,11,15,14,13,16,14,12,17,16,14,18,16,20,18,16,14,13,12,10,9],
  Meta: [5,6,7,6,8,9,7,10,9,8,11,10,9,12,11,10,13,12,11,14,13,12,11,10,9,8,7],
};

const SOURCE_TABLE = [
  { source: "Google Ads", sub: "Campaign: Whitening", calls: 34, qualified: 24, booked: 8,  costQ: "₹320" },
  { source: "LSA",        sub: "Local Services",      calls: 28, qualified: 18, booked: 6,  costQ: "₹410" },
  { source: "Web",        sub: "Organic / SEO",       calls: 21, qualified: 14, booked: 4,  costQ: "₹290" },
];

const QA_TREND_DAYS = [
  { day: "Mon", val: 38 }, { day: "Tue", val: 52 }, { day: "Wed", val: 45 },
  { day: "Thu", val: 72 }, { day: "Fri", val: 60 }, { day: "Sat", val: 55 },
];

// Admin top reps — includes Team column
const ADMIN_TOP_REPS = {
  all: [
    { team: "Team 4", agent: "Sarah K.", dt: "2026-01-18 09:12", status: "OK"      },
    { team: "Team 3", agent: "Sarah K.", dt: "2026-01-18 09:44", status: "Invalid" },
    { team: "Team 5", agent: "Mike D.",  dt: "2026-01-18 09:44", status: "Missing" },
    { team: "Team 4", agent: "Sarah K.", dt: "2026-01-18 09:12", status: "OK"      },
    { team: "Team 3", agent: "Sarah K.", dt: "2026-01-18 09:44", status: "Invalid" },
  ],
  successful: [
    { team: "Team 4", agent: "Sarah K.", dt: "2026-01-18 09:12", status: "OK" },
    { team: "Team 4", agent: "Sarah K.", dt: "2026-01-18 09:12", status: "OK" },
  ],
  unsuccessful: [
    { team: "Team 3", agent: "Sarah K.", dt: "2026-01-18 09:44", status: "Invalid" },
    { team: "Team 5", agent: "Mike D.",  dt: "2026-01-18 09:44", status: "Missing" },
  ],
};

// Agent scores for top reps panel (admin dash right)
const AGENT_SCORES = {
  all: [
    { name: "Sarah K.", score: "82 avg", pass: "Pass 74%" },
    { name: "Sarah K.", score: "82 avg", pass: "Pass 74%" },
    { name: "Mike D.",  score: "71 avg", pass: "Pass 58%" },
  ],
  successful: [
    { name: "Sarah K.", score: "82 avg", pass: "Pass 74%" },
  ],
  unsuccessful: [
    { name: "Mike D.",  score: "71 avg", pass: "Fail 38%" },
  ],
};

const SC_ROWS = [
  { initials: "RK", bg: C.blue,  name: "Ramesh Kumar", phone: "+91 99734 79088",  status: "PASS", pass: "Pass 74%", detail: "Greeted and introduced clinic",   conf: "High", ev: "00:05" },
  { initials: "SG", bg: C.pink,  name: "Shriya Goyal",  phone: "+91 95678 786645", status: "FAIL", pass: "Pass 32%", detail: "Asked needs/pain before pricing", conf: "Med",  ev: "00:50" },
  { initials: "BS", bg: C.amber, name: "Bhavna Singh",  phone: "+91 95678 786645", status: "FAIL", pass: "Pass 32%", detail: "Asked timeline/urgency",           conf: "High", ev: "00:50" },
  { initials: "RK", bg: C.blue,  name: "Ramesh Kumar", phone: "+91 99734 79088",  status: "PASS", pass: "Pass 74%", detail: "Greeted and introduced clinic",   conf: "High", ev: "00:05" },
  { initials: "SG", bg: C.pink,  name: "Shriya Goyal",  phone: "+91 95678 786645", status: "FAIL", pass: "Pass 32%", detail: "Asked needs/pain before pricing", conf: "Med",  ev: "00:50" },
  { initials: "BS", bg: C.amber, name: "Bhavna Singh",  phone: "+91 95678 786645", status: "FAIL", pass: "Pass 32%", detail: "Asked timeline/urgency",           conf: "High", ev: "00:50" },
];

const QA_FILE_ROWS = [
  { file: "call_001.mp3", agent: "Sarah K.", dt: "2026-01-18 09:12", source: "Google Ads", status: "OK"      },
  { file: "call_002.mp3", agent: "Sarah K.", dt: "2026-01-18 09:44", source: "Google Ads", status: "Invalid" },
  { file: "call_003.mp3", agent: "Mike D.",  dt: "2026-01-18 09:44", source: "Google Ads", status: "Missing" },
  { file: "call_001.mp3", agent: "Sarah K.", dt: "2026-01-18 09:12", source: "Google Ads", status: "OK"      },
  { file: "call_002.mp3", agent: "Sarah K.", dt: "2026-01-18 09:44", source: "Google Ads", status: "Invalid" },
  { file: "call_003.mp3", agent: "Mike D.",  dt: "2026-01-18 09:44", source: "Google Ads", status: "Missing" },
  { file: "call_001.mp3", agent: "Sarah K.", dt: "2026-01-18 09:12", source: "Google Ads", status: "OK"      },
  { file: "call_002.mp3", agent: "Sarah K.", dt: "2026-01-18 09:44", source: "Google Ads", status: "Invalid" },
];

const MISSED_CRITERIA = [
  { label: "Offer appointment & ask time", pct: 39, color: C.red   },
  { label: "Ask timeline/urgency",         pct: 31, color: C.amber },
  { label: "Confirm next step clearly",    pct: 24, color: C.orange },
];

const SCORECARD_TEMPLATES = [
  { id: 1, label: "B3", bg: C.blue,   name: "Inbound Lead -\nBook Appointment (v3)", sub: "Score Card for booking appointment (v3)", selected: true  },
  { id: 2, label: "B3", bg: C.indigo, name: "Inbound Lead -\nBook Appointment (v2)", sub: "Score Card for booking appointment (v2)", selected: false },
  { id: 3, label: "L3", bg: C.amber,  name: "Inbound Lead -\nLeads Collection (v3)", sub: "Score Card for Leads Collection (v3)",   selected: false },
  { id: 4, label: "B3", bg: C.blue,   name: "Inbound Lead -\nBook Appointment (v2)", sub: "Score Card for booking appointment (v2)", selected: false },
  { id: 5, label: "L3", bg: C.amber,  name: "Inbound Lead -\nLeads Collection (v3)", sub: "Score Card for Leads Collection (v3)",   selected: false },
  { id: 6, label: "B3", bg: C.pink,   name: "Inbound Lead -\nBook Appointment (v3)", sub: "Score Card for booking appointment (v3)", selected: false },
];

// ─── HELPERS ─────────────────────────────────────────────
function Avatar({ initials, bg, size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.round(size * 0.37), fontWeight: 600, color: "#fff",
      flexShrink: 0, letterSpacing: "-0.3px",
    }}>{initials}</div>
  );
}

function DonutChart({ pct = 72, size = 62 }) {
  const r = size / 2 - 5;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const c = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={c} cy={c} r={r} fill="none" stroke={C.g200} strokeWidth="6" />
      <circle cx={c} cy={c} r={r} fill="none" stroke={C.green} strokeWidth="6"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" transform={`rotate(-90 ${c} ${c})`} />
      <text x={c} y={c + 4} textAnchor="middle" fontSize="12" fontWeight="700"
        fill={C.g900} fontFamily="Inter,sans-serif">{pct}%</text>
    </svg>
  );
}

function PassTag({ status }) {
  const isPass = status === "PASS";
  return (
    <span style={{
      fontSize: 9, fontWeight: 700, borderRadius: 4, padding: "2px 6px",
      background: isPass ? C.greenLight : C.redLight,
      color: isPass ? "#15803D" : C.redText,
    }}>{status}</span>
  );
}

function StatusPill({ status }) {
  const map = {
    OK:      { bg: C.greenLight,  color: "#15803D",    label: "OK"                      },
    Invalid: { bg: C.amberLight,  color: C.amberText,  label: "Invalid datetime format"  },
    Missing: { bg: C.orangeLight, color: C.orangeText, label: "Audio file missing"       },
  };
  const s = map[status] || map.OK;
  return (
    <span style={{
      background: s.bg, color: s.color, fontSize: 9, fontWeight: 600,
      borderRadius: 5, padding: "2px 7px", whiteSpace: "nowrap",
    }}>{s.label}</span>
  );
}

function ConfTag({ conf }) {
  const isHigh = conf === "High";
  return (
    <span style={{
      fontSize: 9, borderRadius: 4, padding: "2px 6px",
      background: isHigh ? C.violetLight : C.amberLight,
      color: isHigh ? C.violet : C.amberText,
    }}>Conf: {conf}</span>
  );
}

function TabBtn({ active, onClick, children }) {
  return (
    <button onClick={onClick} style={{
      padding: "4px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer",
      fontFamily: "inherit", fontWeight: active ? 600 : 400,
      border: active ? "none" : `1px solid ${C.g200}`,
      background: active ? C.green : C.white,
      color: active ? C.white : C.g500,
      transition: "background .15s",
    }}>{children}</button>
  );
}

// Line chart
function LineChart({ data, width = 340, height = 120 }) {
  const maxV = Math.max(...data.map(d => d.val));
  const minV = Math.min(...data.map(d => d.val));
  const padX = 24; const padY = 14;
  const W = width - padX * 2;
  const H = height - padY * 2;
  const pts = data.map((d, i) => ({
    x: padX + (i / (data.length - 1)) * W,
    y: padY + H - ((d.val - minV) / (maxV - minV || 1)) * H,
    ...d,
  }));
  const peak = pts.reduce((a, b) => b.val > a.val ? b : a);
  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = `M${pts[0].x},${padY + H} ` + pts.map(p => `L${p.x},${p.y}`).join(" ") + ` L${pts[pts.length-1].x},${padY + H} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      {[0, 25, 50, 75, 100].map(v => {
        const y = padY + H - ((v - minV) / (maxV - minV || 1)) * H;
        if (y < padY - 5 || y > padY + H + 5) return null;
        return (
          <g key={v}>
            <line x1={padX} y1={y} x2={padX + W} y2={y} stroke={C.g200} strokeWidth="1" strokeDasharray="4 3" />
            <text x={padX - 4} y={y + 3} textAnchor="end" fontSize="8" fill={C.g400} fontFamily="Inter,sans-serif">{v}</text>
          </g>
        );
      })}
      <path d={area} fill={C.green} fillOpacity="0.08" />
      <polyline points={polyline} fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={C.green} stroke={C.white} strokeWidth="1.5" />
      ))}
      <rect x={peak.x - 22} y={peak.y - 22} width={44} height={16} rx="4" fill={C.g900} />
      <text x={peak.x} y={peak.y - 10} textAnchor="middle" fontSize="9" fontWeight="700" fill={C.white} fontFamily="Inter,sans-serif">{peak.val} pts</text>
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={padY + H + 14} textAnchor="middle" fontSize="8" fill={C.g400} fontFamily="Inter,sans-serif">{p.day}</text>
      ))}
    </svg>
  );
}

// Bar chart
function BarChart({ bars, maxVal = 80 }) {
  const weeks = ["W1","W2","W3","W4","W5","W6","W7"];
  const peakIdx = bars.indexOf(Math.max(...bars));
  return (
    <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 24, width: 26,
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        alignItems: "flex-end", paddingRight: 4 }}>
        {[100,80,60,40,20,0].map(v => (
          <span key={v} style={{ fontSize: 9, color: C.g400 }}>{v}</span>
        ))}
      </div>
      <div style={{ position: "absolute", left: 30, right: 0, top: 0, bottom: 24 }}>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0,
            top: `${(i / 5) * 100}%`, borderBottom: `1px dashed ${C.g200}` }} />
        ))}
        <div style={{ position: "absolute", inset: 0, display: "flex",
          alignItems: "flex-end", gap: 3, padding: "0 4px" }}>
          {bars.map((val, i) => {
            const isPeak = i === peakIdx;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "flex-end", position: "relative" }}>
                {isPeak && (
                  <div style={{
                    position: "absolute", bottom: `calc(${(val / maxVal) * 100}% + 4px)`,
                    background: C.g900, color: "#fff", fontSize: 9, fontWeight: 600,
                    borderRadius: 5, padding: "2px 6px", whiteSpace: "nowrap", zIndex: 2,
                  }}>{val} pts</div>
                )}
                <div style={{
                  width: "100%", height: `${(val / maxVal) * 100}%`,
                  borderRadius: "3px 3px 0 0",
                  background: isPeak ? C.green : "#BBEED1",
                  transition: "height .3s ease",
                }} />
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ position: "absolute", left: 30, right: 0, bottom: 0, height: 20,
        display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        {weeks.map(w => <span key={w} style={{ fontSize: 9, color: C.g400 }}>{w}</span>)}
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────
function Sidebar({ active, onNav, onNotif }) {
  const items = [
    { id: "dashboard",  icon: "📊", label: "Dash Board"  },
    { id: "teams",      icon: "👥", label: "Teams"        },
    { id: "scorecards", icon: "📋", label: "Score Cards"  },
    { id: "qaqueue",    icon: "✅", label: "QA Queue"     },
    { id: "notification",icon:"🔔", label: "Notification" },
    { id: "messages",   icon: "💬", label: "Messages"     },
    { id: "calendar",   icon: "📅", label: "Calendar"     },
  ];
  const bottom = [
    { id: "settings", icon: "⚙️", label: "Settings" },
    { id: "logout",   icon: "🚪", label: "Log Out"  },
  ];
  const Btn = ({ item, onClick }) => {
    const isActive = active === item.id;
    return (
      <button onClick={onClick} style={{
        display: "flex", alignItems: "center", gap: 9, width: "100%",
        padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer",
        fontSize: 12, fontWeight: isActive ? 600 : 400, fontFamily: "inherit",
        background: isActive ? C.green : "transparent",
        color: isActive ? C.white : C.g500,
        textAlign: "left", marginBottom: 2, transition: "background .15s",
      }}>
        <span style={{ fontSize: 14 }}>{item.icon}</span>{item.label}
      </button>
    );
  };
  return (
    <aside style={{
      width: 190, height: "100%", background: C.white, flexShrink: 0,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "16px 0", borderRight: `1px solid ${C.g200}`,
    }}>
      <div>
        <div style={{ padding: "0 16px 12px", borderBottom: `1px solid ${C.g100}`, fontWeight: 700, fontSize: 15 }}>
          Call Coach <span style={{ color: C.green }}>360°</span>
        </div>
        <nav style={{ padding: "8px 8px 0" }}>
          {items.map(item => (
            <Btn key={item.id} item={item}
              onClick={item.id === "notification" ? onNotif : () => onNav(item.id)} />
          ))}
        </nav>
      </div>
      <nav style={{ padding: "0 8px 8px" }}>
        {bottom.map(item => (
          <Btn key={item.id} item={item} onClick={() => onNav(item.id)} />
        ))}
      </nav>
    </aside>
  );
}

// ─── HEADER ──────────────────────────────────────────────
function Header({ onNotif }) {
  return (
    <header style={{
      background: C.white, borderBottom: `1px solid ${C.g200}`,
      height: 48, padding: "0 16px", flexShrink: 0,
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 15, color: C.g400 }}>⊞</span>
        <div style={{ display: "flex", alignItems: "center", gap: 5, color: C.g500, fontSize: 12 }}>
          <span>📊</span><span>Dash Board</span>
        </div>
      </div>
      <div style={{ position: "relative", flex: 1, maxWidth: 260, margin: "0 16px" }}>
        <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: C.g400 }}>🔍</span>
        <input placeholder="Search" style={{
          width: "100%", padding: "5px 32px 5px 26px",
          border: `1px solid ${C.g200}`, borderRadius: 8,
          fontSize: 11, color: C.g700, background: C.g50, outline: "none", fontFamily: "inherit",
        }} />
        <span style={{
          position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)",
          fontSize: 9, color: C.g500, background: C.g200, borderRadius: 3, padding: "1px 4px", fontWeight: 600,
        }}>AI</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 11, color: C.g700, cursor: "pointer" }}>+ New</span>
        <span style={{ fontSize: 14, color: C.g400, cursor: "pointer" }}>❓</span>
        <span style={{ fontSize: 14, color: C.g400, cursor: "pointer" }}>💬</span>
        <span style={{ fontSize: 14, color: C.g400, cursor: "pointer" }}>⏰</span>
        <Avatar initials="EM" bg={C.indigo} size={26} />
        <span style={{ fontSize: 11, color: C.g400, cursor: "pointer" }} onClick={onNotif}>▾</span>
      </div>
    </header>
  );
}

// ─── REUSABLE: Admin Top Reps Panel ──────────────────────
function AdminTopRepsPanel({ repTab, setRepTab, showViewAll = true }) {
  const rows = ADMIN_TOP_REPS[repTab] || ADMIN_TOP_REPS.all;
  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>Top reps (QA)</p>
      <p style={{ margin: "0 0 10px", fontSize: 10, color: C.g400 }}>Consistency across lead calls</p>
      {/* Tabs */}
      <div style={{ display: "flex", gap: 5, marginBottom: 8, flexWrap: "wrap" }}>
        {[["all","All Calls"],["successful","Successful Calls"],["unsuccessful","Unsuccessful Calls"]].map(([id,label]) => (
          <TabBtn key={id} active={repTab === id} onClick={() => setRepTab(id)}>{label}</TabBtn>
        ))}
        <select style={{ marginLeft: "auto", fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 6px", color: C.g500, background: C.white, fontFamily: "inherit" }}>
          <option>Today</option>
        </select>
      </div>
      {/* Table header */}
      <div style={{ display: "grid", gridTemplateColumns: "0.8fr 1fr 1.2fr 90px", gap: 6, padding: "4px 0", borderBottom: `1px solid ${C.g200}`, marginBottom: 5, flexShrink: 0 }}>
        {["Team","Agent name","Call_datetime","Status"].map(h => (
          <span key={h} style={{ fontSize: 10, color: C.g400, fontWeight: 600 }}>{h}</span>
        ))}
      </div>
      {/* Rows */}
      <div style={{ overflowY: "auto", flex: 1, scrollbarWidth: "thin" }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "0.8fr 1fr 1.2fr 90px",
            gap: 6, alignItems: "center", padding: "6px 0",
            borderBottom: i < rows.length - 1 ? `1px solid ${C.g100}` : "none",
          }}>
            <span style={{ fontSize: 11, color: C.g700, fontWeight: 500 }}>{r.team}</span>
            <span style={{ fontSize: 11, color: C.g700 }}>{r.agent}</span>
            <span style={{ fontSize: 11, color: C.g700 }}>{r.dt}</span>
            <StatusPill status={r.status} />
          </div>
        ))}
      </div>
      {showViewAll && (
        <button style={{
          marginTop: 10, width: "100%", padding: "9px 0", flexShrink: 0,
          background: C.green, color: C.white, border: "none", borderRadius: 8,
          fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        }}>View all call for today →</button>
      )}
    </div>
  );
}

// ─── SCREEN 1: DASH BOARD ────────────────────────────────
function AdminDashScreen() {
  const [activeSrc, setActiveSrc] = useState("Ads");
  const [repTab, setRepTab]       = useState("all");

  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 16px 0", flex: 1, overflow: "hidden" }}>

      {/* LEFT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 12, overflow: "hidden", minWidth: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.g900, margin: "0 0 4px" }}>Good morning, Admin 001</h1>
          <p style={{ fontSize: 11, color: C.g500, margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: C.g900 }}>Call Coach 360°</strong> wishes you a good and productive day,{" "}
            <span style={{ color: C.green, fontWeight: 600 }}>120 calls</span> have been reviewed and have an approx{" "}
            <span style={{ color: C.red, fontWeight: 600 }}>38% increment</span> in overall performance from last week (W24) of{" "}
            <span style={{ color: C.blue, fontWeight: 600 }}>Team 4</span>.
          </p>
        </div>

        {/* Marketing ROI Card */}
        <div style={{ background: C.white, border: `1px solid ${C.g200}`, borderRadius: 11, padding: "14px 14px 10px", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>Marketing ROI (Quality by source)</p>
          <p style={{ margin: "0 0 10px", fontSize: 10, color: C.g400 }}>Qualified &amp; booked performance across lead sources</p>
          {/* Source tabs */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexShrink: 0 }}>
            <div style={{ display: "flex", gap: 5 }}>
              {Object.keys(CHART_DATA).map(src => (
                <button key={src} onClick={() => setActiveSrc(src)} style={{
                  padding: "3px 11px", borderRadius: 20, fontSize: 11, cursor: "pointer",
                  border: `1px solid ${activeSrc === src ? C.green : C.g200}`,
                  background: activeSrc === src ? C.green : C.white,
                  color: activeSrc === src ? C.white : C.g700,
                  fontFamily: "inherit", fontWeight: activeSrc === src ? 600 : 400,
                }}>{src}</button>
              ))}
            </div>
            <select style={{ fontSize: 10, border: `1px solid ${C.g200}`, borderRadius: 6, padding: "3px 8px", color: C.g500, background: C.white, fontFamily: "inherit" }}>
              <option>2 months</option><option>1 month</option>
            </select>
          </div>
          {/* Bar chart */}
          <div style={{ flex: 1, minHeight: 0 }}>
            <BarChart bars={CHART_DATA[activeSrc]} />
          </div>
          {/* Source table */}
          <div style={{ marginTop: 8, flexShrink: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 50px 70px 55px 55px", gap: 6, padding: "4px 0", borderBottom: `1px solid ${C.g200}`, marginBottom: 4 }}>
              {["Source","Calls","Qualified","Booked","Cost/Q"].map(h => (
                <span key={h} style={{ fontSize: 10, color: C.g500, fontWeight: 600 }}>{h}</span>
              ))}
            </div>
            {SOURCE_TABLE.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 50px 70px 55px 55px", gap: 6, padding: "5px 0", borderBottom: i < SOURCE_TABLE.length - 1 ? `1px solid ${C.g100}` : "none", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: C.g900 }}>{row.source}</p>
                  <p style={{ margin: 0, fontSize: 9, color: C.g400 }}>{row.sub}</p>
                </div>
                <span style={{ fontSize: 11, color: C.g700 }}>{row.calls}</span>
                <span style={{ fontSize: 11, color: C.g700 }}>{row.qualified}</span>
                <span style={{ fontSize: 11, color: C.g700 }}>{row.booked}</span>
                <span style={{ fontSize: 11, color: C.g700 }}>{row.costQ}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", paddingBottom: 14, scrollbarWidth: "thin" }}>

        {/* Team Performance (line chart) */}
        <div style={{ background: C.white, border: `1px solid ${C.g200}`, borderRadius: 11, padding: 14, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>Team Performance</p>
              <p style={{ margin: 0, fontSize: 10, color: C.g400 }}>What's breaking conversions this week</p>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <select style={{ fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 5px", color: C.g500, background: C.white, fontFamily: "inherit" }}>
                <option>Team 4</option><option>Team 3</option><option>Team 5</option>
              </select>
              <select style={{ fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 5px", color: C.g500, background: C.white, fontFamily: "inherit" }}>
                <option>Last week</option>
              </select>
            </div>
          </div>
          <LineChart data={QA_TREND_DAYS} width={292} height={110} />
        </div>

        {/* Top reps — Admin version (with donut) */}
        <div style={{ background: C.white, border: `1px solid ${C.g200}`, borderRadius: 11, padding: 14, flexShrink: 0 }}>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>Top reps (QA)</p>
          <p style={{ margin: "0 0 8px", fontSize: 10, color: C.g400 }}>Consistency across lead calls</p>

          {/* Donut + review counts */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.g50, borderRadius: 8, padding: "10px 12px", marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 2px", fontSize: 11, color: C.g400 }}>Total Calls Performance</p>
              <p style={{ margin: "0 0 5px", fontSize: 12, fontWeight: 600, color: C.g900 }}>12 calls need review</p>
              <div style={{ display: "flex", gap: 5 }}>
                <span style={{ background: C.amberLight, color: C.amberText, fontSize: 9, borderRadius: 4, padding: "2px 7px", fontWeight: 600 }}>4 unclear</span>
                <span style={{ background: C.redLight, color: C.redText, fontSize: 9, borderRadius: 4, padding: "2px 7px", fontWeight: 600 }}>2 critical fails</span>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <DonutChart pct={72} size={58} />
              <p style={{ margin: "2px 0 0", fontSize: 9, color: C.g400 }}>72% pass</p>
              <p style={{ margin: 0, fontSize: 9, color: C.g400 }}>included a clear next step.</p>
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap" }}>
            {[["all","All Calls"],["successful","Successful Calls"],["unsuccessful","Unsuccessful Calls"]].map(([id,label]) => (
              <TabBtn key={id} active={repTab === id} onClick={() => setRepTab(id)}>{label}</TabBtn>
            ))}
            <select style={{ marginLeft: "auto", fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 5px", color: C.g500, background: C.white, fontFamily: "inherit" }}>
              <option>Today</option>
            </select>
          </div>

          {/* Agent score table */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 55px", gap: 5, padding: "3px 0", borderBottom: `1px solid ${C.g200}`, marginBottom: 6 }}>
            {["Agent name","Avg. Scr","Pass %"].map(h => (
              <span key={h} style={{ fontSize: 10, color: C.g400, fontWeight: 600 }}>{h}</span>
            ))}
          </div>
          {(AGENT_SCORES[repTab] || AGENT_SCORES.all).map((a, i, arr) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 60px 55px", gap: 5,
              alignItems: "center", padding: "5px 0",
              borderBottom: i < arr.length - 1 ? `1px solid ${C.g100}` : "none",
            }}>
              <span style={{ fontSize: 11, color: C.g900, fontWeight: 500 }}>{a.name}</span>
              <span style={{ background: C.violetLight, color: C.violet, fontSize: 9, borderRadius: 5, padding: "2px 6px", fontWeight: 600, textAlign: "center" }}>{a.score}</span>
              <span style={{ fontSize: 11, color: C.g700 }}>{a.pass}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN 2: TEAMS ─────────────────────────────────────
function TeamsScreen() {
  const [insightTab, setInsightTab] = useState("QA Trends");
  const [repTab, setRepTab]         = useState("all");
  const [teamFilter, setTeamFilter] = useState("Team 4");
  const [periodFilter, setPeriodFilter] = useState("last week");

  const MISSED = [
    { label: "Offer appointment & ask time", pct: 39, color: C.red   },
    { label: "Ask timeline/urgency",         pct: 31, color: C.amber },
    { label: "Confirm next step clearly",    pct: 24, color: C.orange },
  ];

  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 16px 0", flex: 1, overflow: "hidden" }}>

      {/* LEFT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, overflow: "hidden", minWidth: 0 }}>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, flexShrink: 0 }}>
          <div style={{ background: C.green, borderRadius: 10, padding: 12 }}>
            <p style={{ margin: "0 0 2px", fontSize: 10, color: "rgba(255,255,255,.8)" }}>Overall Team score</p>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: "rgba(255,255,255,.85)" }}>Inbound Lead - Book Appointment</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: C.white }}>78 / 100</span>
              <span style={{ background: "rgba(255,255,255,.25)", color: C.white, borderRadius: 6, padding: "2px 9px", fontSize: 11, fontWeight: 600 }}>PASS</span>
            </div>
          </div>
          {[
            { title: "Pass rate",      sub: "Score ≥ threshold",     val: "63%", badge: "↑ UP 5%",     badgeBg: C.greenLight, badgeCol: "#15803D" },
            { title: "Critical fails", sub: "Auto-fail items",        val: "14",  badge: "Compliance",   badgeBg: C.redLight,   badgeCol: C.redText },
            { title: "Rep variance",   sub: "Consistency across reps",val: "Low", badge: "Improvised",   badgeBg: C.amberLight, badgeCol: C.amberText },
          ].map(card => (
            <div key={card.title} style={{ background: C.white, border: `1px solid ${C.g200}`, borderRadius: 10, padding: 12 }}>
              <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: C.g900 }}>{card.title}</p>
              <p style={{ margin: "0 0 6px", fontSize: 10, color: C.g400 }}>{card.sub}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: C.g900 }}>{card.val}</span>
                <span style={{ background: card.badgeBg, color: card.badgeCol, fontSize: 10, borderRadius: 5, padding: "2px 7px", fontWeight: 600 }}>{card.badge}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Sub-tabs */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {["Marketing ROI","QA Trends","Voice of Customer (Beta)"].map(tab => (
            <TabBtn key={tab} active={insightTab === tab} onClick={() => setInsightTab(tab)}>{tab}</TabBtn>
          ))}
        </div>

        {/* Chart panel */}
        <div style={{ flex: 1, background: C.white, border: `1px solid ${C.g200}`, borderRadius: 11, padding: 14, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {insightTab === "QA Trends" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexShrink: 0 }}>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>Team Performances</p>
                  <p style={{ margin: 0, fontSize: 10, color: C.g400 }}>What's breaking conversions this week</p>
                </div>
                <div style={{ display: "flex", gap: 5 }}>
                  <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)} style={{ fontSize: 10, border: `1px solid ${C.g200}`, borderRadius: 6, padding: "3px 8px", color: C.g700, background: C.white, fontFamily: "inherit" }}>
                    <option>Team 4</option><option>Team 3</option><option>Team 5</option>
                  </select>
                  <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} style={{ fontSize: 10, border: `1px solid ${C.g200}`, borderRadius: 6, padding: "3px 8px", color: C.g700, background: C.white, fontFamily: "inherit" }}>
                    <option>last week</option><option>this week</option>
                  </select>
                </div>
              </div>
              <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: C.g900, flexShrink: 0 }}>QA Trends</p>
              <p style={{ margin: "0 0 6px", fontSize: 10, color: C.g400, flexShrink: 0 }}>What's breaking conversions this week</p>
              <div style={{ flex: 1, minHeight: 0 }}>
                <LineChart data={QA_TREND_DAYS} width={500} height={160} />
              </div>
            </>
          )}
          {insightTab === "Marketing ROI" && (
            <>
              <p style={{ margin: "0 0 8px", fontSize: 13, fontWeight: 700, color: C.g900, flexShrink: 0 }}>Marketing ROI</p>
              <div style={{ flex: 1, minHeight: 0 }}>
                <BarChart bars={CHART_DATA.Ads} />
              </div>
            </>
          )}
          {insightTab === "Voice of Customer (Beta)" && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 32 }}>🎙️</span>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.g700 }}>Voice of Customer</p>
              <p style={{ fontSize: 11, color: C.g400 }}>Beta feature — coming soon.</p>
            </div>
          )}
        </div>

        {/* Top missed criteria */}
        <div style={{ background: C.white, border: `1px solid ${C.g200}`, borderRadius: 11, padding: 14, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>Top missed criteria</p>
              <p style={{ margin: 0, fontSize: 10, color: C.g400 }}>Biggest conversion leaks</p>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <select style={{ fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 6px", color: C.g500, background: C.white, fontFamily: "inherit" }}><option>Agent 276</option></select>
              <select style={{ fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 6px", color: C.g500, background: C.white, fontFamily: "inherit" }}><option>Last week</option></select>
            </div>
          </div>
          {MISSED.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: i < MISSED.length - 1 ? 8 : 0 }}>
              <span style={{ fontSize: 11, color: C.g700 }}>{m.label}</span>
              <span style={{
                background: m.color === C.red ? C.redLight : m.color === C.amber ? C.amberLight : C.orangeLight,
                color: m.color === C.red ? C.redText : m.color === C.amber ? C.amberText : C.orangeText,
                fontSize: 10, borderRadius: 5, padding: "3px 10px", fontWeight: 600,
              }}>Missed in {m.pct}% calls</span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div style={{ width: 320, flexShrink: 0, background: C.white, border: `1px solid ${C.g200}`, borderRadius: 11, padding: 14, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <AdminTopRepsPanel repTab={repTab} setRepTab={setRepTab} showViewAll={true} />
      </div>
    </div>
  );
}

// ─── SCREEN 3: SCORE CARDS ───────────────────────────────
function ScoreCardsScreen() {
  const [cards, setCards] = useState(SCORECARD_TEMPLATES);
  const [selectedId, setSelectedId] = useState(1);

  const select = (id) => {
    setSelectedId(id);
    setCards(prev => prev.map(c => ({ ...c, selected: c.id === id })));
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", padding: "18px 20px 0" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 6, flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: C.g900, margin: "0 0 4px" }}>Good morning, Admin 001</h1>
          <p style={{ fontSize: 11, color: C.g400, margin: 0 }}>Choose the fastest way to start auditing</p>
        </div>
        <button style={{
          display: "flex", alignItems: "center", gap: 6,
          background: C.green, color: C.white, border: "none", borderRadius: 22,
          padding: "9px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        }}>
          <span style={{ fontSize: 16, fontWeight: 400 }}>+</span> Create new score card
        </button>
      </div>

      {/* Section label + sort */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexShrink: 0 }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: C.g900 }}>Existing Score Card templates</p>
        <div style={{ display: "flex", gap: 6 }}>
          <button style={{ fontSize: 11, border: `1px solid ${C.g200}`, borderRadius: 7, padding: "4px 12px", background: C.white, color: C.g700, cursor: "pointer", fontFamily: "inherit" }}>Sort : Date</button>
          <button style={{ fontSize: 11, border: `1px solid ${C.g200}`, borderRadius: 7, padding: "4px 12px", background: C.white, color: C.g700, cursor: "pointer", fontFamily: "inherit" }}>Sort: Date</button>
        </div>
      </div>

      {/* Cards grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, overflowY: "auto", flex: 1, paddingBottom: 16, scrollbarWidth: "thin", alignContent: "start" }}>
        {cards.map(card => (
          <div key={card.id} onClick={() => select(card.id)} style={{
            background: card.selected ? "#EFF6FF" : C.white,
            border: `1.5px solid ${card.selected ? C.blue : C.g200}`,
            borderRadius: 12, padding: "16px 16px 14px",
            cursor: "pointer", transition: "border-color .15s",
            position: "relative", minHeight: 130,
          }}>
            {/* Edit/Delete only on selected */}
            {card.selected && (
              <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 5 }}>
                <button style={{ background: C.g100, border: "none", borderRadius: 6, width: 24, height: 24, cursor: "pointer", fontSize: 12 }}>✏️</button>
                <button style={{ background: C.redLight, border: "none", borderRadius: 6, width: 24, height: 24, cursor: "pointer", fontSize: 12 }}>🗑️</button>
              </div>
            )}
            {/* Label badge */}
            <div style={{
              width: 34, height: 34, borderRadius: "50%", background: card.bg,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 12, fontWeight: 700, color: C.white, marginBottom: 12,
            }}>{card.label}</div>
            {/* Name */}
            <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 700, color: C.g900, lineHeight: 1.4, whiteSpace: "pre-line" }}>{card.name}</p>
            <p style={{ margin: 0, fontSize: 10, color: C.g400 }}>{card.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SCREEN 4: QA QUEUE ──────────────────────────────────
function AdminQAQueueScreen() {
  const [qTab, setQTab]     = useState("Qualification");
  const [repTab, setRepTab] = useState("all");
  const [selectedRow, setSelectedRow] = useState(0);
  const [teamFilter, setTeamFilter]   = useState("Team 4");
  const [periodFilter, setPeriodFilter] = useState("last week");

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
      {/* Team Performances bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px 10px", flexShrink: 0 }}>
        <div>
          <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: C.g900 }}>Team Performances</p>
          <p style={{ margin: 0, fontSize: 10, color: C.g400 }}>What's breaking conversions this week</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <select value={teamFilter} onChange={e => setTeamFilter(e.target.value)} style={{ fontSize: 11, border: `1px solid ${C.g200}`, borderRadius: 7, padding: "5px 10px", color: C.g700, background: C.white, fontFamily: "inherit", cursor: "pointer" }}>
            <option>Team 4</option><option>Team 3</option><option>Team 5</option>
          </select>
          <select value={periodFilter} onChange={e => setPeriodFilter(e.target.value)} style={{ fontSize: 11, border: `1px solid ${C.g200}`, borderRadius: 7, padding: "5px 10px", color: C.g700, background: C.white, fontFamily: "inherit", cursor: "pointer" }}>
            <option>last week</option><option>this week</option>
          </select>
        </div>
      </div>

      {/* Main content */}
      <div style={{ display: "flex", gap: 14, padding: "0 20px 0", flex: 1, overflow: "hidden" }}>

        {/* LEFT: QA Queue file list */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>QA Queue</p>
          <p style={{ margin: "0 0 8px", fontSize: 10, color: C.g400 }}>Inbound Lead - Book Appointment (v3)</p>

          {/* Score tabs */}
          <div style={{ display: "flex", gap: 5, marginBottom: 8, flexShrink: 0, flexWrap: "wrap" }}>
            {["Opening","Qualification","Close","Compliance"].map(tab => (
              <TabBtn key={tab} active={qTab === tab} onClick={() => setQTab(tab)}>{tab}</TabBtn>
            ))}
            <select style={{ marginLeft: "auto", fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 6px", color: C.g500, background: C.white, fontFamily: "inherit" }}>
              <option>Today</option>
            </select>
          </div>

          {/* Table header */}
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 1.2fr 0.9fr 80px", gap: 8, padding: "5px 8px", borderBottom: `1px solid ${C.g200}`, marginBottom: 4, flexShrink: 0 }}>
            {["File name","Agent name","Call_datetime","Source","Status"].map(h => (
              <span key={h} style={{ fontSize: 10, color: C.g400, fontWeight: 600 }}>{h}</span>
            ))}
          </div>

          {/* File rows */}
          <div style={{ overflowY: "auto", flex: 1, scrollbarWidth: "thin" }}>
            {QA_FILE_ROWS.map((r, i) => (
              <div key={i} onClick={() => setSelectedRow(i)} style={{
                display: "grid", gridTemplateColumns: "1.2fr 0.9fr 1.2fr 0.9fr 80px",
                gap: 8, alignItems: "center", padding: "7px 8px",
                borderBottom: i < QA_FILE_ROWS.length - 1 ? `1px solid ${C.g100}` : "none",
                borderRadius: 6, cursor: "pointer",
                background: selectedRow === i ? "#EFF6FF" : "transparent",
              }}>
                <span style={{ fontSize: 11, color: C.blue, fontWeight: 500 }}>{r.file}</span>
                <span style={{ fontSize: 11, color: C.g700 }}>{r.agent}</span>
                <span style={{ fontSize: 11, color: C.g700 }}>{r.dt}</span>
                <span style={{ fontSize: 11, color: C.g700 }}>{r.source}</span>
                <StatusPill status={r.status} />
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: SC rows */}
        <div style={{ width: 320, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>Top reps (QA)</p>
          <p style={{ margin: "0 0 8px", fontSize: 10, color: C.g400 }}>Consistency across lead calls</p>

          {/* Rep tabs */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8, flexWrap: "wrap", flexShrink: 0 }}>
            {[["all","All Calls"],["successful","Successful Calls"],["unsuccessful","Unsuccessful Calls"]].map(([id,label]) => (
              <TabBtn key={id} active={repTab === id} onClick={() => setRepTab(id)}>{label}</TabBtn>
            ))}
            <select style={{ marginLeft: "auto", fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 5px", color: C.g500, background: C.white, fontFamily: "inherit" }}>
              <option>Today</option>
            </select>
          </div>

          {/* SC rows */}
          <div style={{ overflowY: "auto", flex: 1, scrollbarWidth: "thin" }}>
            {SC_ROWS.map((r, i) => (
              <div key={i} style={{
                background: C.white, borderRadius: 9, border: `1px solid ${C.g200}`,
                padding: "8px 10px", marginBottom: 6, cursor: "pointer",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Avatar initials={r.initials} bg={r.bg} size={26} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: C.g900 }}>{r.name}</p>
                    <p style={{ margin: 0, fontSize: 9, color: C.g400 }}>{r.phone}</p>
                  </div>
                  <PassTag status={r.status} />
                  <span style={{ fontSize: 10, color: C.g700, fontWeight: 500, marginLeft: 4 }}>{r.pass}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 9 }}>
                  <span style={{ color: C.red }}>🚩</span>
                  <span style={{ flex: 1, color: C.g700, fontStyle: "italic" }}>"{r.detail}"</span>
                  <ConfTag conf={r.conf} />
                  <span style={{ color: C.blue, textDecoration: "underline", cursor: "pointer" }}>Evidence: {r.ev}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NOTIFICATION MODAL ──────────────────────────────────
function NotificationModal({ onClose }) {
  const items = [
    { initials: "RK", bg: C.blue,  name: "Ramesh Kumar", phone: "+91 99734 79088",  concern: "Skin Pigmentation", location: "Chandigarh", booked: false },
    { initials: "SG", bg: C.pink,  name: "Shriya Goyal",  phone: "+91 95678 786645", concern: "Skin Pigmentation", location: "Delhi",      booked: false },
    { initials: "BS", bg: C.amber, name: "Bhavna Singh",  phone: "+91 95678 786645", concern: "Dark Spots",        location: "Delhi",      booked: true  },
    { initials: "RK", bg: C.blue,  name: "Ramesh Kumar", phone: "+91 99734 79088",  concern: "Skin Pigmentation", location: "Chandigarh", booked: false },
  ];
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.35)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.white, borderRadius: 12, padding: 18,
        width: 420, maxHeight: 460, overflowY: "auto",
        boxShadow: "0 8px 32px rgba(0,0,0,.18)",
      }}>
        <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: C.g900 }}>Notification</p>
        <p style={{ margin: "0 0 12px", fontSize: 11, color: C.green, fontWeight: 500 }}>Inbound Lead - Book Appointment (v3)</p>
        {items.map((n, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < items.length - 1 ? `1px solid ${C.g100}` : "none" }}>
            <Avatar initials={n.initials} bg={n.bg} size={30} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.g900 }}>{n.name}</p>
              <p style={{ margin: 0, fontSize: 10, color: C.g400 }}>{n.phone}</p>
              {n.booked && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <button style={{ background: C.green, color: C.white, border: "none", borderRadius: 6, padding: "3px 9px", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Booked Call</button>
                  <span style={{ fontSize: 10, color: C.g400 }}>📅 15 May, Today | 10:25 AM</span>
                </div>
              )}
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 9, color: C.g400 }}>Concern:</p>
              <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: 500, color: C.g700 }}>{n.concern}</p>
              <p style={{ margin: 0, fontSize: 9, color: C.g400 }}>Location:</p>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: ["Delhi","Mumbai"].includes(n.location) ? C.red : C.g700 }}>{n.location}</p>
            </div>
          </div>
        ))}
        <button onClick={onClose} style={{ marginTop: 12, width: "100%", padding: 8, border: `1px solid ${C.g200}`, borderRadius: 8, background: C.white, cursor: "pointer", fontFamily: "inherit", fontSize: 12, color: C.g500 }}>Close</button>
      </div>
    </div>
  );
}

// ─── PLACEHOLDER ─────────────────────────────────────────
function Placeholder({ title, icon }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12 }}>
      <span style={{ fontSize: 44 }}>{icon}</span>
      <p style={{ fontSize: 17, fontWeight: 600, color: C.g700 }}>{title}</p>
      <p style={{ fontSize: 12, color: C.g400 }}>Coming soon.</p>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────
export default function AdminDashboard() {
  const [screen, setScreen]       = useState("dashboard");
  const [showNotif, setShowNotif] = useState(false);

  const activeNav = screen === "qaqueue" ? "qaqueue" : screen;

  const handleNav = (id) => setScreen(id);

  return (
    <div style={{
      display: "flex", width: "100vw", height: "100vh",
      fontFamily: "'Inter', sans-serif", background: C.g100,
      overflow: "hidden", fontSize: 13, color: C.g900, position: "relative",
    }}>
      <Sidebar active={activeNav} onNav={handleNav} onNotif={() => setShowNotif(true)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header onNotif={() => setShowNotif(true)} />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {screen === "dashboard"  && <AdminDashScreen />}
          {screen === "teams"      && <TeamsScreen />}
          {screen === "scorecards" && <ScoreCardsScreen />}
          {screen === "qaqueue"    && <AdminQAQueueScreen />}
          {screen === "messages"   && <Placeholder title="Messages"  icon="💬" />}
          {screen === "calendar"   && <Placeholder title="Calendar"  icon="📅" />}
          {screen === "settings"   && <Placeholder title="Settings"  icon="⚙️" />}
        </div>
      </div>

      {showNotif && <NotificationModal onClose={() => setShowNotif(false)} />}
    </div>
  );
}