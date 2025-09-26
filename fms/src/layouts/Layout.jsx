import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import TopBanner from "../components/TopBanner";


export default function Layout({ children }) {
  return (
    <div className="app-layout">
      <TopBanner />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}