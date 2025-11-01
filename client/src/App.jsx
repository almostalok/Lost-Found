import Home from "./pages/Home";
import Login from "./pages/Login";
import Lost from "./pages/Lost";
import Signup from "./pages/Signup";
import Found from "./pages/Found";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/found" element={<Found />} />
        <Route path="/lost" element={<Lost />} />
      </Routes>

      <Footer />
    </BrowserRouter>
  );
};

export default App