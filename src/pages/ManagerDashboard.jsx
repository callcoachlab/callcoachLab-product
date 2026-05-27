import { useState } from "react";

// ─── DESIGN TOKENS ──────────────────────────────────────
const C = {
  green: "#22C55E", greenLight: "#DCFCE7", greenDark: "#16A34A",
  pink: "#EC4899", indigo: "#6366F1", blue: "#3B82F6",
  amber: "#F59E0B", amberLight: "#FEF3C7", amberText: "#D97706",
  orange: "#F97316", orangeLight: "#FFEDD5", orangeText: "#C2410C",
  red: "#EF4444", redLight: "#FEE2E2", redText: "#DC2626",
  violet: "#7C3AED", violetLight: "#EDE9FE",
  teal: "#0D9488", tealLight: "#CCFBF1",
  g50: "#F9FAFB", g100: "#F3F4F6", g200: "#E5E7EB", g300: "#D1D5DB",
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
  { source: "Referral",   sub: "Word of mouth",       calls: 15, qualified: 11, booked: 5,  costQ: "₹180" },
  { source: "Meta Ads",   sub: "Instagram + FB",      calls: 12, qualified:  7, booked: 2,  costQ: "₹520" },
];

const QA_TREND_DAYS = [
  { day: "Mon", val: 38 }, { day: "Tue", val: 52 }, { day: "Wed", val: 45 },
  { day: "Thu", val: 72 }, { day: "Fri", val: 60 }, { day: "Sat", val: 55 },
];

const TOP_REPS = {
  all: [
    { file: "call_001.mp3", agent: "Sarah K.", dt: "2026-01-18 09:12", status: "OK" },
    { file: "call_002.mp3", agent: "Sarah K.", dt: "2026-01-18 09:44", status: "Invalid" },
    { file: "call_003.mp3", agent: "Mike D.",  dt: "2026-01-18 09:44", status: "Missing" },
    { file: "call_001.mp3", agent: "Sarah K.", dt: "2026-01-18 09:12", status: "OK" },
    { file: "call_002.mp3", agent: "Sarah K.", dt: "2026-01-18 09:44", status: "Invalid" },
  ],
  successful: [
    { file: "call_001.mp3", agent: "Sarah K.", dt: "2026-01-18 09:12", status: "OK" },
    { file: "call_001.mp3", agent: "Sarah K.", dt: "2026-01-18 09:12", status: "OK" },
  ],
  unsuccessful: [
    { file: "call_002.mp3", agent: "Sarah K.", dt: "2026-01-18 09:44", status: "Invalid" },
    { file: "call_003.mp3", agent: "Mike D.",  dt: "2026-01-18 09:44", status: "Missing" },
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

const REVIEW_ROWS = [
  { quote: '"Greeted and introduced clinic"',   conf: "High", badge: "unclear",        ev: "Evidence: 00:05" },
  { quote: '"Asked needs/pain before pricing"', conf: "Med",  badge: "critical fails",  ev: "Evidence: 00:50" },
  { quote: '"Asked timeline/urgency"',          conf: "High", badge: "clear",           ev: "Evidence: 00:57" },
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
  { file: "call_003.mp3", agent: "Mike D.",  dt: "2026-01-18 09:44", source: "Google Ads", status: "Missing" },
];

const MISSED_CRITERIA = [
  { label: "Offer appointment & ask time", pct: 39, color: C.red },
  { label: "Ask timeline/urgency",         pct: 31, color: C.amber },
  { label: "Confirm next step clearly",    pct: 24, color: C.orange },
];

const TRANSCRIPT_LINES = [
  { who: "Caller", text: "Hi there! This is Alex from Bright Solutions. Am I speaking with Jamie?" },
  { who: "Jamie",  text: "Yes, this is Jamie. How can I help you today?" },
  { who: "Caller", text: "I'm reaching out because you expressed interest in our services. I'd love to discuss how we can assist you further. Do you have a moment to chat?" },
  { who: "Jamie",  text: "Well, I'm interested in improving our marketing strategy. We've been struggling to reach our target audience effectively." },
  { who: "Caller", text: "I understand. Many of our clients have faced similar challenges. We offer tailored marketing solutions that can help you engage your audience better. Would you like to schedule a more in-depth appointment to discuss this?" },
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
    OK:      { bg: C.greenLight,  color: "#15803D",    label: "OK"                   },
    Invalid: { bg: C.amberLight,  color: C.amberText,  label: "Invalid datetime format" },
    Missing: { bg: C.orangeLight, color: C.orangeText, label: "Audio file missing"    },
  };
  const s = map[status] || map.OK;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 9, fontWeight: 600, borderRadius: 5,
      padding: "2px 7px", whiteSpace: "nowrap",
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

function VDiv() {
  return <div style={{ width: 1, height: 26, background: C.g200, flexShrink: 0 }} />;
}

// Line chart for QA Trends
function LineChart({ data, width = 280, height = 100 }) {
  const maxV = Math.max(...data.map(d => d.val));
  const minV = Math.min(...data.map(d => d.val));
  const padX = 10; const padY = 12;
  const W = width - padX * 2;
  const H = height - padY * 2;
  const pts = data.map((d, i) => {
    const x = padX + (i / (data.length - 1)) * W;
    const y = padY + H - ((d.val - minV) / (maxV - minV || 1)) * H;
    return { x, y, ...d };
  });
  const peak = pts.reduce((a, b) => b.val > a.val ? b : a);
  const polyline = pts.map(p => `${p.x},${p.y}`).join(" ");
  const area = `M${pts[0].x},${padY + H} ` + pts.map(p => `L${p.x},${p.y}`).join(" ") + ` L${pts[pts.length-1].x},${padY + H} Z`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
      {/* Y grid lines */}
      {[0, 25, 50, 75, 100].map(v => {
        const y = padY + H - ((v - minV) / (maxV - minV || 1)) * H;
        if (y < padY || y > padY + H) return null;
        return <line key={v} x1={padX} y1={y} x2={padX + W} y2={y} stroke={C.g200} strokeWidth="1" strokeDasharray="4 3" />;
      })}
      {/* Y labels */}
      {[20, 40, 60, 80, 100].map(v => {
        const y = padY + H - ((v - minV) / (maxV - minV || 1)) * H;
        if (y < padY - 5 || y > padY + H + 5) return null;
        return <text key={v} x={padX - 4} y={y + 3} textAnchor="end" fontSize="8" fill={C.g400} fontFamily="Inter,sans-serif">{v}</text>;
      })}
      {/* Area fill */}
      <path d={area} fill={C.green} fillOpacity="0.08" />
      {/* Line */}
      <polyline points={polyline} fill="none" stroke={C.green} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Dots */}
      {pts.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r="3.5" fill={C.green} stroke={C.white} strokeWidth="1.5" />
      ))}
      {/* Peak tooltip */}
      <rect x={peak.x - 20} y={peak.y - 22} width={40} height={16} rx="4" fill={C.g900} />
      <text x={peak.x} y={peak.y - 10} textAnchor="middle" fontSize="9" fontWeight="700" fill={C.white} fontFamily="Inter,sans-serif">{peak.val} pts</text>
      {/* X labels */}
      {pts.map((p, i) => (
        <text key={i} x={p.x} y={padY + H + 12} textAnchor="middle" fontSize="8" fill={C.g400} fontFamily="Inter,sans-serif">{p.day}</text>
      ))}
    </svg>
  );
}

// Bar chart (reused from Dash Board)
function BarChart({ bars, maxVal = 80, weeks = ["W1","W2","W3","W4","W5","W6","W7"] }) {
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
            const h = `${(val / maxVal) * 100}%`;
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
                  width: "100%", height: h, borderRadius: "3px 3px 0 0",
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
        {weeks.map(w => (
          <span key={w} style={{ fontSize: 9, color: C.g400 }}>{w}</span>
        ))}
      </div>
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────
function Sidebar({ activeScreen, onNav, onNotif }) {
  const navItems = [
    { id: "dashboard",   icon: "📊", label: "Dash Board"   },
    { id: "teaminsight", icon: "👁", label: "Team Insight"  },
    { id: "qaqueue",     icon: "✅", label: "QA Queue"      },
    { id: "notification",icon: "🔔", label: "Notification"  },
    { id: "messages",    icon: "💬", label: "Messages"      },
    { id: "calendar",    icon: "📅", label: "Calendar"      },
  ];
  const bottomItems = [
    { id: "settings", icon: "⚙️", label: "Settings" },
    { id: "logout",   icon: "🚪", label: "Log Out"  },
  ];

  const NavBtn = ({ item, onClick }) => {
    const active = activeScreen === item.id;
    return (
      <button onClick={onClick} style={{
        display: "flex", alignItems: "center", gap: 9, width: "100%",
        padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer",
        fontSize: 12, fontWeight: active ? 600 : 400, fontFamily: "Inter,sans-serif",
        background: active ? C.green : "transparent",
        color: active ? C.white : C.g500, textAlign: "left", marginBottom: 2,
        transition: "background .15s",
      }}>
        <span style={{ fontSize: 14 }}>{item.icon}</span>
        {item.label}
      </button>
    );
  };

  return (
    <aside style={{
      width: 190, height: "100%", background: C.white,
      display: "flex", flexDirection: "column", justifyContent: "space-between",
      padding: "16px 0", flexShrink: 0, borderRight: `1px solid ${C.g200}`,
    }}>
      <div>
        <div style={{ padding: "0 16px 12px", borderBottom: `1px solid ${C.g100}`, fontWeight: 700, fontSize: 15 }}>
          Call Coach <span style={{ color: C.green }}>360°</span>
        </div>
        <nav style={{ padding: "8px 8px 0" }}>
          {navItems.map(item => (
            <NavBtn key={item.id} item={item}
              onClick={item.id === "notification" ? onNotif : () => onNav(item.id)} />
          ))}
        </nav>
      </div>
      <nav style={{ padding: "0 8px 8px" }}>
        {bottomItems.map(item => (
          <NavBtn key={item.id} item={item} onClick={() => onNav(item.id)} />
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
          fontSize: 11, color: C.g700, background: C.g50,
          outline: "none", fontFamily: "inherit",
        }} />
        <span style={{
          position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)",
          fontSize: 9, color: C.g500, background: C.g200,
          borderRadius: 3, padding: "1px 4px", fontWeight: 600,
        }}>AI</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: C.g700, cursor: "pointer" }}>
          + New
        </div>
        <span style={{ fontSize: 14, color: C.g400, cursor: "pointer" }}>❓</span>
        <span style={{ fontSize: 14, color: C.g400, cursor: "pointer" }}>💬</span>
        <span style={{ fontSize: 14, color: C.g400, cursor: "pointer" }}>⏰</span>
        <Avatar initials="BM" bg={C.indigo} size={26} />
        <span style={{ fontSize: 11, color: C.g400, cursor: "pointer" }} onClick={onNotif}>▾</span>
      </div>
    </header>
  );
}

// ─── TOP REPS PANEL (shared by Dash Board + Team Insight) ─
function TopRepsPanel({ repTab, setRepTab }) {
  const rows = TOP_REPS[repTab] || TOP_REPS.all;
  return (
    <div style={{ background: C.white, borderRadius: 11, border: `1px solid ${C.g200}`, padding: 14, display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
      <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>Top reps (QA)</p>
      <p style={{ margin: "0 0 10px", fontSize: 10, color: C.g400 }}>Consistency across lead calls</p>

      {/* Tabs */}
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 10 }}>
        {[["all","All Calls"],["successful","Successful Calls"],["unsuccessful","Unsuccessful Calls"]].map(([id, label]) => (
          <button key={id} onClick={() => setRepTab(id)} style={{
            padding: "4px 10px", borderRadius: 20, fontSize: 10, cursor: "pointer",
            fontFamily: "inherit", fontWeight: repTab === id ? 600 : 400,
            border: repTab === id ? "none" : `1px solid ${C.g200}`,
            background: repTab === id ? C.green : C.white,
            color: repTab === id ? C.white : C.g500,
          }}>{label}</button>
        ))}
        <select style={{ marginLeft: "auto", fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 6px", color: C.g500, background: C.white, fontFamily: "inherit" }}>
          <option>Today</option><option>This Week</option>
        </select>
      </div>

      {/* Table header */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 1.2fr 80px", gap: 6, padding: "4px 0", borderBottom: `1px solid ${C.g200}`, marginBottom: 6 }}>
        {["File name","Agent name","Call_datetime","Status"].map(h => (
          <span key={h} style={{ fontSize: 10, color: C.g400, fontWeight: 600 }}>{h}</span>
        ))}
      </div>

      {/* Rows */}
      <div style={{ overflowY: "auto", flex: 1, scrollbarWidth: "thin" }}>
        {rows.map((r, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "1.2fr 1fr 1.2fr 80px",
            gap: 6, alignItems: "center", padding: "6px 0",
            borderBottom: i < rows.length - 1 ? `1px solid ${C.g100}` : "none",
          }}>
            <span style={{ fontSize: 11, color: C.blue, fontWeight: 500 }}>{r.file}</span>
            <span style={{ fontSize: 11, color: C.g700 }}>{r.agent}</span>
            <span style={{ fontSize: 11, color: C.g700 }}>{r.dt}</span>
            <StatusPill status={r.status} />
          </div>
        ))}
      </div>

      {/* View all */}
      <button style={{
        marginTop: 10, width: "100%", padding: "9px 0",
        background: C.green, color: C.white, border: "none", borderRadius: 8,
        fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
      }}>View all call for today →</button>
    </div>
  );
}

// ─── SCREEN 1: DASH BOARD ────────────────────────────────
function DashBoardScreen() {
  const [activeSrc, setActiveSrc] = useState("Ads");
  const [repTab, setRepTab]       = useState("all");

  const bars = CHART_DATA[activeSrc];

  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 16px 0", flex: 1, overflow: "hidden" }}>

      {/* LEFT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: C.g900, margin: "0 0 4px" }}>Good morning, Manager 024</h1>
          <p style={{ fontSize: 11, color: C.g500, margin: 0, lineHeight: 1.6 }}>
            <strong style={{ color: C.g900 }}>Call Coach 360°</strong> wishes you a good and productive day,{" "}
            <span style={{ color: C.green, fontWeight: 600 }}>120 calls</span> waiting for review. You have an approx{" "}
            <span style={{ color: C.red, fontWeight: 600 }}>38% increment</span> in overall performance from last week (W24).
          </p>
        </div>

        {/* Marketing ROI card */}
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
            <BarChart bars={bars} />
          </div>

          {/* Source table */}
          <div style={{ marginTop: 8, flexShrink: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 50px 70px 55px 55px", gap: 6, padding: "4px 0", borderBottom: `1px solid ${C.g200}`, marginBottom: 4 }}>
              {["Source","Calls","Qualified","Booked","Cost/Q"].map(h => (
                <span key={h} style={{ fontSize: 10, color: C.g500, fontWeight: 600 }}>{h}</span>
              ))}
            </div>
            {SOURCE_TABLE.slice(0,2).map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 50px 70px 55px 55px", gap: 6, padding: "5px 0", borderBottom: i < 1 ? `1px solid ${C.g100}` : "none", alignItems: "center" }}>
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
      <div style={{ width: 310, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", paddingBottom: 14, scrollbarWidth: "thin" }}>

        {/* QA Trends mini */}
        <div style={{ background: C.white, borderRadius: 11, border: `1px solid ${C.g200}`, padding: 14, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>QA Trends</p>
              <p style={{ margin: 0, fontSize: 10, color: C.g400 }}>What's breaking conversions this week</p>
            </div>
            <div style={{ display: "flex", gap: 5 }}>
              <select style={{ fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 5px", color: C.g500, background: C.white, fontFamily: "inherit" }}>
                <option>Agent 274</option>
              </select>
              <select style={{ fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 5px", color: C.g500, background: C.white, fontFamily: "inherit" }}>
                <option>Last week</option>
              </select>
            </div>
          </div>
          <LineChart data={QA_TREND_DAYS} width={282} height={100} />
        </div>

        {/* Top reps */}
        <div style={{ background: C.white, borderRadius: 11, border: `1px solid ${C.g200}`, padding: 14, flexShrink: 0 }}>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>Top reps (QA)</p>
          <p style={{ margin: "0 0 8px", fontSize: 10, color: C.g400 }}>Consistency across lead calls</p>

          {/* Donut + badges */}
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: C.g900 }}>12 calls need review</p>
              <div style={{ display: "flex", gap: 5 }}>
                <span style={{ background: C.amberLight, color: C.amberText, fontSize: 9, borderRadius: 4, padding: "2px 7px", fontWeight: 600 }}>4 unclear</span>
                <span style={{ background: C.redLight, color: C.redText, fontSize: 9, borderRadius: 4, padding: "2px 7px", fontWeight: 600 }}>2 critical fails</span>
              </div>
            </div>
            <div style={{ textAlign: "center" }}>
              <DonutChart pct={72} size={56} />
              <p style={{ margin: "2px 0 0", fontSize: 9, color: C.g400, textAlign: "center" }}>72% pass</p>
              <p style={{ margin: 0, fontSize: 9, color: C.g400 }}>included a clear next step.</p>
            </div>
          </div>

          {/* Tab buttons */}
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>
            {[["all","All Calls"],["successful","Successful Calls"],["unsuccessful","Unsuccessful Calls"]].map(([id,label]) => (
              <button key={id} onClick={() => setRepTab(id)} style={{
                padding: "3px 8px", borderRadius: 20, fontSize: 9, cursor: "pointer",
                fontFamily: "inherit", fontWeight: repTab === id ? 600 : 400,
                border: repTab === id ? "none" : `1px solid ${C.g200}`,
                background: repTab === id ? C.green : C.white,
                color: repTab === id ? C.white : C.g500,
              }}>{label}</button>
            ))}
            <select style={{ marginLeft: "auto", fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 5px", color: C.g500, background: C.white, fontFamily: "inherit" }}>
              <option>Today</option>
            </select>
          </div>

          {/* Table hdr */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 0.8fr 1fr 70px", gap: 4, padding: "2px 0", borderBottom: `1px solid ${C.g200}`, marginBottom: 5 }}>
            {["File name","Agent name","Call_datetime","Status"].map(h => (
              <span key={h} style={{ fontSize: 9, color: C.g400, fontWeight: 600 }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {(TOP_REPS[repTab] || TOP_REPS.all).slice(0,3).map((r, i, arr) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 0.8fr 1fr 70px",
              gap: 4, alignItems: "center", padding: "5px 0",
              borderBottom: i < arr.length - 1 ? `1px solid ${C.g100}` : "none",
            }}>
              <span style={{ fontSize: 10, color: C.blue, fontWeight: 500 }}>{r.file}</span>
              <span style={{ fontSize: 10, color: C.g700 }}>{r.agent}</span>
              <span style={{ fontSize: 10, color: C.g700 }}>{r.dt.split(" ")[1]}</span>
              <StatusPill status={r.status} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN 2: TEAM INSIGHT ──────────────────────────────
function TeamInsightScreen() {
  const [insightTab, setInsightTab] = useState("QA Trends");
  const [repTab, setRepTab]         = useState("all");

  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 16px 0", flex: 1, overflow: "hidden" }}>

      {/* LEFT */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0, gap: 10 }}>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, flexShrink: 0 }}>
          {/* Overall team score */}
          <div style={{ background: C.green, borderRadius: 10, padding: 12 }}>
            <p style={{ margin: "0 0 2px", fontSize: 10, color: "rgba(255,255,255,.8)" }}>Overall Team score</p>
            <p style={{ margin: "0 0 6px", fontSize: 11, color: "rgba(255,255,255,.85)" }}>Inbound Lead - Book Appointment</p>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: C.white }}>78 / 100</span>
              <span style={{ background: "rgba(255,255,255,.25)", color: C.white, borderRadius: 6, padding: "2px 9px", fontSize: 11, fontWeight: 600 }}>PASS</span>
            </div>
          </div>

          {/* Pass rate */}
          <div style={{ background: C.white, border: `1px solid ${C.g200}`, borderRadius: 10, padding: 12 }}>
            <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: C.g900 }}>Pass rate</p>
            <p style={{ margin: "0 0 8px", fontSize: 10, color: C.g400 }}>Score ≥ threshold</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: C.g900 }}>63%</span>
              <span style={{ background: C.greenLight, color: "#15803D", fontSize: 10, borderRadius: 5, padding: "2px 7px", fontWeight: 600 }}>↑ UP 5%</span>
            </div>
          </div>

          {/* Critical fails */}
          <div style={{ background: C.white, border: `1px solid ${C.g200}`, borderRadius: 10, padding: 12 }}>
            <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: C.g900 }}>Critical fails</p>
            <p style={{ margin: "0 0 8px", fontSize: 10, color: C.g400 }}>Auto-fail items</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 22, fontWeight: 700, color: C.g900 }}>14</span>
              <span style={{ background: C.redLight, color: C.redText, fontSize: 10, borderRadius: 5, padding: "2px 7px", fontWeight: 600 }}>Compliance</span>
            </div>
          </div>

          {/* Rep variance */}
          <div style={{ background: C.white, border: `1px solid ${C.g200}`, borderRadius: 10, padding: 12 }}>
            <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: C.g900 }}>Rep variance</p>
            <p style={{ margin: "0 0 8px", fontSize: 10, color: C.g400 }}>Consistency across reps</p>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 20, fontWeight: 700, color: C.g900 }}>Low</span>
              <span style={{ background: C.amberLight, color: C.amberText, fontSize: 10, borderRadius: 5, padding: "2px 7px", fontWeight: 600 }}>Improvised</span>
            </div>
          </div>
        </div>

        {/* Sub tabs */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
          {["Marketing ROI","QA Trends","Voice of Customer (Beta)"].map(tab => (
            <button key={tab} onClick={() => setInsightTab(tab)} style={{
              padding: "5px 13px", borderRadius: 20, fontSize: 11, cursor: "pointer",
              fontFamily: "inherit", fontWeight: insightTab === tab ? 600 : 400,
              border: insightTab === tab ? "none" : `1px solid ${C.g200}`,
              background: insightTab === tab ? C.green : C.white,
              color: insightTab === tab ? C.white : C.g700,
            }}>{tab}</button>
          ))}
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.white, border: `1px solid ${C.g200}`, borderRadius: 11, padding: 14 }}>
          {insightTab === "QA Trends" && (
            <>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, flexShrink: 0 }}>
                <div>
                  <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>QA Trends</p>
                  <p style={{ margin: 0, fontSize: 10, color: C.g400 }}>What's breaking conversions this week</p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <select style={{ fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 6px", color: C.g500, background: C.white, fontFamily: "inherit" }}><option>Agent 276</option></select>
                  <select style={{ fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 6px", color: C.g500, background: C.white, fontFamily: "inherit" }}><option>Last week</option></select>
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0 }}>
                <LineChart data={QA_TREND_DAYS} width={500} height={160} />
              </div>
            </>
          )}
          {insightTab === "Marketing ROI" && (
            <>
              <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 700, color: C.g900, flexShrink: 0 }}>Marketing ROI</p>
              <div style={{ flex: 1, minHeight: 0 }}>
                <BarChart bars={CHART_DATA.Ads} />
              </div>
            </>
          )}
          {insightTab === "Voice of Customer (Beta)" && (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
              <span style={{ fontSize: 32 }}>🎙️</span>
              <p style={{ fontSize: 13, fontWeight: 600, color: C.g700 }}>Voice of Customer</p>
              <p style={{ fontSize: 11, color: C.g400 }}>Beta feature — data analysis coming soon.</p>
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
            <div style={{ display: "flex", gap: 6 }}>
              <select style={{ fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 6px", color: C.g500, background: C.white, fontFamily: "inherit" }}><option>Agent 276</option></select>
              <select style={{ fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 6px", color: C.g500, background: C.white, fontFamily: "inherit" }}><option>Last week</option></select>
            </div>
          </div>
          {MISSED_CRITERIA.map((m, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: i < MISSED_CRITERIA.length - 1 ? 8 : 0 }}>
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
      <div style={{ width: 310, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopRepsPanel repTab={repTab} setRepTab={setRepTab} />
      </div>
    </div>
  );
}

// ─── SCREEN 3: QA QUEUE (file list view) ─────────────────
function QAQueueScreen({ onSelectFile }) {
  const [qTab, setQTab] = useState("Qualification");
  const [repTab, setRepTab] = useState("all");

  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 16px 0", flex: 1, overflow: "hidden" }}>

      {/* LEFT: file list */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: C.g900 }}>QA Queue</p>
        <p style={{ margin: "0 0 10px", fontSize: 10, color: C.g400 }}>Inbound Lead - Book Appointment (v3)</p>

        {/* Score tabs */}
        <div style={{ display: "flex", gap: 5, marginBottom: 10, flexShrink: 0 }}>
          {["Opening","Qualification","Close","Compliance"].map(tab => (
            <button key={tab} onClick={() => setQTab(tab)} style={{
              padding: "4px 11px", borderRadius: 20, fontSize: 11, cursor: "pointer",
              fontFamily: "inherit", fontWeight: qTab === tab ? 600 : 400,
              border: qTab === tab ? "none" : `1px solid ${C.g200}`,
              background: qTab === tab ? C.green : C.white,
              color: qTab === tab ? C.white : C.g500,
            }}>{tab}</button>
          ))}
          <select style={{ marginLeft: "auto", fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 6px", color: C.g500, background: C.white, fontFamily: "inherit" }}>
            <option>Today</option>
          </select>
        </div>

        {/* Table header */}
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.9fr 1.2fr 0.9fr 80px", gap: 8, padding: "4px 0", borderBottom: `1px solid ${C.g200}`, marginBottom: 4, flexShrink: 0 }}>
          {["File name","Agent name","Call_datetime","Source","Status"].map(h => (
            <span key={h} style={{ fontSize: 10, color: C.g400, fontWeight: 600 }}>{h}</span>
          ))}
        </div>

        {/* File rows */}
        <div style={{ overflowY: "auto", flex: 1, scrollbarWidth: "thin" }}>
          {QA_FILE_ROWS.map((r, i) => (
            <div key={i} onClick={() => onSelectFile(r)} style={{
              display: "grid", gridTemplateColumns: "1.2fr 0.9fr 1.2fr 0.9fr 80px",
              gap: 8, alignItems: "center", padding: "7px 0",
              borderBottom: i < QA_FILE_ROWS.length - 1 ? `1px solid ${C.g100}` : "none",
              cursor: "pointer", borderRadius: 6,
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

      {/* RIGHT: scorecard list */}
      <div style={{ width: 310, flexShrink: 0, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>Top reps (QA)</p>
        <p style={{ margin: "0 0 10px", fontSize: 10, color: C.g400 }}>Consistency across lead calls</p>

        {/* rep tabs */}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8, flexShrink: 0 }}>
          {[["all","All Calls"],["successful","Successful Calls"],["unsuccessful","Unsuccessful Calls"]].map(([id,label]) => (
            <button key={id} onClick={() => setRepTab(id)} style={{
              padding: "3px 9px", borderRadius: 20, fontSize: 10, cursor: "pointer",
              fontFamily: "inherit", fontWeight: repTab === id ? 600 : 400,
              border: repTab === id ? "none" : `1px solid ${C.g200}`,
              background: repTab === id ? C.green : C.white,
              color: repTab === id ? C.white : C.g500,
            }}>{label}</button>
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
  );
}

// ─── SCREEN 4: QA QUEUE DETAIL (after clicking a file) ───
function QADetailScreen({ file, onExport }) {
  return (
    <div style={{ display: "flex", gap: 14, padding: "14px 16px 0", flex: 1, overflow: "hidden" }}>

      {/* LEFT: call log list */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: C.g900 }}>QA Queue</p>
        <p style={{ margin: "0 0 8px", fontSize: 10, color: C.g400 }}>Inbound Lead - Book Appointment (v3)</p>

        {/* Selected file bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10, background: C.g50,
          border: `1px solid ${C.g200}`, borderRadius: 8, padding: "7px 12px", marginBottom: 10, flexShrink: 0,
        }}>
          <span style={{ fontSize: 11, color: C.blue, fontWeight: 600 }}>{file?.file || "call_001.mp3"}</span>
          <span style={{ fontSize: 11, color: C.g500 }}>{file?.agent || "Sarah K."}</span>
          <span style={{ fontSize: 11, color: C.g500 }}>{file?.dt || "2026-01-18 09:12"}</span>
          <span style={{ fontSize: 11, color: C.g500 }}>{file?.source || "Google Ads"}</span>
          <StatusPill status={file?.status || "OK"} />
        </div>

        {/* Scorecard tabs */}
        <div style={{ display: "flex", gap: 5, marginBottom: 8, flexShrink: 0 }}>
          {["Opening","Qualification","Close","Compliance"].map((tab, i) => (
            <button key={tab} style={{
              padding: "4px 11px", borderRadius: 20, fontSize: 11, cursor: "pointer",
              fontFamily: "inherit", fontWeight: i === 1 ? 600 : 400,
              border: i === 1 ? "none" : `1px solid ${C.g200}`,
              background: i === 1 ? C.green : C.white,
              color: i === 1 ? C.white : C.g500,
            }}>{tab}</button>
          ))}
          <select style={{ marginLeft: "auto", fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 6px", color: C.g500, background: C.white, fontFamily: "inherit" }}>
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

      {/* RIGHT: QA Detail */}
      <div style={{ width: 360, flexShrink: 0, background: C.white, borderRadius: 11, border: `1px solid ${C.g200}`, padding: 14, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>QA Queue Detail</p>
        <p style={{ margin: "0 0 10px", fontSize: 10, color: C.g400 }}>Inbound Lead - Book Appointment (v3)</p>

        {/* Agent header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, paddingBottom: 8, borderBottom: `1px solid ${C.g200}` }}>
          <Avatar initials="RK" bg={C.blue} size={30} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.g900 }}>Ramesh Kumar</p>
            <p style={{ margin: 0, fontSize: 9, color: C.g400 }}>+91 99734 79088</p>
          </div>
          <PassTag status="PASS" />
          <span style={{ fontSize: 10, color: C.g700, fontWeight: 500, marginLeft: 6 }}>Pass 74%</span>
        </div>

        {/* Transcript label + language */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 10, color: C.g400 }}>
          <span>[Call Transcript]</span>
          <span>Language: <span style={{ background: C.blue, color: C.white, borderRadius: 4, padding: "1px 6px", fontSize: 9, fontWeight: 600 }}>Eng</span></span>
        </div>

        {/* Transcript */}
        <div style={{ overflowY: "auto", flex: 1, scrollbarWidth: "thin", paddingRight: 4 }}>
          {TRANSCRIPT_LINES.map((line, i) => (
            <p key={i} style={{ margin: "0 0 7px", fontSize: 11, lineHeight: 1.6, color: C.g700 }}>
              <strong style={{ color: C.g900 }}>{line.who}:</strong> {line.text}
            </p>
          ))}

          {/* Audio bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.g50, borderRadius: 8, padding: "7px 10px", margin: "8px 0" }}>
            <span style={{ fontSize: 16, cursor: "pointer" }}>▶</span>
            <div style={{ flex: 1, height: 4, background: C.g200, borderRadius: 2, position: "relative" }}>
              <div style={{ height: "100%", width: "30%", background: C.blue, borderRadius: 2 }} />
              <div style={{ width: 10, height: 10, background: C.blue, borderRadius: "50%", position: "absolute", top: -3, left: "28%" }} />
            </div>
            <span style={{ fontSize: 10, color: C.g500 }}>0:00</span>
            <span style={{ fontSize: 10, color: C.blue }}>00:50</span>
            <span style={{ background: C.blue, color: C.white, fontSize: 9, borderRadius: 5, padding: "2px 7px", fontWeight: 600, cursor: "pointer" }}>Evidence</span>
          </div>

          {/* Review section */}
          <div style={{ marginTop: 8, paddingTop: 8, borderTop: `1px solid ${C.g200}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <DonutChart pct={74} size={44} />
              <div>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.g900 }}>74% calls pass</p>
                <p style={{ margin: 0, fontSize: 9, color: C.g400 }}>included a clear next step.</p>
              </div>
              <div style={{ marginLeft: "auto", textAlign: "right" }}>
                <p style={{ margin: "0 0 2px", fontSize: 10, fontWeight: 600, color: C.g900 }}>This call needs review</p>
                <div style={{ display: "flex", gap: 4, justifyContent: "flex-end" }}>
                  <span style={{ background: C.amberLight, color: C.amberText, fontSize: 9, borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>4 unclear</span>
                  <span style={{ background: C.redLight, color: C.redText, fontSize: 9, borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>2 critical fails</span>
                </div>
              </div>
            </div>

            {REVIEW_ROWS.map((r, i) => {
              const badgeStyle =
                r.badge === "clear"          ? { bg: C.greenLight,  color: "#15803D"   } :
                r.badge === "unclear"        ? { bg: C.amberLight,  color: C.amberText } :
                                               { bg: C.redLight,    color: C.redText   };
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 5, alignItems: "center", marginBottom: 5, fontSize: 10 }}>
                  <span style={{ color: C.g700, fontStyle: "italic" }}>{r.quote}</span>
                  <ConfTag conf={r.conf || "High"} />
                  <span style={{ background: badgeStyle.bg, color: badgeStyle.color, fontSize: 9, borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>{r.badge}</span>
                  <span style={{ fontSize: 9, color: C.blue, cursor: "pointer", textDecoration: "underline" }}>{r.ev}</span>
                </div>
              );
            })}

            {/* Export button */}
            <button onClick={onExport} style={{
              marginTop: 10, width: "100%", padding: "8px 0",
              background: C.white, color: C.g700, border: `1px solid ${C.g200}`,
              borderRadius: 8, fontSize: 11, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            }}>📤 Export evidence pack</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN 5: EXPORT MODAL ──────────────────────────────
function ExportModal({ onClose }) {
  const [includes, setIncludes] = useState({
    transcript: true, timestamps: true, audioLink: false, scoresEvidence: true,
  });
  const [expiry, setExpiry] = useState("7 days");

  const toggleInclude = (key) => setIncludes(p => ({ ...p, [key]: !p[key] }));

  const includeBtns = [
    { key: "transcript",     label: "Transcript excerpts" },
    { key: "timestamps",     label: "Timestamps"          },
    { key: "audioLink",      label: "Audio link"          },
    { key: "scoresEvidence", label: "Scores + evidence"   },
  ];

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,.4)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: C.white, borderRadius: 14, padding: 24,
        width: 420, boxShadow: "0 12px 40px rgba(0,0,0,.2)",
      }}>
        <p style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: C.g900 }}>Export evidence pack</p>
        <p style={{ margin: "0 0 16px", fontSize: 11, color: C.g400 }}>Share with agency/owner. Link can expire.</p>

        {/* Include */}
        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: C.g900 }}>Include</p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 16 }}>
          {includeBtns.map(btn => {
            const on = includes[btn.key];
            return (
              <button key={btn.key} onClick={() => toggleInclude(btn.key)} style={{
                padding: "5px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer",
                fontFamily: "inherit", fontWeight: on ? 600 : 400,
                border: `1.5px solid ${on ? C.blue : C.g200}`,
                background: on ? "#EFF6FF" : C.white,
                color: on ? C.blue : C.g500,
              }}>{btn.label}</button>
            );
          })}
        </div>

        {/* Exports row */}
        <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: C.g900 }}>Exports</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {["Generate PDF","Copy share link","Download audio"].map(label => (
              <button key={label} style={{
                padding: "6px 11px", borderRadius: 8, fontSize: 10, cursor: "pointer",
                fontFamily: "inherit", border: `1px solid ${C.g200}`,
                background: C.white, color: C.g700, fontWeight: 500,
              }}>{label}</button>
            ))}
          </div>

          {/* Shareable link expiry */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <p style={{ margin: 0, fontSize: 10, color: C.g400, whiteSpace: "nowrap" }}>Shareable link expiry</p>
          </div>
        </div>

        {/* Expiry + actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "flex-end" }}>
          <div style={{ display: "flex", gap: 5 }}>
            {["7 days","Custom..."].map(v => (
              <button key={v} onClick={() => setExpiry(v)} style={{
                padding: "5px 11px", borderRadius: 7, fontSize: 10, cursor: "pointer",
                fontFamily: "inherit",
                border: `1px solid ${expiry === v ? C.g700 : C.g200}`,
                background: expiry === v ? C.g100 : C.white,
                color: C.g700, fontWeight: expiry === v ? 600 : 400,
              }}>{v}</button>
            ))}
          </div>
          <button onClick={onClose} style={{
            padding: "6px 14px", borderRadius: 8, fontSize: 11, cursor: "pointer",
            fontFamily: "inherit", border: `1px solid ${C.g200}`,
            background: C.white, color: C.g700,
          }}>Cancel</button>
          <button style={{
            padding: "6px 16px", borderRadius: 8, fontSize: 11, cursor: "pointer",
            fontFamily: "inherit", border: "none",
            background: C.blue, color: C.white, fontWeight: 600,
            display: "flex", alignItems: "center", gap: 5,
          }}>Create Pack →</button>
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
function PlaceholderScreen({ title, icon }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: C.g400 }}>
      <span style={{ fontSize: 48 }}>{icon}</span>
      <p style={{ fontSize: 18, fontWeight: 600, color: C.g700 }}>{title}</p>
      <p style={{ fontSize: 13 }}>This section is coming soon.</p>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────
export default function ManagerDashboard() {
  const [screen, setScreen]         = useState("dashboard");
  const [showNotif, setShowNotif]   = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const activeNav =
    screen === "qadetail" ? "qaqueue" : screen;

  const handleNav = (id) => {
    if (id === "qaqueue") { setScreen("qaqueue"); return; }
    setScreen(id);
  };

  const handleSelectFile = (file) => {
    setSelectedFile(file);
    setScreen("qadetail");
  };

  return (
    <div style={{
      display: "flex", width: "100vw", height: "100vh",
      fontFamily: "'Inter', sans-serif", background: C.g100,
      overflow: "hidden", fontSize: 13, color: C.g900, position: "relative",
    }}>
      <Sidebar activeScreen={activeNav} onNav={handleNav} onNotif={() => setShowNotif(true)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header onNotif={() => setShowNotif(true)} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {screen === "dashboard"  && <DashBoardScreen />}
          {screen === "teaminsight"&& <TeamInsightScreen />}
          {screen === "qaqueue"    && <QAQueueScreen onSelectFile={handleSelectFile} />}
          {screen === "qadetail"   && <QADetailScreen file={selectedFile} onExport={() => setShowExport(true)} />}
          {screen === "messages"   && <PlaceholderScreen title="Messages"  icon="💬" />}
          {screen === "calendar"   && <PlaceholderScreen title="Calendar"  icon="📅" />}
          {screen === "settings"   && <PlaceholderScreen title="Settings"  icon="⚙️" />}
        </div>
      </div>

      {showNotif  && <NotificationModal onClose={() => setShowNotif(false)} />}
      {showExport && <ExportModal       onClose={() => setShowExport(false)} />}
    </div>
  );
}