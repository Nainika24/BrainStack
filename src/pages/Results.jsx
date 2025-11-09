import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./Results.css";

const GAME_ICONS = {
  "Reaction Time": "⚡",
  "Aim Trainer": "🎯",
  "Number Memory": "🔢",
  "Memory Test": "🎨",
  "Typing Test": "⌨️",
  "Verbal Memory": "📝",
};

export default function Results() {
  const navigate = useNavigate();
  const [scores, setScores] = useState([]);
  const [selectedGame, setSelectedGame] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    async function fetchScores() {
      setLoading(true);
      setError(null);
      
      if (!userId) {
        navigate('/'); // Redirect to login if not logged in
        return;
      }

      try {
        const res = await api.get(`/scores/user/${userId}`);
        if (res.data && Array.isArray(res.data)) {
          // Sort scores by date, newest first
          const sortedScores = res.data.sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          );
          setScores(sortedScores);
        } else {
          setError("Invalid data received from server");
        }
      } catch (err) {
        console.error("Error fetching scores:", err);
        setError(err.response?.data?.message || "Failed to load scores");
      } finally {
        setLoading(false);
      }
    }
    fetchScores();
  }, [userId, navigate]);

  const formatScore = (testType, score) => {
    switch (testType) {
      case "Reaction Time":
        return `${score} ms`;
      case "Aim Trainer":
        return `${score} hits`;
      case "Number Memory":
        return `Level ${score}`;
      case "Memory Test":
        return `Level ${score}`;
      case "Typing Test":
        return `${score} WPM`;
      case "Verbal Memory":
        return `${score} words`;
      default:
        return score;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const filteredScores = selectedGame === "All" 
    ? scores 
    : scores.filter(s => s.testType === selectedGame);

  const uniqueGameTypes = ["All", ...new Set(scores.map(s => s.testType))];

  return (
    <div className="results-container">
      <nav className="results-nav">
        <button className="nav-button" onClick={() => navigate('/home')}>
          ← Back to Games
        </button>
      </nav>
      <div className="results-content">
        <h1 className="results-title">My Game Results</h1>

        <div className="filter-buttons">
          {uniqueGameTypes.map(game => (
            <button
              key={game}
              className={`filter-button ${selectedGame === game ? 'active' : ''}`}
              onClick={() => setSelectedGame(game)}
            >
              {game === "All" ? "All Games" : `${GAME_ICONS[game]} ${game}`}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="results-empty">
            Loading your scores...
          </div>
        ) : error ? (
          <div className="results-empty error">
            {error}
          </div>
        ) : scores.length === 0 ? (
          <div className="results-empty">
            No scores yet — go play some games! 🎮
          </div>
        ) : (
          <table className="results-table">
            <thead>
              <tr>
                <th>Game</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredScores.map((s) => {
                const { date, time } = formatDate(s.date);
                return (
                  <tr key={s._id}>
                    <td>
                      <span className="game-icon">{GAME_ICONS[s.testType]}</span>
                      {" "}{s.testType}
                    </td>
                    <td>
                      <span className="score-badge">
                        {formatScore(s.testType, s.score)}
                      </span>
                    </td>
                    <td className="date-cell">
                      {date}
                      <br />
                      <small>{time}</small>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
