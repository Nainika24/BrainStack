import { useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";


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
  <div className="register-container">
    <div className="logo-row">
      <div className="brain-logo">🧠</div>
      <h1 className="main-title"><span className="title-text">BrainStack</span></h1>
    </div>
    <div className="register-card">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />

        <button type="submit">Register</button>
      </form>

      {message && <p className="message">{message}</p>}

      <p className="redirect-text">
        Already have an account? <a href="/">Login</a>
      </p>
    </div>
  </div>
);

}
