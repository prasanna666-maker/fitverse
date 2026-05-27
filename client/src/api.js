import axios from "axios";

const API = axios.create({
  baseURL: "/api",
});

export const getGyms = (params) => API.get("/gyms", { params });
export const getGymBySlug = (slug) => API.get(`/gyms/${slug}`);
export const getAreas = () => API.get("/gyms/areas");
export const compareGyms = (ids) =>
  API.get("/gyms/compare", { params: { ids: ids.join(",") } });
export const addReview = (slug, review) =>
  API.post(`/gyms/${slug}/reviews`, review);
export const createOrder = (amount) => API.post("/payment/order", { amount });
export const verifyPayment = (data) => API.post("/payment/verify", data);
export const toggleFavorite = (gymId) => API.post(`/favorites/${gymId}`);
export const getFavorites = () => API.get("/favorites");
export const getAvailableSlots = (gymId, date) => API.get(`/bookings/slots/${gymId}/${date}`);
export const createBooking = (data) => API.post("/bookings", data);
export const getMyBookings = () => API.get("/bookings/mine");
export const cancelBooking = (id) => API.put(`/bookings/${id}/cancel`);
export const uploadReviewPhoto = (formData) =>
  API.post("/upload/review", formData, { headers: { "Content-Type": "multipart/form-data" } });

// Admin endpoints
export const adminGetUsers = () => API.get("/admin/users");
export const adminUpdateUserRole = (id, role) => API.put(`/admin/users/${id}/role`, { role });
export const adminDeleteUser = (id) => API.delete(`/admin/users/${id}`);
export const adminGetGyms = () => API.get("/admin/gyms");
export const adminCreateGym = (gymData) => API.post("/admin/gyms", gymData);
export const adminToggleApproveGym = (id) => API.put(`/admin/gyms/${id}/approve`);
export const adminToggleFeaturedGym = (id) => API.put(`/admin/gyms/${id}/featured`);
export const adminDeleteGym = (id) => API.delete(`/admin/gyms/${id}`);

export default API;
