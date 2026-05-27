import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, X, Navigation, NavigationOff } from "lucide-react";
import { getGyms, getAreas } from "../api";
import GymCard from "../components/GymCard.jsx";
import LoadingSkeleton from "../components/LoadingSkeleton.jsx";

const types = ["All", "Gym", "MMA", "Boxing", "CrossFit", "Yoga", "Pilates", "Zumba"];
const sortOptions = [
  { value: "rating", label: "Top Rated" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name", label: "Name A-Z" },
];

// Haversine formula to calculate distance between two coordinates
function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Gyms() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [gyms, setGyms] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [compareList, setCompareList] = useState([]);

  // Nearby state
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyMode, setNearbyMode] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const activeType = searchParams.get("type") || "All";
  const activeArea = searchParams.get("area") || "";
  const activeSearch = searchParams.get("search") || "";
  const activeSort = searchParams.get("sort") || "rating";
  const activeMinPrice = searchParams.get("minPrice") || "";
  const activeMaxPrice = searchParams.get("maxPrice") || "";

  useEffect(() => {
    getAreas().then((res) => setAreas(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (activeType !== "All") params.type = activeType;
    if (activeArea) params.area = activeArea;
    if (activeSearch) params.search = activeSearch;
    if (activeSort) params.sort = activeSort;
    if (activeMinPrice) params.minPrice = activeMinPrice;
    if (activeMaxPrice) params.maxPrice = activeMaxPrice;

    getGyms(params)
      .then((res) => setGyms(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [activeType, activeArea, activeSearch, activeSort, activeMinPrice, activeMaxPrice]);

  const updateFilter = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value && value !== "All") {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    setSearchParams(params);
  };

  const clearFilters = () => setSearchParams({});

  const toggleCompare = (gym) => {
    setCompareList((prev) => {
      if (prev.find((g) => g._id === gym._id)) return prev.filter((g) => g._id !== gym._id);
      if (prev.length >= 3) return prev;
      return [...prev, gym];
    });
  };

  const handleNearbyToggle = () => {
    if (nearbyMode) {
      setNearbyMode(false);
      setUserLocation(null);
      setLocationError("");
      return;
    }

    setLocationLoading(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setNearbyMode(true);
        setLocationLoading(false);
      },
      (err) => {
        setLocationError("Location access denied. Please allow location in your browser.");
        setLocationLoading(false);
      },
      { timeout: 10000 }
    );
  };

  // Add distance to each gym and sort if in nearby mode
  const displayedGyms = nearbyMode && userLocation
    ? [...gyms]
        .map((gym) => ({
          ...gym,
          distance: getDistanceKm(
            userLocation.lat,
            userLocation.lng,
            gym.location.coordinates.lat,
            gym.location.coordinates.lng
          ),
        }))
        .sort((a, b) => a.distance - b.distance)
    : gyms;

  const hasFilters = activeType !== "All" || activeArea || activeSearch || activeMinPrice || activeMaxPrice;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-navy-900/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Explore <span className="text-accent-400">Gyms</span>
          </h1>
          <p className="text-navy-300">Find the perfect fitness facility in Chennai</p>

          {/* Search bar */}
          <div className="mt-6 flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <input
                type="text"
                value={activeSearch}
                onChange={(e) => updateFilter("search", e.target.value)}
                placeholder="Search gyms..."
                className="w-full bg-navy-900/60 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-navy-400 focus:outline-none focus:border-accent-500/50 transition-colors"
              />
            </div>

            {/* Near Me Button */}
            <button
              onClick={handleNearbyToggle}
              disabled={locationLoading}
              className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${
                nearbyMode
                  ? "bg-green-500/15 border-green-500/40 text-green-400"
                  : "border-white/10 text-navy-300 hover:border-green-500/30 hover:text-green-400"
              }`}
              title="Find gyms near your location"
            >
              {locationLoading ? (
                <div className="w-4 h-4 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
              ) : nearbyMode ? (
                <NavigationOff className="w-4 h-4" />
              ) : (
                <Navigation className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">{nearbyMode ? "Exit Near Me" : "Near Me"}</span>
            </button>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl border text-sm font-medium flex items-center gap-2 transition-all ${showFilters ? "bg-accent-500/15 border-accent-500/30 text-accent-400" : "border-white/10 text-navy-300 hover:border-white/20"}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Location error */}
          {locationError && (
            <p className="mt-2 text-xs text-red-400 flex items-center gap-1">
              <X className="w-3 h-3" /> {locationError}
            </p>
          )}

          {/* Nearby mode active banner */}
          {nearbyMode && userLocation && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-2">
              <Navigation className="w-4 h-4" />
              Showing gyms sorted by distance from your current location
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Type tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {types.map((type) => (
            <button
              key={type}
              onClick={() => updateFilter("type", type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeType === type ? "bg-accent-500 text-white" : "bg-navy-900/40 text-navy-300 border border-white/5 hover:border-white/10"}`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="glass rounded-2xl p-6 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-up">
            <div>
              <label className="block text-xs text-navy-400 mb-2 font-medium uppercase tracking-wider">Area</label>
              <select
                value={activeArea}
                onChange={(e) => updateFilter("area", e.target.value)}
                className="w-full bg-navy-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500/50"
              >
                <option value="">All Areas</option>
                {areas.map((area) => (<option key={area} value={area}>{area}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-navy-400 mb-2 font-medium uppercase tracking-wider">Price Range</label>
              <div className="flex gap-2">
                <input type="number" value={activeMinPrice} onChange={(e) => updateFilter("minPrice", e.target.value)} placeholder="Min ₹" className="w-1/2 bg-navy-800/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-accent-500/50" />
                <input type="number" value={activeMaxPrice} onChange={(e) => updateFilter("maxPrice", e.target.value)} placeholder="Max ₹" className="w-1/2 bg-navy-800/60 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-accent-500/50" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-navy-400 mb-2 font-medium uppercase tracking-wider">Sort By</label>
              <select
                value={activeSort}
                onChange={(e) => updateFilter("sort", e.target.value)}
                className="w-full bg-navy-800/60 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500/50"
                disabled={nearbyMode}
              >
                {sortOptions.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
              </select>
              {nearbyMode && <p className="text-xs text-navy-400 mt-1">Sorting by distance in Near Me mode</p>}
            </div>
          </div>
        )}

        {/* Active filters */}
        {hasFilters && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <span className="text-xs text-navy-400">Active:</span>
            {activeType !== "All" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-accent-500/10 text-accent-400 text-xs">
                {activeType}<button onClick={() => updateFilter("type", "All")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {activeArea && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs">
                {activeArea}<button onClick={() => updateFilter("area", "")}><X className="w-3 h-3" /></button>
              </span>
            )}
            {activeSearch && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/10 text-green-400 text-xs">
                &quot;{activeSearch}&quot;<button onClick={() => updateFilter("search", "")}><X className="w-3 h-3" /></button>
              </span>
            )}
            <button onClick={clearFilters} className="text-xs text-navy-400 hover:text-accent-400 transition-colors underline">Clear all</button>
          </div>
        )}

        {/* Results count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-navy-400">
            {loading ? "Loading..." : `${displayedGyms.length} gym${displayedGyms.length !== 1 ? "s" : ""} found`}
            {nearbyMode && " · sorted by distance"}
          </p>
        </div>

        {loading ? (
          <LoadingSkeleton count={6} />
        ) : displayedGyms.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-navy-800/50 flex items-center justify-center">
              <Search className="w-8 h-8 text-navy-500" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No gyms found</h3>
            <p className="text-sm text-navy-400 mb-4">Try adjusting your filters or search terms.</p>
            <button onClick={clearFilters} className="px-6 py-2.5 rounded-xl bg-accent-500 text-white text-sm font-medium hover:bg-accent-600 transition-colors">Clear Filters</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedGyms.map((gym) => (
              <GymCard
                key={gym._id}
                gym={gym}
                onCompare={toggleCompare}
                isSelected={!!compareList.find((g) => g._id === gym._id)}
                distance={nearbyMode ? gym.distance : null}
              />
            ))}
          </div>
        )}

        {/* Compare bar */}
        {compareList.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass rounded-2xl px-6 py-4 flex items-center gap-4 animate-fade-up">
            <span className="text-sm text-navy-200"><strong className="text-accent-400">{compareList.length}</strong>/3 selected</span>
            <div className="flex gap-2">
              {compareList.map((g) => (
                <span key={g._id} className="px-3 py-1 rounded-lg bg-accent-500/10 text-accent-400 text-xs font-medium">{g.name}</span>
              ))}
            </div>
            {compareList.length >= 2 && (
              <a href={`/compare?ids=${compareList.map((g) => g._id).join(",")}`} className="px-5 py-2 rounded-xl bg-accent-500 text-white text-sm font-semibold hover:bg-accent-600 transition-colors">Compare</a>
            )}
            <button onClick={() => setCompareList([])} className="text-navy-400 hover:text-white transition-colors"><X className="w-4 h-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}
