import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

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
      setMessage(err.response?.data?.error || "Invalid credentials.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={{ margin: "8px", padding: "8px", width: "250px" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={{ margin: "8px", padding: "8px", width: "250px" }}
        />
        <button type="submit" style={{ marginTop: "10px", padding: "10px 20px" }}>
          Login
        </button>
      </form>
      <p style={{ color: "green", marginTop: "10px" }}>{message}</p>
      <p>
        Don’t have an account? <a href="/register">Register</a>
      </p>
    </div>
  );
}
