import { useState, useRef } from "react";
import { Check, X, MapPin, Star, Loader2, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import ReputationBadge from "@/components/ReputationBadge";
import VerifiedBadge from "@/components/VerifiedBadge";

export interface WorkerData {
  id: string;
  name: string;
  role: string;
  rating: number;
  flinks: number;
  location: string;
  medal: "Ouro" | "Prata" | "Bronze";
  avatar: string;
  trainings: string[];
  verified: boolean;
  matchScore: number;
  comment: string;
}

interface SwipeableWorkerCardProps {
  worker: WorkerData;
  onAccept: (worker: WorkerData) => void;
  onReject: (worker: WorkerData) => void;
  isSubmitting?: boolean;
}

const SwipeableWorkerCard = ({ worker, onAccept, onReject, isSubmitting }: SwipeableWorkerCardProps) => {
  const [offset, setOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startX = useRef(0);

  const handleStart = (x: number) => {
    if (isSubmitting) return;
    startX.current = x;
    setIsDragging(true);
  };

  const handleMove = (x: number) => {
    if (!isDragging || isSubmitting) return;
    setOffset(x - startX.current);
  };

  const handleEnd = () => {
    if (isSubmitting) return;
    setIsDragging(false);
    if (offset > 100) {
      onAccept(worker);
    } else if (offset < -100) {
      onReject(worker);
    }
    setOffset(0);
  };

  const rotation = offset * 0.05;
  const acceptOpacity = Math.max(0, offset / 150);
  const rejectOpacity = Math.max(0, -offset / 150);

  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div
        className={`gradient-card rounded-3xl border border-border p-6 ${isSubmitting ? "opacity-70" : "cursor-grab active:cursor-grabbing"}`}
        style={{
          transform: `translateX(${offset}px) rotate(${rotation}deg)`,
          transition: isDragging ? "none" : "transform 0.3s ease",
        }}
        onMouseDown={(e) => handleStart(e.clientX)}
        onMouseMove={(e) => handleMove(e.clientX)}
        onMouseUp={handleEnd}
        onMouseLeave={() => { if (isDragging) handleEnd(); }}
        onTouchStart={(e) => handleStart(e.touches[0].clientX)}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        onTouchEnd={handleEnd}
      >
        {/* Accept/Reject overlays */}
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl border-4 border-success"
          style={{ opacity: acceptOpacity }}
        >
          <span className="rotate-[-20deg] rounded-xl border-4 border-success px-6 py-2 text-3xl font-black text-success">
            ACEITAR
          </span>
        </div>
        <div
          className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-3xl border-4 border-destructive"
          style={{ opacity: rejectOpacity }}
        >
          <span className="rotate-[20deg] rounded-xl border-4 border-destructive px-6 py-2 text-3xl font-black text-destructive">
            RECUSAR
          </span>
        </div>

        {/* Match badge */}
        <div className="mb-4 flex items-center justify-between">
          <div className="gradient-primary rounded-full px-4 py-1.5 glow-orange">
            <span className="text-sm font-bold text-primary-foreground">{worker.matchScore}% match</span>
          </div>
          {worker.verified && <VerifiedBadge size="sm" />}
        </div>

        {/* Avatar + Name */}
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary text-lg font-bold text-primary-foreground">
            {worker.avatar}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">{worker.name}</h2>
            <p className="text-sm text-muted-foreground">{worker.role}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-5 space-y-2.5">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Star className="h-4 w-4 text-primary fill-primary" />
            <span className="font-semibold text-foreground">{worker.rating.toFixed(1)}</span>
            <span>• {worker.flinks} flinks realizados</span>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{worker.location}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Award className="h-4 w-4 text-primary" />
            <ReputationBadge medal={worker.medal} stars={worker.rating} size="sm" />
          </div>
        </div>

        {/* Trainings */}
        {worker.trainings.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {worker.trainings.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-secondary text-secondary-foreground">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Comment */}
        {worker.comment && (
          <p className="mt-4 text-sm italic text-muted-foreground">"{worker.comment}"</p>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          onClick={() => !isSubmitting && onReject(worker)}
          disabled={isSubmitting}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-destructive/30 bg-card transition-all hover:border-destructive hover:bg-destructive/10 disabled:opacity-50"
        >
          <X className="h-6 w-6 text-destructive" />
        </button>
        <button
          onClick={() => !isSubmitting && onAccept(worker)}
          disabled={isSubmitting}
          className="flex h-16 w-16 items-center justify-center rounded-full gradient-primary glow-orange transition-transform hover:scale-110 disabled:opacity-50"
        >
          {isSubmitting ? (
            <Loader2 className="h-7 w-7 text-primary-foreground animate-spin" />
          ) : (
            <Check className="h-7 w-7 text-primary-foreground" />
          )}
        </button>
      </div>
    </div>
  );
};

export default SwipeableWorkerCard;
