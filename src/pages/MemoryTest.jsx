import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./MemoryTest.css";

export default function MemoryTest() {
  const [pattern, setPattern] = useState([]);
  const [userClicks, setUserClicks] = useState([]);
  const [level, setLevel] = useState(1);
  const [status, setStatus] = useState("watch"); // "watch", "play", "win", "lose"
  const [message, setMessage] = useState("");
  const [showingIndex, setShowingIndex] = useState(-1);
  const timersRef = useRef([]);
  const [nextEnabled, setNextEnabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    generatePattern();
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, [level]);

  const generatePattern = () => {
    const patternLength = level + 2;
    const set = new Set();
    while (set.size < patternLength) {
      set.add(Math.floor(Math.random() * 16));
    }
    const newPattern = Array.from(set);
    setPattern(newPattern);
    setUserClicks([]);
    setStatus("watch");
    setMessage("");
    setShowingIndex(-1);

    // Clear any existing timers
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    const displayDelay = 700;

    // Sequentially flash pattern tiles
    newPattern.forEach((idx, i) => {
      const showTimer = setTimeout(() => setShowingIndex(idx), i * displayDelay);
      const hideTimer = setTimeout(() => setShowingIndex(-1), i * displayDelay + 400);
      timersRef.current.push(showTimer, hideTimer);
    });

    // After pattern is shown, switch to play mode
    const endTimer = setTimeout(() => {
      setStatus("play");
      setShowingIndex(-1);
    }, newPattern.length * displayDelay + 500);
    timersRef.current.push(endTimer);
  };

  const handleTileClick = async (index) => {
    if (status !== "play") return;
    if (userClicks.includes(index)) return;

    if (!pattern.includes(index)) {
      setStatus("lose");
      setMessage(`❌ Wrong tile! You reached level ${level}`);

      const userId = localStorage.getItem("userId");
      if (userId) {
        try {
          await fetch("http://localhost:5000/api/scores/add", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId,
              testType: "Memory Test",
              score: level - 1,
            }),
          });
        } catch (error) {
          console.error("Error saving Memory Test score:", error);
        }
      }
      return;
    }

    const newClicks = [...userClicks, index];
    setUserClicks(newClicks);

    if (newClicks.length === pattern.length) {
      setStatus("win");
      setMessage("✅ Great memory! Click Next to continue...");
      setNextEnabled(false);
      setTimeout(() => setNextEnabled(true), 800);
    }
  };

  const handleRestart = () => {
    setUserClicks([]);
    setMessage("");
    setStatus("watch");
    setNextEnabled(false);
    generatePattern();
  };

  return (
    <div
      className="memory-test"
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
      }}
    >
      <h1>🧠 Memory Test</h1>
      <h3>Level {level}</h3>
      <p>
        {status === "watch"
          ? "👀 Memorize the pattern"
          : status === "play"
          ? "🖱️ Repeat the pattern!"
          : message}
      </p>

      <div className="grid-container">
        {Array.from({ length: 16 }, (_, i) => (
          <div
            key={i}
            onClick={() => handleTileClick(i)}
            className={`grid-tile 
    ${showingIndex === i && status === "watch" ? "active" : ""}
    ${userClicks.includes(i) ? "clicked" : ""}
    ${status !== "play" ? "disabled" : ""}`}
          />
        ))}
      </div>

      {status === "lose" && (
        <div style={{ marginTop: "20px" }}>
          <p style={{ fontSize: "1.1rem", margin: "8px 0" }}>
            Your score: {Math.max(0, level - 1)}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <button onClick={handleRestart} className="btn btn-red">
              🔁 Try Again
            </button>

            <button onClick={() => navigate("/home")} className="btn btn-blue">
              ← Back to Home
            </button>
          </div>
        </div>
      )}

      {status === "win" && (
        <button
          onClick={() => {
            if (!nextEnabled) return;
            setLevel((l) => l + 1);
            setStatus("watch");
            setMessage("");
            setNextEnabled(false);
          }}
          disabled={!nextEnabled}
          className={`btn ${nextEnabled ? "btn-green" : "btn-grey"}`}
        >
          ▶️ Next Level
        </button>
      )}
    </div>
  );
}
