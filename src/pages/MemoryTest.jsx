import React, { useState, useEffect } from "react";

export default function MemoryTest() {
  const [grid, setGrid] = useState([]);
  const [pattern, setPattern] = useState([]);
  const [userClicks, setUserClicks] = useState([]);
  const [level, setLevel] = useState(1);
  const [status, setStatus] = useState("watch"); // "watch", "play", "win", "lose"
  const [message, setMessage] = useState("");
  const [showingIndex, setShowingIndex] = useState(-1);
  const timersRef = React.useRef([]);

  useEffect(() => {
    generatePattern();
  }, [level]);

  const generatePattern = () => {
    const patternLength = level + 2;
    const newPattern = Array.from(
      { length: patternLength },
      () => Math.floor(Math.random() * 16)
    );
    setPattern(newPattern);
    setUserClicks([]);
    setStatus("watch");
    setMessage("");
    setShowingIndex(-1);

    // clear any previous timers
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];

    // sequentially flash each index in the pattern
    const displayDelay = 800; // ms per item
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
  };

  const handleTileClick = async (index) => {
    if (status !== "play") return;

    const newClicks = [...userClicks, index];
    setUserClicks(newClicks);

    // ❌ Wrong click
    if (index !== pattern[newClicks.length - 1]) {
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

    // ✅ Completed pattern correctly
    if (newClicks.length === pattern.length) {
      setStatus("win");
      setMessage("✅ Great memory! Next level...");
      setTimeout(() => setLevel((lvl) => lvl + 1), 1000);
    }
  };

  const handleRestart = () => {
    setLevel(1);
    setStatus("watch");
    setMessage("");
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

      {/* Restart Button */}
      {status === "lose" && (
        <button
          onClick={handleRestart}
          style={{
            marginTop: "20px",
            padding: "10px 25px",
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          🔁 Try Again
        </button>
      )}
    </div>
  );
}
