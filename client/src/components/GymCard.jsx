import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, MapPin, IndianRupee, ArrowRight, Heart } from "lucide-react";
import { FavoritesContext } from "../context/FavoritesContext";
import { AuthContext } from "../context/AuthContext";

const typeColors = {
  Gym: "from-blue-500/20 to-blue-600/20 text-blue-400 border-blue-500/30",
  MMA: "from-red-500/20 to-red-600/20 text-red-400 border-red-500/30",
  Boxing: "from-amber-500/20 to-amber-600/20 text-amber-400 border-amber-500/30",
  CrossFit: "from-green-500/20 to-green-600/20 text-green-400 border-green-500/30",
  Yoga: "from-purple-500/20 to-purple-600/20 text-purple-400 border-purple-500/30",
  Pilates: "from-pink-500/20 to-pink-600/20 text-pink-400 border-pink-500/30",
  Zumba: "from-orange-500/20 to-orange-600/20 text-orange-400 border-orange-500/30",
};

export default function GymCard({ gym, onCompare, isSelected, distance }) {
  const colorClass = typeColors[gym.type] || typeColors.Gym;
  const { favoriteIds, toggle } = useContext(FavoritesContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const isFav = favoriteIds.has(gym._id);
  const [animating, setAnimating] = useState(false);

  const handleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { navigate("/login"); return; }
    setAnimating(true);
    await toggle(gym._id);
    setTimeout(() => setAnimating(false), 400);
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden bg-navy-900/60 border border-white/5 hover:border-accent-500/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(249,115,22,0.08)]">
      {/* Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={gym.images?.[0] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"}
          alt={gym.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />

        {/* Type Badge */}
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r border ${colorClass}`}>
          {gym.type}
        </span>

        {/* Favorite Button */}
        <button
          onClick={handleFavorite}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isFav
              ? "bg-red-500 text-white shadow-lg shadow-red-500/30"
              : "bg-navy-900/70 text-navy-300 hover:bg-navy-800 hover:text-red-400"
          } ${animating ? "scale-125" : "scale-100"}`}
          title={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className={`w-4 h-4 transition-all ${isFav ? "fill-white" : ""}`} />
        </button>

        {/* Featured badge */}
        {gym.featured && (
          <span className="absolute bottom-3 left-3 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-accent-500 to-accent-600 text-white">
            ⭐ Featured
          </span>
        )}

        {/* Distance badge */}
        {distance != null && (
          <span className="absolute bottom-3 right-3 px-2 py-1 rounded-full text-xs font-semibold bg-navy-900/80 text-green-400 border border-green-500/30">
            📍 {distance < 1 ? `${Math.round(distance * 1000)}m` : `${distance.toFixed(1)} km`}
          </span>
        )}

        {/* Compare checkbox */}
        {onCompare && (
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCompare(gym); }}
            className={`absolute bottom-3 ${distance != null ? "left-20" : "right-3"} w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              isSelected ? "bg-accent-500 text-white" : "bg-navy-900/70 text-navy-300 hover:bg-navy-800 hover:text-white"
            }`}
            title={isSelected ? "Remove from compare" : "Add to compare"}
          >
            {isSelected ? "✓" : "+"}
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-white mb-1 group-hover:text-accent-400 transition-colors">
          {gym.name}
        </h3>

        <div className="flex items-center gap-1 text-sm text-navy-300 mb-3">
          <MapPin className="w-3.5 h-3.5 text-accent-500" />
          <span>{gym.location?.area}, Chennai</span>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-white">{gym.rating?.toFixed(1)}</span>
          </div>
          <span className="text-xs text-navy-400">({gym.reviewCount} reviews)</span>
        </div>

        {/* Price + CTA */}
        <div className="flex items-center justify-between pt-3 border-t border-white/5">
          <div className="flex items-center gap-1">
            <IndianRupee className="w-3.5 h-3.5 text-accent-400" />
            <span className="text-lg font-bold text-white">
              {gym.pricing?.monthly?.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-navy-400">/mo</span>
          </div>
          <Link
            to={`/gyms/${gym.slug}`}
            className="flex items-center gap-1 text-sm font-medium text-accent-400 hover:text-accent-300 transition-colors"
          >
            Details
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
