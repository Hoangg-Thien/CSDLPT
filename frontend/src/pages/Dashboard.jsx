import Card from "../components/Card";
import "../css/Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">

      {/* ===== STATS ===== */}
      <div className="stats-grid">

        <Card>
          <div className="stat-card blue">
            <div className="stat-icon">👥</div>
            <div>
              <div className="stat-label">Users</div>
              <div className="stat-value">1200</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="stat-card green">
            <div className="stat-icon">🚖</div>
            <div>
              <div className="stat-label">Drivers</div>
              <div className="stat-value">320</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="stat-card yellow">
            <div className="stat-icon">🗺️</div>
            <div>
              <div className="stat-label">Trips</div>
              <div className="stat-value">540</div>
            </div>
          </div>
        </Card>

      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="dashboard-grid">

        {/* RECENT TRIPS */}
        <Card title="Recent Trips">
          <div className="recent-list">
            <div className="recent-item">
              <span>Hanoi → HCM</span>
              <span className="badge completed">Completed</span>
            </div>

            <div className="recent-item">
              <span>Hue → Da Nang</span>
              <span className="badge running">Running</span>
            </div>

            <div className="recent-item">
              <span>HCM → Vung Tau</span>
              <span className="badge pending">Pending</span>
            </div>
          </div>
        </Card>

        {/* MAP PREVIEW */}
        <Card title="Map Overview">
          <div className="map-preview">
            Map Preview
          </div>
        </Card>

        
        {/* SYSTEM STATUS */}
        <Card title="System Status">
          <div className="system-box">
            <div className="system-item">
              <span>Active Drivers</span>
              <strong>120</strong>
            </div>

            <div className="system-item">
              <span>Running Trips</span>
              <strong>45</strong>
            </div>

            <div className="system-item">
              <span>Pending Trips</span>
              <strong>18</strong>
            </div>
          </div>
        </Card>

        

      </div>

    </div>
  );
}