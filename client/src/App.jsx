import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Tag, X } from "lucide-react";
import Navbar from "./components/Navbar.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Gyms from "./pages/Gyms.jsx";
import GymDetail from "./pages/GymDetail.jsx";
import Compare from "./pages/Compare.jsx";
import MapView from "./pages/MapView.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Favorites from "./pages/Favorites.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import Admin from "./pages/Admin.jsx";

function App() {
  const [showOffer, setShowOffer] = useState(false);

  useEffect(() => {
    const isFirstTime = !localStorage.getItem("fitverse_visited");
    if (isFirstTime) {
      setShowOffer(true);
    }
  }, []);

  const closeOffer = () => {
    setShowOffer(false);
    localStorage.setItem("fitverse_visited", "true");
  };

  return (
    <div className="min-h-screen flex flex-col">
      {showOffer && (
        <div className="bg-gradient-to-r from-accent-500 to-accent-600 px-4 py-2 flex items-center justify-between text-white shadow-md relative z-50">
          <div className="flex items-center gap-2 mx-auto">
            <Tag className="w-4 h-4 animate-pulse" />
            <span className="text-sm font-medium tracking-wide">
              Welcome! Get <span className="font-bold">20% OFF</span> your first membership with code <span className="bg-white/20 px-2 py-0.5 rounded font-mono font-bold">FIRST20</span>
            </span>
          </div>
          <button onClick={closeOffer} className="p-1 hover:bg-white/20 rounded transition-colors" aria-label="Close offer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gyms" element={<Gyms />} />
          <Route path="/gyms/:slug" element={<GymDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/admin" element={<Admin />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
