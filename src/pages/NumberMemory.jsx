import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./NumberMemory.css"; // ✅ Import the CSS file

export default function NumberMemory() {
  const navigate = useNavigate();
  const [number, setNumber] = useState("");
  const [input, setInput] = useState("");
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState("show"); // show | recall | result
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(100);
  const [bestScore, setBestScore] = useState(
    localStorage.getItem("bestNumberMemory") || 0
  );

  // Generate number by digits = level
  const generateNumber = (len) => {
    return Math.floor(
      Math.random() * Math.pow(10, len - 1) + Math.pow(10, len - 1)
    ).toString();
  };

  useEffect(() => {
    const newNumber = generateNumber(level);
    setNumber(newNumber);
    setPhase("show");
    setMessage("");
    setInput("");
    setProgress(100);

    // Timer for number show phase
    const duration = 2000 + level * 500;
    const start = Date.now();

    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (elapsed >= duration) clearInterval(timer);
    }, 60);

    // Hide number after timer
    const timeout = setTimeout(() => {
      setPhase("recall");
      setNumber("");
    }, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(timeout);
    };
  }, [level]);

  useEffect(() => {
    if (phase === "show") {
      sessionStorage.setItem("lastNumber", number);
    }
  }, [number, phase]);

  useEffect(() => {
    const prevBackground = document.body.style.background;
    const prevColor = document.body.style.color;
    document.body.style.background =
      "linear-gradient(135deg, #1a2332 0%, #2d3e50 100%)";
    document.body.style.color = "#f8fafc";
    return () => {
      document.body.style.background = prevBackground;
      document.body.style.color = prevColor;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const correct = sessionStorage.getItem("lastNumber");

    if (input === correct) {
      setMessage("✅ Correct!");

      // Update best score
      setBestScore((prev) => {
        const newBest = Math.max(prev, level);
        localStorage.setItem("bestNumberMemory", newBest);
        return newBest;
      });

      setPhase("result");
    } else {
      setMessage(`❌ Wrong! It was ${correct}`);
      setPhase("result");

      // Save score to backend
      const userId = localStorage.getItem("userId");
      if (userId) {
        await fetch("http://localhost:5000/api/scores/add", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            testType: "Number Memory",
            score: level - 1,
          }),
        });
      }
    }
  };

  const handleRestart = () => {
    setLevel(1);
    setPhase("show");
  };

  // ✅ For display fallback
  const displayNumber =
    number || sessionStorage.getItem("lastNumber") || "—";

  return (
    <div
      className="number-container"
      style={{
        background: "linear-gradient(135deg, #1a2332 0%, #2d3e50 100%)",
        color: "#f8fafc",
      }}
    >
      <h1 className="number-title">🔢 Number Memory</h1>
      <p className="number-info">
        Level: <b>{level}</b> | Best: <b>{bestScore}</b>
      </p>

      <div
        className="number-card"
        style={{
          background: "rgba(15, 23, 42, 0.6)",
          boxShadow: "0 18px 42px rgba(2, 6, 23, 0.45)",
        }}
      >
        {/* ✅ SHOW PHASE */}
        {phase === "show" && (
          <>
            {/* Progress Bar */}
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>

            <p>Memorize this number:</p>
            <h2 className="number-display">{displayNumber}</h2>
          </>
        )}

        {/* ✅ RECALL PHASE */}
        {phase === "recall" && (
          <form onSubmit={handleSubmit}>
            <p>Enter the number you remember:</p>

            <input
              type="text"
              className="number-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              autoFocus
            />

            <button type="submit" className="number-btn">
              Submit
            </button>
          </form>
        )}

        {/* ✅ RESULT PHASE */}
        {phase === "result" && (
          <>
            <h2 className="result-message">{message}</h2>

            <div className="number-actions">
              <button
                className={`number-btn ${
                  message.startsWith("✅") ? "" : "try-btn"
                }`}
                onClick={() => {
                  if (message.startsWith("✅")) {
                    setLevel(level + 1);
                  } else {
                    handleRestart();
                  }
                }}
              >
                {message.startsWith("✅") ? "Next Level" : "Try Again"}
              </button>
              <button
                className="number-btn back-btn"
                onClick={() => navigate('/home')}
              >
                Back to Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
