import { NavLink } from "react-router-dom";
import "../css/Sidebar.css";
export default function Sidebar() {
  return (
    <aside className="sidebar">

      <div className="sidebar-logo">
        <div className="logo-mark">
          <div className="logo-icon">🚗</div>
          <div>
            <div className="logo-text">Viet<span>Ride</span></div>
            <div className="logo-sub">Admin Portal</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">

        <div className="nav-section-label">Tổng quan</div>
        <NavLink to="/" className="nav-item">
          📊 Dashboard
        </NavLink>

        <div className="nav-section-label">Quản lý</div>

        <NavLink to="/users" className="nav-item">
          👥 Người dùng
        </NavLink>

        <NavLink to="/drivers" className="nav-item">
          🚖 Tài xế
        </NavLink>

        <NavLink to="/trips" className="nav-item">
          🗺️ Chuyến xe
        </NavLink>

      </nav>
    </aside>
  );
}