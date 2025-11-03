import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";

export default function AimTrainer() {
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [savedMessage, setSavedMessage] = useState("");
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  const spawnTarget = () => {
    const cont = containerRef.current;
    if (!cont) return;
    const rect = cont.getBoundingClientRect();
    const size = 40;
    const x = Math.max(10, Math.random() * (rect.width - size));
    const y = Math.max(10, Math.random() * (rect.height - size));
    setTargetPos({ x, y });
  };

  useEffect(() => {
    if (running) spawnTarget();
  }, [running]);

  useEffect(() => {
    if (!running) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          stop();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [running]);

  const start = () => {
    setHits(0);
    setMisses(0);
    setTimeLeft(20);
    setSavedMessage("");
    setRunning(true);
  };

  const stop = async () => {
    setRunning(false);
    // Save hits as score
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setSavedMessage("Not logged in — score not saved.");
      return;
    }
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      setSavedMessage("Invalid user ID — score not saved.");
      return;
    }
    try {
      await api.post("/scores/add", {
        userId,
        testType: "Aim Trainer",
        score: hits,
      });
      setSavedMessage("Score saved to leaderboard!");
    } catch (err) {
      console.error("Error saving aim score:", err);
      setSavedMessage("Failed to save score.");
    }
  };

  const handleContainerClick = (e) => {
    // if click inside target area count hit else miss
    const cont = containerRef.current;
    if (!cont) return;
    const rect = cont.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;
    const tx = targetPos.x + 20; // center
    const ty = targetPos.y + 20;
    const dist = Math.hypot(clickX - tx, clickY - ty);
    if (dist <= 25 && running) {
      setHits((h) => h + 1);
      spawnTarget();
    } else if (running) {
      setMisses((m) => m + 1);
    }
  };

  return (
    <div style={{ padding: 20, textAlign: "center", fontFamily: "Poppins, sans-serif" }}>
      <h1>Aim Trainer</h1>
      <p>Click the targets as they appear. Test length: 20 seconds.</p>

      <div style={{ margin: "12px auto" }}>
        <button onClick={start} disabled={running} style={{ marginRight: 8, padding: "8px 12px" }}>
          Start
        </button>
        <button onClick={stop} disabled={!running} style={{ padding: "8px 12px" }}>
          Stop
        </button>
      </div>

      <div style={{ marginTop: 12 }}>Time left: {timeLeft}s</div>
      <div style={{ marginTop: 8 }}>Hits: {hits} — Misses: {misses}</div>

      <div
        ref={containerRef}
        onClick={handleContainerClick}
        style={{
          width: "80%",
          height: 360,
          margin: "16px auto",
          border: "2px solid #ddd",
          position: "relative",
          background: "#f9f9f9",
        }}
      >
        {running && (
          <div
            style={{
              position: "absolute",
              left: targetPos.x,
              top: targetPos.y,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "#ff5252",
              boxShadow: "0 0 6px rgba(0,0,0,0.2)",
            }}
          />
        )}
      </div>

      {savedMessage && (
        <div style={{ marginTop: 12 }}>{savedMessage}</div>
      )}
    </div>
  );
}
