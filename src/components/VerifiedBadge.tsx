import { BadgeCheck } from "lucide-react";

interface VerifiedBadgeProps {
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

const sizeMap = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const VerifiedBadge = ({ size = "sm", showLabel = false }: VerifiedBadgeProps) => {
  return (
    <span className="inline-flex items-center gap-1">
      <BadgeCheck className={`${sizeMap[size]} text-blue-500`} />
      {showLabel && (
        <span className="text-[10px] font-bold text-blue-500">Verificado</span>
      )}
    </span>
  );
};

export default VerifiedBadge;
