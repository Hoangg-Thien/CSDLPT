import {
  BrowserRouter as Router,
  Routes,
  Route
} from "react-router-dom";

import Sidebar from "./components/Sidebar";

// pages
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users";
import Drivers from "./pages/Drivers";
import Trips from "./pages/Trips";



import "./css/App.css";

export default function App() {
  return (
    <Router>
      <div className="layout">

        {/* SIDEBAR */}
        <Sidebar />

        {/* CONTENT */}
        <div className="content">
          <Routes>

            {/* DASHBOARD */}
            <Route path="/" element={<Dashboard />} />

            {/* CRUD */}
            <Route path="/users" element={<Users />} />
            <Route path="/drivers" element={<Drivers />} />
            <Route path="/trips" element={<Trips />} />

      
          </Routes>
        </div>

      </div>
    </Router>
  );
}
