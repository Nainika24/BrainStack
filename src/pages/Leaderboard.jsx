import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Leaderboard() {
  const [scores, setScores] = useState([]);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await api.get("/scores/leaderboard/Reaction Time");
        setScores(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchLeaderboard();
  }, []);

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", textAlign: "center" }}>
      <h2>Leaderboard – Reaction Time</h2>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Score (ms)</th>
          </tr>
        </thead>
        <tbody>
          {scores.map((s, index) => (
            <tr key={index}>
              <td>{s.userId?.name || "Unknown"}</td>
              <td>{s.score}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
