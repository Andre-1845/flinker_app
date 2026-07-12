import { Star } from "lucide-react";

interface ReputationBadgeProps {
  medal: "Ouro" | "Prata" | "Bronze";
  stars: number;
  size?: "sm" | "md" | "lg";
}

const medalConfig: Record<string, { emoji: string; label: string; colorClass: string }> = {
  Ouro: { emoji: "🥇", label: "Ouro", colorClass: "text-yellow-400 bg-yellow-400/10 border-yellow-400/30" },
  Prata: { emoji: "🥈", label: "Prata", colorClass: "text-slate-300 bg-slate-300/10 border-slate-300/30" },
  Bronze: { emoji: "🥉", label: "Bronze", colorClass: "text-amber-600 bg-amber-600/10 border-amber-600/30" },
};

const ReputationBadge = ({ medal, stars, size = "sm" }: ReputationBadgeProps) => {
  const config = medalConfig[medal] || medalConfig.Bronze;
  const sizeClass = size === "lg"
    ? "px-3 py-1.5 text-sm gap-1.5"
    : size === "md"
    ? "px-2.5 py-1 text-xs gap-1"
    : "px-2 py-0.5 text-[10px] gap-1";

  const starSize = size === "sm" ? "h-3 w-3" : "h-4 w-4";
  const textSize = size === "sm" ? "text-[10px]" : "text-xs";

  return (
    <div className="inline-flex items-center gap-1.5">
      {/* Medal badge */}
      <span className={`inline-flex items-center rounded-full border font-bold ${config.colorClass} ${sizeClass}`}>
        {config.emoji} {config.label}
      </span>
      {/* Star rating */}
      <span className="inline-flex items-center gap-0.5">
        <Star className={`fill-primary text-primary ${starSize}`} />
        <span className={`font-semibold text-foreground ${textSize}`}>
          {stars.toFixed(1)}
        </span>
      </span>
    </div>
  );
};

export default ReputationBadge;
