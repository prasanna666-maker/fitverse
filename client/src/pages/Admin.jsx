import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";
import { useNavigate } from "react-router-dom";
import { 
  Users, Dumbbell, Shield, UserX, CheckCircle2, XCircle, 
  Star, Plus, Trash2, ShieldAlert, Check, Flame, MapPin 
} from "lucide-react";
import { 
  adminGetUsers, adminUpdateUserRole, adminDeleteUser,
  adminGetGyms, adminCreateGym, adminToggleApproveGym, 
  adminToggleFeaturedGym, adminDeleteGym 
} from "../api";

export default function Admin() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("gyms");
  const [usersList, setUsersList] = useState([]);
  const [gymsList, setGymsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for creating a new gym
  const [showAddGymModal, setShowAddGymModal] = useState(false);
  const [newGymForm, setNewGymForm] = useState({
    name: "",
    type: "Gym",
    description: "",
    area: "",
    address: "",
    lat: 13.0827,
    lng: 80.2707,
    monthly: "",
    quarterly: "",
    yearly: "",
    timings: "6:00 AM - 10:00 PM",
    phone: "",
    featured: false,
    approved: true,
    amenitiesInput: "",
    imagesInput: "",
  });

  const [submittingGym, setSubmittingGym] = useState(false);

  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersRes, gymsRes] = await Promise.all([
        adminGetUsers(),
        adminGetGyms()
      ]);
      setUsersList(usersRes.data);
      setGymsList(gymsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminUpdateUserRole(userId, newRole);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to update role");
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;
    try {
      await adminDeleteUser(userId);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete user");
    }
  };

  const handleToggleApprove = async (gymId) => {
    try {
      await adminToggleApproveGym(gymId);
      fetchData();
    } catch (err) {
      alert("Failed to toggle approval");
    }
  };

  const handleToggleFeatured = async (gymId) => {
    try {
      await adminToggleFeaturedGym(gymId);
      fetchData();
    } catch (err) {
      alert("Failed to toggle featured status");
    }
  };

  const handleDeleteGym = async (gymId) => {
    if (!confirm("Are you sure you want to delete this gym?")) return;
    try {
      await adminDeleteGym(gymId);
      fetchData();
    } catch (err) {
      alert("Failed to delete gym");
    }
  };

  const handleCreateGymSubmit = async (e) => {
    e.preventDefault();
    setSubmittingGym(true);
    try {
      const amenities = newGymForm.amenitiesInput
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0);
      const images = newGymForm.imagesInput
        .split(",")
        .map((i) => i.trim())
        .filter((i) => i.length > 0);

      await adminCreateGym({
        ...newGymForm,
        amenities,
        images,
      });

      setShowAddGymModal(false);
      setNewGymForm({
        name: "",
        type: "Gym",
        description: "",
        area: "",
        address: "",
        lat: 13.0827,
        lng: 80.2707,
        monthly: "",
        quarterly: "",
        yearly: "",
        timings: "6:00 AM - 10:00 PM",
        phone: "",
        featured: false,
        approved: true,
        amenitiesInput: "",
        imagesInput: "",
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to create gym");
    }
    setSubmittingGym(false);
  };

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen text-white bg-navy-950 pb-16">
      {/* Header banner */}
      <div className="bg-gradient-to-r from-accent-600/20 via-navy-900 to-navy-950 border-b border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-accent-500/10 border border-accent-500/20 rounded-2xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-accent-400" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Admin Dashboard</h1>
              <p className="text-navy-300 text-sm mt-1">Full control over Fitverse gyms, reservations, and users</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-500/15 text-accent-400 border border-accent-500/30">System Operator</span>
            <span className="text-sm text-navy-400">Chennai Platform</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        {/* Navigation Tabs */}
        <div className="flex border-b border-white/5 gap-2 mb-8">
          <button 
            onClick={() => setActiveTab("gyms")} 
            className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${activeTab === "gyms" ? "border-accent-500 text-accent-400 bg-white/5" : "border-transparent text-navy-400 hover:text-white"}`}
          >
            <Dumbbell className="w-4 h-4" /> Gyms Management ({gymsList.length})
          </button>
          <button 
            onClick={() => setActiveTab("users")} 
            className={`px-5 py-3 font-semibold text-sm rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${activeTab === "users" ? "border-accent-500 text-accent-400 bg-white/5" : "border-transparent text-navy-400 hover:text-white"}`}
          >
            <Users className="w-4 h-4" /> Users Directory ({usersList.length})
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : activeTab === "gyms" ? (
          <div className="space-y-6">
            {/* Gym Control Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Registered Gyms</h2>
                <p className="text-sm text-navy-300">Approve, feature, delete or append new fitness studios</p>
              </div>
              <button 
                onClick={() => setShowAddGymModal(true)} 
                className="px-4 py-2.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg active:scale-95"
              >
                <Plus className="w-4 h-4" /> Add Gym Studio
              </button>
            </div>

            {/* Gyms table list */}
            <div className="glass rounded-2xl overflow-hidden border border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5 text-navy-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Gym Name</th>
                      <th className="py-4 px-6">Type & Area</th>
                      <th className="py-4 px-6">Pricing (Monthly)</th>
                      <th className="py-4 px-6">Rating</th>
                      <th className="py-4 px-6">Status badges</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-navy-200">
                    {gymsList.map((gym) => (
                      <tr key={gym._id} className="hover:bg-white/5 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <img src={gym.images?.[0]} alt="" className="w-12 h-9 rounded object-cover border border-white/10 shrink-0" />
                            <div>
                              <div className="font-semibold text-white">{gym.name}</div>
                              <div className="text-xs text-navy-400">{gym.phone || "No phone"}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div>
                            <span className="px-2 py-0.5 rounded text-xs bg-navy-800 text-navy-200">{gym.type}</span>
                            <div className="text-xs text-navy-400 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" />{gym.location?.area}</div>
                          </div>
                        </td>
                        <td className="py-4 px-6 font-semibold text-white">₹{gym.pricing?.monthly?.toLocaleString("en-IN")}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span>{gym.rating?.toFixed(1) || "0.0"}</span>
                            <span className="text-xs text-navy-400">({gym.reviewCount})</span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {gym.approved ? (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/30 flex items-center gap-1">
                                <Check className="w-3 h-3" /> Approved
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-500/15 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                                <ShieldAlert className="w-3 h-3" /> Unapproved
                              </span>
                            )}
                            {gym.featured && (
                              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-500/15 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                                <Flame className="w-3 h-3" /> Featured
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleToggleApprove(gym._id)}
                              className={`p-2 rounded-lg text-xs font-semibold transition-all border ${gym.approved ? "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20" : "bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20"}`}
                              title={gym.approved ? "Reject Gym" : "Approve Gym"}
                            >
                              {gym.approved ? "Unapprove" : "Approve"}
                            </button>
                            <button 
                              onClick={() => handleToggleFeatured(gym._id)}
                              className={`p-2 rounded-lg text-xs font-semibold transition-all border ${gym.featured ? "bg-white/10 text-navy-300 border-white/5 hover:bg-white/20" : "bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20"}`}
                              title={gym.featured ? "Unfeature" : "Feature"}
                            >
                              {gym.featured ? "Unfeature" : "Feature"}
                            </button>
                            <button 
                              onClick={() => handleDeleteGym(gym._id)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-all"
                              title="Delete Gym"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-white">System Users Directory</h2>
              <p className="text-sm text-navy-300">Alter roles or remove members of the Fitverse ecosystem</p>
            </div>

            <div className="glass rounded-2xl overflow-hidden border border-white/5">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/5 border-b border-white/5 text-navy-400 text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Email</th>
                      <th className="py-4 px-6">Joined Date</th>
                      <th className="py-4 px-6">Current Role</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm text-navy-200">
                    {usersList.map((u) => {
                      const isSelf = u._id === user._id;
                      return (
                        <tr key={u._id} className="hover:bg-white/5 transition-colors">
                          <td className="py-4 px-6 font-semibold text-white">
                            <div className="flex items-center gap-2">
                              {u.name}
                              {isSelf && <span className="px-1.5 py-0.5 rounded bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider">YOU</span>}
                            </div>
                          </td>
                          <td className="py-4 px-6 text-navy-300">{u.email}</td>
                          <td className="py-4 px-6 text-navy-400">{new Date(u.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</td>
                          <td className="py-4 px-6">
                            <select 
                              value={u.role} 
                              disabled={isSelf}
                              onChange={(e) => handleRoleChange(u._id, e.target.value)}
                              className="bg-navy-800 border border-white/10 text-white rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-accent-500/50 disabled:opacity-50"
                            >
                              <option value="user">User</option>
                              <option value="owner">Gym Owner</option>
                              <option value="admin">Administrator</option>
                            </select>
                          </td>
                          <td className="py-4 px-6 text-right">
                            <button 
                              onClick={() => handleDeleteUser(u._id)}
                              disabled={isSelf}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/25 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                              title={isSelf ? "Cannot delete yourself" : "Delete User"}
                            >
                              <UserX className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Gym Modal */}
      {showAddGymModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-sm" onClick={() => setShowAddGymModal(false)}>
          <div className="w-full max-w-2xl bg-navy-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-up max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-navy-800/50">
              <div>
                <h3 className="text-lg font-bold text-white">Add New Gym Studio</h3>
                <p className="text-xs text-navy-300 mt-0.5">Initialize a gym details card in database</p>
              </div>
              <button onClick={() => setShowAddGymModal(false)} className="p-2 rounded-lg hover:bg-white/10 text-navy-400 hover:text-white transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleCreateGymSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-300 mb-1.5">Gym Studio Name *</label>
                  <input type="text" required value={newGymForm.name} onChange={(e) => setNewGymForm({ ...newGymForm, name: e.target.value })} placeholder="e.g. Iron Temple Gym" className="w-full bg-navy-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-300 mb-1.5">Workout Category Type *</label>
                  <select required value={newGymForm.type} onChange={(e) => setNewGymForm({ ...newGymForm, type: e.target.value })} className="w-full bg-navy-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500/50">
                    <option value="Gym">Gym</option>
                    <option value="MMA">MMA</option>
                    <option value="Boxing">Boxing</option>
                    <option value="CrossFit">CrossFit</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Pilates">Pilates</option>
                    <option value="Zumba">Zumba</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-300 mb-1.5">Studio Description *</label>
                <textarea required rows={3} value={newGymForm.description} onChange={(e) => setNewGymForm({ ...newGymForm, description: e.target.value })} placeholder="Describe the equipment, trainers, special programs..." className="w-full bg-navy-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500/50 resize-none" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-300 mb-1.5">Chennai Area / Location *</label>
                  <input type="text" required value={newGymForm.area} onChange={(e) => setNewGymForm({ ...newGymForm, area: e.target.value })} placeholder="e.g. Adyar, Velachery, T. Nagar" className="w-full bg-navy-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-300 mb-1.5">Full Physical Address *</label>
                  <input type="text" required value={newGymForm.address} onChange={(e) => setNewGymForm({ ...newGymForm, address: e.target.value })} placeholder="Complete street address details" className="w-full bg-navy-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-300 mb-1.5">Latitude Location Coordinate *</label>
                  <input type="number" step="any" required value={newGymForm.lat} onChange={(e) => setNewGymForm({ ...newGymForm, lat: e.target.value })} className="w-full bg-navy-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-300 mb-1.5">Longitude Location Coordinate *</label>
                  <input type="number" step="any" required value={newGymForm.lng} onChange={(e) => setNewGymForm({ ...newGymForm, lng: e.target.value })} className="w-full bg-navy-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-300 mb-1.5">Monthly Price (₹) *</label>
                  <input type="number" required value={newGymForm.monthly} onChange={(e) => setNewGymForm({ ...newGymForm, monthly: e.target.value })} placeholder="e.g. 1999" className="w-full bg-navy-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-300 mb-1.5">Quarterly Price (₹)</label>
                  <input type="number" value={newGymForm.quarterly} onChange={(e) => setNewGymForm({ ...newGymForm, quarterly: e.target.value })} placeholder="e.g. 4999" className="w-full bg-navy-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-300 mb-1.5">Yearly Price (₹)</label>
                  <input type="number" value={newGymForm.yearly} onChange={(e) => setNewGymForm({ ...newGymForm, yearly: e.target.value })} placeholder="e.g. 14999" className="w-full bg-navy-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-navy-300 mb-1.5">Hours / Timings</label>
                  <input type="text" value={newGymForm.timings} onChange={(e) => setNewGymForm({ ...newGymForm, timings: e.target.value })} placeholder="6:00 AM - 10:00 PM" className="w-full bg-navy-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500/50" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-navy-300 mb-1.5">Phone Number</label>
                  <input type="text" value={newGymForm.phone} onChange={(e) => setNewGymForm({ ...newGymForm, phone: e.target.value })} placeholder="+91 98765 43210" className="w-full bg-navy-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500/50" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-300 mb-1.5">Amenities (comma-separated)</label>
                <input type="text" value={newGymForm.amenitiesInput} onChange={(e) => setNewGymForm({ ...newGymForm, amenitiesInput: e.target.value })} placeholder="AC, Parking, Locker Room, Steam Room, Shower" className="w-full bg-navy-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500/50" />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-300 mb-1.5">Images URLs (comma-separated or blank for default)</label>
                <input type="text" value={newGymForm.imagesInput} onChange={(e) => setNewGymForm({ ...newGymForm, imagesInput: e.target.value })} placeholder="https://image-url1.jpg, https://image-url2.jpg" className="w-full bg-navy-800/50 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-accent-500/50" />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newGymForm.featured} onChange={(e) => setNewGymForm({ ...newGymForm, featured: e.target.checked })} className="rounded bg-navy-800 border-white/10 text-accent-500 focus:ring-accent-500/50" />
                  <span className="text-xs font-semibold text-navy-300">Set as Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={newGymForm.approved} onChange={(e) => setNewGymForm({ ...newGymForm, approved: e.target.checked })} className="rounded bg-navy-800 border-white/10 text-accent-500 focus:ring-accent-500/50" />
                  <span className="text-xs font-semibold text-navy-300">Instant Approved</span>
                </label>
              </div>

              <div className="pt-4 flex gap-3 border-t border-white/5">
                <button type="button" onClick={() => setShowAddGymModal(false)} className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-sm font-semibold transition-colors">Cancel</button>
                <button type="submit" disabled={submittingGym} className="flex-1 py-3 bg-accent-500 hover:bg-accent-600 text-white rounded-xl text-sm font-bold transition-all shadow-lg active:scale-[0.99] disabled:opacity-50">{submittingGym ? "Creating..." : "Save Gym Studio"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
