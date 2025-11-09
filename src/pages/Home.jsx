import { Link } from "react-router-dom";
import "./home.css";
import BestScores from "../components/BestScores";

export default function Home() {
  const games = [
    { name: "Reaction Time", icon: "⚡", desc: "Test your reflexes and reaction speed!", link: "/reaction" },
    { name: "Memory Test", icon: "🧩", desc: "Remember color and pattern sequences!", link: "/memory-test" },
    { name: "Number Memory", icon: "🔢", desc: "Memorize numbers that get longer each round!", link: "/number-memory" },
    { name: "Typing Speed", icon: "⌨️", desc: "Type as fast and accurately as you can!", link: "/typing" },
    { name: "Aim Trainer", icon: "🎯", desc: "Improve your precision and hand-eye coordination!", link: "/aim" },
    { name: "Verbal Memory", icon: "💬", desc: "Remember words as they appear. Train your recall!", link: "/verbal-memory" },
  ];

  return (
    <div className="brainstack-container">
      {/* Navigation Bar */}
      <nav className="navbar">
        <div className="nav-logo">🧠 BrainStack</div>
        <ul className="nav-links">
          <li><a href="#home">Home</a></li>
          <li><a href="#leaderboard">Leaderboard</a></li>
          <li><Link to="/results">Results</Link></li>
          <li><a href="#about">About</a></li>
        </ul>
      </nav>

      {/* Hero Section */}
      <header id="home" className="hero-section">
        <div className="logo-container">
          <div className="brain-logo">🧠</div>
        </div>
        <h1 className="main-title"><span className="title-text">BrainStack</span></h1>
        <p className="subtitle">
          Challenge your brain and track your improvement across fun cognitive games!
        </p>
      </header>

      {/* Games Section */}
      <section className="games-grid">
        {games.map((game, i) => (
          <div key={i} className="game-card">
            <div className="game-icon">{game.icon}</div>
            <h2 className="game-title">{game.name}</h2>
            <p className="game-description">{game.desc}</p>
            <Link to={game.link}>
              <button className="play-button">Play Now</button>
            </Link>
          </div>
        ))}
      </section>

      {/* Leaderboard Section */}
      <section id="leaderboard" className="leaderboard-section">
        <h2 className="section-heading">🏆 Leaderboard</h2>
        <p className="section-subtitle">Top scores across all BrainStack games</p>
        <div className="leaderboard-grid">
          <div className="leaderboard-card">
            <h3>Player 1</h3>
            <p>Reaction Time: <span>235ms</span></p>
          </div>
          <div className="leaderboard-card">
            <h3>Player 2</h3>
            <p>Typing Speed: <span>92 WPM</span></p>
          </div>
          <div className="leaderboard-card">
            <h3>Player 3</h3>
            <p>Aim Trainer: <span>87%</span></p>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section id="results" className="results-section">
        <h2 className="section-heading">📊 My Best Scores</h2>
        <p className="section-subtitle">Your personal records in each game</p>
        <BestScores />
        <div className="view-all-results">
          <Link to="/results" className="view-all-button">
            View All Results →
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <h2 className="section-heading">💡 About BrainStack</h2>
        <p className="about-text">
          BrainStack is a cognitive training platform designed to make mental exercise fun and engaging. 
          Play interactive games that enhance your memory, focus, and reflexes — and see your growth over time!
        </p>
        <div className="about-features">
          <div className="about-card">
            <div className="about-icon">🎮</div>
            <h3>Interactive Games</h3>
            <p>Play fun brain-training mini-games that improve focus, memory, and reaction.</p>
          </div>
          <div className="about-card">
            <div className="about-icon">📈</div>
            <h3>Track Progress</h3>
            <p>Monitor your scores and see how you improve over time with analytics.</p>
          </div>
          <div className="about-card">
            <div className="about-icon">🌍</div>
            <h3>Compete Globally</h3>
            <p>Compare scores with players worldwide on the global leaderboard.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>Made with ❤️ by BrainStack Team | © 2025</p>
      </footer>
    </div>
  );
}
