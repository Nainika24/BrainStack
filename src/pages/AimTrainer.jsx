import React, { useState, useEffect, useRef } from "react";
import api from "../api/axios";
import "./AimTrainer.css";

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
    const x = Math.random() * (rect.width - size);
    const y = Math.random() * (rect.height - size);
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
    const userId = localStorage.getItem("userId");
    if (!userId || !/^[0-9a-fA-F]{24}$/.test(userId)) {
      setSavedMessage("Not logged in — score not saved.");
      return;
    }

    try {
      await api.post("/scores/add", {
        userId,
        testType: "Aim Trainer",
        score: hits,
      });
      setSavedMessage("✅ Score saved!");
    } catch {
      setSavedMessage("❌ Failed to save.");
    }
  };

  const handleClick = (e) => {
    if (!running) return;
    const cont = containerRef.current.getBoundingClientRect();
    const clickX = e.clientX - cont.left;
    const clickY = e.clientY - cont.top;
    const centerX = targetPos.x + 20;
    const centerY = targetPos.y + 20;
    const dist = Math.hypot(clickX - centerX, clickY - centerY);

    if (dist <= 25) {
      setHits((h) => h + 1);
      spawnTarget();
    } else {
      setMisses((m) => m + 1);
    }
  };

  return (
    <div className="aim-container">
      <h1>🎯 Aim Trainer</h1>
      <p className="aim-description">
        Click the target as quickly and accurately as you can before the timer
        runs out.
      </p>

      <div className="aim-stats">
        <div className="aim-stat-card">
          <strong>Time Left</strong>
          <span>{timeLeft}s</span>
        </div>
        <div className="aim-stat-card">
          <strong>Hits</strong>
          <span>{hits}</span>
        </div>
        <div className="aim-stat-card">
          <strong>Misses</strong>
          <span>{misses}</span>
        </div>
      </div>

      <div className="aim-buttons">
        <button onClick={start} disabled={running} className="aim-btn">
          Start
        </button>
        <button
          onClick={stop}
          disabled={!running}
          className="aim-btn secondary"
        >
          Stop
        </button>
      </div>

      <div className="aim-area" ref={containerRef} onClick={handleClick}>
        {running && (
          <div
            className="target"
            style={{ left: targetPos.x, top: targetPos.y }}
          />
        )}
      </div>

      {savedMessage && <p className="aim-feedback">{savedMessage}</p>}
    </div>
  );
}
