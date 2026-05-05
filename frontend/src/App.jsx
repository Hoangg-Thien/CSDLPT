import React, { useState, useEffect, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMap, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const API = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/+$/, "");

const C = { primary: "#0f172a", blue: "#185FA5", blueLight: "#dbeafe", pink: "#be185d", pinkLight: "#fce7f3", success: "#10b981", successLight: "#d1fae5", warning: "#f59e0b", warningLight: "#fffbeb", error: "#ef4444", errorLight: "#fee2e2", surface: "#ffffff", bg: "#f1f5f9", textMain: "#0f172a", textMuted: "#64748b", border: "#e2e8f0" };

const RIDE_TYPES = [
  { id: "bike", icon: "🛵", name: "V-Bike", eta: "3 phút", base: 15000, perKm: 5000 },
  { id: "eco", icon: "🚗", name: "V-Car", eta: "5 phút", base: 25000, perKm: 10000 },
  { id: "premium", icon: "🚙", name: "V-Plus", eta: "8 phút", base: 40000, perKm: 15000 },
];

const fmtPrice = (n) => n.toLocaleString("vi-VN") + "đ";

// ─── REAL MAP ────────────────────────────────────────────────────────────────
const RealMap = ({ pickup, dropoff, routeCoordinates, showRoute, error, height = "100%", isDriving = false }) => {
  const defaultCenter = pickup?.lat ? [pickup.lat, pickup.lon] : [10.762622, 106.660172];

  const MapBounds = () => {
    const map = useMap();
    useEffect(() => {
      if (pickup?.lat && dropoff?.lat) {
        const bounds = L.latLngBounds([[pickup.lat, pickup.lon], [dropoff.lat, dropoff.lon]]);
        map.fitBounds(bounds, { padding: [30, 30] });
      } else if (pickup?.lat) {
        map.setView([pickup.lat, pickup.lon], 15);
      }
    }, [pickup, dropoff, map]);
    return null;
  };

  return (
    <div style={{ position: "absolute", inset: 0, height, zIndex: 0 }}>
      <MapContainer center={defaultCenter} zoom={13} style={{ height: "100%", width: "100%" }} zoomControl={false}>
        <TileLayer url={error ? "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"} attribution="&copy; OpenStreetMap" />
        <MapBounds />
        {pickup?.lat && !isDriving && <Marker position={[pickup.lat, pickup.lon]}><Popup>Điểm đón</Popup></Marker>}
        {dropoff?.lat && <Marker position={[dropoff.lat, dropoff.lon]}><Popup>Điểm đến</Popup></Marker>}
        {isDriving && routeCoordinates?.length > 0 && <Marker position={routeCoordinates[0]}><Popup>Tài xế</Popup></Marker>}
        {showRoute && routeCoordinates?.length > 0 && <Polyline positions={routeCoordinates} color="#185FA5" weight={5} />}
      </MapContainer>
      {error && <div style={{ position: "absolute", inset: 0, background: "rgba(254, 202, 202, 0.4)", zIndex: 400 }}></div>}
    </div>
  );
};

const DevPanel = ({ users, currentUser, db, onToggleDB, onChangeUser }) => {
  const dbKeys = ["south_primary", "south_replica", "north_primary", "north_replica"];
  const dbLabels = { south_primary: "S-Pri", south_replica: "S-Rep", north_primary: "N-Pri", north_replica: "N-Rep" };
  return (
    <div style={{ background: "#0f172a", padding: "10px 12px", position: "relative", zIndex: 1000 }}>
      <div style={{ fontSize: 9, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>Control Panel — 4 DB Nodes</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 8 }}>
        {dbKeys.map(k => (
          <div key={k} onClick={() => onToggleDB(k)} style={{ background: db[k] ? "#14532d" : "#7f1d1d", border: `1px solid ${db[k] ? "#166534" : "#991b1b"}`, borderRadius: 6, padding: "5px 8px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div><div style={{ fontSize: 10, fontWeight: 600, color: db[k] ? "#86efac" : "#fca5a5" }}>{dbLabels[k]}</div><div style={{ fontSize: 9, color: db[k] ? "#4ade80" : "#f87171", opacity: 0.8 }}>{k.includes("primary") ? "Write+Read" : "Read-only"}</div></div>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: db[k] ? "#4ade80" : "#f87171", display: "block" }} />
          </div>
        ))}
      </div>
      <select value={`${currentUser.region}_${currentUser.id}`} onChange={e => {
        const [region, idStr] = e.target.value.split('_');
        onChangeUser(region, parseInt(idStr));
      }} style={{ width: "100%", background: "#1e293b", color: "#f1f5f9", border: "1px solid #334155", padding: "5px 8px", borderRadius: 6, fontSize: 11, outline: "none" }}>
        {users.map(u => <option key={`${u.region}_${u.id}`} value={`${u.region}_${u.id}`}>{u.full_name} ({u.region})</option>)}
      </select>
    </div>
  );
};

const DBStatusBar = ({ db, region }) => {
  const k = region.toLowerCase();
  const primary = db[k + "_primary"], replica = db[k + "_replica"], src = primary ? "Primary" : replica ? "Replica" : null;
  return (
    <div style={{ display: "flex", gap: 5, padding: "7px 14px", borderBottom: `1px solid ${C.border}`, flexWrap: "wrap", background: C.surface, position: "relative", zIndex: 1000 }}>
      {[{ label: `${k === "south" ? "South" : "North"} Primary`, up: primary, sub: "W+R" }, { label: `${k === "south" ? "South" : "North"} Replica`, up: replica, sub: "R" }].map(item => (
        <span key={item.label} style={{ fontSize: 10, padding: "3px 8px", borderRadius: 10, fontWeight: 600, background: item.up ? C.successLight : C.errorLight, color: item.up ? "#065f46" : "#991b1b", display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: item.up ? C.success : C.error, display: "block" }} />{item.label} ({item.sub})
        </span>
      ))}
      {src ? <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 10, background: "#fef9c3", color: "#713f12", fontWeight: 600 }}>Đọc: {src}</span> : <span style={{ fontSize: 10, padding: "3px 8px", borderRadius: 10, background: C.errorLight, color: "#991b1b", fontWeight: 600 }}>Offline</span>}
    </div>
  );
};

const TopBar = ({ user, db }) => {
  const k = user.region.toLowerCase(), primaryUp = db[k + "_primary"], replicaUp = db[k + "_replica"], allDown = !primaryUp && !replicaUp;
  const dotColor = allDown ? C.error : primaryUp ? C.success : C.warning, label = allDown ? "Offline" : primaryUp ? `Primary · ${user.region === "SOUTH" ? "Miền Nam" : "Miền Bắc"}` : `Backup · ${user.region === "SOUTH" ? "Miền Nam" : "Miền Bắc"}`;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: C.surface, borderBottom: `1px solid ${C.border}`, position: "relative", zIndex: 1000 }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", background: C.primary, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700 }}>{user.full_name.charAt(0)}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 5, border: `1px solid ${C.border}`, padding: "5px 12px", borderRadius: 20, fontSize: 11, fontWeight: 600 }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: dotColor, display: "block" }} />{label}</div>
    </div>
  );
};

const NavBar = ({ active, onNav }) => (
  <div style={{ display: "flex", borderTop: `1px solid ${C.border}`, background: C.surface, position: "relative", zIndex: 1000 }}>
    {[{ id: "home", icon: "🚗", label: "Đặt xe" }, { id: "activity", icon: "📋", label: "Lịch sử" }].map(item => (
      <button key={item.id} onClick={() => onNav(item.id)} style={{ flex: 1, padding: "10px 0", background: "none", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600, color: active === item.id ? C.primary : C.textMuted, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
        <span style={{ fontSize: 18 }}>{item.icon}</span>{item.label}
      </button>
    ))}
  </div>
);

// ─── SEARCH SCREEN ────────────────────────────────────────────────────────────
const SearchScreen = ({ searchFor, pickup, dropoff, region, onSelect, onBack }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim().length > 2) {
        setSearching(true);
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=vn&limit=5`)
          .then(res => res.json())
          .then(data => {
            const places = data.map(p => ({
              name: p.display_name.split(',')[0],
              addr: p.display_name,
              lat: parseFloat(p.lat),
              lon: parseFloat(p.lon),
              icon: "📍", cat: "Địa điểm"
            }));
            setResults(places);
          }).finally(() => setSearching(false));
      } else {
        setResults([]);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const isPickup = searchFor === "pickup";
  return (
    <div style={{ background: C.surface, minHeight: "100%", position: "relative", zIndex: 1000 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: `1px solid ${C.border}` }}>
        <button onClick={onBack} style={{ width: 32, height: 32, borderRadius: "50%", border: `1px solid ${C.border}`, background: "none", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>←</button>
        <span style={{ fontSize: 14, fontWeight: 700, color: C.textMain }}>{isPickup ? "Chọn điểm đón" : "Chọn điểm đến"}</span>
      </div>
      <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: isPickup ? C.blueLight : C.bg, borderRadius: 10, padding: "10px 12px", border: `1px solid ${isPickup ? C.blue : C.border}` }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.blue, display: "block", flexShrink: 0 }} />
          {isPickup ? <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm điểm đón..." style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontWeight: 500, background: "transparent", color: C.textMain }} /> : <span style={{ flex: 1, fontSize: 13, color: C.textMuted }}>{pickup?.name || "Vị trí hiện tại"}</span>}
          {isPickup && query && <span onClick={() => setQuery("")} style={{ cursor: "pointer", fontSize: 13, color: C.textMuted }}>✕</span>}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, marginLeft: 16 }}>{[0, 1, 2].map(i => <span key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: C.border, display: "block" }} />)}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, background: !isPickup ? C.pinkLight : C.bg, borderRadius: 10, padding: "10px 12px", border: `1px solid ${!isPickup ? C.pink : C.border}` }}>
          <span style={{ width: 10, height: 10, borderRadius: "50%", background: C.pink, display: "block", flexShrink: 0 }} />
          {!isPickup ? <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Tìm điểm đến..." style={{ flex: 1, border: "none", outline: "none", fontSize: 13, fontWeight: 500, background: "transparent", color: C.textMain }} /> : <span style={{ flex: 1, fontSize: 13, color: C.textMuted }}>{dropoff?.name || "Điểm đến"}</span>}
          {!isPickup && query && <span onClick={() => setQuery("")} style={{ cursor: "pointer", fontSize: 13, color: C.textMuted }}>✕</span>}
        </div>
      </div>
      <div style={{ padding: "0 14px" }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>{searching ? "Đang tìm..." : query ? "Kết quả tìm kiếm" : "Hãy gõ địa chỉ"}</div>
        {results.map((p, i) => (
          <div key={i} onClick={() => onSelect(p)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 0", borderBottom: `1px solid ${C.border}`, cursor: "pointer" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{p.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 600, color: C.textMain, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.name}</div><div style={{ fontSize: 11, color: C.textMuted, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{p.addr}</div></div>
          </div>
        ))}
      </div>
    </div>
  );
};

const HomeScreen = ({ user, db, pickup, dropoff, selRide, distance, onOpenSearch, onSelectRide, onConfirm }) => {
  const k = user.region.toLowerCase(), canWrite = db[k + "_primary"], canRead = db[k + "_primary"] || db[k + "_replica"], hasRoute = !!dropoff;
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <TopBar user={user} db={db} /><DBStatusBar db={db} region={user.region} />
      <div style={{ height: 220, background: C.bg, position: "relative", overflow: "hidden" }}>
        <RealMap pickup={pickup} dropoff={dropoff} error={!canRead} showRoute={false} height="100%" />
      </div>
      <div style={{ background: C.surface, borderRadius: "18px 18px 0 0", marginTop: -16, position: "relative", zIndex: 5 }}>
        <div style={{ width: 36, height: 3, background: C.border, borderRadius: 2, margin: "10px auto 14px" }} />
        <div style={{ margin: "0 14px 12px", background: C.bg, borderRadius: 12, border: `1px solid ${C.border}` }}>
          <div onClick={() => onOpenSearch("pickup")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer" }}><div style={{ width: 28, height: 28, borderRadius: "50%", background: C.blueLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🔵</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 10, color: C.textMuted, marginBottom: 1 }}>Điểm đón</div><div style={{ fontSize: 13, fontWeight: 600, color: C.textMain, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{pickup?.name || "Vị trí hiện tại"}</div></div><span style={{ fontSize: 12, color: C.textMuted }}>✏️</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "0 14px" }}><div style={{ width: 28, display: "flex", justifyContent: "center" }}><div style={{ width: 1.5, height: 16, background: C.border }} /></div><div style={{ flex: 1, height: 1, background: C.border }} /></div>
          <div onClick={() => onOpenSearch("dropoff")} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer" }}><div style={{ width: 28, height: 28, borderRadius: "50%", background: C.pinkLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>🔴</div><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 10, color: C.textMuted, marginBottom: 1 }}>Điểm đến</div><div style={{ fontSize: 13, fontWeight: hasRoute ? 600 : 400, color: hasRoute ? C.textMain : C.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{dropoff?.name || "Bạn muốn đến đâu?"}</div></div><span style={{ fontSize: 12, color: C.textMuted }}>✏️</span></div>
        </div>
        {!canRead && <div style={{ margin: "0 14px 12px", background: C.errorLight, border: `1px solid #fecaca`, borderRadius: 10, padding: "10px 12px", fontSize: 11, color: "#991b1b", fontWeight: 600 }}>✕ Mất kết nối toàn bộ DB khu vực {user.region}</div>}
        {canRead && !canWrite && <div style={{ margin: "0 14px 12px", background: C.warningLight, border: `1px solid #fde68a`, borderRadius: 10, padding: "10px 12px", fontSize: 11, color: "#92400e", fontWeight: 600 }}>⚠️ Primary offline — Chỉ đọc từ Replica. Đặt xe tạm thời bị tắt.</div>}
        {hasRoute && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, padding: "0 14px 12px" }}>
            {RIDE_TYPES.map(r => {
              const price = r.base + Math.max(1, distance) * r.perKm;
              return (
                <div key={r.id} onClick={() => onSelectRide(r.id)} style={{ padding: "10px 6px", borderRadius: 10, cursor: "pointer", textAlign: "center", border: selRide === r.id ? `1.5px solid ${C.primary}` : `1px solid ${C.border}`, background: selRide === r.id ? C.bg : C.surface, transition: "all 0.15s" }}>
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{r.icon}</div><div style={{ fontSize: 11, fontWeight: 700, color: C.textMain }}>{r.name}</div><div style={{ fontSize: 10, color: C.textMuted, margin: "2px 0" }}>{r.eta}</div><div style={{ fontSize: 12, fontWeight: 700, color: C.blue }}>{fmtPrice(price)}</div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ padding: "0 14px 14px" }}>
          <button onClick={hasRoute && canWrite ? onConfirm : undefined} style={{ width: "100%", height: 50, borderRadius: 12, border: "none", fontSize: 15, fontWeight: 700, cursor: hasRoute && canWrite ? "pointer" : "not-allowed", background: hasRoute && canWrite ? C.primary : C.bg, color: hasRoute && canWrite ? "white" : C.textMuted }}>
            {!canRead ? "Mất kết nối DB" : !canWrite ? "Hệ thống bảo trì" : !hasRoute ? "Chọn điểm đến để tiếp tục" : "Xác nhận đặt xe"}
          </button>
        </div>
      </div>
    </div>
  );
};

const ConfirmScreen = ({ user, db, pickup, dropoff, selRide, distance, fare, routeCoords, onBook, onBack }) => {
  const ride = RIDE_TYPES.find(r => r.id === selRide) || RIDE_TYPES[1];
  return (
    <div style={{ background: C.surface }}>
      <TopBar user={user} db={db} />
      <div style={{ height: 200, background: C.bg, position: "relative", overflow: "hidden" }}>
        <RealMap pickup={pickup} dropoff={dropoff} routeCoordinates={routeCoords} showRoute={true} height="100%" />
        <div style={{ position: "absolute", top: 10, left: 10, background: C.surface, borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 600, border: `1px solid ${C.border}`, zIndex: 1000 }}>{ride.icon} {ride.name} · {ride.eta}</div>
      </div>
      <div style={{ padding: "16px 14px 0" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 6 }}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 3 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: C.blue, display: "block" }} /><span style={{ width: 1.5, height: 22, background: C.border, display: "block" }} /></div><div><div style={{ fontSize: 13, fontWeight: 600, color: C.textMain }}>{pickup?.name}</div><div style={{ fontSize: 11, color: C.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 280 }}>{pickup?.addr || user.province}</div></div></div>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 14 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: C.pink, display: "block", marginTop: 3, flexShrink: 0 }} /><div><div style={{ fontSize: 13, fontWeight: 600, color: C.textMain }}>{dropoff?.name}</div><div style={{ fontSize: 11, color: C.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 280 }}>{dropoff?.addr}</div></div></div>
        <div style={{ height: 1, background: C.border, margin: "0 0 12px" }} />
        {[{ label: "Khoảng cách", val: `~${distance.toFixed(1)} km` }, { label: "Loại xe", val: `${ride.icon} ${ride.name}` }, { label: "Thanh toán", val: "💵 Tiền mặt" }].map(row => (
          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontSize: 12, color: C.textMuted }}>{row.label}</span><span style={{ fontSize: 13, fontWeight: 600, color: C.textMain }}>{row.val}</span></div>
        ))}
        <div style={{ height: 1, background: C.border, margin: "10px 0" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><span style={{ fontSize: 15, fontWeight: 700, color: C.textMain }}>Tổng cộng</span><span style={{ fontSize: 20, fontWeight: 800, color: C.primary }}>{fmtPrice(fare)}</span></div>
      </div>
      <div style={{ padding: "0 14px 10px" }}>
        <button onClick={onBook} style={{ width: "100%", height: 50, borderRadius: 12, border: "none", background: C.primary, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 8 }}>Đặt xe ngay · {fmtPrice(fare)}</button>
        <button onClick={onBack} style={{ width: "100%", height: 44, borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.textMain, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Quay lại</button>
      </div>
    </div>
  );
};

const DrivingScreen = ({ user, db, pickup, dropoff, selRide, fare, driver, routeCoords, onComplete, onCancel, onNav }) => {
  const ride = RIDE_TYPES.find(r => r.id === selRide) || RIDE_TYPES[1];
  return (
    <div>
      <TopBar user={user} db={db} />
      <div style={{ height: 220, background: C.bg, position: "relative", overflow: "hidden" }}>
        <RealMap pickup={pickup} dropoff={dropoff} routeCoordinates={routeCoords} showRoute={true} height="100%" isDriving={true} />
        <div style={{ position: "absolute", bottom: 12, left: "50%", transform: "translateX(-50%)", background: C.blue, color: "white", borderRadius: 20, padding: "6px 14px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", zIndex: 1000 }}>Tài xế đang đến · {ride.eta}</div>
      </div>
      <DBStatusBar db={db} region={user.region} />
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "14px 14px 0", background: C.bg, borderRadius: 12, padding: "14px", border: `1px solid ${C.border}` }}>
        <div style={{ width: 46, height: 46, borderRadius: "50%", background: C.blueLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🧑</div>
        <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 700, color: C.textMain }}>{driver.fullName || driver.name}</div><div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>🚗 {driver.phone || driver.plate}</div><div style={{ fontSize: 11, color: "#b45309", marginTop: 2 }}>★ {driver.rating || "4.9"}</div></div>
        <div style={{ textAlign: "right" }}><div style={{ fontSize: 16, fontWeight: 800, color: C.primary }}>{fmtPrice(fare)}</div><div style={{ fontSize: 10, color: C.textMuted, marginTop: 2 }}>{ride.name}</div></div>
      </div>
      <div style={{ margin: "10px 14px 0", padding: "12px", background: C.bg, borderRadius: 10, border: `1px solid ${C.border}` }}>
        <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 6 }}>Lộ trình</div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 12 }}>🔵</span><span style={{ fontSize: 12, color: C.textMuted, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pickup?.name}</span></div>
        <div style={{ width: 1, height: 10, background: C.border, margin: "3px 0 3px 6px" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 12 }}>🔴</span><span style={{ fontSize: 12, fontWeight: 600, color: C.textMain, flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{dropoff?.name}</span></div>
      </div>
      <div style={{ padding: "14px 14px 8px" }}>
        <button onClick={onComplete} style={{ width: "100%", height: 50, borderRadius: 12, border: "none", background: C.success, color: "white", fontSize: 15, fontWeight: 700, cursor: "pointer", marginBottom: 8 }}>✓ Hoàn thành chuyến đi</button>
        <button onClick={onCancel} style={{ width: "100%", height: 44, borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.textMain, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>Hủy chuyến</button>
      </div>
      <NavBar active="home" onNav={onNav} />
    </div>
  );
};

const HistoryScreen = ({ user, db, rides, onNav }) => {
  const k = user.region.toLowerCase(), canWrite = db[k + "_primary"], src = db[k + "_primary"] ? "Primary" : db[k + "_replica"] ? "Replica" : null;
  const userRides = rides.filter(r => r.userId === user.id).slice().reverse();
  return (
    <div style={{ background: C.surface, minHeight: "100%" }}>
      <TopBar user={user} db={db} /><DBStatusBar db={db} region={user.region} />
      <div style={{ padding: "14px 14px 8px", borderBottom: `1px solid ${C.border}` }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: C.textMain, margin: 0 }}>Lịch sử chuyến đi</h2>
        {!canWrite && src && <div style={{ marginTop: 8, background: C.warningLight, border: `1px solid #fde68a`, borderRadius: 8, padding: "8px 12px", fontSize: 11, color: "#92400e", fontWeight: 600 }}>🛡️ Chế độ an toàn — đang đọc từ {src}</div>}
      </div>
      <div style={{ padding: "8px 14px 80px" }}>
        {userRides.length === 0 && <div style={{ textAlign: "center", padding: "40px 0", color: C.textMuted }}><div style={{ fontSize: 36, marginBottom: 10 }}>📭</div><div style={{ fontSize: 13 }}>Chưa có chuyến đi nào</div></div>}
        {userRides.map((trip, i) => (
          <div key={i} style={{ padding: "14px 0", borderBottom: `1px solid ${C.border}`, display: "flex", gap: 12, alignItems: "flex-start" }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.blueLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{trip.rideIcon}</div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 14, fontWeight: 700, color: C.textMain }}>{trip.dropoff}</div><div style={{ fontSize: 11, color: C.textMuted, marginTop: 2 }}>{trip.pickup} → {trip.dropoff}</div><div style={{ fontSize: 11, color: C.textMuted }}>{trip.date}</div><span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 8, background: C.successLight, color: "#065f46", fontWeight: 600, display: "inline-block", marginTop: 4 }}>Hoàn thành</span></div>
            <div style={{ textAlign: "right", flexShrink: 0 }}><div style={{ fontSize: 14, fontWeight: 700, color: C.primary }}>{trip.price}</div><div style={{ fontSize: 10, color: C.textMuted, marginTop: 2, fontStyle: "italic" }}>{trip.source} data</div></div>
          </div>
        ))}
      </div>
      <NavBar active="activity" onNav={onNav} />
    </div>
  );
};

export default function MobileApp() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersError, setUsersError] = useState("");
  const [db, setDb] = useState({ south_primary: true, south_replica: true, north_primary: true, north_replica: true });
  const [screen, setScreen] = useState("home");
  const [searchFor, setSearchFor] = useState(null);
  const [pickup, setPickup] = useState(null);
  const [dropoff, setDropoff] = useState(null);
  const [selRide, setSelRide] = useState("eco");
  const [fare, setFare] = useState(0);
  const [distance, setDistance] = useState(0);
  const [routeCoords, setRouteCoords] = useState([]);
  const [activeDriver, setActiveDriver] = useState(null);
  const [activeRideId, setActiveRideId] = useState(null);
  const [rides, setRides] = useState([]);

  useEffect(() => {
    fetch(`${API}/users`).then(r => r.json()).then(data => {
      const mapped = data.map(u => ({ id: u.id, full_name: u.fullName, province: u.province, region: u.region }));
      if (mapped.length) { setUsers(mapped); setCurrentUser(mapped[0]); }
    }).catch(() => setUsersError("Lỗi kết nối Backend")).finally(() => setLoading(false));
  }, []);

  // Fetch coordinates for default province
  useEffect(() => {
    if (currentUser && !pickup?.lat) {
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(currentUser.province)}&limit=1`)
        .then(r => r.json()).then(d => {
          if (d.length > 0) setPickup({ name: currentUser.province, addr: currentUser.province, lat: parseFloat(d[0].lat), lon: parseFloat(d[0].lon) });
        });
    }
  }, [currentUser, pickup]);

  // Calculate route and distance
  useEffect(() => {
    if (pickup?.lat && dropoff?.lat) {
      fetch(`https://router.project-osrm.org/route/v1/driving/${pickup.lon},${pickup.lat};${dropoff.lon},${dropoff.lat}?overview=full&geometries=geojson`)
        .then(r => r.json()).then(data => {
          if (data.routes && data.routes.length > 0) {
            setDistance(data.routes[0].distance / 1000);
            const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
            setRouteCoords(coords);
          }
        });
    } else {
      setRouteCoords([]);
      setDistance(0);
    }
  }, [pickup, dropoff]);

  const loadHistory = useCallback(async (user) => {
    if (!user) return;
    try {
      const res = await fetch(`${API}/rides/history/${user.id}?province=${encodeURIComponent(user.province)}&isReadOnly=false`);
      const data = await res.json();
      setRides(data.map(r => ({ ...r, price: r.price || "—", rideIcon: "🚗", source: "primary", date: new Date(r.createdAt).toLocaleString("vi-VN") })).sort((a, b) => b.id - a.id));
    } catch { setRides([]); }
  }, []);

  useEffect(() => { loadHistory(currentUser); }, [currentUser, loadHistory]);

  const handleBook = async () => {
    const k = currentUser.region.toLowerCase();
    if (!db[k + "_primary"]) { setScreen("home"); return; }
    try {
      const res = await fetch(`${API}/rides/book?province=${encodeURIComponent(currentUser.province)}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, pickup: pickup?.name, dropoff: dropoff?.name, status: "PENDING", region: currentUser.region, price: fmtPrice(fare) }),
      });
      if (!res.ok) throw new Error();
      const newRide = await res.json();

      // Giả lập backend chọn được tài xế
      setActiveRideId(newRide.id);
      setActiveDriver({ name: "Tài xế V-App", plate: "29A-123.45", rating: "4.9" });
      setScreen("driving");
    } catch { alert("Hệ thống gián đoạn!"); setScreen("home"); }
  };

  const handleComplete = async () => {
    if (activeRideId) {
      try {
        await fetch(`${API}/rides/complete/${activeRideId}?region=${encodeURIComponent(currentUser.region)}`, { method: "PUT" });
      } catch (e) { console.error("Không thể cập nhật DB:", e); }
    }
    await loadHistory(currentUser);
    setDropoff(null); setActiveDriver(null); setActiveRideId(null); setScreen("activity");
  };

  if (loading) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.bg, flexDirection: "column" }}><span style={{ fontSize: 36 }}>🚗</span><span>Đang tải...</span></div>;
  if (usersError || !currentUser) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: C.bg, flexDirection: "column" }}><span style={{ fontSize: 32 }}>⚠️</span><span>{usersError}</span></div>;

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); *{box-sizing:border-box;margin:0;padding:0;font-family:'Inter',sans-serif;} body{background:#cbd5e1;} .phone-frame{width:100%;max-width:400px;margin:16px auto;background:#ffffff;position:relative;box-shadow:0 20px 50px rgba(0,0,0,0.2);border-radius:36px;border:6px solid #1e293b;overflow:hidden;} @media (max-width:480px) { .phone-frame{max-width:100%;margin:0;border:none;border-radius:0;} } button:active{opacity:0.85;transform:scale(0.98);}`}</style>
      <div className="phone-frame">
        <DevPanel users={users} currentUser={currentUser} db={db} onToggleDB={k => setDb(prev => ({ ...prev, [k]: !prev[k] }))} onChangeUser={(region, id) => { setCurrentUser(users.find(u => u.id === id && u.region === region)); setPickup(null); setDropoff(null); setScreen("home"); }} />
        <div style={{ overflowY: "auto", maxHeight: "calc(100vh - 120px)" }}>
          {screen === "home" && <HomeScreen user={currentUser} db={db} pickup={pickup} dropoff={dropoff} selRide={selRide} distance={distance} onOpenSearch={t => { setSearchFor(t); setScreen("search"); }} onSelectRide={setSelRide} onConfirm={() => { const r = RIDE_TYPES.find(x => x.id === selRide) || RIDE_TYPES[1]; setFare(r.base + Math.max(1, distance) * r.perKm); setScreen("confirm"); }} />}
          {screen === "search" && <SearchScreen searchFor={searchFor} pickup={pickup} dropoff={dropoff} onSelect={p => { searchFor === "pickup" ? setPickup(p) : setDropoff(p); setScreen("home"); }} onBack={() => setScreen("home")} />}
          {screen === "confirm" && <ConfirmScreen user={currentUser} db={db} pickup={pickup} dropoff={dropoff} selRide={selRide} distance={distance} fare={fare} routeCoords={routeCoords} onBook={handleBook} onBack={() => setScreen("home")} />}
          {screen === "driving" && <DrivingScreen user={currentUser} db={db} pickup={pickup} dropoff={dropoff} selRide={selRide} fare={fare} driver={activeDriver} routeCoords={routeCoords} onComplete={handleComplete} onCancel={() => { setActiveDriver(null); setScreen("home"); }} onNav={setScreen} />}
          {screen === "activity" && <HistoryScreen user={currentUser} db={db} rides={rides} onNav={setScreen} />}
        </div>
      </div>
    </>
  );
}
