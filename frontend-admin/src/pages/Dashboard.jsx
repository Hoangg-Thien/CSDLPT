import { useEffect, useState } from "react";
import Card from "../components/Card";
import "../css/Dashboard.css";

export default function Dashboard() {
  const [users, setUsers] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/users")
      .then(res => res.json()).then(setUsers);

    fetch("http://localhost:8080/api/drivers")
      .then(res => res.json()).then(setDrivers);

    fetch("http://localhost:8080/api/rides")
      .then(res => res.json()).then(setTrips);
  }, []);

  // Stats tính từ data thật
  const availableDrivers = drivers.filter(d => d.isAvailable).length;
  const busyDrivers = drivers.filter(d => !d.isAvailable).length;
  const runningTrips   = trips.filter(t => t.status?.toLowerCase() === "ongoing").length;
  const pendingTrips   = trips.filter(t => t.status?.toLowerCase() === "pending").length;
  const completedTrips = trips.filter(t => t.status?.toLowerCase() === "completed").length;

  // 5 trips gần nhất
  const recentTrips = [...trips].slice(-5).reverse();

  return (
    <div className="dashboard">

      {/* ===== STATS ===== */}
      <div className="stats-grid">
        <Card>
          <div className="stat-card blue">
            <div className="stat-icon">👥</div>
            <div>
              <div className="stat-label">Users</div>
              <div className="stat-value">{users.length}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="stat-card green">
            <div className="stat-icon">🚖</div>
            <div>
              <div className="stat-label">Drivers</div>
              <div className="stat-value">{drivers.length}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="stat-card yellow">
            <div className="stat-icon">🗺️</div>
            <div>
              <div className="stat-label">Trips</div>
              <div className="stat-value">{trips.length}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* ===== MAIN GRID ===== */}
      <div className="dashboard-grid">

        {/* RECENT TRIPS */}
        <Card title="Recent Trips">
          <div className="recent-list">
            {recentTrips.length === 0 ? (
              <div className="empty">No trips yet</div>
            ) : (
              recentTrips.map(t => (
                <div className="recent-item" key={`${t.region}-${t.id}`}>
                  <span>{t.pickup} → {t.dropoff}</span>
                  <span className={`badge ${t.status?.toLowerCase()}`}>{t.status}</span>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* SYSTEM STATUS */}
        <Card title="System Status">
          <div className="system-box">
            <div className="system-item">
              <span>Available Drivers</span>
              <strong className="green-text">{availableDrivers}</strong>
            </div>
            <div className="system-item">
              <span>Busy Drivers</span>
              <strong className="red-text">{busyDrivers}</strong>
            </div>
            <div className="system-item">
              <span>Running Trips</span>
              <strong className="blue-text">{runningTrips}</strong>
            </div>
            <div className="system-item">
              <span>Pending Trips</span>
              <strong className="yellow-text">{pendingTrips}</strong>
            </div>
            <div className="system-item">
              <span>Completed Trips</span>
              <strong className="green-text">{completedTrips}</strong>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}