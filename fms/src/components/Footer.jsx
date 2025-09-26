import "../styles/Footer.css";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-container">

        
        <div className="footer-col">
          <h3 className="footer-logo">BizBooks</h3>
          <p>
            Your trusted financial management solution.  
            Simplify your accounting with ease.
          </p>
        </div>

        
        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/features">Features</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/signup">Signup</Link></li>
          </ul>
        </div>

      
        <div className="footer-col">
          <h4>Resources</h4>
          <ul>
            <li>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => window.location.href = "/help-center"}
                style={{ background: "none", border: "none", color: "#ddd", textDecoration: "underline", cursor: "pointer", padding: 0 }}
              >
                Help Center
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => window.location.href = "/blog"}
                style={{ background: "none", border: "none", color: "#ddd", textDecoration: "underline", cursor: "pointer", padding: 0 }}
              >
                Blog
              </button>
            </li>
            <li>
              <button
                type="button"
                className="footer-link-btn"
                onClick={() => window.location.href = "/faqs"}
                style={{ background: "none", border: "none", color: "#ddd", textDecoration: "underline", cursor: "pointer", padding: 0 }}
              >
                FAQs
              </button>
            </li>
          </ul>
        </div>

        {/* 🔹 Contact */}
        <div className="footer-col">
          <h4>Contact</h4>
          <p>Email: support@BizBooks.com</p>
          <p>Phone: +1 234 567 890</p>
        </div>
      </div>

      {/* 🔹 Bottom bar */}
      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} BizBooks. All Rights Reserved.</p>
      </div>
    </footer>
  );
}