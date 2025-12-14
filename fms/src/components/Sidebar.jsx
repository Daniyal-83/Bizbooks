import React from "react";
import { Link } from "react-router-dom";
import "../styles/Sidebar.css";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { logout } = useAuth();
  return (
    <aside className="sidebar">
      <h2 className="sidebar-title">Dashboard</h2>
      <nav>
        <ul className="sidebar-links">
          <li><Link to="/dashboard">Overview</Link></li>
          <li><Link to="/invoices">Invoices</Link></li>
          <li><Link to="/processor">Processor</Link></li>
          <li><button className="link-like" onClick={logout}>Logout</button></li>
        </ul>
      </nav>
    </aside>
  );
}
