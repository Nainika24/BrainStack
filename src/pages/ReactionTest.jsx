import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./ReactionTest.css";

export default function ReactionTest() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("waiting");
  const [message, setMessage] = useState("Click to start!");
  const [startTime, setStartTime] = useState(null);
  const [reactionTime, setReactionTime] = useState(null);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));

  useEffect(() => {
    const id = localStorage.getItem("userId");
    if (id && id !== userId) setUserId(id);
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

      if (!userId || !isValidObjectId(userId)) {
        setMessage(`Your reaction time: ${time} ms — Not saved.`);
        return;
      }

      try {
        await api.post("/scores/add", {
          userId,
          testType: "Reaction Time",
          score: time,
        });
        setMessage(`Your reaction time: ${time} ms — Saved!`);
        setSaved(true);
      } catch (err) {
        console.error("Error saving score:", err);
        setMessage(`Your reaction time: ${time} ms — Failed to save.`);
      }
    }
  };

  const background =
    status === "click"
      ? "#16a34a"
      : status === "ready"
      ? "#f97316"
      : "linear-gradient(135deg, #1a2332 0%, #2d3e50 100%)";

  return (
    <div className="reaction-container" onClick={handleClick} style={{ background }}>
      <div>
        <p className="reaction-message">{message}</p>
        {reactionTime && (
          <p className="reaction-status">Last reaction: {reactionTime} ms</p>
        )}
        {!saved && <p className="reaction-status">Click anywhere to play again</p>}
        {reactionTime && (
          <button 
            className="back-button" 
            onClick={(e) => {
              e.stopPropagation();
              navigate('/home');
            }}
          >
            Back to Home
          </button>
        )}
      </div>
    </div>
  );
}
