import React, { useState, useRef } from "react";
import api from "../api/axios";

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.`;

export default function TypingTest() {
  const [started, setStarted] = useState(false);
  const DURATION = 10; // seconds (changed from 60)
  const [timeLeft, setTimeLeft] = useState(DURATION); // seconds
  const [text, setText] = useState("");
  const [wpm, setWpm] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");
  const timerRef = useRef(null);

  const isValidObjectId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

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
    // compute WPM and accuracy
    const totalChars = text.length;
    const correctChars = Array.from(text).filter((ch, i) => ch === SAMPLE_TEXT[i]).length;
    const minutes = DURATION / 60; // convert test duration to minutes
    const wordsTyped = totalChars / 5;
    const calcWpm = minutes > 0 ? Math.round(wordsTyped / minutes) : 0;
    const calcAcc = totalChars === 0 ? 0 : Math.round((correctChars / totalChars) * 100);
    setWpm(calcWpm);
    setAccuracy(calcAcc);

    // attempt to save
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setSavedMessage("Not logged in — score not saved.");
      return;
    }
    if (!isValidObjectId(userId)) {
      setSavedMessage("Invalid user ID — score not saved.");
      return;
    }

    try {
      await api.post("/scores/add", {
        userId,
        testType: "Typing Test",
        score: calcWpm,
      });
      setSavedMessage("Score saved to leaderboard!");
    } catch (err) {
      console.error("Failed to save typing score:", err);
      setSavedMessage("Failed to save score.");
    }
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Poppins, sans-serif", textAlign: "center" }}>
  <h1>Typing Test</h1>
  <p>Type the text below as quickly and accurately as you can. Test length: 10 seconds.</p>

      <div style={{ maxWidth: 800, margin: "1rem auto", textAlign: "left", background: "#fff", padding: "1rem", borderRadius: 8, color: "#111" }}>
        <p style={{ margin: 0 }}>{SAMPLE_TEXT}</p>
      </div>

      <div>
        <button
          onClick={startTest}
          disabled={started}
          style={{ padding: "8px 16px", marginBottom: 12, background: started ? "#ddd" : "#4caf50", color: started ? "#333" : "#fff" }}
        >
          {started ? "Running..." : "Start 10s Test"}
        </button>
      </div>

      <div>
        <div style={{ marginBottom: 8 }}>Time left: {timeLeft}s</div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={!started}
          placeholder={started ? "Start typing..." : "Click start to begin"}
          style={{ width: "90%", height: 150, fontSize: 16, padding: 8, background: started ? "#fff" : "#f3f3f3", color: "#111", borderRadius: 6 }}
        />
      </div>

      {wpm !== null && (
        <div style={{ marginTop: 16 }}>
          <h3>Results</h3>
          <p>WPM: {wpm}</p>
          <p>Accuracy: {accuracy}%</p>
          <p>{savedMessage}</p>
        </div>
      )}
    </div>
  );
}
