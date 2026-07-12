import { Star } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  showValue?: boolean;
}

const sizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const RatingStars = ({ rating, size = "md", showValue = true }: RatingStarsProps) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizes[size]} ${
            star <= rating ? "fill-primary text-primary" : "text-muted-foreground/30"
          }`}
        />
      ))}
      {showValue && <span className="ml-1 text-sm font-semibold text-foreground">{rating.toFixed(1)}</span>}
    </div>
  );
};

export default RatingStars;
