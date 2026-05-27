import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Star, MapPin, IndianRupee, ArrowRight } from "lucide-react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getGyms } from "../api";

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const createCustomIcon = (type) => {
  const colors = {
    Gym: "#3b82f6",
    MMA: "#ef4444",
    Boxing: "#f59e0b",
    CrossFit: "#22c55e",
    Yoga: "#a855f7",
  };
  const color = colors[type] || "#f97316";

  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background:${color};width:32px;height:32px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="transform:rotate(45deg);color:white;font-size:12px;font-weight:bold;">${type[0]}</span></div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export default function MapView() {
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("All");

  useEffect(() => {
    getGyms({})
      .then((res) => setGyms(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const types = ["All", "Gym", "MMA", "Boxing", "CrossFit", "Yoga"];
  const filtered = activeType === "All" ? gyms : gyms.filter((g) => g.type === activeType);
  const chennaiCenter = [13.0827, 80.2707];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="bg-navy-900/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-2">
            Map <span className="text-accent-400">View</span>
          </h1>
          <p className="text-navy-300">Explore gym locations across Chennai</p>
          <div className="flex flex-wrap gap-2 mt-4">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeType === type ? "bg-accent-500 text-white" : "bg-navy-900/40 text-navy-300 border border-white/5 hover:border-white/10"}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 h-[600px] rounded-2xl overflow-hidden border border-white/10">
            <MapContainer center={chennaiCenter} zoom={12} style={{ height: "100%", width: "100%" }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
              />
              {filtered.map((gym) => (
                <Marker
                  key={gym._id}
                  position={[gym.location?.coordinates?.lat, gym.location?.coordinates?.lng]}
                  icon={createCustomIcon(gym.type)}
                >
                  <Popup>
                    <div style={{ minWidth: 200, color: "#1e3355", fontFamily: "Inter, sans-serif" }}>
                      <img src={gym.images?.[0]} alt={gym.name} style={{ width: "100%", height: 100, objectFit: "cover", borderRadius: 8, marginBottom: 8 }} />
                      <h3 style={{ fontWeight: 700, fontSize: 14, margin: "0 0 4px" }}>{gym.name}</h3>
                      <p style={{ fontSize: 12, color: "#5473a3", margin: "0 0 4px" }}>{gym.location?.area} · {gym.type}</p>
                      <p style={{ fontSize: 12, margin: "0 0 4px" }}>⭐ {gym.rating?.toFixed(1)} · ₹{gym.pricing?.monthly?.toLocaleString("en-IN")}/mo</p>
                      <a href={`/gyms/${gym.slug}`} style={{ color: "#f97316", fontSize: 12, fontWeight: 600, textDecoration: "none" }}>View Details →</a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Sidebar list */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            <p className="text-sm text-navy-400 mb-2">{filtered.length} locations</p>
            {filtered.map((gym) => (
              <Link
                key={gym._id}
                to={`/gyms/${gym.slug}`}
                className="block p-4 rounded-xl bg-navy-900/40 border border-white/5 hover:border-accent-500/30 transition-all group"
              >
                <div className="flex gap-3">
                  <img src={gym.images?.[0]} alt="" className="w-16 h-16 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-white group-hover:text-accent-400 transition-colors truncate">{gym.name}</h3>
                    <p className="text-xs text-navy-400 flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3" />{gym.location?.area}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-navy-300 flex items-center gap-0.5"><Star className="w-3 h-3 text-amber-400 fill-amber-400" />{gym.rating?.toFixed(1)}</span>
                      <span className="text-xs text-accent-400 font-semibold">₹{gym.pricing?.monthly?.toLocaleString("en-IN")}/mo</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
