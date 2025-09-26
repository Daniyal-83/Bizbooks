import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FaBook, FaUserCircle } from "react-icons/fa";
import "../styles/Navbar.css";

export default function Navbar() {
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
        <li>
          <Link to="/profile">Profile</Link>
        </li>
        <li>
          <Link to="/login">
            <FaUserCircle style={{ marginRight: 4 }} />
            Login
          </Link>
        </li>
      </ul>
    </motion.nav>
  );
}
