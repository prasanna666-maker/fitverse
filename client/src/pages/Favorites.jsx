import { useContext } from "react";
import { Link } from "react-router-dom";
import { Heart, ArrowRight } from "lucide-react";
import { FavoritesContext } from "../context/FavoritesContext";
import { AuthContext } from "../context/AuthContext";
import GymCard from "../components/GymCard";

export default function Favorites() {
  const { user } = useContext(AuthContext);
  const { favorites } = useContext(FavoritesContext);

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-red-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Sign In to See Favorites</h2>
        <p className="text-navy-300 mb-6 max-w-sm">
          Create an account or log in to save your favorite gyms and access them anywhere.
        </p>
        <div className="flex gap-3">
          <Link to="/login" className="px-6 py-2.5 rounded-xl bg-white/10 text-white font-medium hover:bg-white/20 transition-colors">
            Login
          </Link>
          <Link to="/register" className="px-6 py-2.5 rounded-xl bg-accent-500 text-white font-bold hover:bg-accent-600 transition-colors">
            Sign Up Free
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
            <Heart className="w-6 h-6 text-red-400 fill-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">My Favorites</h1>
            <p className="text-navy-300 text-sm">{favorites.length} saved gym{favorites.length !== 1 ? "s" : ""}</p>
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-24 h-24 rounded-full bg-navy-800/50 border border-white/5 flex items-center justify-center mx-auto mb-6">
              <Heart className="w-12 h-12 text-navy-600" />
            </div>
            <h2 className="text-xl font-bold text-white mb-3">No favorites yet</h2>
            <p className="text-navy-300 mb-6">
              Browse gyms and tap the ❤️ button to save your favorites here.
            </p>
            <Link
              to="/gyms"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent-500 text-white font-bold hover:bg-accent-600 transition-colors"
            >
              Explore Gyms <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((gym) => (
              <GymCard key={gym._id} gym={gym} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
