import { useEffect, useState } from "react";
import "../css/Drivers.css";
export default function Drivers() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/drivers")
      .then(res => res.json())
      .then(setDrivers);
  }, []);

  return (
  <div className="drivers-page">
    <div className="drivers-header">
      <h2>Drivers</h2>
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
  {drivers.map(d => (
    <tr key={d.id}>
      <td>{d.id}</td>
      <td>{d.fullName}</td>  {/* ✅ bỏ div name-cell và span avatar */}
      <td>{d.phone}</td>
      <td>{d.region}</td>
      <td>
        <span className={`status ${d.isAvailable ? "available" : "busy"}`}>
          {d.isAvailable ? "Available" : "Busy"}
        </span>
      </td>
    </tr>
  ))}
</tbody>
      </table>
    </div>
  </div>
);
}