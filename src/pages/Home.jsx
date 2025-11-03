import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div
      style={{
        textAlign: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a, #1e293b)",
        color: "white",
        fontFamily: "Poppins, sans-serif",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "10px" }}>🧠 BrainStack</h1>
      <p style={{ fontSize: "1.3rem", marginBottom: "40px", color: "#cbd5e1" }}>
        Test your skills, improve your reflexes, and challenge your memory!
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "20px",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        {[
          { path: "/reaction", label: "⚡ Reaction Time" },
          { path: "/memory-test", label: "🧩 Memory Test" },
          { path: "/number-memory", label: "🔢 Number Memory" },
          { path: "/leaderboard", label: "🏆 Leaderboard" },
          { path: "/results", label: "📊 My Results" },
        ].map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              background: "#3b82f6",
              padding: "15px",
              borderRadius: "10px",
              color: "white",
              fontSize: "1.1rem",
              textDecoration: "none",
              transition: "all 0.3s ease",
              boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            }}
            onMouseOver={(e) => (e.target.style.background = "#2563eb")}
            onMouseOut={(e) => (e.target.style.background = "#3b82f6")}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
