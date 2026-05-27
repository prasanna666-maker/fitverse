import { Star } from "lucide-react";

export default function StarRating({ rating, size = "md" }) {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= Math.round(rating)
              ? "text-amber-400 fill-amber-400"
              : "text-navy-600"
          }`}
        />
      ))}
    </div>
  );
}
