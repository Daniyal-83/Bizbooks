import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBook, FaUserCircle } from "react-icons/fa";
import "../styles/Navbar.css";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <motion.nav
      className="navbar"
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.7 }}
    >
      <div className="navbar-logo">
        <FaBook style={{ marginRight: 8, color: "#2ca01c" }} />
        <span>BizBooks</span>
      </div>
      <ul className="navbar-links">
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/features">Features</Link>
        </li>
        <li>
          <Link to="/pricing">Pricing</Link>
        </li>
        {user && (
          <>
            <li>
              <Link to="/dashboard">Dashboard</Link>
            </li>
            <li>
              <Link to="/invoices">Invoices</Link>
            </li>
            <li>
              <button
                onClick={logout}
                style={{
                  background: "#e53935",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "8px 16px",
                  cursor: "pointer",
                  fontWeight: "bold",
                  boxShadow: "0 2px 6px rgba(229,57,53,0.15)",
                  transition: "background 0.2s",
                }}
                onMouseOver={(e) => (e.target.style.background = "#b71c1c")}
                onMouseOut={(e) => (e.target.style.background = "#e53935")}
              >
                Logout
              </button>
            </li>
          </>
        )}
        {!user && (
          <li>
            <Link to="/login">
              <FaUserCircle style={{ marginRight: 4 }} />
              Login
            </Link>
          </li>
        )}
      </ul>
    </motion.nav>
  );
}
