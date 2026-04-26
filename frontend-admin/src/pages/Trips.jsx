import { useEffect, useState } from "react";
import "../css/Trips.css";

export default function Trips() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/rides")
      .then(res => res.json())
      .then(setTrips);
  }, []);

  const southTrips = trips.filter(t => t.region?.toUpperCase() === "SOUTH");
  const northTrips = trips.filter(t => t.region?.toUpperCase() === "NORTH");

  const renderRows = (list) =>
    list.map(t => (
      <tr key={`${t.region}-${t.id}`}>
        <td className="mono">{t.id}</td>
        <td className="mono">{t.userId}</td>
        <td className="mono">{t.driverId || "—"}</td>
        <td>{t.pickup}</td>
        <td>{t.dropoff}</td>
        <td>
          <span className={`status ${t.status}`}>{t.status}</span>
        </td>
        <td>{t.region}</td>
      </tr>
    ));

  return (
    <div className="trips-page">
      <div className="trips-header">
        <h2>Trips</h2>
        <span className="total-count">{trips.length} trips</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Driver</th>
              <th>Pickup</th>
              <th>Dropoff</th>
              <th>Status</th>
              <th>Region</th>
            </tr>
          </thead>
          <tbody>
            <tr className="region-divider">
              <td colSpan={7}>🌏 South Region</td>
            </tr>
            {renderRows(southTrips)}

            <tr className="region-divider">
              <td colSpan={7}>🌏 North Region</td>
            </tr>
            {renderRows(northTrips)}
          </tbody>
        </table>
      </div>
    </div>
  );
}