import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./Leaderboard.css";

// Organize games into a grid layout
const GAME_TYPES = [
  {
    id: "Reaction Time",
    title: "Reaction Time",
    icon: "⚡",
    format: (score) => `${score} ms`,
    sortOrder: "asc",
    description: "Fastest response time"
  },
  {
    id: "Aim Trainer",
    title: "Aim Trainer",
    icon: "🎯",
    format: (score) => `${score} hits`,
    sortOrder: "desc",
    description: "Most targets hit"
  },
  {
    id: "Number Memory",
    title: "Number Memory",
    icon: "🔢",
    format: (score) => `Level ${score}`,
    sortOrder: "desc",
    description: "Highest level reached"
  },
  {
    id: "Memory Test",
    title: "Memory Test",
    icon: "🎨",
    format: (score) => `Level ${score}`,
    sortOrder: "desc",
    description: "Highest level reached"
  },
  {
    id: "Typing Test",
    title: "Typing Test",
    icon: "⌨️",
    format: (score) => `${score} WPM`,
    sortOrder: "desc",
    description: "Fastest typing speed"
  },
  {
    id: "Verbal Memory",
    title: "Verbal Memory",
    icon: "📝",
    format: (score) => `${score} words`,
    sortOrder: "desc",
    description: "Most words remembered"
  }
];

const GAMES = {
  "Reaction Time": {
    icon: "⚡",
    format: (score) => `${score} ms`,
    sortOrder: "asc" // lower is better
  },
  "Aim Trainer": {
    icon: "🎯",
    format: (score) => `${score} hits`,
    sortOrder: "desc" // higher is better
  },
  "Number Memory": {
    icon: "🔢",
    format: (score) => `Level ${score}`,
    sortOrder: "desc"
  },
  "Memory Test": {
    icon: "🎨",
    format: (score) => `Level ${score}`,
    sortOrder: "desc"
  },
  "Typing Test": {
    icon: "⌨️",
    format: (score) => `${score} WPM`,
    sortOrder: "desc"
  },
  "Verbal Memory": {
    icon: "📝",
    format: (score) => `${score} words`,
    sortOrder: "desc"
  }
};

export default function Leaderboard() {
  const [gameScores, setGameScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAllLeaderboards() {
      setLoading(true);
      setError(null);
      try {
        const promises = Object.keys(GAMES).map(game =>
          api.get(`/scores/leaderboard/${game}`)
            .then(res => ({ game, scores: res.data }))
        );
        
        const results = await Promise.all(promises);
        const scoresByGame = results.reduce((acc, { game, scores }) => {
          // Sort based on game's preferred order
          scores.sort((a, b) => {
            if (GAMES[game].sortOrder === "asc") {
              return a.score - b.score;
            }
            return b.score - a.score;
          });
          acc[game] = scores;
          return acc;
        }, {});
        
        setGameScores(scoresByGame);
      } catch (err) {
        console.error("Error fetching leaderboards:", err);
        setError("Failed to load leaderboard data");
      } finally {
        setLoading(false);
      }
    }

    fetchAllLeaderboards();
  }, []);

  if (loading) {
    return (
      <div className="leaderboard-container">
        <div className="loading-message">Loading leaderboards...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="leaderboard-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  return (
    <div className="leaderboard-container">
      <div className="leaderboard-content">
        <Link to="/home" className="nav-button">
          ← Back to Games
        </Link>

        <div className="leaderboard-header">
          <h1 className="leaderboard-title">🏆 Global Leaderboards</h1>
          <p className="leaderboard-subtitle">Top performers across all games</p>
        </div>

        <div className="leaderboard-grid">
          {GAME_TYPES.map(({ id, title, icon, format, description }) => {
            const scores = gameScores[id] || [];
            const topScore = scores[0];
            
            return (
              <div key={id} className="game-leaderboard">
                <div className="game-header">
                  <span className="game-icon">{icon}</span>
                  <div className="game-info">
                    <h2 className="game-title">{title}</h2>
                    <p className="game-description">{description}</p>
                  </div>
                </div>
                
                {/* Top Player Highlight */}
                {topScore && (
                  <div className="top-player">
                    <div className="crown">👑</div>
                    <div className="top-player-info">
                      <div className="top-player-name">
                        {topScore.userId?.name || "Anonymous"}
                      </div>
                      <div className="top-player-score">
                        {format(topScore.score)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Other Top Players */}
                <ul className="top-scores">
                  {scores.slice(1, 5).map((score, index) => (
                    <li key={score._id} className="score-item">
                      <div className={`rank rank-${index + 2}`}>{index + 2}</div>
                      <span className="player-name">
                        {score.userId?.name || "Anonymous"}
                      </span>
                      <span className="score-value">{format(score.score)}</span>
                    </li>
                  ))}
                  {scores.length === 0 && (
                    <li className="score-item no-scores">
                      <span className="player-name">No scores yet</span>
                      <span className="score-value">Be the first!</span>
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
