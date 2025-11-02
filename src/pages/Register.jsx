import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", form);
      setMessage("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      // Backend returns helpful messages under `message` (e.g. "User already exists").
      setMessage(err.response?.data?.message || err.response?.data?.error || "Registration failed.");
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
          style={{ margin: "8px", padding: "8px", width: "250px" }}
        />
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
          Register
        </button>
      </form>
      <p style={{ color: "green", marginTop: "10px" }}>{message}</p>
      <p>
        Already have an account? <a href="/">Login</a>
      </p>
    </div>
  );
}
