import React, { useState } from "react";
import { registerUser } from "../services/api";

export default function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  // handle form inputs
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser(form);
      setMessage("✅ Signup Successful! You can now login.");
      console.log("Registered User:", res.data);
    } catch (err) {
      setMessage("❌ Error: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: "400px", margin: "auto" }}>
      <h2>Sign Up</h2>
      <input
        type="text"
        name="name"
        placeholder="Full Name"
        value={form.name}
        onChange={handleChange}
        required
        style={{ display: "block", margin: "10px 0", padding: "8px", width: "100%" }}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={form.email}
        onChange={handleChange}
        required
        style={{ display: "block", margin: "10px 0", padding: "8px", width: "100%" }}
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        value={form.password}
        onChange={handleChange}
        required
        style={{ display: "block", margin: "10px 0", padding: "8px", width: "100%" }}
      />
      <button
        type="submit"
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
        Sign Up
      </button>
      <p>{message}</p>
    </form>
  );
}
