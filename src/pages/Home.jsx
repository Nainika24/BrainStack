import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Human Benchmark</h1>
      <p>Test your skills and track your performance!</p>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px", marginTop: "30px", flexWrap: "wrap" }}>
        <Link to="/reaction">Reaction Time</Link>
        <Link to="/typing">Typing Test</Link>
        <Link to="/aim">Aim Trainer</Link>
  <Link to="/verbal-memory">Verbal Memory</Link>
        <Link to="/memory-test">Memory Test</Link>
        <Link to="/number-memory">Number Memory</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        <Link to="/results">My Results</Link>
      </div>
    </div>
  );
}
