import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function MemoryTest() {
  const [pattern, setPattern] = useState([]);
  const [userClicks, setUserClicks] = useState([]);
  const [level, setLevel] = useState(1);
  const [status, setStatus] = useState("watch"); // "watch", "play", "win", "lose"
  const [message, setMessage] = useState("");
  const [showingIndex, setShowingIndex] = useState(-1);
  const timersRef = useRef([]);
  const [nextEnabled, setNextEnabled] = useState(false);
  const playTimerRef = useRef(null);
  const nextEnableTimerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    generatePattern();
    return () => {
      // cleanup timers if level changes/unmount
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
      if (nextEnableTimerRef.current) clearTimeout(nextEnableTimerRef.current);
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

    // clear any previous timers
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    const displayDelay = 800; // ms per item

    // sequentially flash each index in the pattern
    newPattern.forEach((idx, i) => {
      const t = setTimeout(() => {
        setShowingIndex(idx);
      }, i * displayDelay);
      timersRef.current.push(t);
    });

    // after the sequence ends, clear highlight and switch to play
    const endTimer = setTimeout(() => {
      setShowingIndex(-1);
      setStatus("play");
    }, newPattern.length * displayDelay + 300);
    timersRef.current.push(endTimer);
  }; // ✅ FIXED: properly close generatePattern function

  const handleTileClick = async (index) => {
    if (status !== "play") return;
    if (userClicks.includes(index)) return;

    // ❌ Wrong click
    if (!pattern.includes(index)) {
      setStatus("lose");
      setMessage(`❌ Wrong tile! You reached level ${level}`);

      // ✅ Save score to backend
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

    // correct click
    const newClicks = [...userClicks, index];
    setUserClicks(newClicks);

    if (newClicks.length === pattern.length) {
      setStatus("win");
      setMessage("✅ Great memory! Click Next to continue...");
      setNextEnabled(false);
      if (nextEnableTimerRef.current) clearTimeout(nextEnableTimerRef.current);
      nextEnableTimerRef.current = setTimeout(() => setNextEnabled(true), 800);
    }
  };

  const handleRestart = () => {
    setUserClicks([]);
    setMessage("");
    setStatus("watch");
    setNextEnabled(false);
    if (playTimerRef.current) clearTimeout(playTimerRef.current);
    if (nextEnableTimerRef.current) clearTimeout(nextEnableTimerRef.current);
    generatePattern();
  };

  // cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  return (
    <div
      style={{
        textAlign: "center",
        padding: "2rem",
        backgroundColor: "#f8fafc",
        minHeight: "100vh",
        fontFamily: "Poppins, sans-serif",
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

      {/* Game Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 80px)",
          gap: "10px",
          justifyContent: "center",
          marginTop: "2rem",
        }}
      >
        {Array.from({ length: 16 }, (_, i) => (
          <div
            key={i}
            onClick={() => handleTileClick(i)}
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "10px",
              backgroundColor:
                showingIndex === i && status === "watch"
                  ? "gold"
                  : userClicks.includes(i)
                  ? "lightgreen"
                  : "#d1d5db",
              transition: "background-color 0.3s",
              cursor: status === "play" ? "pointer" : "not-allowed",
            }}
          />
        ))}
      </div>

      {status === "lose" && (
        <div style={{ marginTop: "20px" }}>
          <p style={{ fontSize: "1.1rem", margin: "8px 0" }}>
            Your score: {Math.max(0, level - 1)}
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            <button
              onClick={() => navigate("/home")}
              style={{
                padding: "10px 25px",
                background: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      )}

      {status === "win" && (
        <button
          onClick={() => {
            if (!nextEnabled) return;
            if (nextEnableTimerRef.current) clearTimeout(nextEnableTimerRef.current);
            setLevel((l) => l + 1);
            setStatus("watch");
            setMessage("");
            setNextEnabled(false);
          }}
          disabled={!nextEnabled}
          style={{
            marginTop: "20px",
            padding: "10px 25px",
            background: nextEnabled ? "#4caf50" : "#9e9e9e",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: nextEnabled ? "pointer" : "not-allowed",
            fontSize: "1rem",
            marginLeft: "10px",
            opacity: nextEnabled ? 1 : 0.7,
          }}
        >
          ▶️ Next Level
        </button>
      )}
    </div>
  );
}

