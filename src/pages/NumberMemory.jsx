import React, { useState, useEffect } from "react";

export default function NumberMemory() {
  const [number, setNumber] = useState("");
  const [input, setInput] = useState("");
  const [level, setLevel] = useState(1);
  const [phase, setPhase] = useState("show"); // show | recall | result
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(100);
  const [bestScore, setBestScore] = useState(
    localStorage.getItem("bestNumberMemory") || 0
  );

  // Generate a random number for each level
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

    // countdown progress bar
    const duration = 2000 + level * 500;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(pct);
      if (elapsed >= duration) clearInterval(timer);
    }, 50);

    // hide number after time
    const timeout = setTimeout(() => {
      setPhase("recall");
      setNumber("");
    }, duration);

    return () => {
      clearTimeout(timeout);
      clearInterval(timer);
    };
  }, [level]);

  useEffect(() => {
    if (phase === "show") {
      sessionStorage.setItem("lastNumber", number);
    }
  }, [number, phase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const correctNumber = sessionStorage.getItem("lastNumber");

    if (input === correctNumber) {
      setMessage("✅ Correct!");
      setBestScore((prev) => {
        const newBest = Math.max(prev, level);
        localStorage.setItem("bestNumberMemory", newBest);
        return newBest;
      });
      setPhase("result");
      // Previously we auto-advanced after 1s; remove automatic progression so
      // the user advances only when they click the Next Level button.
    } else {
      setMessage(`❌ Wrong! It was ${correctNumber}`);
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

  return (
    <div
      style={{
        textAlign: "center",
        padding: "2rem",
        minHeight: "100vh",
        background: "#f7f8fa",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h1>🔢 Number Memory</h1>
      <p>
        <b>Level:</b> {level} | <b>Best:</b> {bestScore}
      </p>

      {/* Progress Bar */}
      {phase === "show" && (
        <div
          style={{
            width: "300px",
            height: "10px",
            background: "#ddd",
            margin: "20px auto",
            borderRadius: "10px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "10px",
              width: `${progress}%`,
              background: "#4caf50",
              transition: "width 0.1s linear",
            }}
          />
        </div>
      )}

      {/* Number display */}
      {phase === "show" && (
        <>
          <p>Memorize this number:</p>
          <h2
            style={{
              fontSize: "2.2rem",
              letterSpacing: "3px",
              opacity: progress / 100,
              transition: "opacity 0.3s ease",
            }}
          >
            {number}
          </h2>
        </>
      )}

      {/* Recall phase */}
      {phase === "recall" && (
        <form onSubmit={handleSubmit}>
          <p>Enter the number you remember:</p>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{
              padding: "8px",
              fontSize: "1.2rem",
              textAlign: "center",
              borderRadius: "6px",
              border: "1px solid #aaa",
            }}
            autoFocus
          />
          <br />
          <button
            type="submit"
            style={{
              marginTop: "12px",
              padding: "10px 25px",
              background: "#4caf50",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Submit
          </button>
        </form>
      )}

      {/* Result phase */}
      {phase === "result" && (
        <>
          <h2>{message}</h2>
          <button
            onClick={() => {
              if (message.startsWith("✅")) setLevel((l) => l + 1);
              else handleRestart();
            }}
            style={{
              marginTop: "15px",
              padding: "10px 25px",
              background: message.startsWith("✅") ? "#4caf50" : "#ff5252",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            {message.startsWith("✅") ? "Next Level" : "Try Again"}
          </button>
        </>
      )}
    </div>
  );
}
