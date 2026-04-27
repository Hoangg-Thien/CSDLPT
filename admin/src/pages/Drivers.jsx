import { useEffect, useState } from "react";
import "../css/Drivers.css";

export default function Drivers() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/drivers")
      .then(res => res.json())
      .then(setDrivers);
  }, []);

  const southDrivers = drivers.filter(d => d.region?.toUpperCase() === "SOUTH");
  const northDrivers = drivers.filter(d => d.region?.toUpperCase() === "NORTH");

  const renderRows = (list) =>
    list.map(d => (
      <tr key={`${d.region}-${d.id}`}>
        <td className="mono">{d.id}</td>
        <td>{d.fullName}</td>
        <td className="mono">{d.phone}</td>
        <td>{d.region}</td>
        <td>
          <span className={`status ${d.isAvailable ? "available" : "busy"}`}>
            {d.isAvailable ? "Available" : "Busy"}
          </span>
        </td>
      </tr>
    ));

  return (
    <div className="drivers-page">
      <div className="drivers-header">
        <h2>Drivers</h2>
        <span className="total-count">{drivers.length} drivers</span>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Region</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr className="region-divider">
              <td colSpan={5}>🌏 South Region</td>
            </tr>
            {renderRows(southDrivers)}

            <tr className="region-divider">
              <td colSpan={5}>🌏 North Region</td>
            </tr>
            {renderRows(northDrivers)}
          </tbody>
        </table>
      </div>
    </div>
  );
}