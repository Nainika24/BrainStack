import { useState, useEffect } from 'react';
import api from '../api/axios';
import './BestScores.css';

const GAME_ICONS = {
  "Reaction Time": "⚡",
  "Aim Trainer": "🎯",
  "Number Memory": "🔢",
  "Memory Test": "🎨",
  "Typing Test": "⌨️",
  "Verbal Memory": "📝"
};

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

export default function BestScores() {
  const [bestScores, setBestScores] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    async function fetchBestScores() {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const res = await api.get(`/scores/user/${userId}`);
        if (res.data && Array.isArray(res.data)) {
          // Group scores by test type and find the best for each
          const scores = res.data.reduce((acc, score) => {
            const { testType, score: value } = score;
            if (!acc[testType] || 
                (testType === "Reaction Time" ? value < acc[testType] : value > acc[testType])) {
              acc[testType] = value;
            }
            return acc;
          }, {});
          setBestScores(scores);
        }
      } catch (err) {
        console.error('Error fetching scores:', err);
        setError('Failed to load scores');
      } finally {
        setLoading(false);
      }
    }

    fetchBestScores();
  }, [userId]);

  if (loading) {
    return <div className="results-grid loading">Loading your scores...</div>;
  }

  if (error) {
    return <div className="results-grid error">{error}</div>;
  }

  if (!userId) {
    return <div className="results-grid">Log in to see your scores!</div>;
  }

  if (Object.keys(bestScores).length === 0) {
    return <div className="results-grid">Play some games to see your scores here!</div>;
  }

  return (
    <div className="results-grid">
      {Object.entries(GAME_ICONS).map(([game, icon]) => (
        <div key={game} className="results-card">
          <div className="results-card-header">
            <span className="game-icon">{icon}</span>
            <h4>{game}</h4>
          </div>
          {bestScores[game] ? (
            <p className="best-score">
              Best: <span>{formatScore(game, bestScores[game])}</span>
            </p>
          ) : (
            <p className="no-score">No attempts yet</p>
          )}
        </div>
      ))}
    </div>
  );
}