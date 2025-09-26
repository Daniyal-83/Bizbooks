import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, logoutUser } from "../services/api";

export default function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getProfile();
        setProfile(res.data); // set user data
      } catch (err) {
        setMessage("❌ Error: " + (err.response?.data?.message || err.message));
      }
    };

    fetchProfile();
  }, []);

  if (message) return <p>{message}</p>;

  if (!profile) return <p>Loading profile...</p>;

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate("/login", { replace: true });
    } catch (err) {
      setMessage("❌ Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", minHeight: "70vh", gap: "16px" }}>
      <aside style={{ borderRight: "1px solid #eee", padding: "16px" }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 600 }}>{profile.name}</div>
          <div style={{ color: "#666", fontSize: 14 }}>{profile.email}</div>
        </div>
        <nav>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            <li style={{ padding: "8px 0" }}>Dashboard</li>
            <li style={{ padding: "8px 0" }}>Invoices</li>
            <li style={{ padding: "8px 0" }}>Customers</li>
            <li style={{ padding: "8px 0" }}>Settings</li>
          </ul>
        </nav>
        <button onClick={handleLogout} style={{ marginTop: 16, background: "#e11d48", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 4, cursor: "pointer" }}>Logout</button>
      </aside>
      <section style={{ padding: "16px" }}>
        <h2 style={{ marginTop: 0 }}>Dashboard</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
          <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Total Invoices</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>—</div>
          </div>
          <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Outstanding</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>—</div>
          </div>
          <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 16 }}>
            <div style={{ fontSize: 12, color: "#666" }}>Customers</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>—</div>
          </div>
        </div>
        <div style={{ marginTop: 24, border: "1px solid #eee", borderRadius: 8, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Recent Activity</h3>
          <p style={{ color: "#666" }}>No recent activity yet.</p>
        </div>
      </section>
      {message && <div style={{ gridColumn: "1 / -1", color: "#e11d48" }}>{message}</div>}
    </div>
  );
}
