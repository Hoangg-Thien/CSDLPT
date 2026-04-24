import React, { useState, useEffect, useCallback } from "react";

// ─── API BASE ─────────────────────────────────────────────────────────────────
const API = "/api";



// ─── DESIGN TOKENS (PREMIUM THEME) ────────────────────────────────────────────
const C = {
  primary: "#000000",          // Đổi sang đen nhám quyền lực (giống Uber)
  primaryHover: "#222222",
  onPrimary: "#ffffff",
  blue: "#2563eb",             // Điểm nhấn xanh dương
  blueLight: "#eff6ff",
  success: "#10b981",          // Xanh ngọc bích mượt
  successLight: "#d1fae5",
  error: "#ef4444",            // Đỏ tươi cảnh báo
  errorLight: "#fee2e2",
  surface: "#ffffff",
  background: "#f3f4f6",       // Xám nhạt dịu mắt cho nền
  textMain: "#111827",
  textMuted: "#6b7280",
  border: "#e5e7eb",
};

// ─── SVG MAP BACKGROUND (HIỆN ĐẠI HƠN) ────────────────────────────────────────
const MapBg = ({ error = false }) => (
  <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ position: "absolute", inset: 0, opacity: error ? 0.6 : 1 }}>
    <defs>
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke={error ? "#fca5a5" : "#e5e7eb"} strokeWidth="1" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill={error ? "#fef2f2" : "#f9fafb"} />
    <rect width="100%" height="100%" fill="url(#grid)" />

    {/* Các tuyến đường chính */}
    <path d="M 80 0 L 100 400 M 250 0 L 220 400 M 0 150 L 400 120 M 0 280 L 400 300"
      stroke={error ? "#f87171" : "#cbd5e1"} strokeWidth="8" strokeLinecap="round" opacity="0.5" />

    {/* Marker Vị trí */}
    {!error && (
      <g transform="translate(200,180)">
        <circle cx="0" cy="0" r="45" fill={C.blue} opacity="0.1" />
        <circle cx="0" cy="0" r="25" fill={C.blue} opacity="0.2">
          <animate attributeName="r" values="15;35;15" dur="3s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="0.4;0;0.4" dur="3s" repeatCount="indefinite" />
        </circle>
        <circle cx="0" cy="0" r="8" fill={C.blue} />
        <circle cx="0" cy="0" r="3" fill="#fff" />
      </g>
    )}
  </svg>
);

// ─── UI COMPONENTS CỐT LÕI ────────────────────────────────────────────────────
const GlassNav = ({ active, onNav }) => {
  const items = [
    { id: "home", icon: "Ri", label: "Đặt xe" },
    { id: "activity", icon: "Ac", label: "Lịch sử" },
  ];
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)",
      width: "100%", maxWidth: 420, zIndex: 50,
      display: "flex", justifyContent: "space-around", alignItems: "center",
      padding: "16px 20px 24px",
      background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
      borderTop: `1px solid ${C.border}`,
      boxShadow: "0 -10px 40px rgba(0,0,0,0.05)"
    }}>
      {items.map(item => (
        <button key={item.id} onClick={() => onNav(item.id)} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
          padding: "8px 24px", borderRadius: 16, border: "none", cursor: "pointer",
          background: "transparent",
          color: active === item.id ? C.primary : C.textMuted,
          fontFamily: "'Inter', sans-serif", transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 48, height: 32, borderRadius: 16,
            background: active === item.id ? C.background : "transparent",
            transition: "all 0.3s"
          }}>
            <span style={{ fontSize: 20, fontWeight: 800 }}>{item.id === 'home' ? '🚗' : '🧾'}</span>
          </div>
          <span style={{ fontSize: 11, fontWeight: active === item.id ? 700 : 600 }}>{item.label}</span>
        </button>
      ))}
    </nav>
  );
};

const PremiumTopBar = ({ user, isPrimaryDown }) => {
  const regionName = user.region === 'SOUTH' ? 'Miền Nam' : 'Miền Bắc';
  const dbStatus = isPrimaryDown ? `Backup • ${regionName}` : `Primary • ${regionName}`;

  return (
    <header style={{
      display: "flex", justifyContent: "space-between", alignItems: "center",
      height: 60, padding: "0 20px", position: "absolute", top: 0, left: 0, right: 0, zIndex: 50,
      background: "linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 100%)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: C.primary, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
          {user.full_name.charAt(0)}
        </div>
      </div>

      <div style={{
        display: "flex", alignItems: "center", gap: 6,
        background: "white", padding: "6px 14px", borderRadius: 999,
        fontSize: 11, fontFamily: "'Inter', sans-serif", fontWeight: 700,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)", border: `1px solid ${C.border}`
      }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: isPrimaryDown ? C.error : C.success, display: "inline-block", boxShadow: `0 0 8px ${isPrimaryDown ? C.error : C.success}` }} />
        <span style={{ color: C.textMain }}>{dbStatus}</span>
      </div>
    </header>
  );
};

// ─── SCREENS ──────────────────────────────────────────────────────────────────
const HomeScreen = ({ onNav, isPrimaryDown, user, onBookRide }) => {
  const [selected, setSelected] = useState("eco");
  const [destination, setDestination] = useState("");

  const rides = [
    { id: "bike", icon: "🛵", label: "V-Bike", price: "25.000đ", time: "3 phút" },
    { id: "eco", icon: "🚗", label: "V-Car", price: "55.000đ", time: "5 phút" },
    { id: "premium", icon: "🚙", label: "V-Plus", price: "85.000đ", time: "7 phút" },
  ];

  const handleBookClick = () => {
    if (!destination) { alert("Vui lòng nhập điểm đến!"); return; }
    onBookRide("Vị trí hiện tại", destination, selected);
    setDestination("");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", position: "relative" }}>
      <PremiumTopBar user={user} isPrimaryDown={isPrimaryDown} />

      <div style={{ position: "relative", flex: 1, overflow: "hidden", minHeight: 350 }}>
        <MapBg error={isPrimaryDown} />

        {/* Nút định vị nổi */}
        <button style={{
          position: "absolute", right: 20, bottom: "25%",
          width: 48, height: 48, borderRadius: "50%", background: "white",
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", border: "none", cursor: "pointer",
          fontSize: 20, zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center"
        }}>📍</button>

        {/* Khung đặt xe */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 30,
          background: "white", borderRadius: "24px 24px 0 0",
          boxShadow: "0 -10px 40px rgba(0,0,0,0.1)", padding: "24px 20px 100px"
        }}>

          <div style={{ width: 40, height: 4, background: C.border, borderRadius: 2, margin: "0 auto 20px" }} />

          <h2 style={{ fontSize: 22, fontWeight: 800, color: C.textMain, marginBottom: 16 }}>Đến đâu đây?</h2>

          {/* Ô nhập liệu */}
          <div style={{
            background: C.background, borderRadius: 16, padding: "14px 16px",
            marginBottom: 20, display: "flex", alignItems: "center", gap: 12,
            border: "1px solid transparent", transition: "border 0.2s"
          }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: C.blue }} />
            <input
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="Tìm kiếm điểm đến..."
              style={{ flex: 1, border: "none", outline: "none", fontSize: 16, fontWeight: 500, background: "transparent", color: C.textMain }}
            />
          </div>

          {/* Chọn loại xe */}
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 10, marginBottom: 20, WebkitOverflowScrolling: 'touch' }}>
            {rides.map(r => (
              <div key={r.id} onClick={() => setSelected(r.id)} style={{
                minWidth: 105, flexShrink: 0, padding: "14px 12px", borderRadius: 16, cursor: "pointer",
                border: selected === r.id ? `2px solid ${C.primary}` : `2px solid transparent`,
                background: selected === r.id ? "#fafafa" : "white",
                boxShadow: selected === r.id ? "0 8px 20px rgba(0,0,0,0.08)" : "0 2px 8px rgba(0,0,0,0.04)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)", display: "flex", flexDirection: "column", alignItems: "center"
              }}>
                <span style={{ fontSize: 32, marginBottom: 8, filter: selected === r.id ? "drop-shadow(0 4px 6px rgba(0,0,0,0.1))" : "none" }}>{r.icon}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: C.textMain }}>{r.label}</span>
                <span style={{ fontSize: 11, fontWeight: 500, color: C.textMuted, marginTop: 2 }}>{r.time}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.textMain, marginTop: 6 }}>{r.price}</span>
              </div>
            ))}
          </div>

          {/* Nút đặt xe chính */}
          <button
            onClick={handleBookClick}
            onMouseDown={e => e.currentTarget.style.transform = "scale(0.97)"}
            onMouseUp={e => e.currentTarget.style.transform = "scale(1)"}
            style={{
              width: "100%", height: 56, background: isPrimaryDown ? C.background : C.primary,
              color: isPrimaryDown ? C.textMuted : "white", border: "none", borderRadius: 16, cursor: isPrimaryDown ? "not-allowed" : "pointer",
              fontSize: 17, fontWeight: 700, transition: "all 0.2s",
              boxShadow: isPrimaryDown ? "none" : "0 10px 25px rgba(0,0,0,0.2)"
            }}
          >
            {isPrimaryDown ? "Hệ thống đang bảo trì" : "Bắt đầu chuyến đi"}
          </button>
        </div>
      </div>
      <GlassNav active="home" onNav={onNav} />
    </div>
  );
};

const ErrorScreen = ({ onNav, user }) => (
  <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: C.errorLight }}>
    <PremiumTopBar user={user} isPrimaryDown={true} />
    <main style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 24px", gap: 20 }}>

      <div style={{
        width: "100%", background: "white", borderRadius: 24, padding: "40px 24px",
        boxShadow: "0 20px 40px rgba(239, 68, 68, 0.15)", border: "1px solid rgba(239,68,68,0.2)",
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center"
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: "50%", background: C.errorLight,
          display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20
        }}>
          <span style={{ fontSize: 40 }}>⚠️</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: C.error, marginBottom: 12, letterSpacing: "-0.5px" }}>Lỗi Ghi Dữ Liệu</h1>
        <p style={{ fontSize: 15, color: C.textMain, lineHeight: 1.6, fontWeight: 500 }}>
          Máy chủ <b style={{ color: C.primary }}>Primary khu vực {user.region}</b> hiện không phản hồi. Hành động Ghi bị từ chối để đảm bảo tính toàn vẹn.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", marginTop: 32 }}>
          <button onClick={() => onNav("activity")} style={{
            width: "100%", height: 52, borderRadius: 16, border: "none",
            background: C.primary, color: "white", fontWeight: 700, fontSize: 16, cursor: "pointer",
            boxShadow: "0 8px 20px rgba(0,0,0,0.15)"
          }}>Xem dữ liệu (Read-Only)</button>

          <button onClick={() => onNav("home")} style={{
            width: "100%", height: 52, borderRadius: 16, border: `2px solid ${C.border}`,
            background: "transparent", color: C.textMain, fontWeight: 700, fontSize: 16, cursor: "pointer"
          }}>Quay lại trang chủ</button>
        </div>
      </div>

    </main>
    <GlassNav active="home" onNav={onNav} />
  </div>
);

const TripHistoryScreen = ({ onNav, user, rides, isPrimaryDown }) => {
  const userRides = rides.filter(r => r.user_id === user.id);

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100%", background: "white" }}>
      <div style={{ height: 60 }}><PremiumTopBar user={user} isPrimaryDown={isPrimaryDown} /></div>

      <main style={{ flex: 1, padding: "0 0 100px", background: C.background }}>

        {/* Header Lịch sử */}
        <div style={{ padding: "24px 24px 16px", background: "white", borderBottom: `1px solid ${C.border}` }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: C.textMain, letterSpacing: "-0.5px" }}>Hoạt động</h1>
          {isPrimaryDown && (
            <div style={{
              marginTop: 12, background: "#fffbeb", color: "#b45309", padding: "12px 16px",
              borderRadius: 12, display: "flex", gap: 10, alignItems: "center", border: "1px solid #fde68a"
            }}>
              <span style={{ fontSize: 18 }}>🛡️</span>
              <p style={{ fontSize: 12, fontWeight: 600, margin: 0, lineHeight: 1.5 }}>
                Chế độ An toàn: Đang đọc dữ liệu từ máy chủ dự phòng (Replica).
              </p>
            </div>
          )}
        </div>

        {/* Danh sách chuyến đi */}
        <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {userRides.map((trip, idx) => (
            <div key={trip.id} style={{
              background: "white", borderRadius: 20, padding: "20px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)", border: `1px solid ${C.border}`,
              animation: `fadeIn 0.4s ease-out ${idx * 0.1}s both`
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: "50%", background: C.blueLight, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🚗</div>
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: C.textMain }}>{trip.dropoff}</h3>
                    <span style={{ fontSize: 13, fontWeight: 500, color: C.textMuted }}>{trip.date} • {trip.region}</span>
                  </div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.textMain }}>{trip.price}</div>
              </div>

              <div style={{ background: C.background, borderRadius: 12, padding: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: C.success }} />
                  <span style={{ fontSize: 12, color: C.textMain, fontWeight: 700 }}>{trip.status}</span>
                </div>
                {isPrimaryDown && <span style={{ fontSize: 11, fontStyle: "italic", color: C.textMuted, fontWeight: 600 }}>Replica Data</span>}
              </div>
            </div>
          ))}
          {userRides.length === 0 && (
            <div style={{ textAlign: 'center', padding: "40px 20px" }}>
              <span style={{ fontSize: 40, opacity: 0.5 }}>📭</span>
              <p style={{ color: C.textMuted, marginTop: 12, fontSize: 15, fontWeight: 500 }}>Chưa có chuyến đi nào được ghi nhận.</p>
            </div>
          )}
        </div>
      </main>
      <GlassNav active="activity" onNav={onNav} />
    </div>
  );
};

// ─── ROOT APP & DEV TOOLS PANEL ───────────────────────────────────────────────
export default function MobileApp() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [rides, setRides] = useState([]);
  const [isPrimaryDown, setIsPrimaryDown] = useState(false);
  const [screen, setScreen] = useState("home");
  const [loading, setLoading] = useState(true);

  // ── Load users từ DB khi khởi động ──
  useEffect(() => {
    fetch(`${API}/users`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(u => ({
          id: u.id,
          full_name: u.fullName,
          province: u.province,
          region: u.region,
        }));
        setUsers(mapped);
        if (mapped.length > 0) setCurrentUser(mapped[0]);
      })
      .catch(() => {
        // fallback nếu backend chưa sẵn
        const fallback = [
          { id: 1, full_name: 'Nguyen Van A', province: 'hồ chí minh', region: 'SOUTH' },
          { id: 2, full_name: 'Tran Thi B', province: 'bình dương', region: 'SOUTH' },
          { id: 3, full_name: 'Le Van C', province: 'hà nội', region: 'NORTH' },
          { id: 4, full_name: 'Pham Thi D', province: 'hải phòng', region: 'NORTH' },
        ];
        setUsers(fallback);
        setCurrentUser(fallback[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── Load lịch sử chuyến đi khi đổi user ──
  const loadHistory = useCallback((user) => {
    if (!user) return;
    fetch(`${API}/rides/history/${user.id}?province=${encodeURIComponent(user.province)}&isReadOnly=true`)
      .then(res => res.json())
      .then(data => {
        const mapped = data.map(r => ({
          id: r.id,
          user_id: r.userId,
          pickup: r.pickup,
          dropoff: r.dropoff,
          price: r.price || '—',
          status: r.status,
          region: r.region,
          date: r.createdAt ? new Date(r.createdAt).toLocaleString('vi-VN') : 'Không rõ',
        }));
        setRides(mapped);
      })
      .catch(() => setRides([]));
  }, []);

  useEffect(() => {
    loadHistory(currentUser);
  }, [currentUser, loadHistory]);

  const handleNav = id => setScreen(id);

  // ── Đổi user → reset mọi thứ ──
  const handleChangeUser = (userId) => {
    const user = users.find(u => u.id === parseInt(userId));
    if (user) {
      setCurrentUser(user);
      setIsPrimaryDown(false);
      setScreen("home");
    }
  };

  // ── Book ride → gọi POST API thực ──
  const handleBookRide = async (pickup, dropoff, type) => {
    if (isPrimaryDown) { setScreen("error"); return; }

    const prices = { bike: '25.000đ', eco: '55.000đ', premium: '85.000đ' };
    const body = {
      userId: currentUser.id,
      pickup,
      dropoff,
      status: 'PENDING',
      region: currentUser.region,
      price: prices[type],
    };

    try {
      const res = await fetch(`${API}/rides/book?province=${encodeURIComponent(currentUser.province)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Lỗi server');
      await loadHistory(currentUser);
      setScreen("activity");
    } catch {
      setScreen("error");
    }
  };

  if (loading || !currentUser) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#f3f4f6', fontFamily: 'Inter, sans-serif', color: '#6b7280', flexDirection: 'column', gap: 16 }}>
        <span style={{ fontSize: 40 }}>🚗</span>
        <span style={{ fontWeight: 700, fontSize: 16 }}>Đang kết nối database...</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
        body { background: #e5e7eb; }
        @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.6; transform: scale(0.8); } }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .phone-frame { 
          width: 100%; max-width: 400px; height: 850px; max-height: 100vh; 
          background: #ffffff; position: relative; overflow-x: hidden; 
          box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
          border-radius: 40px; border: 8px solid #1f2937; margin: 20px auto;
          overflow: hidden;
        }
        
        /* Giao diện Dev Tools Panel cho Giảng viên */
        .dev-panel {
          background: #0f172a; padding: 12px 20px; display: flex; 
          justify-content: space-between; alignItems: center;
          border-bottom: 2px solid #334155; z-index: 100; position: relative;
        }
        
        @media (max-width: 480px) { 
          .phone-frame { max-width: 100%; height: 100vh; border: none; border-radius: 0; margin: 0; } 
        }
      `}</style>

      <div className="phone-wrapper">
        <div className="phone-frame">

          {/* 🛠️ DEV TOOLS PANEL - CÔNG CỤ DÀNH CHO GIẢNG VIÊN */}
          <div className="dev-panel">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ color: '#94a3b8', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1 }}>Control Panel • Live DB</span>
              <select
                value={currentUser.id}
                onChange={e => handleChangeUser(e.target.value)}
                style={{ background: "#1e293b", color: "#f8fafc", border: "1px solid #475569", padding: "6px 8px", borderRadius: 6, fontSize: 12, fontWeight: 600, outline: "none", cursor: "pointer" }}
              >
                {users.map(u => <option key={u.id} value={u.id}>{u.full_name} ({u.region})</option>)}
              </select>
            </div>

            <button
              onClick={() => setIsPrimaryDown(!isPrimaryDown)}
              style={{
                padding: "8px 12px", borderRadius: 8, border: "none", fontSize: 11, fontWeight: 800, cursor: "pointer",
                background: isPrimaryDown ? "#ef4444" : "#10b981", color: "white",
                boxShadow: isPrimaryDown ? "0 4px 12px rgba(239, 68, 68, 0.4)" : "0 4px 12px rgba(16, 185, 129, 0.4)",
                transition: "all 0.2s"
              }}
            >
              {isPrimaryDown ? '🔴 OFF' : '🟢 PRIMARY ON'}
            </button>
          </div>

          {/* MÀN HÌNH CHÍNH APP */}
          <div style={{ position: "relative", height: "calc(100% - 62px)", overflowY: "auto", overflowX: "hidden" }}>
            {screen === "home" && <HomeScreen onNav={handleNav} user={currentUser} isPrimaryDown={isPrimaryDown} onBookRide={handleBookRide} />}
            {screen === "error" && <ErrorScreen onNav={handleNav} user={currentUser} />}
            {screen === "activity" && <TripHistoryScreen onNav={handleNav} user={currentUser} rides={rides} isPrimaryDown={isPrimaryDown} />}
          </div>

        </div>
      </div>
    </>
  );
}