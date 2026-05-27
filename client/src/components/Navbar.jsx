import { useState, useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Dumbbell, Menu, X, LogOut, Heart, Calendar, Shield } from "lucide-react";
import { AuthContext } from "../context/AuthContext.jsx";
import { FavoritesContext } from "../context/FavoritesContext.jsx";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/gyms", label: "Gyms" },
  { to: "/compare", label: "Compare" },
  { to: "/map", label: "Map" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const { favoriteIds } = useContext(FavoritesContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setShowProfileMenu(false);
    navigate("/");
  };

  return (
    <nav className="glass sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-accent-400 to-accent-600 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
              <Dumbbell className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Fit<span className="text-accent-400">verse</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-accent-500/15 text-accent-400"
                      : "text-navy-200 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            
            {/* Favorites link */}
            <NavLink
              to="/favorites"
              className={({ isActive }) =>
                `relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                  isActive ? "bg-red-500/15 text-red-400" : "text-navy-200 hover:text-red-400 hover:bg-white/5"
                }`
              }
            >
              <Heart className="w-4 h-4" />
              <span>Saved</span>
              {favoriteIds.size > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {favoriteIds.size}
                </span>
              )}
            </NavLink>
            
            {/* Auth Section Desktop */}
            <div className="ml-4 pl-4 border-l border-white/10 flex items-center gap-3">
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-navy-800/50 border border-white/5 hover:bg-navy-800 transition-colors"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-white">{user.name.split(' ')[0]}</span>
                  </button>
                  
                  {/* Dropdown */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-navy-800 border border-white/10 shadow-xl overflow-hidden animate-fade-up">
                      <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                        <p className="text-sm font-medium text-white">{user.name}</p>
                        <p className="text-xs text-navy-300 truncate">{user.email}</p>
                      </div>
                      <div className="p-1">
                        {user.role === "admin" && (
                          <Link to="/admin" onClick={() => setShowProfileMenu(false)} className="w-full text-left px-3 py-2 text-sm text-navy-200 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2 transition-colors">
                            <Shield className="w-4 h-4 text-accent-400" /> Admin Panel
                          </Link>
                        )}
                        <Link to="/bookings" onClick={() => setShowProfileMenu(false)} className="w-full text-left px-3 py-2 text-sm text-navy-200 hover:text-white hover:bg-white/5 rounded-lg flex items-center gap-2 transition-colors">
                          <Calendar className="w-4 h-4 text-accent-400" /> My Bookings
                        </Link>
                        <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg flex items-center gap-2 transition-colors">
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-navy-200 hover:text-white transition-colors">Login</Link>
                  <Link to="/register" className="px-4 py-2 bg-accent-500 hover:bg-accent-600 text-white text-sm font-bold rounded-lg transition-colors">Sign Up</Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg text-navy-200 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-white/5 animate-fade-up">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === "/"}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-accent-500/15 text-accent-400"
                      : "text-navy-200 hover:text-white hover:bg-white/5"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
          
          {/* Auth Section Mobile */}
          <div className="px-4 py-4 border-t border-white/5 bg-white/5">
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 px-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-sm font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{user.name}</p>
                    <p className="text-xs text-navy-300">{user.email}</p>
                  </div>
                </div>
                 {user.role === "admin" && (
                   <Link to="/admin" onClick={() => setIsOpen(false)} className="w-full px-4 py-2.5 text-sm font-medium text-navy-200 hover:text-white bg-white/5 rounded-lg flex items-center justify-center gap-2 transition-all">
                     <Shield className="w-4 h-4 text-accent-400" /> Admin Panel
                   </Link>
                 )}
                 <Link to="/bookings" onClick={() => setIsOpen(false)} className="w-full px-4 py-2.5 text-sm font-medium text-navy-200 hover:text-white bg-white/5 rounded-lg flex items-center justify-center gap-2 transition-all">
                  <Calendar className="w-4 h-4 text-accent-400" /> My Bookings
                </Link>
                <button onClick={() => { handleLogout(); setIsOpen(false); }} className="w-full px-4 py-2.5 text-sm font-medium text-red-400 bg-red-500/10 rounded-lg flex items-center justify-center gap-2">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link to="/login" onClick={() => setIsOpen(false)} className="px-4 py-2.5 rounded-lg text-sm font-medium text-center text-white bg-white/10 hover:bg-white/20">Login</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="px-4 py-2.5 rounded-lg text-sm font-bold text-center text-white bg-accent-500 hover:bg-accent-600">Sign Up</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
