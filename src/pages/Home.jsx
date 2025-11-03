import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-container">
      <div className="background-animation"></div>

      <h1 className="logo">🧠 BrainStack</h1>
      <p className="tagline">
        Test your skills, sharpen your reflexes, and challenge your memory!
      </p>

      <div className="button-grid">
        <Link to="/reaction" className="menu-btn">⚡ Reaction Time</Link>
        <Link to="/memory-test" className="menu-btn">🧩 Memory Test</Link>
        <Link to="/number-memory" className="menu-btn">🔢 Number Memory</Link>
        <Link to="/leaderboard" className="menu-btn">🏆 Leaderboard</Link>
        <Link to="/results" className="menu-btn">📊 My Results</Link>
      </div>
    </div>
  );
}
