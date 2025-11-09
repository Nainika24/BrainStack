import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios";
import "./VerbalMemory.css";

const WORD_BANK = [
  "apple","banana","orange","table","chair","window","river","mountain","dog","cat",
  "house","car","book","phone","computer","garden","flower","sun","moon","star",
  "bread","butter","cheese","milk","coffee","tea","shoe","sock","shirt","pants",
  "key","door","lamp","clock","glass","plate","knife","spoon","fork","tree",
  "road","bridge","train","plane","boat","island","ocean","cloud","rain","snow",
  "music","song","dance","movie","actor","artist","storm","wind","fire","earth"
];

function shuffle(a) {
  return a.slice().sort(() => Math.random() - 0.5);
}

export default function VerbalMemory() {
  const [status, setStatus] = useState("idle"); // idle | show | recall | result
  const [sequence, setSequence] = useState([]);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [gridWords, setGridWords] = useState([]);
  const [selected, setSelected] = useState([]);
  const [correctCount, setCorrectCount] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");
  const timersRef = useRef([]);

  const SEQ_LEN = 10; // number of words to remember
  const GRID_SIZE = 25; // total candidate words shown in recall

  useEffect(() => {
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, []);

  const startTest = () => {
    // pick unique sequence
    const shuffled = shuffle(WORD_BANK);
    const seq = shuffled.slice(0, SEQ_LEN);
    setSequence(seq);
    setDisplayIndex(0);
    setStatus("show");
    setSelected([]);
    setCorrectCount(null);
    setSavedMessage("");

    // schedule showing each word
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    seq.forEach((w, i) => {
      const t = setTimeout(() => setDisplayIndex(i), i * 900);
      timersRef.current.push(t);
    });

    // after the last word, move to recall
    const endT = setTimeout(() => {
      setDisplayIndex(-1);
      setStatus("recall");
      prepareGrid(seq);
    }, seq.length * 900 + 300);
    timersRef.current.push(endT);
  };

  const prepareGrid = (seq) => {
    const remaining = WORD_BANK.filter((w) => !seq.includes(w));
    const distractors = shuffle(remaining).slice(0, GRID_SIZE - seq.length);
    const words = shuffle(seq.concat(distractors));
    setGridWords(words);
  };

  const toggleSelect = (word) => {
    if (status !== "recall") return;
    setSelected((s) => {
      if (s.includes(word)) return s.filter((x) => x !== word);
      return [...s, word];
    });
  };

  const finishRecall = async () => {
    const correct = selected.filter((w) => sequence.includes(w)).length;
    setCorrectCount(correct);
    setStatus("result");

    // save to backend
    const userId = localStorage.getItem("userId");
    if (!userId) {
      setSavedMessage("Not logged in — score not saved.");
      return;
    }
    if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
      setSavedMessage("Invalid user id — score not saved.");
      return;
    }

    try {
      await api.post("/scores/add", {
        userId,
        testType: "Verbal Memory",
        score: correct,
      });
      setSavedMessage("Saved to leaderboard!");
    } catch (err) {
      console.error("Failed to save verbal memory score:", err);
      setSavedMessage("Failed to save score.");
    }
  };

  const handleRestart = () => {
    setStatus("idle");
    setSequence([]);
    setGridWords([]);
    setSelected([]);
    setCorrectCount(null);
    setSavedMessage("");
  };

  return (
    <div className="verbal-container">
      <h1>Verbal Memory</h1>
      <p className="verbal-text">
        Memorize the words as they appear. After the sequence, select the words you remember from the grid.
      </p>

      {status === "idle" && (
        <div className="verbal-actions">
          <button className="verbal-btn" onClick={startTest}>
            Start Test
          </button>
        </div>
      )}

      {status === "show" && (
        <div className="verbal-stage">
          <div className="verbal-display-card">
            {displayIndex >= 0 && sequence[displayIndex] ? sequence[displayIndex] : ""}
          </div>
          <div className="verbal-status">
            {displayIndex >= 0 ? `Word ${displayIndex + 1} of ${sequence.length}` : ""}
          </div>
        </div>
      )}

      {status === "recall" && (
        <div className="verbal-stage">
          <div className="verbal-word-grid">
            {gridWords.map((w) => {
              const isSelected = selected.includes(w);
              return (
                <div
                  key={w}
                  className={`verbal-word ${isSelected ? "selected" : ""}`}
                  onClick={() => toggleSelect(w)}
                >
                  {w}
                </div>
              );
            })}
          </div>
          <div className="verbal-actions">
            <button className="verbal-btn success" onClick={finishRecall}>
              Done
            </button>
            <button className="verbal-btn secondary" onClick={handleRestart}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {status === "result" && (
        <div className="verbal-stage">
          <h2>Results</h2>
          <p className="verbal-status">
            You selected {selected.length} words — {correctCount} correct
          </p>
          <p
            className={`verbal-message ${
              savedMessage.includes("Saved") ? "success" : savedMessage.includes("Failed") ? "error" : ""
            }`}
          >
            {savedMessage}
          </p>
          <div className="verbal-actions">
            <button className="verbal-btn" onClick={handleRestart}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
