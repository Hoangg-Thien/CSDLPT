import { useEffect, useState } from "react";
import "../css/Users.css";

export default function Users() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/users")
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  return (
    <div className="page">
      <h2>User Management</h2>

      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Phone</th>
              <th>Province</th>  {/* ✅ thêm */}
              <th>Region</th>
            </tr>
          </thead>

          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.fullName}</td>
                <td>{u.phone}</td>
                <td>{u.province || "—"}</td>  {/* ✅ thêm */}
                <td>
                  <span className={`badge ${u.region?.toLowerCase()}`}>
                    {u.region}
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