import { useState, useRef } from "react";
import { Check, X, MapPin, Clock, DollarSign, Star, Building2, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface GigData {
  id: string;
  title: string;
  company_name: string;
  company_id: string;
  location: string | null;
  payment_amount: number;
  payment_type: string;
  date_start: string;
  date_end: string;
  description: string | null;
  tags: string[] | null;
  match_score?: number;
}

interface SwipeableGigCardProps {
  gig: GigData;
  onAccept: (gig: GigData) => void;
  onReject: (gig: GigData) => void;
  isSubmitting?: boolean;
}

const SwipeableGigCard = ({ gig, onAccept, onReject, isSubmitting }: SwipeableGigCardProps) => {
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
      onAccept(gig);
    } else if (offset < -100) {
      onReject(gig);
    }
    setOffset(0);
  };

  const rotation = offset * 0.05;
  const acceptOpacity = Math.max(0, offset / 150);
  const rejectOpacity = Math.max(0, -offset / 150);

  const formatDate = () => {
    try {
      const start = new Date(gig.date_start);
      const end = new Date(gig.date_end);
      const day = format(start, "dd MMM", { locale: ptBR });
      const startTime = format(start, "HH'h'");
      const endTime = format(end, "HH'h'");
      return `${day}, ${startTime}-${endTime}`;
    } catch {
      return "Data a definir";
    }
  };

  const formatPayment = () => {
    const suffix = gig.payment_type === "hourly" ? "/hora" : "/dia";
    return `R$ ${gig.payment_amount.toFixed(0)}${suffix}`;
  };

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
          {gig.match_score && (
            <div className="gradient-primary rounded-full px-4 py-1.5 glow-orange">
              <span className="text-sm font-bold text-primary-foreground">{gig.match_score}% match</span>
            </div>
          )}
        </div>

        <h2 className="text-2xl font-bold text-foreground">{gig.title}</h2>
        <div className="mt-1 flex items-center gap-2 text-muted-foreground">
          <Building2 className="h-4 w-4" />
          <span className="text-sm font-medium">{gig.company_name}</span>
        </div>

        {gig.description && (
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{gig.description}</p>
        )}

        <div className="mt-5 space-y-2.5">
          {gig.location && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>{gig.location}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Clock className="h-4 w-4 text-primary" />
            <span>{formatDate()}</span>
          </div>
          <div className="flex items-center gap-3 text-lg font-bold text-foreground">
            <DollarSign className="h-5 w-5 text-primary" />
            <span>{formatPayment()}</span>
          </div>
        </div>

        {gig.tags && gig.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {gig.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="bg-secondary text-secondary-foreground">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex items-center justify-center gap-6">
        <button
          onClick={() => !isSubmitting && onReject(gig)}
          disabled={isSubmitting}
          className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-destructive/30 bg-card transition-all hover:border-destructive hover:bg-destructive/10 disabled:opacity-50"
        >
          <X className="h-6 w-6 text-destructive" />
        </button>
        <button
          onClick={() => !isSubmitting && onAccept(gig)}
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

export default SwipeableGigCard;
