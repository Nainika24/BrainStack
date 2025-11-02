import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import ReactionTest from "./pages/ReactionTest";
import Results from "./pages/Results";
import Leaderboard from "./pages/Leaderboard";
import NumberMemory from "./pages/NumberMemory";
import MemoryTest from "./pages/MemoryTest";







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
        <Route path="/results" element={<Results />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
