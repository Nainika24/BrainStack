import { useState, useEffect } from "react";
import api from "../api/axios";

export default function ReactionTest() {
  const [status, setStatus] = useState("waiting");
  const [message, setMessage] = useState("Click to start!");
  const [startTime, setStartTime] = useState(null);
  const [reactionTime, setReactionTime] = useState(null);
  const [saved, setSaved] = useState(false);
  // read userId once from localStorage; kept in state so tests during session can react
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));

  useEffect(() => {
    // keep userId in sync if something else updates localStorage while app is open
    const id = localStorage.getItem("userId");
    if (id && id !== userId) setUserId(id);
    // intentionally no dependency on userId to run once on mount
  }, []);

  const isValidObjectId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

  const startGame = () => {
    setStatus("ready");
    setMessage("Wait for green...");
    setReactionTime(null);
    setSaved(false);

    const randomDelay = Math.floor(Math.random() * 4000) + 1000;
    setTimeout(() => {
      setStatus("click");
      setMessage("Click now!");
      setStartTime(Date.now());
    }, randomDelay);
  };

  const handleClick = async () => {
    if (status === "waiting") {
      startGame();
    } else if (status === "ready") {
      setMessage("Too soon! Try again.");
      setStatus("waiting");
    } else if (status === "click") {
      const time = Date.now() - startTime;
      setReactionTime(time);
      setStatus("waiting");

      // Only attempt to save if we have a valid userId
      if (!userId) {
        setMessage(`Your reaction time: ${time} ms — Not logged in, score not saved.`);
        setSaved(false);
        return;
      }
      if (!isValidObjectId(userId)) {
        setMessage(`Your reaction time: ${time} ms — Invalid user ID, score not saved.`);
        console.error("Invalid userId:", userId);
        setSaved(false);
        return;
      }

      try {
        await api.post("/scores/add", {
          userId,
          testType: "Reaction Time",
          score: time,
        });
        setMessage(`Your reaction time: ${time} ms — Saved to leaderboard!`);
        setSaved(true);
      } catch (err) {
        console.error("Error saving score:", err);
        setMessage(`Your reaction time: ${time} ms — Failed to save score.`);
        setSaved(false);
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: status === "click" ? "green" : "red",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "24px",
        cursor: "pointer",
        transition: "background-color 0.3s",
      }}
    >
      <div>
        <p>{message}</p>
      </div>
    </div>
  );
}
