import { useEffect, useState } from "react";
import api from "../api/axios";

export default function Results() {
  const [scores, setScores] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    async function fetchScores() {
      try {
        if (!userId) {
          // Don't call the API when userId is missing — avoid /user/undefined
          setScores([]);
          return;
        }
        const res = await api.get(`/scores/user/${userId}`);
        setScores(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    fetchScores();
  }, [userId]);

  return (
    <div style={{ maxWidth: "600px", margin: "50px auto", textAlign: "center" }}>
      <h2>My Test Results</h2>
      {scores.length === 0 ? (
        <p>No scores yet — go play a test!</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Test</th>
              <th>Score</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {scores.map((s) => (
              <tr key={s._id}>
                <td>{s.testType}</td>
                <td>{s.score}</td>
                <td>{new Date(s.date).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
