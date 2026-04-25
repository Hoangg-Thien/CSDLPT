import React, { useState, useEffect, useCallback, useRef } from "react";

const API = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  primary: "#0f172a",
  blue: "#185FA5",
  blueLight: "#dbeafe",
  pink: "#be185d",
  pinkLight: "#fce7f3",
  success: "#10b981",
  successLight: "#d1fae5",
  warning: "#f59e0b",
  warningLight: "#fffbeb",
  error: "#ef4444",
  errorLight: "#fee2e2",
  surface: "#ffffff",
  bg: "#f1f5f9",
  textMain: "#0f172a",
  textMuted: "#64748b",
  border: "#e2e8f0",
};

// ─── DỮ LIỆU ĐỊA ĐIỂM ────────────────────────────────────────────────────────
const PLACES = {
  SOUTH: [
    { name: "Vincom Center Q1", addr: "72 Lê Thánh Tôn, Q1", icon: "🏬", cat: "Mua sắm" },
    { name: "Sân bay Tân Sơn Nhất", addr: "Trường Sơn, Tân Bình", icon: "✈️", cat: "Sân bay" },
    { name: "Bệnh viện Chợ Rẫy", addr: "201B Nguyễn Chí Thanh, Q5", icon: "🏥", cat: "Y tế" },
    { name: "Đại học Bách Khoa", addr: "268 Lý Thường Kiệt, Q10", icon: "🎓", cat: "Giáo dục" },
    { name: "Phố đi bộ Nguyễn Huệ", addr: "Nguyễn Huệ, Q1", icon: "🌳", cat: "Vui chơi" },
    { name: "Chợ Bến Thành", addr: "Lê Lợi, Q1", icon: "🛒", cat: "Chợ" },
    { name: "Landmark 81", addr: "720A Điện Biên Phủ, Bình Thạnh", icon: "🏙️", cat: "Điểm đến" },
    { name: "Nhà thờ Đức Bà", addr: "1 Công xã Paris, Q1", icon: "⛪", cat: "Di tích" },
    { name: "Lotte Mart Q7", addr: "469 Nguyễn Hữu Thọ, Q7", icon: "🛍️", cat: "Mua sắm" },
    { name: "Đảo Kim Cương Q2", addr: "Đảo Kim Cương, Q2", icon: "🏝️", cat: "Khu dân cư" },
  ],
  NORTH: [
    { name: "Hồ Hoàn Kiếm", addr: "Đinh Tiên Hoàng, Hoàn Kiếm", icon: "🏞️", cat: "Du lịch" },
    { name: "Sân bay Nội Bài", addr: "Phù Lỗ, Sóc Sơn", icon: "✈️", cat: "Sân bay" },
    { name: "Vincom Bà Triệu", addr: "191 Bà Triệu, Hai Bà Trưng", icon: "🏬", cat: "Mua sắm" },
    { name: "Bệnh viện Bạch Mai", addr: "78 Giải Phóng, Đống Đa", icon: "🏥", cat: "Y tế" },
    { name: "Hồ Tây", addr: "Tây Hồ, Hà Nội", icon: "🌊", cat: "Du lịch" },
    { name: "AEON Mall Long Biên", addr: "27 Cổ Linh, Long Biên", icon: "🛍️", cat: "Mua sắm" },
    { name: "Văn Miếu Quốc Tử Giám", addr: "58 Quốc Tử Giám, Đống Đa", icon: "🏛️", cat: "Di tích" },
    { name: "Chợ Đồng Xuân", addr: "Đồng Xuân, Hoàn Kiếm", icon: "🛒", cat: "Chợ" },
    { name: "Lăng Chủ tịch HCM", addr: "2 Hùng Vương, Ba Đình", icon: "🏯", cat: "Di tích" },
    { name: "Times City", addr: "458 Minh Khai, Hai Bà Trưng", icon: "🏢", cat: "Khu đô thị" },
  ],
};

const RIDE_TYPES = [
  { id: "bike", icon: "🛵", name: "V-Bike", eta: "3 phút", base: 25000 },
  { id: "eco", icon: "🚗", name: "V-Car", eta: "5 phút", base: 55000 },
  { id: "premium", icon: "🚙", name: "V-Plus", eta: "8 phút", base: 85000 },
];

const MOCK_DRIVERS = [
  { name: "Minh Tuấn", plate: "51G-123.45", rating: "4.9", icon: "🧑", vehicle: "Toyota Vios" },
  { name: "Hồng Phúc", plate: "29A-678.90", rating: "4.8", icon: "👩", vehicle: "Vinfast Fadil" },
  { name: "Văn Hùng", plate: "43B-321.10", rating: "5.0", icon: "🧔", vehicle: "Kia Morning" },
];

const fmtPrice = (n) => n.toLocaleString("vi-VN") + "đ";
const calcFare = (base) => base + (2 + Math.floor(Math.random() * 8)) * 4000;

// ─── SVG MAP ──────────────────────────────────────────────────────────────────
const MapSVG = ({ showRoute = false, error = false }) => (
  <svg viewBox="0 0 390 240" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg"
    style={{ position: "absolute", inset: 0 }}>
    <rect width="390" height="240" fill={error ? "#fef2f2" : "#e8f0e8"} />
    {/* Blocks */}
    {[[30, 30, 60, 40], [140, 50, 80, 55], [290, 25, 70, 50], [30, 165, 90, 60], [180, 155, 60, 45], [300, 150, 70, 55]].map(([x, y, w, h], i) => (
      <rect key={i} x={x} y={y} width={w} height={h} rx="4" fill={error ? "#fecaca" : "#cdd9cd"} />
    ))}
    {/* Roads */}
    <path d="M 0 80 Q 120 60 250 90 T 390 70" stroke={error ? "#f87171" : "#b8cbb8"} strokeWidth="8" fill="none" strokeLinecap="round" />
    <path d="M 0 150 Q 200 130 390 160" stroke={error ? "#f87171" : "#b8cbb8"} strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M 100 0 Q 110 120 100 240" stroke={error ? "#f87171" : "#b8cbb8"} strokeWidth="6" fill="none" strokeLinecap="round" />
    <path d="M 255 0 Q 262 120 258 240" stroke={error ? "#f87171" : "#b8cbb8"} strokeWidth="5" fill="none" strokeLinecap="round" />
    {/* Route */}
    {showRoute && (
      <>
        <path d="M 75 155 C 130 100 220 80 295 75" stroke={C.blue} strokeWidth="3" fill="none" strokeDasharray="6 4" strokeLinecap="round" />
        <circle cx="295" cy="75" r="10" fill={C.pink} opacity="0.2" />
        <circle cx="295" cy="75" r="6" fill={C.pink} />
        <circle cx="295" cy="75" r="3" fill="white" />
      </>
    )}
    {/* Pickup dot */}
    <circle cx="75" cy="155" r="12" fill={C.blue} opacity="0.15" />
    <circle cx="75" cy="155" r="7" fill={C.blue} />
    <circle cx="75" cy="155" r="3" fill="white" />
    {!showRoute && (
      <>
        <circle cx="75" cy="155" r="22" fill={C.blue} opacity="0.08">
          <animate attributeName="r" values="10;24;10" dur="2.5s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.2;0;0.2" dur="2.5s" repeatCount="indefinite" />
        </circle>
      </>
    )}
  </svg>
);

// ─── DB CONTROL PANEL ─────────────────────────────────────────────────────────
const DevPanel = ({ users, currentUser, db, onToggleDB, onChangeUser }) => {
  const dbKeys = ["south_primary", "south_replica", "north_primary", "north_replica"];
  const dbLabels = { south_primary: "S-Pri", south_replica: "S-Rep", north_primary: "N-Pri", north_replica: "N-Rep" };
  return (
    <div style={{ background: "#0f172a", padding: "10px 12px" }}>
      <div style={{ fontSize: 9, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
        Control Panel — 4 DB Nodes
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 8 }}>
        {dbKeys.map(k => (
          <div key={k} onClick={() => onToggleDB(k)} style={{
            background: db[k] ? "#14532d" : "#7f1d1d",
            border: `1px solid ${db[k] ? "#166534" : "#991b1b"}`,
            borderRadius: 6, padding: "5px 8px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: db[k] ? "#86efac" : "#fca5a5" }}>{dbLabels[k]}</div>
              <div style={{ fontSize: 9, color: db[k] ? "#4ade80" : "#f87171", opacity: 0.8 }}>
                {k.includes("primary") ? "Write+Read" : "Read-only"}
              </div>
            </div>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: db[k] ? "#4ade80" : "#f87171", display: "block" }} />
          </div>
        ))}
      </div>
      <select
        value={currentUser.id}
        onChange={e => onChangeUser(parseInt(e.target.value))}
        style={{ width: "100%", background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155", padding: "5px 8px", borderRadius: 6, fontSize: 11, outline: "none" }}
      >
        {users.map(u => (
          <option key={u.id} value={u.id}>{u.full_name} ({u.region})</option>
        ))}
      </select>
    </div>
  );
};

// ─── DB STATUS BAR ────────────────────────────────────────────────────────────
const DBStatusBar = ({ db, region }) => {
  const k = region.toLowerCase();
  const primary = db[k + "_primary"];
  const replica = db[k + "_replica"];
  const src = primary ? "Primary" : replica ? "Replica" : null;
  return (
    <div style={{ display: "flex", gap: 5, padding: "7px 14px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", background: C.surface }}>
      {[
        { label: `${k === "south" ? "South" : "North"} Primary`, up: primary, sub: "W+R" },
        { label: `${k === "south" ? "South" : "North"} Replica`, up: replica, sub: "R" },
      ].map(item => (
        <span key={item.label} style={{
          fontSize: 10, padding: "3px 8px", borderRadius: 10, fontWeight: 600,
          background: item.up ? C.successLight : C.errorLight,
          color: item.up ? "#065f46" : "#991b1b",
          display: "flex", alignItems: "center", gap: 4,
        }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: item.up ? C.success : C.error, display: "block" }} />
          {item.label} ({item.sub})
        </span>
      ))}
      {src
        ? <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 10, background: "#fef9c3", color: "#713f12", fontWeight: 600 }}>Đọc: {src}</span>
        : <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 10, background: C.errorLight, color: "#991b1b", fontWeight: 600 }}>Offline</span>
      }
    </div>
  );
};

// ─── TOP BAR ──────────────────────────────────────────────────────────────────
const TopBar = ({ user, db }) => {
  const k = user.region.toLowerCase();
  const primaryUp = db[k + "_primary"];
  const replicaUp = db[k + "_replica"];
  const allDown = !primaryUp && !replicaUp;
  const dotColor = allDown ? C.error : primaryUp ? C.success : C.warning;
  const label = allDown ? "Offline" : primaryUp
    ? `Primary · ${user.region === "SOUTH" ? "Miền Nam" : "Miền Bắc"}`
    : `Backup · ${user.region === "SOUTH" ? "Miền Nam" : "Miền Bắc"}`;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.surface, borderBottom: `1px solid ${C.border}` }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.primary, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>
        {user.full_name.charAt(0)}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, border: `1px solid ${C.border}`, padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, display: "block" }} />
        {label}
      </div>
    </div>
  );
};

// ─── NAV BAR ──────────────────────────────────────────────────────────────────
const NavBar = ({ active, onNav }) => (
  <div style={{ display: "flex", borderTop: `1px solid ${C.border}`, background: C.surface }}>
    {[{ id: "home", icon: "🚗", label: "Đặt xe" }, { id: "activity", icon: "📋", label: "Lịch sử" }].map(item => (
      <button key={item.id} onClick={() => onNav(item.id)} style={{
        flex: 1, padding: "10px 0", background: "none", border: "none", cursor: "pointer",
        fontSize: 11, fontWeight: 600, color: active === item.id ? C.primary : C.textMuted,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
      }}>
        <span style={{ fontSize: 18 }}>{item.icon}</span>
        {item.label}
      </button>
    ))}
  </div>
);

// ─── SEARCH SCREEN ────────────────────────────────────────────────────────────
const SearchScreen = ({ searchFor, pickup, dropoff, region, onSelect, onBack }) => {
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const allPlaces = PLACES[region] || [];
  const filtered = query.trim()
    ? allPlaces.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.addr.toLowerCase().includes(query.toLowerCase()))
    : allPlaces;

  const isPickup = searchFor === "pickup";
  return (
    <div style={{ background: C.surface, minHeight: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onBack} style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.border}`, background: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.textMain }}>{isPickup ? "Chọn điểm đón" : "Chọn điểm đến"}</span>
      </div>

      {/* Route inputs */}
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        {/* Pickup input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: isPickup ? C.blueLight : C.bg,
          borderRadius: 10, padding: "10px 12px",
          border: `1px solid ${isPickup ? C.blue : C.border}`,
        }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.blue, display: "block", flexShrink: 0 }} />
          {isPickup
            ? <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Tìm điểm đón..." style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontWeight: 500, background: "transparent", color: C.textMain }} />
            : <span style={{ flex: 1, fontSize: 13, color: C.textMuted }}>{pickup?.name || "Vị trí hiện tại"}</span>
          }
          {isPickup && query && <span onClick={() => setQuery("")} style={{ cursor: "pointer", fontSize: 13, color: C.textMuted }}>✕</span>}
        </div>

        {/* Divider dots */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, marginLeft: 16 }}>
          {[0, 1, 2].map(i => <span key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: C.border, display: "block" }} />)}
        </div>

        {/* Dropoff input */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: !isPickup ? C.pinkLight : C.bg,
          borderRadius: 10, padding: "10px 12px",
          border: `1px solid ${!isPickup ? C.pink : C.border}`,
        }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.pink, display: "block", flexShrink: 0 }} />
          {!isPickup
            ? <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Tìm điểm đến..." style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontWeight: 500, background: "transparent", color: C.textMain }} />
            : <span style={{ flex: 1, fontSize: 13, color: C.textMuted }}>{dropoff?.name || "Điểm đến"}</span>
          }
          {!isPickup && query && <span onClick={() => setQuery("")} style={{ cursor: "pointer", fontSize: 13, color: C.textMuted }}>✕</span>}
        </div>
      </div>

      {/* Suggestions */}
      <div style={{ padding: "0 14px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
          {query ? "Kết quả tìm kiếm" : "Địa điểm phổ biến"}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "24px 0", color: C.textMuted, fontSize: 13 }}>Không tìm thấy địa điểm</div>
        )}
        {filtered.map((p, i) => (
          <div key={i} onClick={() => onSelect(p)} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "11px 0",
            borderBottom: `1px solid ${C.border}`, cursor: "pointer",
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {p.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.textMain, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>{p.addr}</div>
            </div>
            <span style={{ fontSize: 10, color: C.textMuted, flexShrink: 0, paddingLeft: 8 }}>{p.cat}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────
const HomeScreen = ({ user, db, pickup, dropoff, selRide, onOpenSearch, onSelectRide, onConfirm }) => {
  const k = user.region.toLowerCase();
  const canWrite = db[k + "_primary"];
  const canRead = db[k + "_primary"] || db[k + "_replica"];
  const hasRoute = !!dropoff;

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <TopBar user={user} db={db} />
      <DBStatusBar db={db} region={user.region} />

      {/* Map */}
      <div style={{ height: 220, background: C.bg, position: "relative", overflow: "hidden" }}>
        <MapSVG showRoute={hasRoute} error={!canRead} />
        <button style={{ position: "absolute", right: 12, bottom: 12, width: 36, height: 36, borderRadius: "50%", background: C.surface, border: `1px solid ${C.border}`, cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
          📍
        </button>
      </div>

      {/* Bottom sheet */}
      <div style={{ background: C.surface, borderRadius: "18px 18px 0 0", marginTop: -16, position: "relative", zIndex: 5 }}>
        <div style={{ width: 36, height: 3, background: C.border, borderRadius: 2, margin: "10px auto 14px" }} />

        {/* Route card */}
        <div style={{ margin: "0 14px 12px", background: C.bg, borderRadius: 12, border: `1px solid ${C.border}` }}>
          {/* Pickup */}
          <div onClick={() => onOpenSearch("pickup")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.blueLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🔵</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 1 }}>Điểm đón</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pickup?.name || "Vị trí hiện tại"}</div>
            </div>
            <span style={{ fontSize: 12, color: C.textMuted }}>✏️</span>
          </div>

          {/* Divider with line */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 14px" }}>
            <div style={{ width: 28, display: "flex", justifyContent: "center" }}>
              <div style={{ width: 1.5, height: 16, background: C.border }} />
            </div>
            <div style={{ flex: 1, height: 1, background: C.border }} />
          </div>

          {/* Dropoff */}
          <div onClick={() => onOpenSearch("dropoff")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer" }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: C.pinkLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🔴</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 10, color: C.textMuted, marginBottom: 1 }}>Điểm đến</div>
              <div style={{ fontSize: 13, fontWeight: hasRoute ? 600 : 400, color: hasRoute ? C.textMain : C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {dropoff?.name || "Bạn muốn đến đâu?"}
              </div>
            </div>
            <span style={{ fontSize: 12, color: C.textMuted }}>✏️</span>
          </div>
        </div>

        {/* Warnings */}
        {!canRead && (
          <div style={{ margin: "0 14px 12px", background: C.errorLight, border: `1px solid #fecaca`, borderRadius: 10, padding: "10px 12px", fontSize: 11, color: "#991b1b", fontWeight: 600 }}>
            ✕ Mất kết nối toàn bộ DB khu vực {user.region}
          </div>
        )}
        {canRead && !canWrite && (
          <div style={{ margin: "0 14px 12px", background: C.warningLight, border: `1px solid #fde68a`, borderRadius: 10, padding: "10px 12px", fontSize: 11, color: "#92400e", fontWeight: 600 }}>
            ⚠️ Primary offline — Chỉ đọc từ Replica. Đặt xe tạm thời bị tắt.
          </div>
        )}

        {/* Ride types */}
        {hasRoute && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 14px 12px" }}>
            {RIDE_TYPES.map(r => (
              <div key={r.id} onClick={() => onSelectRide(r.id)} style={{
                padding: "10px 6px", borderRadius: 10, cursor: "pointer", textAlign: "center",
                border: selRide === r.id ? `1.5px solid ${C.primary}` : `1px solid ${C.border}`,
                background: selRide === r.id ? C.bg : C.surface,
                transition: "all 0.15s",
              }}>
                <div style={{ fontSize: 22, marginBottom: 4 }}>{r.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: C.textMain }}>{r.name}</div>
                <div style={{ fontSize: 10, color: C.textMuted, margin: "2px 0" }}>{r.eta}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>{fmtPrice(r.base)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Book button */}
        <div style={{ padding: "0 14px 14px" }}>
          <button onClick={hasRoute && canWrite ? onConfirm : undefined} style={{
            width: "100%", height: 50, borderRadius: 12, border: "none", fontSize: 15, fontWeight: 700,
            cursor: hasRoute && canWrite ? "pointer" : "not-allowed",
            background: hasRoute && canWrite ? C.primary : C.bg,
            color: hasRoute && canWrite ? "white" : C.textMuted,
          }}>
            {!canRead ? "Mất kết nối DB" : !canWrite ? "Hệ thống bảo trì" : !hasRoute ? "Chọn điểm đến để tiếp tục" : "Xác nhận đặt xe"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── CONFIRM SCREEN ───────────────────────────────────────────────────────────
const ConfirmScreen = ({ user, db, pickup, dropoff, selRide, fare, onBook, onBack }) => {
  const ride = RIDE_TYPES.find(r => r.id === selRide) || RIDE_TYPES[1];
  const dist = Math.max(2, Math.round((fare - ride.base) / 4000));
  return (
    <div style={{ background: C.surface }}>
      <TopBar user={user} db={db} />

      {/* Map with route */}
      <div style={{ height: 200, background: C.bg, position: "relative", overflow: "hidden" }}>
        <MapSVG showRoute={true} />
        <div style={{ position: "absolute", top: 10, left: 10, background: C.surface, borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, border: `1px solid ${C.border}` }}>
          {ride.icon} {ride.name} · {ride.eta}
        </div>
      </div>

      {/* Trip info */}
      <div style={{ padding: "16px 14px 0" }}>
        {/* Pickup */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 6 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 3 }}>
            <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.blue, display: "block" }} />
            <span style={{ width: 1.5, height: 22, background: C.border, display: "block" }} />
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.textMain }}>{pickup?.name}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{pickup?.addr || user.province}</div>
          </div>
        </div>
        {/* Dropoff */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.pink, display: "block", marginTop: 3, flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: C.textMain }}>{dropoff?.name}</div>
            <div style={{ fontSize: 11, color: C.textMuted }}>{dropoff?.addr}</div>
          </div>
        </div>

        <div style={{ height: 1, background: C.border, margin: "0 0 12px" }} />

        {/* Fare breakdown */}
        {[
          { label: "Khoảng cách", val: `~${dist} km` },
          { label: "Loại xe", val: `${ride.icon} ${ride.name}` },
          { label: "Thanh toán", val: "💵 Tiền mặt" },
        ].map(row => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: C.textMuted }}>{row.label}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: C.textMain }}>{row.val}</span>
          </div>
        ))}

        <div style={{ height: 1, background: C.border, margin: "10px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: C.textMain }}>Tổng cộng</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: C.primary }}>{fmtPrice(fare)}</span>
        </div>
      </div>

      <div style={{ padding: "0 14px 10px" }}>
        <button onClick={onBook} style={{ width: "100%", height: 50, borderRadius: 12, border: "none", background: C.primary, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 8 }}>
          Đặt xe ngay · {fmtPrice(fare)}
        </button>
        <button onClick={onBack} style={{ width: "100%", height: 44, borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.textMain, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Quay lại
        </button>
      </div>
    </div>
  );
};

// ─── DRIVING SCREEN ───────────────────────────────────────────────────────────
const DrivingScreen = ({ user, db, pickup, dropoff, selRide, fare, driver, onComplete, onCancel, onNav }) => {
  const ride = RIDE_TYPES.find(r => r.id === selRide) || RIDE_TYPES[1];
  return (
    <div>
      <TopBar user={user} db={db} />

      <div style={{ height: 220, background: C.bg, position: "relative", overflow: "hidden" }}>
        <MapSVG showRoute={true} />
        <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", background: C.blue, color: "white", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
          Tài xế đang đến · {ride.eta}
        </div>
      </div>

      <DBStatusBar db={db} region={user.region} />

      {/* Driver card */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 14px 0", background: C.bg, borderRadius: 12, padding: "14px", border: `1px solid ${C.border}` }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: C.blueLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
          {driver.icon}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.textMain }}>{driver.name}</div>
          <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>🚗 {driver.plate} · {driver.vehicle}</div>
          <div style={{ fontSize: 11, color: "#b45309", marginTop: 2 }}>★ {driver.rating}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 16, fontWeight: 800, color: C.primary }}>{fmtPrice(fare)}</div>
          <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{ride.name}</div>
        </div>
      </div>

      {/* Route summary */}
      <div style={{ margin: "10px 14px 0", padding: "12px", background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>Lộ trình</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12 }}>🔵</span>
          <span style={{ fontSize: 12, color: C.textMuted, flex: 1 }}>{pickup?.name}</span>
        </div>
        <div style={{ width: 1, height: 10, background: C.border, margin: "3px 0 3px 6px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 12 }}>🔴</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: C.textMain, flex: 1 }}>{dropoff?.name}</span>
        </div>
      </div>

      <div style={{ padding: "14px 14px 8px" }}>
        <button onClick={onComplete} style={{ width: "100%", height: 50, borderRadius: 12, border: "none", background: C.success, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 8 }}>
          ✓ Hoàn thành chuyến đi
        </button>
        <button onClick={onCancel} style={{ width: "100%", height: 44, borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.textMain, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
          Hủy chuyến
        </button>
      </div>
      <NavBar active="home" onNav={onNav} />
    </div>
  );
};

// ─── HISTORY SCREEN ───────────────────────────────────────────────────────────
const HistoryScreen = ({ user, db, rides, onNav }) => {
  const k = user.region.toLowerCase();
  const canWrite = db[k + "_primary"];
  const src = db[k + "_primary"] ? "Primary" : db[k + "_replica"] ? "Replica" : null;
  const userRides = rides.filter(r => r.userId === user.id).slice().reverse();

  return (
    <div style={{ background: C.surface, minHeight: "100%" }}>
      <TopBar user={user} db={db} />
      <DBStatusBar db={db} region={user.region} />

      <div style={{ padding: "14px 14px 8px", borderBottom: `1px solid ${C.border}` }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.textMain, margin: 0 }}>Lịch sử chuyến đi</h2>
        {!canWrite && src && (
          <div style={{ marginTop: 8, background: C.warningLight, border: `1px solid #fde68a`, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "#92400e", fontWeight: 600 }}>
            🛡️ Chế độ an toàn — đang đọc từ {src}
          </div>
        )}
      </div>

      <div style={{ padding: "8px 14px 80px" }}>
        {userRides.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>📭</div>
            <div style={{ fontSize: 13 }}>Chưa có chuyến đi nào</div>
          </div>
        )}
        {userRides.map((trip, i) => (
          <div key={i} style={{ padding: "14px 0", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.blueLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
              {trip.rideIcon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.textMain }}>{trip.dropoff}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{trip.pickup} → {trip.dropoff}</div>
              <div style={{ fontSize: 11, color: C.textMuted }}>{trip.date}</div>
              <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 8, background: C.successLight, color: "#065f46", fontWeight: 600, display: "inline-block", marginTop: 4 }}>
                Hoàn thành
              </span>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>{trip.price}</div>
              <div style={{ fontSize: 10, color: C.textMuted, marginTop: 2, fontStyle: "italic" }}>{trip.source} data</div>
            </div>
          </div>
        ))}
      </div>
      <NavBar active="activity" onNav={onNav} />
    </div>
  );
};

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function MobileApp() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersError, setUsersError] = useState("");

  // 4 DB states
  const [db, setDb] = useState({
    south_primary: true,
    south_replica: true,
    north_primary: true,
    north_replica: true,
  });

  // Booking state
  const [screen, setScreen] = useState("home"); // home | search | confirm | driving | activity
  const [searchFor, setSearchFor] = useState(null); // "pickup" | "dropoff"
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [selRide, setSelRide] = useState("eco");
  const [fare, setFare] = useState(0);
  const [activeDriver, setActiveDriver] = useState(null);
  const [rides, setRides] = useState([]);

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const res = await fetch(`${API}/users`);
        if (!res.ok) {
          throw new Error(`Failed to load users: ${res.status}`);
        }

        const data = await res.json();
        const mapped = data.map(u => ({ id: u.id, full_name: u.fullName, province: u.province, region: u.region }));
        if (mapped.length === 0) {
          throw new Error("No users returned from backend");
        }

        setUsersError("");
        setUsers(mapped);
        setCurrentUser(mapped[0]);
        setPickup({ name: "Vị trí hiện tại", addr: mapped[0].province });
      } catch {
        setUsers([]);
        setCurrentUser(null);
        setUsersError("Failed to load users from backend. Please verify API availability.");
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  // Load history
  const loadHistory = useCallback(async (user) => {
    if (!user) return;
    try {
      const res = await fetch(`${API}/rides/history/${user.id}?province=${encodeURIComponent(user.province)}&isReadOnly=true`);
      const data = await res.json();
      const mapped = data.map(r => ({
        id: r.id,
        userId: r.userId,
        pickup: r.pickup,
        dropoff: r.dropoff,
        price: r.price || "—",
        rideIcon: "🚗",
        status: r.status,
        region: r.region,
        source: "primary",
        date: r.createdAt ? new Date(r.createdAt).toLocaleString("vi-VN", {
          hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit", year: "numeric",
        }) : "Không rõ",
      }));
      setRides(mapped.sort((a, b) => b.id - a.id));
    } catch {
      setRides([]);
    }
  }, []);

  useEffect(() => { loadHistory(currentUser); }, [currentUser, loadHistory]);

  const toggleDB = (key) => setDb(prev => ({ ...prev, [key]: !prev[key] }));

  const handleChangeUser = (id) => {
    const user = users.find(u => u.id === id);
    if (user) {
      setCurrentUser(user);
      setPickup({ name: "Vị trí hiện tại", addr: user.province });
      setDropoff(null);
      setScreen("home");
    }
  };

  const handleOpenSearch = (type) => {
    setSearchFor(type);
    setScreen("search");
  };

  const handleSelectPlace = (place) => {
    if (searchFor === "pickup") setPickup(place);
    else setDropoff(place);
    setScreen("home");
  };

  const handleConfirm = () => {
    const ride = RIDE_TYPES.find(r => r.id === selRide) || RIDE_TYPES[1];
    setFare(calcFare(ride.base));
    setScreen("confirm");
  };

  const handleBook = async () => {
    const k = currentUser.region.toLowerCase();
    if (!db[k + "_primary"]) { setScreen("home"); return; }

    const ride = RIDE_TYPES.find(r => r.id === selRide) || RIDE_TYPES[1];
    const driver = MOCK_DRIVERS[Math.floor(Math.random() * MOCK_DRIVERS.length)];
    setActiveDriver(driver);
    setScreen("driving");

    // POST to backend
    try {
      await fetch(`${API}/rides/book?province=${encodeURIComponent(currentUser.province)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          pickup: pickup?.name,
          dropoff: dropoff?.name,
          status: "COMPLETED",
          region: currentUser.region,
          price: fmtPrice(fare),
        }),
      });
    } catch {
      // Fail silently — vẫn cho trải nghiệm UI
    }
  };

  const handleComplete = async () => {
    const ride = RIDE_TYPES.find(r => r.id === selRide) || RIDE_TYPES[1];
    const k = currentUser.region.toLowerCase();
    const src = db[k + "_primary"] ? "primary" : "replica";
    const newRide = {
      id: Date.now(),
      userId: currentUser.id,
      pickup: pickup?.name,
      dropoff: dropoff?.name,
      price: fmtPrice(fare),
      rideIcon: ride.icon,
      status: "COMPLETED",
      region: currentUser.region,
      source: src,
      date: new Date().toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }),
    };
    setRides(prev => [newRide, ...prev]);
    setDropoff(null);
    setActiveDriver(null);
    setScreen("activity");
  };

  const handleCancel = () => {
    setActiveDriver(null);
    setScreen("home");
  };

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.bg, flexDirection: "column", gap: 12 }}>
        <span style={{ fontSize: 36 }}>🚗</span>
        <span style={{ fontWeight: 700, fontSize: 15, fontFamily: "Inter, sans-serif", color: C.textMain }}>Đang kết nối database...</span>
      </div>
    );
  }

  if (usersError || !currentUser) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.bg, flexDirection: "column", gap: 12, padding: 16, textAlign: "center" }}>
        <span style={{ fontSize: 32 }}>⚠️</span>
        <span style={{ fontWeight: 700, fontSize: 15, color: C.textMain }}>{usersError || "No users available to display."}</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
        body { background: #cbd5e1; }
        .phone-frame {
          width: 100%; max-width: 400px; margin: 16px auto;
          background: #ffffff; position: relative;
          box-shadow: 0 20px 50px rgba(0,0,0,0.2);
          border-radius: 36px; border: 6px solid #1e293b;
          overflow: hidden;
        }
        @media (max-width: 480px) {
          .phone-frame { max-width: 100%; margin: 0; border: none; border-radius: 0; }
        }
        input::placeholder { color: #94a3b8; }
        button:active { opacity: 0.85; transform: scale(0.98); }
      `}</style>

      <div className="phone-frame">
        <DevPanel users={users} currentUser={currentUser} db={db} onToggleDB={toggleDB} onChangeUser={handleChangeUser} />

        <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 120px)" }}>
          {screen === "home" && (
            <HomeScreen
              user={currentUser} db={db}
              pickup={pickup} dropoff={dropoff}
              selRide={selRide}
              onOpenSearch={handleOpenSearch}
              onSelectRide={setSelRide}
              onConfirm={handleConfirm}
            />
          )}
          {screen === "search" && (
            <SearchScreen
              searchFor={searchFor}
              pickup={pickup} dropoff={dropoff}
              region={currentUser.region}
              onSelect={handleSelectPlace}
              onBack={() => setScreen("home")}
            />
          )}
          {screen === "confirm" && (
            <ConfirmScreen
              user={currentUser} db={db}
              pickup={pickup} dropoff={dropoff}
              selRide={selRide} fare={fare}
              onBook={handleBook}
              onBack={() => setScreen("home")}
            />
          )}
          {screen === "driving" && activeDriver && (
            <DrivingScreen
              user={currentUser} db={db}
              pickup={pickup} dropoff={dropoff}
              selRide={selRide} fare={fare}
              driver={activeDriver}
              onComplete={handleComplete}
              onCancel={handleCancel}
              onNav={setScreen}
            />
          )}
          {screen === "activity" && (
            <HistoryScreen
              user={currentUser} db={db}
              rides={rides}
              onNav={setScreen}
            />
          )}
        </div>
      </div>
    </>
  );
}
