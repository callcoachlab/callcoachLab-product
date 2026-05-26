import { useState } from "react";

const C = {
  green: "#22C55E", greenLight: "#DCFCE7", pink: "#EC4899",
  indigo: "#6366F1", blue: "#3B82F6", amber: "#F59E0B",
  amberLight: "#FEF3C7", amberText: "#D97706",
  red: "#EF4444", redLight: "#FEE2E2", redText: "#DC2626",
  violet: "#7C3AED", violetLight: "#EDE9FE",
  g50: "#F9FAFB", g100: "#F3F4F6", g200: "#E5E7EB", g300: "#D1D5DB",
  g400: "#9CA3AF", g500: "#6B7280", g700: "#374151", g800: "#1F2937",
  g900: "#111827", white: "#FFFFFF",
};

// ─── DATA ───────────────────────────────────────────────
const CALLS = [
  { time: "09:30", initials: "RK", bg: C.blue,  name: "Ramesh Kumar", phone: "+91 99734 79088",  callType: "Skin Pigmentation", location: "Chandigarh", booked: false },
  { time: "10:00", initials: "SG", bg: C.pink,  name: "Shriya Goyal",  phone: "+91 95678 786645", callType: "Skin Pigmentation", location: "Delhi",      booked: false },
  { time: "10:25", initials: "BS", bg: C.amber, name: "Bhavna Singh",  phone: "+91 95678 786645", callType: "Dark Spots",        location: "Delhi",      booked: true  },
  { time: "10:25", initials: "RK", bg: C.blue,  name: "Ramesh Kumar", phone: "+91 99734 79088",  callType: "Skin Pigmentation", location: "Chandigarh", booked: false },
  { time: "10:25", initials: "SG", bg: C.pink,  name: "Shriya Goyal",  phone: "+91 95678 786645", callType: "Skin Pigmentation", location: "Delhi",      booked: false },
  { time: "10:25", initials: "BS", bg: C.amber, name: "Bhavna Singh",  phone: "+91 95678 786645", callType: "Dark Spots",        location: "Delhi",      booked: false },
  { time: "10:25", initials: "RK", bg: C.blue,  name: "Ramesh Kumar", phone: "+91 99734 79088",  callType: "Skin Pigmentation", location: "Chandigarh", booked: false },
];

const CLIENTS = {
  successful: [
    { initials: "RK", bg: C.blue, name: "Ramesh Kumar", phone: "+91 99734 79088",  score: "82 avg", pass: "Pass 74%" },
    { initials: "SG", bg: C.pink, name: "Shriya Goyal",  phone: "+91 95678 786645", score: "75 avg", pass: "Pass 62%" },
  ],
  unsuccessful: [
    { initials: "BS", bg: C.amber, name: "Bhavna Singh", phone: "+91 95678 786645", score: "41 avg", pass: "Fail 38%" },
  ],
};

const CAL_WEEKS = [
  { days: [null, null, null, null, null, "01", "02"], wk: "W23" },
  { days: ["06", "07", "08", "09", "10", "11", "12"], wk: "W24" },
  { days: ["13", "14", "15", "16", "17", "18", "19"], wk: "W24", cur: true },
  { days: ["20", "21", "22", "23", "24", "25", "26"], wk: "W25" },
  { days: ["27", "28", "29", "30", "31", null, null], wk: "W25" },
];

const QA_CALLS = [
  { initials: "RK", bg: C.blue,  name: "Ramesh Kumar", phone: "+91 99734 79088",  date: "2026-01-18 09:12", status: "PASS", quote: "Greeted and introduced clinic",    conf: "High", ev: "00:05", selected: false },
  { initials: "SG", bg: C.pink,  name: "Shriya Goyal",  phone: "+91 95678 786645", date: "2026-01-18 09:12", status: "FAIL", quote: "Asked needs/pain before pricing", conf: "Med",  ev: "00:50", selected: false },
  { initials: "BS", bg: C.amber, name: "Bhavna Singh",  phone: "+91 95678 786645", date: "2026-01-18 09:12", status: "PASS", quote: "Asked timeline/urgency",           conf: "High", ev: "00:50", selected: true  },
  { initials: "RK", bg: C.blue,  name: "Ramesh Kumar", phone: "+91 99734 79088",  date: "2026-01-18 09:12", status: "FAIL", quote: "Greeted and introduced clinic",    conf: "High", ev: "00:05", selected: false },
];

const SC_ROWS = [
  { initials: "RK", bg: C.blue,  name: "Ramesh Kumar", phone: "+91 99734 79088",  status: "PASS", pass: "Pass 74%", detail: "Greeted and introduced clinic",    conf: "High", ev: "00:05" },
  { initials: "SG", bg: C.pink,  name: "Shriya Goyal",  phone: "+91 95678 786645", status: "FAIL", pass: "Pass 32%", detail: "Asked needs/pain before pri...",   conf: "Med",  ev: "00:50" },
  { initials: "BS", bg: C.amber, name: "Bhavna Singh",  phone: "+91 95678 786645", status: "FAIL", pass: "Pass 32%", detail: "Asked timeline/urgency",           conf: "High", ev: "00:50" },
  { initials: "RK", bg: C.blue,  name: "Ramesh Kumar", phone: "+91 99734 79088",  status: "PASS", pass: "Pass 74%", detail: "Greeted and introduced clinic",    conf: "High", ev: "00:05" },
];

const REVIEW_ROWS = [
  { quote: '"Greeted and introduced clinic"',    conf: "High", badge: "unclear",       ev: "Evidence: 00:05" },
  { quote: '"Asked needs/pain before pricing"',  conf: "Med",  badge: "critical fails", ev: "Evidence: 00:50" },
  { quote: '"Asked timeline/urgency"',           conf: "High", badge: "clear",          ev: "Evidence: 00:57" },
];

const NOTIF_DATA = [
  { initials: "RK", bg: C.blue,  name: "Ramesh Kumar", phone: "+91 99734 79088",  concern: "Skin Pigmentation", location: "Chandigarh", booked: false },
  { initials: "SG", bg: C.pink,  name: "Shriya Goyal",  phone: "+91 95678 786645", concern: "Skin Pigmentation", location: "Delhi",      booked: false },
  { initials: "BS", bg: C.amber, name: "Bhavna Singh",  phone: "+91 95678 786645", concern: "Dark Spots",        location: "Delhi",      booked: true  },
  { initials: "RK", bg: C.blue,  name: "Ramesh Kumar", phone: "+91 99734 79088",  concern: "Skin Pigmentation", location: "Chandigarh", booked: false },
  { initials: "SG", bg: C.pink,  name: "Shriya Goyal",  phone: "+91 95678 786645", concern: "Skin Pigmentation", location: "Delhi",      booked: false },
  { initials: "BS", bg: C.amber, name: "Bhavna Singh",  phone: "+91 95678 786645", concern: "Dark Spots",        location: "Delhi",      booked: false },
  { initials: "RK", bg: C.blue,  name: "Ramesh Kumar", phone: "+91 99734 79088",  concern: "Skin Pigmentation", location: "Chandigarh", booked: false },
  { initials: "BS", bg: C.amber, name: "Bhavna Singh",  phone: "+91 95678 786645", concern: "Dark Spots",        location: "Delhi",      booked: false },
];

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

// ─── SMALL HELPERS ──────────────────────────────────────
function Avatar({ initials, bg, size = 28 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: Math.round(size * 0.37), fontWeight: 600, color: "#fff",
      flexShrink: 0, letterSpacing: "-0.3px",
    }}>
      {initials}
    </div>
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
  return <div style={{ width: 1, height: 28, background: C.g200, flexShrink: 0 }} />;
}

// ─── SCREEN: DASHBOARD ──────────────────────────────────
function DashboardScreen() {
  const [activeSource, setActiveSource] = useState("Ads");
  const [activeTab, setActiveTab] = useState("successful");

  const bars = CHART_DATA[activeSource];
  const maxVal = 80;
  const weeks = ["W1","W2","W3","W4","W5","W6","W7"];
  const peakIdx = bars.indexOf(Math.max(...bars));

  // Mini timeline calls — only first 3
  const miniCalls = CALLS.slice(0, 3);

  return (
    <div style={{ display: "flex", gap: 16, padding: "16px 16px 0", flex: 1, overflow: "hidden" }}>

      {/* ── LEFT: chart + table ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.g900, margin: "0 0 4px" }}>Good morning, Employee 234</h1>
        <p style={{ fontSize: 12, color: C.g500, margin: "0 0 14px", lineHeight: 1.6 }}>
          <strong style={{ color: C.g900 }}>Call Coach 360°</strong> wishes you a good and productive day,{" "}
          <span style={{ color: C.green, fontWeight: 600 }}>120 calls</span> waiting for you today. You also have{" "}
          <span style={{ color: C.green, fontWeight: 600 }}>24 booked calls</span> in your calendar today.
        </p>

        {/* Chart card */}
        <div style={{ background: C.white, border: `1px solid ${C.g200}`, borderRadius: 12, padding: "16px 16px 12px", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: C.g900 }}>Marketing ROI (Quality by source)</p>
          <p style={{ margin: "0 0 12px", fontSize: 11, color: C.g400 }}>Qualified &amp; booked performance across lead sources</p>

          {/* Source tabs + period */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {Object.keys(CHART_DATA).map(src => (
                <button key={src} onClick={() => setActiveSource(src)} style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 11, cursor: "pointer",
                  border: `1px solid ${activeSource === src ? C.green : C.g200}`,
                  background: activeSource === src ? C.green : C.white,
                  color: activeSource === src ? "#fff" : C.g700,
                  fontFamily: "inherit", fontWeight: activeSource === src ? 600 : 400,
                }}>{src}</button>
              ))}
            </div>
            <select style={{ fontSize: 11, border: `1px solid ${C.g200}`, borderRadius: 6, padding: "4px 8px", color: C.g500, background: C.white, fontFamily: "inherit", cursor: "pointer" }}>
              <option>2 months</option><option>1 month</option><option>3 months</option>
            </select>
          </div>

          {/* Bar chart */}
          <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
            {/* Y-axis labels */}
            <div style={{ position: "absolute", left: 0, top: 0, bottom: 24, width: 28, display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "flex-end", paddingRight: 4 }}>
              {[100,80,60,40,20,0].map(v => (
                <span key={v} style={{ fontSize: 9, color: C.g400 }}>{v}</span>
              ))}
            </div>

            {/* Chart area */}
            <div style={{ position: "absolute", left: 32, right: 0, top: 0, bottom: 24, display: "flex", flexDirection: "column" }}>
              {/* Grid lines */}
              {[0,1,2,3,4,5].map(i => (
                <div key={i} style={{ flex: 1, borderBottom: `1px dashed ${C.g200}`, display: "flex", alignItems: "flex-end" }} />
              ))}

              {/* Bars overlay */}
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", gap: 3, padding: "0 4px" }}>
                {bars.map((val, i) => {
                  const isPeak = i === peakIdx;
                  const h = `${(val / maxVal) * 100}%`;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", position: "relative" }}>
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

            {/* X-axis week labels */}
            <div style={{ position: "absolute", left: 32, right: 0, bottom: 0, height: 20, display: "flex", justifyContent: "space-around", alignItems: "center" }}>
              {weeks.map(w => (
                <span key={w} style={{ fontSize: 9, color: C.g400 }}>{w}</span>
              ))}
            </div>
          </div>

          {/* Source table */}
          <div style={{ marginTop: 12, flexShrink: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 70px 60px 60px", gap: 8, padding: "6px 0", borderBottom: `1px solid ${C.g200}`, marginBottom: 6 }}>
              {["Source","Calls","Qualified","Booked","Cost/Q"].map(h => (
                <span key={h} style={{ fontSize: 11, color: C.g500, fontWeight: 600 }}>{h}</span>
              ))}
            </div>
            {SOURCE_TABLE.map((row, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 60px 70px 60px 60px", gap: 8, padding: "7px 0", borderBottom: i < SOURCE_TABLE.length - 1 ? `1px solid ${C.g100}` : "none", alignItems: "center" }}>
                <div>
                  <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: C.g900 }}>{row.source}</p>
                  <p style={{ margin: 0, fontSize: 10, color: C.g400 }}>{row.sub}</p>
                </div>
                <span style={{ fontSize: 12, color: C.g700 }}>{row.calls}</span>
                <span style={{ fontSize: 12, color: C.g700 }}>{row.qualified}</span>
                <span style={{ fontSize: 12, color: C.g700 }}>{row.booked}</span>
                <span style={{ fontSize: 12, color: C.g700 }}>{row.costQ}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT: mini timeline + today's actions ── */}
      <div style={{ width: 310, flexShrink: 0, display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", paddingBottom: 16, scrollbarWidth: "thin" }}>

        {/* Mini timeline card */}
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.g200}`, padding: "14px 14px 10px", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.g700, marginBottom: 10 }}>
            <span>📅</span> May 15
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 6, marginBottom: 4 }}>
            <span style={{ fontSize: 10, color: C.g400, textAlign: "right" }}>Time</span>
            <span style={{ fontSize: 10, color: C.g400 }}>Today's timeline</span>
          </div>
          {miniCalls.map((call, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 6, marginBottom: 5 }}>
              <div style={{ fontSize: 10, color: C.g400, textAlign: "right", paddingTop: 8 }}>{call.time}</div>
              <div style={{ background: C.g50, border: `1px solid ${C.g200}`, borderRadius: 8, padding: "7px 10px", display: "flex", alignItems: "center", gap: 8 }}>
                <Avatar initials={call.initials} bg={call.bg} size={24} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: C.g900, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{call.name}</p>
                  <p style={{ margin: 0, fontSize: 9, color: C.g400 }}>{call.phone}</p>
                </div>
                <div style={{ flexShrink: 0, textAlign: "right" }}>
                  <p style={{ margin: 0, fontSize: 9, color: C.g400 }}>Concern:</p>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 500, color: C.g700 }}>{call.callType}</p>
                  <p style={{ margin: 0, fontSize: 9, color: ["Delhi","Mumbai"].includes(call.location) ? C.red : C.g400 }}>{call.location}</p>
                </div>
              </div>
            </div>
          ))}
          {/* View all button */}
          <button style={{
            width: "100%", marginTop: 4, padding: "10px 0",
            background: C.green, color: "#fff", border: "none", borderRadius: 9,
            fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          }}>
            View all call for today <span style={{ fontSize: 14 }}>→</span>
          </button>
        </div>

        {/* Today's Actions (same as Calls screen) */}
        <div style={{ background: C.white, borderRadius: 12, border: `1px solid ${C.g200}`, padding: 12 }}>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>Today's actions</p>
          <p style={{ margin: "0 0 10px", fontSize: 10, color: C.g400 }}>Do these to move bookings</p>
          <div style={{ background: C.g50, borderRadius: 8, padding: 10, marginBottom: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <DonutChart pct={72} size={58} />
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: C.g900 }}>72% calls</p>
                <p style={{ margin: "2px 0 5px", fontSize: 9, color: C.g400 }}>included a clear next step.</p>
                <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: 600, color: C.g900 }}>12 calls need review</p>
                <div style={{ display: "flex", gap: 4 }}>
                  <span style={{ background: C.amberLight, color: C.amberText, fontSize: 9, borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>4 unclear</span>
                  <span style={{ background: C.redLight, color: C.redText, fontSize: 9, borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>2 critical fails</span>
                </div>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
            {["successful","unsuccessful"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "4px 9px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit",
                border: activeTab === tab ? "none" : `1px solid ${C.g200}`,
                background: activeTab === tab ? C.green : C.white,
                color: activeTab === tab ? "#fff" : C.g500,
                fontSize: 10, fontWeight: activeTab === tab ? 600 : 500,
              }}>
                {tab === "successful" ? "Successful Calls" : "Unsuccessful Calls"}
              </button>
            ))}
            <select style={{ marginLeft: "auto", fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 5px", color: C.g500, background: C.white, fontFamily: "inherit" }}>
              <option>Today</option><option>This Week</option>
            </select>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 48px", gap: 4, padding: "2px 0", borderBottom: `1px solid ${C.g200}`, marginBottom: 6 }}>
            {["Client Name","Avg. Scr","Pass %"].map(h => (
              <span key={h} style={{ fontSize: 9, color: C.g400, fontWeight: 600 }}>{h}</span>
            ))}
          </div>
          {(CLIENTS[activeTab] || []).map((cl, i, arr) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 60px 48px", gap: 4, alignItems: "center",
              marginBottom: i < arr.length - 1 ? 8 : 0, paddingBottom: i < arr.length - 1 ? 8 : 0,
              borderBottom: i < arr.length - 1 ? `1px solid ${C.g100}` : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Avatar initials={cl.initials} bg={cl.bg} size={25} />
                <div>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: C.g900 }}>{cl.name}</p>
                  <p style={{ margin: 0, fontSize: 8, color: C.g400 }}>{cl.phone}</p>
                </div>
              </div>
              <span style={{ background: C.violetLight, color: C.violet, fontSize: 9, borderRadius: 5, padding: "2px 5px", fontWeight: 600, textAlign: "center" }}>{cl.score}</span>
              <span style={{ fontSize: 10, color: C.g700, fontWeight: 500 }}>{cl.pass}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SIDEBAR ────────────────────────────────────────────
function Sidebar({ activeScreen, onNav, onNotif }) {
  const items = [
    { id: "calls",     icon: "📞", label: "Calls" },
    { id: "dashboard", icon: "📊", label: "Dash Board" },
    { id: "qa",        icon: "✅", label: "QA Queue" },
  ];
  const notifItem = { id: "notification", icon: "🔔", label: "Notification" };
  const extras = [
    { id: "teams",    icon: "👥", label: "Teams" },
    { id: "calendar", icon: "📅", label: "Calendar" },
  ];
  const bottom = [
    { id: "settings", icon: "⚙️", label: "Settings" },
    { id: "logout",   icon: "🚪", label: "Log Out" },
  ];

  const NavBtn = ({ item, onClick }) => {
    const active = activeScreen === item.id;
    return (
      <button
        onClick={onClick}
        style={{
          display: "flex", alignItems: "center", gap: 9, width: "100%",
          padding: "8px 10px", borderRadius: 8, border: "none", cursor: "pointer",
          fontSize: 12, fontWeight: active ? 600 : 400, fontFamily: "Inter,sans-serif",
          background: active ? C.green : "transparent",
          color: active ? C.white : C.g500, textAlign: "left", marginBottom: 2,
          transition: "background .15s",
        }}
      >
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
          {items.map(item => (
            <NavBtn key={item.id} item={item} onClick={() => onNav(item.id)} />
          ))}
          {/* Notification — opens modal, does NOT change screen highlight */}
          <NavBtn item={notifItem} onClick={onNotif} />
          {extras.map(item => (
            <NavBtn key={item.id} item={item} onClick={() => onNav(item.id)} />
          ))}
        </nav>
      </div>
      <nav style={{ padding: "0 8px 8px" }}>
        {bottom.map(item => (
          <NavBtn key={item.id} item={item} onClick={() => onNav(item.id)} />
        ))}
      </nav>
    </aside>
  );
}

// ─── HEADER ─────────────────────────────────────────────
function Header({ onNotif }) {
  return (
    <header style={{
      background: C.white, borderBottom: `1px solid ${C.g200}`,
      height: 48, padding: "0 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      flexShrink: 0,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 15, color: C.g400, cursor: "pointer" }}>⊞</span>
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
          <span>+</span> New
        </div>
        <span style={{ fontSize: 14, color: C.g400, cursor: "pointer" }}>❓</span>
        <span style={{ fontSize: 14, color: C.g400, cursor: "pointer" }}>💬</span>
        <span style={{ fontSize: 14, color: C.g400, cursor: "pointer" }}>⏰</span>
        <Avatar initials="EM" bg={C.indigo} size={26} />
        <span style={{ fontSize: 11, color: C.g400, cursor: "pointer" }} onClick={onNotif}>▾</span>
      </div>
    </header>
  );
}

// ─── SCREEN: CALLS ──────────────────────────────────────
function CallsScreen() {
  const [activeTab, setActiveTab] = useState("successful");

  return (
    <div style={{ display: "flex", gap: 16, padding: "16px 16px 0", flex: 1, overflow: "hidden" }}>
      {/* Center */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: C.g900, margin: "0 0 4px" }}>Good morning, Employee 234</h1>
        <p style={{ fontSize: 12, color: C.g500, margin: "0 0 12px", lineHeight: 1.6 }}>
          <strong style={{ color: C.g900 }}>Call Coach 360°</strong> wishes you a good and productive day,{" "}
          <span style={{ color: C.green, fontWeight: 600 }}>120 calls</span> waiting for you today. You also have{" "}
          <span style={{ color: C.green, fontWeight: 600 }}>24 booked calls</span> in your calendar today.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: C.g700, marginBottom: 8 }}>
          <span>📅</span> May 15
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 8, marginBottom: 4 }}>
          <span style={{ fontSize: 10, color: C.g400, textAlign: "right" }}>Time</span>
          <span style={{ fontSize: 10, color: C.g400 }}>Today's timeline</span>
        </div>
        {/* Timeline */}
        <div style={{ overflowY: "auto", flex: 1, paddingRight: 4, scrollbarWidth: "thin" }}>
          {CALLS.map((call, i) => (
            <div key={i} style={{ position: "relative" }}>
              {i < CALLS.length - 1 && (
                <div style={{
                  position: "absolute", left: 44, top: 34, bottom: -4,
                  width: 1, borderLeft: `1.5px dashed ${C.g300}`, zIndex: 0,
                }} />
              )}
              <div style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 10, color: C.g400, textAlign: "right", paddingTop: 10, paddingRight: 4 }}>{call.time}</div>
                <div style={{
                  background: call.booked ? C.white : C.g50,
                  border: `${call.booked ? "1.5px" : "1px"} solid ${call.booked ? C.green : C.g200}`,
                  borderRadius: 9, padding: "8px 12px",
                  display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
                }}>
                  <Avatar initials={call.initials} bg={call.bg} size={28} />
                  <div style={{ flex: "0 0 130px" }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: C.g900 }}>{call.name}</p>
                    <p style={{ margin: 0, fontSize: 9, color: C.g400 }}>{call.phone}</p>
                  </div>
                  <VDiv />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 9, color: C.g400 }}>⏱ Call type:</p>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: C.g700 }}>{call.callType}</p>
                  </div>
                  <VDiv />
                  <div style={{ flex: "0 0 90px" }}>
                    <p style={{ margin: 0, fontSize: 9, color: C.g400 }}>📍 Location:</p>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: ["Delhi", "Mumbai"].includes(call.location) ? C.red : C.g700 }}>
                      {call.location}
                    </p>
                  </div>
                </div>
              </div>
              {call.booked && (
                <div style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 8, marginBottom: 4 }}>
                  <span />
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "3px 0 3px 2px" }}>
                    <button style={{
                      background: C.green, color: "#fff", border: "none", borderRadius: 6,
                      padding: "4px 11px", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                    }}>Booked Call</button>
                    <span style={{ fontSize: 10, color: C.g400 }}>📅 15 May, Today | 10:25 AM</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        width: 280, display: "flex", flexDirection: "column", gap: 12,
        flexShrink: 0, overflowY: "auto", paddingBottom: 16,
        scrollbarWidth: "thin",
      }}>
        {/* Mini Calendar */}
        <div style={{ background: C.white, borderRadius: 11, padding: 12, border: `1px solid ${C.g200}` }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, fontSize: 16 }}>‹</button>
            <span style={{ background: C.pink, color: "#fff", borderRadius: 20, padding: "2px 12px", fontSize: 11, fontWeight: 600 }}>May 2025</span>
            <button style={{ background: "none", border: "none", cursor: "pointer", color: C.g400, fontSize: 16 }}>›</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr) 30px", gap: 1, marginBottom: 3 }}>
            {["MON","TUE","WED","THU","FRI","SAT","SUN"].map(d => (
              <div key={d} style={{ textAlign: "center", fontSize: 8, color: C.g400, fontWeight: 600 }}>{d}</div>
            ))}
            <div />
          </div>
          {CAL_WEEKS.map((week, wi) => (
            <div key={wi} style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr) 30px", gap: 1, marginBottom: 1 }}>
              {week.days.map((day, di) => (
                <div key={di} style={{
                  textAlign: "center", fontSize: 10, padding: "2px 0", borderRadius: 4, cursor: day ? "pointer" : "default",
                  background: day === "15" ? C.pink : "transparent",
                  color: day === "15" ? "#fff" : day ? C.g700 : "transparent",
                  fontWeight: day === "15" ? 700 : 400,
                }}>{day ?? "·"}</div>
              ))}
              <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 8, borderRadius: 4, fontWeight: week.cur ? 600 : 400,
                background: week.cur ? C.indigo : "transparent",
                color: week.cur ? "#fff" : C.g400,
              }}>{week.wk}</div>
            </div>
          ))}
        </div>

        {/* Today's Actions */}
        <div style={{ background: C.white, borderRadius: 11, padding: 12, border: `1px solid ${C.g200}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.g900 }}>Today's actions</p>
              <p style={{ margin: 0, fontSize: 10, color: C.g400 }}>Do these to move bookings</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ margin: "0 0 3px", fontSize: 8, color: C.g400 }}>Total call attended</p>
              <div style={{ background: C.green, color: "#fff", borderRadius: 6, padding: "2px 12px", fontSize: 18, fontWeight: 700, textAlign: "center" }}>102</div>
            </div>
          </div>
          {/* Donut stats */}
          <div style={{ background: C.g50, borderRadius: 8, padding: 10, marginBottom: 8 }}>
            <p style={{ margin: "0 0 6px", fontSize: 9, color: C.g400 }}>Total Calls Attended</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <DonutChart pct={72} size={62} />
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: C.g900 }}>72% calls</p>
                <p style={{ margin: "2px 0 6px", fontSize: 9, color: C.g400 }}>Included a clear next step.</p>
                <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 600, color: C.g900 }}>12 calls need review</p>
                <div style={{ display: "flex", gap: 4 }}>
                  <span style={{ background: C.amberLight, color: C.amberText, fontSize: 9, borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>4 unclear</span>
                  <span style={{ background: C.redLight, color: C.redText, fontSize: 9, borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>2 critical fails</span>
                </div>
              </div>
            </div>
          </div>
          {/* Tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 8 }}>
            {["successful", "unsuccessful"].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                padding: "4px 9px", borderRadius: 20, cursor: "pointer", fontFamily: "inherit",
                border: activeTab === tab ? "none" : `1px solid ${C.g200}`,
                background: activeTab === tab ? C.green : C.white,
                color: activeTab === tab ? "#fff" : C.g500,
                fontSize: 10, fontWeight: activeTab === tab ? 600 : 500,
              }}>
                {tab === "successful" ? "Successful Calls" : "Unsuccessful Calls"}
              </button>
            ))}
            <select style={{ marginLeft: "auto", fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 5px", color: C.g500, background: C.white, fontFamily: "inherit" }}>
              <option>Today</option><option>This Week</option>
            </select>
          </div>
          {/* Client table */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 60px 48px", gap: 4, padding: "2px 0", borderBottom: `1px solid ${C.g200}`, marginBottom: 6 }}>
            {["Client Name", "Avg. Scr", "Pass %"].map(h => (
              <span key={h} style={{ fontSize: 9, color: C.g400, fontWeight: 600 }}>{h}</span>
            ))}
          </div>
          {(CLIENTS[activeTab] || []).map((cl, i, arr) => (
            <div key={i} style={{
              display: "grid", gridTemplateColumns: "1fr 60px 48px", gap: 4,
              alignItems: "center", marginBottom: i < arr.length - 1 ? 8 : 0,
              paddingBottom: i < arr.length - 1 ? 8 : 0,
              borderBottom: i < arr.length - 1 ? `1px solid ${C.g100}` : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Avatar initials={cl.initials} bg={cl.bg} size={25} />
                <div>
                  <p style={{ margin: 0, fontSize: 10, fontWeight: 600, color: C.g900 }}>{cl.name}</p>
                  <p style={{ margin: 0, fontSize: 8, color: C.g400 }}>{cl.phone}</p>
                </div>
              </div>
              <span style={{ background: C.violetLight, color: C.violet, fontSize: 9, borderRadius: 5, padding: "2px 5px", fontWeight: 600, textAlign: "center" }}>{cl.score}</span>
              <span style={{ fontSize: 10, color: C.g700, fontWeight: 500 }}>{cl.pass}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: QA QUEUE ───────────────────────────────────
function QAScreen() {
  const [scTab, setScTab] = useState("Qualification");

  return (
    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", padding: "16px 16px 0" }}>
      {/* Top cards */}
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr 1fr 1fr", gap: 10, marginBottom: 14, flexShrink: 0 }}>
        {/* Overall score */}
        <div style={{ background: C.green, borderRadius: 10, padding: 12, border: `1px solid ${C.green}` }}>
          <p style={{ margin: "0 0 2px", fontSize: 10, color: "rgba(255,255,255,.8)" }}>Overall score</p>
          <p style={{ margin: "0 0 8px", fontSize: 12, fontWeight: 600, color: "#fff" }}>Inbound Lead - Book Appointment</p>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: "#fff" }}>78 / 100</span>
            <span style={{ background: "rgba(255,255,255,.25)", color: "#fff", borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 600 }}>PASS</span>
          </div>
        </div>
        {/* Top misses */}
        <div style={{ background: C.white, borderRadius: 10, padding: 12, border: `1px solid ${C.g200}` }}>
          <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: C.g900 }}>Top misses</p>
          <p style={{ margin: "0 0 6px", fontSize: 10, color: C.g400 }}>Focus on 1-2 fixes</p>
          <span style={{ background: C.amberLight, color: C.amberText, borderRadius: 5, padding: "3px 7px", fontSize: 9, fontWeight: 600, display: "inline-block", marginBottom: 4 }}>No appointment offered</span><br />
          <span style={{ background: C.amberLight, color: C.amberText, borderRadius: 5, padding: "3px 7px", fontSize: 9, fontWeight: 600, display: "inline-block" }}>No timeline asked</span>
        </div>
        {/* Next action */}
        <div style={{ background: C.white, borderRadius: 10, padding: 12, border: `1px solid ${C.g200}` }}>
          <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 600, color: C.g900 }}>Next action</p>
          <p style={{ margin: "0 0 6px", fontSize: 10, color: C.g400 }}>Minimal coaching (not training)</p>
          <span style={{ background: C.g100, color: C.g700, borderRadius: 5, padding: "3px 7px", fontSize: 9, display: "inline-block", marginBottom: 4 }}>Next time: ask a timeline question</span><br />
          <span style={{ background: C.g100, color: C.g700, borderRadius: 5, padding: "3px 7px", fontSize: 9, display: "inline-block" }}>before discussing price.</span>
        </div>
        {/* Total calls attended */}
        <div style={{ background: C.white, borderRadius: 10, padding: 12, border: `1px solid ${C.g200}` }}>
          <p style={{ margin: "0 0 6px", fontSize: 12, fontWeight: 600, color: C.g900 }}>Total Calls Attended</p>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <DonutChart pct={72} size={56} />
            <div>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: C.g900 }}>72% calls</p>
              <p style={{ margin: "2px 0 5px", fontSize: 9, color: C.g400 }}>included a clear next step.</p>
              <p style={{ margin: "0 0 3px", fontSize: 10, fontWeight: 600, color: C.g900 }}>12 calls need review</p>
              <div style={{ display: "flex", gap: 4 }}>
                <span style={{ background: C.amberLight, color: C.amberText, fontSize: 9, borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>4 unclear</span>
                <span style={{ background: C.redLight, color: C.redText, fontSize: 9, borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>2 critical</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom panels */}
      <div style={{ display: "flex", gap: 14, flex: 1, overflow: "hidden" }}>
        {/* Transcript panel */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", background: C.white, borderRadius: 10, border: `1px solid ${C.g200}`, padding: 12, minWidth: 0 }}>
          <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>Audio &amp; Transcript</p>
          <p style={{ margin: "0 0 10px", fontSize: 10, color: C.g400 }}>Search and jump to evidence</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.g50, borderRadius: 8, padding: "8px 10px", marginBottom: 8 }}>
            <span style={{ fontSize: 16, cursor: "pointer" }}>▶</span>
            <div style={{ flex: 1, height: 4, background: C.g200, borderRadius: 2, position: "relative" }}>
              <div style={{ height: "100%", width: "30%", background: C.blue, borderRadius: 2 }} />
              <div style={{ width: 10, height: 10, background: C.blue, borderRadius: "50%", position: "absolute", top: -3, left: "28%" }} />
            </div>
            <span style={{ fontSize: 10, color: C.g500 }}>0:00</span>
            <span style={{ fontSize: 10, color: C.blue }}>00:50</span>
            <span style={{ background: C.blue, color: "#fff", fontSize: 9, borderRadius: 5, padding: "2px 7px", fontWeight: 600, cursor: "pointer" }}>Evidence</span>
          </div>
          <input placeholder="Search transcript (e.g., price, insurance, schedule...)" style={{ width: "100%", padding: "5px 10px", border: `1px solid ${C.g200}`, borderRadius: 7, fontSize: 11, color: C.g700, background: C.g50, outline: "none", fontFamily: "inherit", marginBottom: 8 }} />
          <div style={{ overflowY: "auto", flex: 1, scrollbarWidth: "thin" }}>
            {QA_CALLS.map((c, i) => (
              <div key={i} style={{ borderRadius: 8, border: `1px solid ${c.selected ? C.blue : C.g200}`, background: c.selected ? "#EFF6FF" : C.white, padding: "8px 10px", marginBottom: 6, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <Avatar initials={c.initials} bg={c.bg} size={24} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: C.g900 }}>{c.name}</p>
                    <p style={{ margin: 0, fontSize: 9, color: C.g400 }}>{c.phone}</p>
                  </div>
                  <PassTag status={c.status} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 4, fontSize: 9, color: C.g400 }}>
                  <div><span>Call Date &amp; time:</span><br /><span style={{ color: C.g700, fontWeight: 500 }}>{c.date}</span></div>
                  <div />
                  <div><span>Status:</span><br /><PassTag status={c.status} /></div>
                </div>
                {c.selected && (
                  <div style={{ marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 10, color: C.g700, fontStyle: "italic" }}>"{c.quote}"</span>
                    <ConfTag conf={c.conf} />
                    <span style={{ fontSize: 9, color: C.blue, cursor: "pointer", textDecoration: "underline" }}>Evidence: {c.ev}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Scorecard panel */}
        <div style={{ width: 270, flexShrink: 0, background: C.white, borderRadius: 10, border: `1px solid ${C.g200}`, padding: 12, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 2 }}>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: C.g900 }}>Scorecard</p>
            <button style={{ background: C.green, color: "#fff", border: "none", borderRadius: 7, padding: "4px 10px", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>View all →</button>
          </div>
          <p style={{ margin: "0 0 8px", fontSize: 10, color: C.g400 }}>Inbound Lead - Book Appointment (v3)</p>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
            {["Opening", "Qualification", "Close", "Compliance"].map(tab => (
              <button key={tab} onClick={() => setScTab(tab)} style={{
                padding: "3px 9px", borderRadius: 14, fontSize: 10, cursor: "pointer",
                border: scTab === tab ? "none" : `1px solid ${C.g200}`,
                background: scTab === tab ? C.green : C.white,
                color: scTab === tab ? "#fff" : C.g500,
                fontFamily: "inherit", fontWeight: scTab === tab ? 600 : 400,
              }}>{tab}</button>
            ))}
            <select style={{ fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 5px", color: C.g500, background: C.white, fontFamily: "inherit" }}>
              <option>Today</option>
            </select>
          </div>
          <div style={{ overflowY: "auto", flex: 1, scrollbarWidth: "thin" }}>
            {SC_ROWS.map((r, i) => (
              <div key={i} style={{ borderBottom: i < SC_ROWS.length - 1 ? `1px solid ${C.g100}` : "none", padding: "7px 0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                  <Avatar initials={r.initials} bg={r.bg} size={24} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: C.g900 }}>{r.name}</p>
                    <p style={{ margin: 0, fontSize: 9, color: C.g400 }}>{r.phone}</p>
                  </div>
                  <PassTag status={r.status} />
                  <span style={{ fontSize: 10, color: C.g700, fontWeight: 500, marginLeft: 4 }}>{r.pass}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 9, color: C.g500 }}>
                  <span style={{ color: C.red }}>🚩</span>
                  <span style={{ flex: 1, color: C.g700 }}>{r.detail}</span>
                  <ConfTag conf={r.conf} />
                  <span style={{ fontSize: 9, color: C.blue, cursor: "pointer", textDecoration: "underline" }}>Evidence: {r.ev}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SCREEN: CALL LOGS ──────────────────────────────────
function CallLogsScreen() {
  const [selected, setSelected] = useState(0);
  const [clTab, setClTab] = useState("Qualification");

  return (
    <div style={{ display: "flex", gap: 14, flex: 1, overflow: "hidden", padding: "16px 16px 0" }}>
      {/* Left */}
      <div style={{ width: 340, flexShrink: 0, background: C.white, borderRadius: 10, border: `1px solid ${C.g200}`, padding: 12, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>Call Logs</p>
        <p style={{ margin: "0 0 8px", fontSize: 10, color: C.g400 }}>Inbound Lead - Book Appointment (v3)</p>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 8 }}>
          {["Opening", "Qualification", "Close", "Compliance"].map(tab => (
            <button key={tab} onClick={() => setClTab(tab)} style={{
              padding: "3px 9px", borderRadius: 14, fontSize: 10, cursor: "pointer",
              border: clTab === tab ? "none" : `1px solid ${C.g200}`,
              background: clTab === tab ? C.green : C.white,
              color: clTab === tab ? "#fff" : C.g500,
              fontFamily: "inherit", fontWeight: clTab === tab ? 600 : 400,
            }}>{tab}</button>
          ))}
          <select style={{ fontSize: 9, border: `1px solid ${C.g200}`, borderRadius: 5, padding: "2px 5px", color: C.g500, background: C.white, fontFamily: "inherit" }}>
            <option>Today</option>
          </select>
        </div>
        <div style={{ overflowY: "auto", flex: 1, scrollbarWidth: "thin" }}>
          {SC_ROWS.map((r, i) => (
            <div key={i} onClick={() => setSelected(i)} style={{
              borderRadius: 8, border: `1px solid ${selected === i ? C.blue : C.g200}`,
              background: selected === i ? "#EFF6FF" : C.white,
              padding: "8px 10px", marginBottom: 6, cursor: "pointer",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                <Avatar initials={r.initials} bg={r.bg} size={24} />
                <div style={{ flex: 1 }}>
                  <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: selected === i ? C.blue : C.g900 }}>{r.name}</p>
                  <p style={{ margin: 0, fontSize: 9, color: C.g400 }}>{r.phone}</p>
                </div>
                <PassTag status={r.status} />
                <span style={{ fontSize: 10, color: C.g700, fontWeight: 500, marginLeft: 4 }}>{r.pass}</span>
              </div>
              <p style={{ margin: "0 0 3px", fontSize: 10, color: C.g500, fontStyle: "italic" }}>"{r.detail}"</p>
              <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
                <ConfTag conf={r.conf} />
                <span style={{ fontSize: 9, color: C.blue, cursor: "pointer", textDecoration: "underline" }}>Evidence: {r.ev}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: QA Detail */}
      <div style={{ flex: 1, background: C.white, borderRadius: 10, border: `1px solid ${C.g200}`, padding: 12, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <p style={{ margin: "0 0 2px", fontSize: 13, fontWeight: 700, color: C.g900 }}>QA Queue Detail</p>
        <p style={{ margin: "0 0 10px", fontSize: 10, color: C.g400 }}>Inbound Lead - Book Appointment (v3)</p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, paddingBottom: 10, borderBottom: `1px solid ${C.g200}` }}>
          <Avatar initials={SC_ROWS[selected].initials} bg={SC_ROWS[selected].bg} size={32} />
          <div style={{ flex: 1 }}>
            <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.g900 }}>{SC_ROWS[selected].name}</p>
            <p style={{ margin: 0, fontSize: 10, color: C.g400 }}>{SC_ROWS[selected].phone}</p>
          </div>
          <PassTag status={SC_ROWS[selected].status} />
          <span style={{ fontSize: 11, color: C.g700, fontWeight: 500, marginLeft: 6 }}>{SC_ROWS[selected].pass}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 10, color: C.g400 }}>
          <span>[Call Transcript]</span>
          <span>Language: <span style={{ background: C.blue, color: "#fff", borderRadius: 4, padding: "1px 6px", fontSize: 9, fontWeight: 600 }}>Eng</span></span>
        </div>
        <div style={{ overflowY: "auto", flex: 1, scrollbarWidth: "thin", paddingRight: 4 }}>
          {[
            { who: "Caller", text: "Hi there! This is Alex from Bright Solutions. Am I speaking with Jamie?" },
            { who: "Jamie",  text: "Yes, this is Jamie. How can I help you today?" },
            { who: "Caller", text: "I'm reaching out because you expressed interest in our services. I'd love to discuss how we can assist you further. Do you have a moment to chat?" },
            { who: "Jamie",  text: "Well, I'm interested in improving our marketing strategy. We've been struggling to reach our target audience effectively." },
            { who: "Caller", text: "I understand. Many of our clients have faced similar challenges. We offer tailored marketing solutions that can help you engage your audience better. Would you like to schedule a more in-depth appointment to discuss this?" },
          ].map((line, i) => (
            <p key={i} style={{ margin: "0 0 8px", fontSize: 11, lineHeight: 1.6, color: C.g700 }}>
              <strong style={{ color: C.g900 }}>{line.who}:</strong> {line.text}
            </p>
          ))}
          {/* Audio bar */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.g50, borderRadius: 8, padding: "8px 10px", margin: "8px 0" }}>
            <span style={{ fontSize: 16, cursor: "pointer" }}>▶</span>
            <div style={{ flex: 1, height: 4, background: C.g200, borderRadius: 2, position: "relative" }}>
              <div style={{ height: "100%", width: "30%", background: C.blue, borderRadius: 2 }} />
              <div style={{ width: 10, height: 10, background: C.blue, borderRadius: "50%", position: "absolute", top: -3, left: "28%" }} />
            </div>
            <span style={{ fontSize: 10, color: C.g500 }}>0:00</span>
            <span style={{ fontSize: 10, color: C.blue }}>00:50</span>
            <span style={{ background: C.blue, color: "#fff", fontSize: 9, borderRadius: 5, padding: "2px 7px", fontWeight: 600, cursor: "pointer" }}>Evidence</span>
          </div>
          {/* Review section */}
          <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${C.g200}` }}>
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
              const badgeStyle = r.badge === "clear"
                ? { background: C.greenLight, color: "#15803D" }
                : r.badge === "unclear"
                ? { background: C.amberLight, color: C.amberText }
                : { background: C.redLight, color: C.redText };
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 6, alignItems: "center", marginBottom: 6, fontSize: 10 }}>
                  <span style={{ color: C.g700, fontStyle: "italic" }}>{r.quote}</span>
                  <ConfTag conf={r.conf || "High"} />
                  <span style={{ ...badgeStyle, fontSize: 9, borderRadius: 4, padding: "2px 6px", fontWeight: 600 }}>{r.badge}</span>
                  <span style={{ fontSize: 9, color: C.blue, cursor: "pointer", textDecoration: "underline" }}>{r.ev}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── NOTIFICATION MODAL ─────────────────────────────────
function NotificationModal({ onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,.35)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      }}
    >
      <div onClick={e => e.stopPropagation()} style={{
        background: C.white, borderRadius: 12, padding: 18,
        width: 430, maxHeight: 480, overflowY: "auto",
        boxShadow: "0 8px 32px rgba(0,0,0,.18)",
      }}>
        <p style={{ margin: "0 0 2px", fontSize: 14, fontWeight: 700, color: C.g900 }}>Notification</p>
        <p style={{ margin: "0 0 12px", fontSize: 11, color: C.green, fontWeight: 500 }}>Inbound Lead - Book Appointment (v3)</p>
        {NOTIF_DATA.map((n, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "8px 0", borderBottom: i < NOTIF_DATA.length - 1 ? `1px solid ${C.g100}` : "none" }}>
            <Avatar initials={n.initials} bg={n.bg} size={32} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: C.g900 }}>{n.name}</p>
              <p style={{ margin: 0, fontSize: 10, color: C.g400 }}>{n.phone}</p>
              {n.booked && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <button style={{ background: C.green, color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 10, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Booked Call</button>
                  <span style={{ fontSize: 10, color: C.g400 }}>📅 15 May, Today | 10:25 AM</span>
                </div>
              )}
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ margin: 0, fontSize: 10, color: C.g400 }}>❤ Concern:</p>
              <p style={{ margin: "0 0 3px", fontSize: 11, fontWeight: 500, color: C.g700 }}>{n.concern}</p>
              <p style={{ margin: 0, fontSize: 10, color: C.g400 }}>📍 Location:</p>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 500, color: ["Delhi", "Mumbai"].includes(n.location) ? C.red : C.g700 }}>{n.location}</p>
            </div>
          </div>
        ))}
        <button onClick={onClose} style={{
          marginTop: 12, width: "100%", padding: 8,
          border: `1px solid ${C.g200}`, borderRadius: 8,
          background: C.white, cursor: "pointer", fontFamily: "inherit",
          fontSize: 12, color: C.g500,
        }}>Close</button>
      </div>
    </div>
  );
}

// ─── PLACEHOLDER SCREEN ─────────────────────────────────
function PlaceholderScreen({ title, icon }) {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12, color: C.g400 }}>
      <span style={{ fontSize: 48 }}>{icon}</span>
      <p style={{ fontSize: 18, fontWeight: 600, color: C.g700 }}>{title}</p>
      <p style={{ fontSize: 13 }}>This section is coming soon.</p>
    </div>
  );
}

// ─── ROOT COMPONENT ─────────────────────────────────────
export default function CallsDashboard() {
  const [screen, setScreen]       = useState("calls");
  const [showNotif, setShowNotif] = useState(false);

  // Which nav item should appear highlighted
  const activeNav =
    screen === "calllogs" ? "qa" :
    screen === "qa"       ? "qa" :
    screen;

  const handleNav = (id) => {
    if (id === "qa") { setScreen("calllogs"); return; }
    setScreen(id);
  };

  const handleNotif = () => setShowNotif(true);

  return (
    <div style={{
      display: "flex", width: "100vw", height: "100vh",
      fontFamily: "'Inter', sans-serif", background: C.g100,
      overflow: "hidden", fontSize: 13, color: C.g900, position: "relative",
    }}>
      <Sidebar activeScreen={activeNav} onNav={handleNav} onNotif={handleNotif} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Header onNotif={handleNotif} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {screen === "calls"     && <CallsScreen     />}
          {screen === "dashboard" && <DashboardScreen />}
          {screen === "qa"        && <QAScreen        />}
          {screen === "calllogs"  && <CallLogsScreen  />}
          {screen === "teams"     && <PlaceholderScreen title="Teams"    icon="👥" />}
          {screen === "calendar"  && <PlaceholderScreen title="Calendar" icon="📅" />}
          {screen === "settings"  && <PlaceholderScreen title="Settings" icon="⚙️" />}
        </div>
      </div>

      {showNotif && <NotificationModal onClose={() => setShowNotif(false)} />}
    </div>
  );
}