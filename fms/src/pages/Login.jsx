import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import "../styles/Login.css";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  React.useEffect(() => {
    setForm({ email: "", password: "" });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      setMessage("✅ Login Successful");
      // Simulate user data, you may replace with res.data
      login({ id: res.data?.id || 1, name: res.data?.name || form.email }, "user");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message;
      setMessage("❌ Error: " + msg);
    }
  };

  return (
    <form className="auth-form" onSubmit={handleSubmit} autoComplete="off" style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Login</h2>
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        className="auth-input"
        placeholder="Email"
        required
        style={{ display: "block", margin: "10px 0", padding: "8px", width: "100%" }}
        autoComplete="off"
      />
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        className="auth-input"
        placeholder="Password"
        required
        style={{ display: "block", margin: "10px 0", padding: "8px", width: "100%" }}
        autoComplete="new-password"
      />
      {message && <div style={{ margin: "10px 0", color: message.startsWith("✅") ? "green" : "red" }}>{message}</div>}
      <button
        type="submit"
        className="auth-button"
        style={{
          background: "#2ca01c",
          color: "white",
          padding: "10px",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          width: "100%",
        }}
      >
        Login
      </button>
      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <span>Not have an account? </span>
        <Link to="/signup">Signup</Link>
      </div>
    </form>
  );
}
