import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../services/api";
import "../styles/Login.css";

export default function Login() {
  const navigate = useNavigate();
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
      console.log(res.data);
      navigate("/profile", { replace: true });
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
      {message && <div className="auth-message">{message}</div>}
      <div style={{ marginTop: "12px", textAlign: "center" }}>
        <span>Not have an account? </span>
        <Link to="/signup">Signup</Link>
      </div>
    </form>
  );
}
