import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ReactionTest from "./pages/ReactionTest";
import Results from "./pages/Results";
import Leaderboard from "./pages/Leaderboard";
import NumberMemory from "./pages/NumberMemory";
import MemoryTest from "./pages/MemoryTest";
import TypingTest from "./pages/TypingTest";
import AimTrainer from "./pages/AimTrainer";
import VerbalMemory from "./pages/VerbalMemory";








function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/reaction" element={<ReactionTest />} />
        <Route path="/memory-test" element={<MemoryTest />} />
        <Route path="/number-memory" element={<NumberMemory />} />
  <Route path="/typing" element={<TypingTest />} />
  <Route path="/aim" element={<AimTrainer />} />
        <Route path="/verbal-memory" element={<VerbalMemory />} />
        <Route path="/results" element={<Results />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
