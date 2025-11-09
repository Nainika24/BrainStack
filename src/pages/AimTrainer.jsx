import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./AimTrainer.css";

export default function AimTrainer() {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(20);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [savedMessage, setSavedMessage] = useState("");
  const containerRef = useRef(null);
  const timerRef = useRef(null);

  const spawnTarget = () => {
    const cont = containerRef.current;
    if (!cont) return;
    const rect = cont.getBoundingClientRect();
    const size = 40;
    
    // Calculate movement range based on time left
    // As time decreases, the range of possible positions increases
    const speedMultiplier = Math.min(2, 1 + (20 - timeLeft) / 10); // Increases up to 2x speed
    const effectiveWidth = rect.width - size;
    const effectiveHeight = rect.height - size;
    
    let x = Math.random() * effectiveWidth;
    let y = Math.random() * effectiveHeight;
    
    // Optional: Add some bias towards the edges as speed increases
    if (Math.random() < (speedMultiplier - 1) / 2) {
      x = Math.random() < 0.5 ? 0 : effectiveWidth;
    }
    if (Math.random() < (speedMultiplier - 1) / 2) {
      y = Math.random() < 0.5 ? 0 : effectiveHeight;
    }
    
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
    setGameOver(false);
  };

  const stop = async () => {
    setRunning(false);
    setGameOver(true);
    clearInterval(timerRef.current);
    
    // Check if game ended due to misses
    if (misses >= 3) {
      setSavedMessage(`Game Over! You missed 3 times. Final score: ${hits} hits`);
      return;
    }
    
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
      setMisses((m) => {
        const newMisses = m + 1;
        if (newMisses >= 3) {
          stop();
        }
        return newMisses;
      });
    }
  };

  return (
    <div className="aim-container">
      <h1>🎯 Aim Trainer</h1>
      <p className="aim-description">
        Click the targets as quickly and accurately as you can. You have 20 seconds, but the game ends if you miss 3 times.
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
      {gameOver && (
        <button 
          onClick={() => navigate('/home')} 
          className="aim-btn back-home"
        >
          Back to Home
        </button>
      )}
    </div>
  );
}
