import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Star, MapPin, IndianRupee, Check, X, ArrowLeft } from "lucide-react";
import { compareGyms, getGyms } from "../api";
import StarRating from "../components/StarRating.jsx";

export default function Compare() {
  const [searchParams] = useSearchParams();
  const [gyms, setGyms] = useState([]);
  const [allGyms, setAllGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showSelector, setShowSelector] = useState(false);

  // Load from URL params
  useEffect(() => {
    const ids = searchParams.get("ids");
    if (ids) {
      const idArr = ids.split(",");
      setSelectedIds(idArr);
      compareGyms(idArr)
        .then((res) => setGyms(res.data))
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  // Load all gyms for selector
  useEffect(() => {
    getGyms({}).then((res) => setAllGyms(res.data)).catch(console.error);
  }, []);

  const addGym = (id) => {
    if (selectedIds.length >= 3 || selectedIds.includes(id)) return;
    const newIds = [...selectedIds, id];
    setSelectedIds(newIds);
    compareGyms(newIds).then((res) => setGyms(res.data)).catch(console.error);
    setShowSelector(false);
  };

  const removeGym = (id) => {
    const newIds = selectedIds.filter((i) => i !== id);
    setSelectedIds(newIds);
    if (newIds.length >= 2) {
      compareGyms(newIds).then((res) => setGyms(res.data)).catch(console.error);
    } else {
      setGyms(gyms.filter((g) => g._id !== id));
    }
  };

  const allAmenities = [...new Set(gyms.flatMap((g) => g.amenities || []))].sort();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="bg-navy-900/30 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/gyms" className="inline-flex items-center gap-2 text-sm text-navy-300 hover:text-accent-400 transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />Back to Gyms
          </Link>
          <h1 className="text-3xl sm:text-4xl font-bold">Compare <span className="text-accent-400">Gyms</span></h1>
          <p className="text-navy-300 mt-1">Select up to 3 gyms to compare side-by-side</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {gyms.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg font-bold text-white mb-2">No gyms selected</h3>
            <p className="text-sm text-navy-400 mb-6">Select gyms from the listings page or add them below.</p>
            <button onClick={() => setShowSelector(true)} className="px-6 py-3 rounded-xl bg-accent-500 text-white font-semibold text-sm hover:bg-accent-600 transition-colors">Add Gyms to Compare</button>
          </div>
        ) : (
          <>
            {/* Add more button */}
            {selectedIds.length < 3 && (
              <div className="mb-6 flex justify-end">
                <button onClick={() => setShowSelector(true)} className="px-4 py-2 rounded-xl bg-accent-500/10 text-accent-400 text-sm font-medium hover:bg-accent-500/20 transition-colors border border-accent-500/20">+ Add Gym</button>
              </div>
            )}

            {/* Comparison table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="text-left p-4 text-sm text-navy-400 font-medium w-40"></th>
                    {gyms.map((gym) => (
                      <th key={gym._id} className="p-4 text-center min-w-[250px]">
                        <div className="glass rounded-2xl p-4 relative">
                          <button onClick={() => removeGym(gym._id)} className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-colors"><X className="w-3 h-3" /></button>
                          <img src={gym.images?.[0]} alt={gym.name} className="w-full h-32 object-cover rounded-xl mb-3" />
                          <h3 className="font-bold text-white text-lg">{gym.name}</h3>
                          <span className="text-xs text-accent-400">{gym.type}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-white/5">
                    <td className="p-4 text-sm text-navy-400 font-medium">Rating</td>
                    {gyms.map((g) => (
                      <td key={g._id} className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <StarRating rating={g.rating} size="sm" />
                          <span className="font-bold text-white">{g.rating?.toFixed(1)}</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-white/5 bg-navy-900/20">
                    <td className="p-4 text-sm text-navy-400 font-medium">Location</td>
                    {gyms.map((g) => (
                      <td key={g._id} className="p-4 text-center">
                        <span className="flex items-center justify-center gap-1 text-sm text-navy-200"><MapPin className="w-3.5 h-3.5 text-accent-400" />{g.location?.area}</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="p-4 text-sm text-navy-400 font-medium">Monthly</td>
                    {gyms.map((g) => (
                      <td key={g._id} className="p-4 text-center">
                        <span className="flex items-center justify-center gap-1 text-lg font-bold text-white"><IndianRupee className="w-4 h-4 text-accent-400" />{g.pricing?.monthly?.toLocaleString("en-IN")}</span>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-t border-white/5 bg-navy-900/20">
                    <td className="p-4 text-sm text-navy-400 font-medium">Quarterly</td>
                    {gyms.map((g) => (
                      <td key={g._id} className="p-4 text-center text-sm text-navy-200">{g.pricing?.quarterly ? `₹${g.pricing.quarterly.toLocaleString("en-IN")}` : "—"}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="p-4 text-sm text-navy-400 font-medium">Yearly</td>
                    {gyms.map((g) => (
                      <td key={g._id} className="p-4 text-center text-sm text-navy-200">{g.pricing?.yearly ? `₹${g.pricing.yearly.toLocaleString("en-IN")}` : "—"}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-white/5 bg-navy-900/20">
                    <td className="p-4 text-sm text-navy-400 font-medium">Timings</td>
                    {gyms.map((g) => (
                      <td key={g._id} className="p-4 text-center text-sm text-navy-200">{g.timings}</td>
                    ))}
                  </tr>
                  <tr className="border-t border-white/5">
                    <td className="p-4 text-sm text-navy-400 font-medium">Reviews</td>
                    {gyms.map((g) => (
                      <td key={g._id} className="p-4 text-center text-sm text-navy-200">{g.reviewCount} reviews</td>
                    ))}
                  </tr>
                  {/* Amenities rows */}
                  {allAmenities.map((amenity, i) => (
                    <tr key={amenity} className={`border-t border-white/5 ${i % 2 ? "bg-navy-900/20" : ""}`}>
                      <td className="p-4 text-sm text-navy-400 font-medium">{amenity}</td>
                      {gyms.map((g) => (
                        <td key={g._id} className="p-4 text-center">
                          {g.amenities?.includes(amenity) ? <Check className="w-5 h-5 text-green-400 mx-auto" /> : <X className="w-4 h-4 text-navy-600 mx-auto" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* Gym selector modal */}
        {showSelector && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/80 backdrop-blur-sm" onClick={() => setShowSelector(false)}>
            <div className="glass rounded-2xl p-6 max-w-md w-full mx-4 max-h-[70vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Select a Gym</h3>
                <button onClick={() => setShowSelector(false)} className="text-navy-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-2">
                {allGyms.filter((g) => !selectedIds.includes(g._id)).map((gym) => (
                  <button key={gym._id} onClick={() => addGym(gym._id)} className="w-full p-3 rounded-xl bg-navy-800/30 border border-white/5 hover:border-accent-500/30 transition-all text-left flex items-center gap-3">
                    <img src={gym.images?.[0]} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <p className="text-sm font-medium text-white">{gym.name}</p>
                      <p className="text-xs text-navy-400">{gym.location?.area} · {gym.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
