import { useEffect, useState } from "react";
import "../css/Trips.css";
export default function Trips() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/rides")
      .then(res => res.json())
      .then(setTrips);
  }, []);

  return (
  <div className="trips-page">
    <div className="trips-header">
      <h2>Trips</h2>
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
          {trips.map(t => (
            <tr key={t.id}>
              <td>{t.id}</td>
              <td>{t.userId}</td>
              <td>{t.driverId || "—"}</td>
              <td>{t.pickup}</td>
              <td>{t.dropoff}</td>
              <td>
                <span className={`status ${t.status}`}>{t.status}</span>
              </td>
              <td>{t.region}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);
}