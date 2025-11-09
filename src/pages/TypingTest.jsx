import React, { useState, useRef } from "react";
import api from "../api/axios";
import "./TypingTest.css";

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.`;

export default function TypingTest() {
  const [started, setStarted] = useState(false);
  const DURATION = 10;
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [text, setText] = useState("");
  const [wpm, setWpm] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");
  const timerRef = useRef(null);

  const isValidObjectId = (id) => /^[0-9a-fA-F]{24}$/.test(id);

  const startTest = () => {
    setStarted(true);
    setText("");
    setWpm(null);
    setAccuracy(null);
    setSavedMessage("");
    setTimeLeft(DURATION);

    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          finishTest();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const finishTest = async () => {
    setStarted(false);
    const totalChars = text.length;
    const correctChars = Array.from(text).filter(
      (ch, i) => ch === SAMPLE_TEXT[i]
    ).length;
    const minutes = DURATION / 60;
    const wordsTyped = totalChars / 5;
    const calcWpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
    const calcAcc =
      totalChars === 0 ? 0 : Math.round((correctChars / totalChars) * 100);
    setWpm(calcWpm);
    setAccuracy(calcAcc);

    const userId = localStorage.getItem("userId");
    if (!userId || !isValidObjectId(userId)) {
      setSavedMessage("Not logged in — score not saved.");
      return;
    }

    try {
      await api.post("/scores/add", {
        userId,
        testType: "Typing Test",
        score: calcWpm,
      });
      setSavedMessage("✅ Score saved!");
    } catch (err) {
      console.error("Save failed:", err);
      setSavedMessage("❌ Failed to save.");
    }
  };

  return (
    <div className="typing-container">
      <h1>⌨️ Typing Test</h1>
      <p>Type the text below as quickly and accurately as you can.</p>

      <div className="text-box">
        <p>{SAMPLE_TEXT}</p>
      </div>

      <button
        onClick={startTest}
        disabled={started}
        className="typing-button"
      >
        {started ? "Running..." : "Start Test"}
      </button>

      <p>⏱️ Time left: {timeLeft}s</p>

      <textarea
        className="typing-textarea"
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={!started}
        placeholder="Start typing..."
      />

      {wpm !== null && (
        <div>
          <h3>Results</h3>
          <p>WPM: {wpm}</p>
          <p>Accuracy: {accuracy}%</p>
          <p>{savedMessage}</p>
        </div>
      )}
    </div>
  );
}
