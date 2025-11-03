import React, { useEffect, useRef, useState } from "react";
import api from "../api/axios";

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
    <div style={{ padding: 20, fontFamily: "Poppins, sans-serif", textAlign: "center" }}>
      <h1>Verbal Memory</h1>
      <p>Memorize the words as they appear. After the sequence, select the words you remember from the grid.</p>

      {status === "idle" && (
        <div>
          <button onClick={startTest} style={{ padding: "10px 20px", fontSize: 16 }}>Start Test</button>
        </div>
      )}

      {status === "show" && (
        <div style={{ marginTop: 30 }}>
          <div style={{ fontSize: 36, fontWeight: 700, padding: "18px 28px", background: "#fff", display: "inline-block", borderRadius: 8, boxShadow: "0 6px 18px rgba(0,0,0,0.08)", color: "#111" }}>
            {displayIndex >= 0 && sequence[displayIndex] ? sequence[displayIndex] : ""}
          </div>
          <div style={{ marginTop: 12, color: "#111" }}>{displayIndex >= 0 ? `Word ${displayIndex + 1} of ${sequence.length}` : ""}</div>
        </div>
      )}

      {status === "recall" && (
        <div style={{ marginTop: 24 }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
            {gridWords.map((w) => {
              const isSelected = selected.includes(w);
              return (
                <div
                  key={w}
                  onClick={() => toggleSelect(w)}
                  style={{
                    padding: 12,
                    background: isSelected ? "#4caf50" : "#fff",
                    color: isSelected ? "#fff" : "#111",
                    borderRadius: 8,
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(0,0,0,0.06)",
                    userSelect: "none",
                  }}
                >
                  {w}
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 18 }}>
            <button onClick={finishRecall} style={{ padding: "8px 16px", marginRight: 8 }}>Done</button>
            <button onClick={handleRestart} style={{ padding: "8px 16px" }}>Cancel</button>
          </div>
        </div>
      )}

      {status === "result" && (
        <div style={{ marginTop: 24 }}>
          <h2>Results</h2>
          <p>You selected {selected.length} words — {correctCount} correct</p>
          <p>{savedMessage}</p>
          <div style={{ marginTop: 12 }}>
            <button onClick={handleRestart} style={{ padding: "8px 14px", marginRight: 8 }}>Play Again</button>
          </div>
        </div>
      )}
    </div>
  );
}
