import { useEffect, useState } from "react";
import "../css/Users.css";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const southUsers = users.filter(u => u.region?.toUpperCase() === "SOUTH");
  const northUsers = users.filter(u => u.region?.toUpperCase() === "NORTH");

  const renderRows = (list) =>
    list.map(u => (
      <tr key={`${u.region}-${u.id}`}>  {/* ✅ key không trùng */}
        <td className="mono">{u.id}</td>
        <td>{u.fullName}</td>
        <td className="mono">{u.phone}</td>
        <td>{u.province || "—"}</td>
        <td>
          <span className={`badge ${u.region?.toLowerCase()}`}>
            {u.region}
          </span>
        </td>
      </tr>
    ));

  return (
    <div className="page">
      <div className="page-header">
        <h2>User Management</h2>
        <span className="total-count">{users.length} users</span>
      </div>

      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Province</th>
              <th>Region</th>
            </tr>
          </thead>
          <tbody>
            {/* ✅ tách nhóm South và North */}
            <tr className="region-divider">
              <td colSpan={5}>🌏 South Region</td>
            </tr>
            {renderRows(southUsers)}

            <tr className="region-divider">
              <td colSpan={5}>🌏 North Region</td>
            </tr>
            {renderRows(northUsers)}
          </tbody>
        </table>
      </div>
    </div>
  );
}