import Home from "./pages/Home";
import Login from "./pages/Login";
import Lost from "./pages/Lost";
import Signup from "./pages/Signup";
import Found from "./pages/Found";
import LostItemDetail from "./pages/LostItemDetail";
import FoundItemDetail from "./pages/FoundItemDetail";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/found" element={<Found />} />
          <Route path="/found/:id" element={<FoundItemDetail />} />
          <Route path="/lost" element={<Lost />} />
          <Route path="/lost/:id" element={<LostItemDetail />} />
        </Routes>

        <Footer />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;