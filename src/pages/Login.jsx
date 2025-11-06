import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);

  // Save token and user info in localStorage
  // Note: server returns `user.id` (not `_id`) so use that field if present.
  localStorage.setItem("token", res.data.token);
  const id = res.data.user?._id || res.data.user?.id || res.data.user?.ID;
  if (id) localStorage.setItem("userId", id);
  localStorage.setItem("userName", res.data.user?.name || "");

      setMessage("Login successful! Redirecting...");
      setTimeout(() => navigate("/home"), 1000);
    } catch (err) {
      // Backend sends errors under `message` (see server/routes/authRoutes.js).
      setMessage(err.response?.data?.message || err.response?.data?.error || "Invalid credentials.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <h1 className="login-title">Welcome Back</h1>
        <p className="login-subtitle">Sign in to continue to BrainStack.</p>
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="email">
            Email
          </label>
          <input
            className="login-input"
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <label className="login-label" htmlFor="password">
            Password
          </label>
          <input
            className="login-input"
            id="password"
            type="password"
            name="password"
            placeholder="Enter your password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button className="login-button" type="submit">
            Sign In
          </button>
        </form>
        {message && (
          <p style={{ marginTop: "4px", color: message.includes("success") ? "#16a34a" : "#dc2626" }}>
            {message}
          </p>
        )}
        <div className="login-footer">
          Don’t have an account? <a href="/register">Create one</a>
        </div>
      </div>
    </div>
  );
}
