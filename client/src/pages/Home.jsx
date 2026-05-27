import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Dumbbell, Swords, Target, Flame, Sparkles, MapPin, TrendingUp, ArrowRight, Star, Users, Shield } from "lucide-react";
import { getGyms } from "../api";
import GymCard from "../components/GymCard.jsx";

const categories = [
  { name: "Gym", icon: Dumbbell, color: "from-blue-500 to-blue-600", desc: "Strength & fitness" },
  { name: "MMA", icon: Swords, color: "from-red-500 to-red-600", desc: "Mixed martial arts" },
  { name: "Boxing", icon: Target, color: "from-amber-500 to-amber-600", desc: "Boxing training" },
  { name: "CrossFit", icon: Flame, color: "from-green-500 to-green-600", desc: "High-intensity" },
  { name: "Yoga", icon: Sparkles, color: "from-purple-500 to-purple-600", desc: "Mind & body" },
];

const stats = [
  { icon: Dumbbell, value: "10+", label: "Gyms Listed" },
  { icon: MapPin, value: "8+", label: "Areas Covered" },
  { icon: Users, value: "5K+", label: "Happy Members" },
  { icon: Star, value: "4.5", label: "Avg Rating" },
];

export default function Home() {
  const [search, setSearch] = useState("");
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getGyms({ sort: "rating" })
      .then((res) => setFeatured(res.data.filter((g) => g.featured).slice(0, 4)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/gyms?search=${encodeURIComponent(search.trim())}`);
  };

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80" alt="Gym" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-navy-950 via-navy-950/95 to-navy-950/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-transparent to-navy-950/50" />
        </div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-accent-500/10 rounded-full blur-[120px]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-light mb-6 animate-fade-up">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-sm text-navy-200">Chennai&apos;s #1 Gym Discovery Platform</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[1.1] mb-6 animate-fade-up stagger-1">
              Find Your<br />
              <span className="bg-gradient-to-r from-accent-400 via-accent-500 to-accent-600 bg-clip-text text-transparent">Perfect Gym</span><br />
              in Chennai
            </h1>

            <p className="text-lg text-navy-300 leading-relaxed mb-8 max-w-lg animate-fade-up stagger-2">
              Discover top-rated gyms, MMA centers, boxing academies, and yoga studios near you. Compare prices, read reviews, and find your fitness home.
            </p>

            <form onSubmit={handleSearch} className="animate-fade-up stagger-3">
              <div className="relative max-w-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-accent-500/20 to-blue-500/20 rounded-2xl blur-xl" />
                <div className="relative flex items-center glass rounded-2xl p-1.5">
                  <MapPin className="w-5 h-5 text-accent-400 ml-4 shrink-0" />
                  <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search gyms, areas, or types..." className="flex-1 bg-transparent px-4 py-3 text-white placeholder-navy-400 focus:outline-none text-sm" />
                  <button type="submit" className="shrink-0 bg-gradient-to-r from-accent-500 to-accent-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:from-accent-600 hover:to-accent-700 transition-all active:scale-95 flex items-center gap-2">
                    <Search className="w-4 h-4" />Search
                  </button>
                </div>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap gap-2 animate-fade-up stagger-4">
              <span className="text-xs text-navy-400">Popular:</span>
              {["Anna Nagar", "T. Nagar", "Adyar", "OMR"].map((area) => (
                <Link key={area} to={`/gyms?area=${encodeURIComponent(area)}`} className="text-xs px-3 py-1.5 rounded-full border border-white/10 text-navy-300 hover:text-accent-400 hover:border-accent-500/30 transition-all">{area}</Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="relative -mt-12 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass rounded-2xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map(({ icon: Icon, value, label }, i) => (
              <div key={i} className="text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-accent-500/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-accent-400" />
                </div>
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-navy-400">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Explore by <span className="text-accent-400">Category</span></h2>
            <p className="text-navy-300 max-w-md mx-auto">From strength training to martial arts — find exactly what suits your fitness goals.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {categories.map(({ name, icon: Icon, color, desc }) => (
              <Link key={name} to={`/gyms?type=${name}`} className="group relative p-6 rounded-2xl bg-navy-900/40 border border-white/5 hover:border-accent-500/30 transition-all duration-300 hover:-translate-y-1 text-center">
                <div className={`w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="font-bold text-white mb-0.5">{name}</h3>
                <p className="text-xs text-navy-400">{desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      <section className="py-20 bg-navy-900/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 text-accent-400 text-sm font-medium mb-2"><TrendingUp className="w-4 h-4" />Top Picks</div>
              <h2 className="text-3xl sm:text-4xl font-bold">Featured <span className="text-accent-400">Gyms</span></h2>
            </div>
            <Link to="/gyms" className="hidden sm:flex items-center gap-1 text-sm font-medium text-accent-400 hover:text-accent-300 transition-colors">View All<ArrowRight className="w-4 h-4" /></Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1,2,3,4].map((i) => (<div key={i} className="rounded-2xl overflow-hidden bg-navy-900/60 border border-white/5"><div className="h-48 animate-shimmer" /><div className="p-5 space-y-3"><div className="h-5 w-3/4 rounded animate-shimmer" /><div className="h-4 w-1/2 rounded animate-shimmer" /></div></div>))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((gym) => (<GymCard key={gym._id} gym={gym} />))}
            </div>
          )}
        </div>
      </section>

      {/* Why Fitverse */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-3">Why <span className="text-accent-400">Fitverse</span>?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Search, title: "Smart Search", desc: "Filter by location, price, type, and rating to find exactly what you need." },
              { icon: TrendingUp, title: "Compare Side-by-Side", desc: "Select up to 3 gyms and compare prices, amenities, and ratings in one view." },
              { icon: Shield, title: "Verified Reviews", desc: "Real reviews from real members help you make informed decisions." },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="p-8 rounded-2xl bg-navy-900/40 border border-white/5 hover:border-accent-500/20 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-accent-500/10 flex items-center justify-center mb-4 group-hover:bg-accent-500/20 transition-colors">
                  <Icon className="w-6 h-6 text-accent-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-navy-300 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-accent-600 to-accent-500" />
            <div className="relative p-12 md:p-16 text-center">
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to Start Your Fitness Journey?</h2>
              <p className="text-accent-100 mb-8 max-w-lg mx-auto">Explore the best fitness facilities in Chennai and find the perfect match for your goals.</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/gyms" className="px-8 py-3.5 rounded-xl bg-white text-accent-600 font-bold text-sm hover:bg-navy-50 transition-colors inline-flex items-center justify-center gap-2">Browse Gyms<ArrowRight className="w-4 h-4" /></Link>
                <Link to="/map" className="px-8 py-3.5 rounded-xl border-2 border-white/30 text-white font-bold text-sm hover:bg-white/10 transition-colors inline-flex items-center justify-center gap-2"><MapPin className="w-4 h-4" />View on Map</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
