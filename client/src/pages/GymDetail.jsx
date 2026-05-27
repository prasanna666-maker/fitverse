import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPin, Clock, Phone, Star, IndianRupee, ArrowLeft, Check, Camera, Trash, X } from "lucide-react";
import { getGymBySlug, addReview, createOrder, verifyPayment, uploadReviewPhoto } from "../api";
import StarRating from "../components/StarRating.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import BookingModal from "../components/BookingModal.jsx";

export default function GymDetail() {
  const { slug } = useParams();
  const { user } = useContext(AuthContext);
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ user: user?.name || "", rating: 5, comment: "", photos: [] });
  const [showBooking, setShowBooking] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  
  // Checkout states
  const [selectedPlan, setSelectedPlan] = useState("quarterly");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    // Automatically apply FIRST20 if they are a first-time user and haven't closed it yet (or just let them type it)
  }, []);

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === "FIRST20") {
      setDiscount(0.2); // 20% off
    } else {
      setDiscount(0);
      alert("Invalid coupon code");
    }
  };

  const handlePayment = async () => {
    if (!window.Razorpay) {
      alert("Razorpay SDK failed to load. Are you online?");
      return;
    }

    const planMap = {
      monthly: gym.pricing?.monthly,
      quarterly: gym.pricing?.quarterly,
      yearly: gym.pricing?.yearly,
    };
    
    const basePrice = planMap[selectedPlan];
    if (!basePrice) return;
    
    const finalPrice = basePrice - (basePrice * discount);
    
    setProcessingPayment(true);
    try {
      // 1. Create order
      const orderRes = await createOrder(finalPrice);
      const order = orderRes.data;

      // 2. Open Razorpay
      const options = {
        key: "rzp_test_mockKeyId123", // Replace with real key in production
        amount: order.amount,
        currency: order.currency,
        name: "Fitverse",
        description: `${gym.name} - ${selectedPlan.toUpperCase()} Plan`,
        order_id: order.id,
        handler: async function (response) {
          try {
            const verifyRes = await verifyPayment({
              ...response,
              email: user?.email || "user@fitverse.com",
              name: user?.name || "Fitverse User",
              gymName: gym.name,
              plan: selectedPlan.toUpperCase(),
              amount: finalPrice,
              phone: "6382833712"
            });
            if (verifyRes.data.message) {
              setPaymentSuccess(true);
            }
          } catch (err) {
            alert("Payment verification failed!");
          }
        },
        prefill: {
          name: user?.name || "Fitverse User",
          email: user?.email || "user@fitverse.com",
          contact: "6382833712",
        },
        theme: {
          color: "#f97316", // accent-500
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert(response.error.description);
      });
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Failed to initiate checkout");
    }
    setProcessingPayment(false);
  };

  useEffect(() => {
    setLoading(true);
    getGymBySlug(slug)
      .then((res) => setGym(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append("photo", file);
    
    setUploadingPhoto(true);
    try {
      const res = await uploadReviewPhoto(formData);
      setReviewForm((prev) => ({
        ...prev,
        photos: [...(prev.photos || []), res.data.url],
      }));
    } catch (err) {
      console.error(err);
      alert("Photo upload failed. Please try again.");
    }
    setUploadingPhoto(false);
  };

  const removeUploadedPhoto = (indexToRemove) => {
    setReviewForm((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await addReview(slug, reviewForm);
      setGym(res.data);
      setReviewForm({ user: user?.name || "", rating: 5, comment: "", photos: [] });
    } catch (err) {
      console.error(err);
      alert("Failed to submit review");
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-accent-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!gym) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">Gym not found</h2>
        <Link to="/gyms" className="text-accent-400 hover:text-accent-300">Back to gyms</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Back */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <Link to="/gyms" className="inline-flex items-center gap-2 text-sm text-navy-300 hover:text-accent-400 transition-colors">
          <ArrowLeft className="w-4 h-4" />Back to Gyms
        </Link>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left - Images & Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden aspect-[16/9]">
                <img src={gym.images?.[activeImg] || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800"} alt={gym.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 to-transparent" />
              </div>
              {gym.images?.length > 1 && (
                <div className="flex gap-2">
                  {gym.images.map((img, i) => (
                    <button key={i} onClick={() => setActiveImg(i)} className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? "border-accent-500" : "border-transparent opacity-60 hover:opacity-100"}`}>
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-accent-500/15 text-accent-400 border border-accent-500/30">{gym.type}</span>
                {gym.featured && <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-500/15 text-green-400 border border-green-500/30">Featured</span>}
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">{gym.name}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-navy-300 mb-6">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-accent-400" />{gym.location?.address}</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-accent-400" />{gym.timings}</span>
                {gym.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-accent-400" />{gym.phone}</span>}
              </div>
              <div className="flex items-center gap-3 mb-6">
                <StarRating rating={gym.rating} size="lg" />
                <span className="text-lg font-bold text-white">{gym.rating?.toFixed(1)}</span>
                <span className="text-sm text-navy-400">({gym.reviewCount} reviews)</span>
              </div>
              <p className="text-navy-300 leading-relaxed">{gym.description}</p>
            </div>

            {/* Amenities */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-4">Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {gym.amenities?.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-navy-200">
                    <Check className="w-4 h-4 text-accent-400 shrink-0" />{amenity}
                  </div>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-6">Reviews ({gym.reviews?.length || 0})</h2>
              <div className="space-y-4 mb-8">
                {gym.reviews?.map((review, i) => (
                  <div key={i} className="p-4 rounded-xl bg-navy-800/30 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center text-white text-xs font-bold">{review.user?.[0]}</div>
                        <span className="font-medium text-white text-sm">{review.user}</span>
                      </div>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <p className="text-sm text-navy-300 mb-3">{review.comment}</p>
                    {review.photos && review.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {review.photos.map((photo, pIdx) => (
                          <div key={pIdx} className="w-20 h-20 rounded-lg overflow-hidden border border-white/10 shrink-0 relative group">
                            <img src={photo} alt="Review attachment" className="w-full h-full object-cover cursor-pointer transition-transform hover:scale-105" onClick={() => window.open(photo, '_blank')} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add review form */}
              <div className="border-t border-white/5 pt-6">
                <h3 className="text-md font-bold text-white mb-4">Write a Review</h3>
                <form onSubmit={handleReview} className="space-y-4">
                  <input type="text" value={reviewForm.user} onChange={(e) => setReviewForm({ ...reviewForm, user: e.target.value })} placeholder="Your name" required className="w-full bg-navy-800/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-accent-500/50" />
                  <div>
                    <label className="block text-xs text-navy-400 mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1,2,3,4,5].map((s) => (
                        <button key={s} type="button" onClick={() => setReviewForm({ ...reviewForm, rating: s })}>
                          <Star className={`w-6 h-6 ${s <= reviewForm.rating ? "text-amber-400 fill-amber-400" : "text-navy-600"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <textarea value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} placeholder="Share your experience..." required rows={3} className="w-full bg-navy-800/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-accent-500/50 resize-none" />
                  
                  {/* Photo Uploader */}
                  <div className="space-y-3">
                    <label className="block text-xs text-navy-400">Add Photos to your Review</label>
                    <div className="flex flex-wrap gap-3 items-center">
                      <label className="w-16 h-16 rounded-xl border border-dashed border-white/20 hover:border-accent-500/50 flex flex-col items-center justify-center cursor-pointer transition-all bg-navy-800/20 hover:bg-navy-800/40 group">
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" disabled={uploadingPhoto} />
                        <Camera className="w-5 h-5 text-navy-400 group-hover:text-accent-400 transition-colors" />
                        <span className="text-[10px] text-navy-500 mt-1">Upload</span>
                      </label>

                      {reviewForm.photos?.map((photoUrl, index) => (
                        <div key={index} className="w-16 h-16 rounded-xl overflow-hidden border border-white/10 relative group shrink-0">
                          <img src={photoUrl} alt="" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeUploadedPhoto(index)} className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                            <Trash className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      ))}

                      {uploadingPhoto && (
                        <div className="w-16 h-16 rounded-xl border border-white/5 bg-navy-800/30 flex items-center justify-center shrink-0">
                          <div className="w-5 h-5 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  </div>

                  <button type="submit" disabled={submitting || uploadingPhoto} className="px-6 py-3 rounded-xl bg-accent-500 text-white font-semibold text-sm hover:bg-accent-600 transition-colors disabled:opacity-50">{submitting ? "Submitting..." : "Submit Review"}</button>
                </form>
              </div>
            </div>
          </div>

          {/* Right sidebar - Pricing */}
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 sticky top-24">
              <h2 className="text-lg font-bold text-white mb-4">Pricing Plans</h2>
              
              {paymentSuccess ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                    <Check className="w-8 h-8 text-green-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Payment Successful!</h3>
                  <p className="text-navy-300 text-sm mb-6">Your membership to {gym.name} is active.</p>
                  <button onClick={() => setPaymentSuccess(false)} className="px-6 py-2 rounded-xl bg-white/10 text-white text-sm hover:bg-white/20 transition-all">View Details</button>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {[
                      { id: "monthly", label: "Monthly", price: gym.pricing?.monthly, popular: false },
                      { id: "quarterly", label: "Quarterly", price: gym.pricing?.quarterly, popular: true },
                      { id: "yearly", label: "Yearly", price: gym.pricing?.yearly, popular: false },
                    ].filter((p) => p.price).map((plan) => (
                      <button 
                        key={plan.id}
                        onClick={() => setSelectedPlan(plan.id)}
                        className={`w-full text-left relative p-4 rounded-xl border transition-all ${selectedPlan === plan.id ? "border-accent-500 bg-accent-500/10" : "border-white/5 bg-navy-800/20 hover:border-white/20"}`}
                      >
                        {plan.popular && <span className="absolute -top-2.5 left-4 px-2 py-0.5 rounded text-[10px] font-bold bg-accent-500 text-white">POPULAR</span>}
                        {selectedPlan === plan.id && <div className="absolute top-4 right-4 w-5 h-5 rounded-full bg-accent-500 flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                        <div className="flex items-center justify-between">
                          <span className={`text-sm ${selectedPlan === plan.id ? 'text-white font-medium' : 'text-navy-300'}`}>{plan.label}</span>
                          <div className={`flex items-center pr-8 ${selectedPlan === plan.id ? 'opacity-100' : 'opacity-70'}`}>
                            <IndianRupee className="w-4 h-4 text-accent-400" />
                            <span className="text-xl font-bold text-white">{plan.price?.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex gap-2 mb-4">
                      <input 
                        type="text" 
                        value={couponCode} 
                        onChange={(e) => setCouponCode(e.target.value)} 
                        placeholder="Coupon Code (try FIRST20)" 
                        className="flex-1 bg-navy-800/40 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-navy-500 focus:outline-none focus:border-accent-500/50"
                      />
                      <button onClick={handleApplyCoupon} className="px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all">Apply</button>
                    </div>
                    
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-sm text-navy-300">
                        <span>Base Price</span>
                        <span>₹{gym.pricing?.[selectedPlan]?.toLocaleString("en-IN")}</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between text-sm text-green-400">
                          <span>Discount (20%)</span>
                          <span>- ₹{(gym.pricing?.[selectedPlan] * discount)?.toLocaleString("en-IN")}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-white pt-2 border-t border-white/10">
                        <span>Total Pay</span>
                        <span>₹{(gym.pricing?.[selectedPlan] - (gym.pricing?.[selectedPlan] * discount))?.toLocaleString("en-IN")}</span>
                      </div>
                    </div>

                    <button 
                      onClick={handlePayment} 
                      disabled={processingPayment}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 text-white font-bold text-sm hover:from-accent-600 hover:to-accent-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {processingPayment ? "Processing..." : "Proceed to Payment"}
                    </button>
                    <p className="text-center text-xs text-navy-400 mt-3 flex items-center justify-center gap-1">
                      <Check className="w-3 h-3" /> Secure payment via Razorpay
                    </p>

                    <button 
                      onClick={() => setShowBooking(true)}
                      className="w-full mt-4 py-3.5 rounded-xl bg-accent-500/10 hover:bg-accent-500/20 border border-accent-500/30 text-accent-400 hover:text-accent-300 font-bold text-sm transition-all active:scale-[0.98] text-center"
                    >
                      Book a Free Trial Session
                    </button>
                  </div>
                  
                  {gym.phone && <a href={`tel:${gym.phone}`} className="block w-full mt-3 py-3 rounded-xl border border-white/10 text-center text-sm text-navy-300 hover:text-white hover:border-white/20 transition-all">Call {gym.phone}</a>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      {showBooking && (
        <BookingModal gym={gym} onClose={() => setShowBooking(false)} />
      )}
    </div>
  );
}
