import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import TopBanner from "../components/TopBanner";
import Sidebar from "../components/Sidebar";
import "../styles/Sidebar.css";
import { useAuth } from "../context/AuthContext";

export default function Layout({ children }) {
  const { user } = useAuth();
  return (
    <div className="app-layout">
      <TopBanner />
      <Navbar />
      <div className="main-layout">
        {user ? <Sidebar /> : null}
        <div className="main-content">{children}</div>
      </div>
      <Footer />
    </div>
  );
}