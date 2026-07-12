import { MapPin, Clock, DollarSign, Star, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GigCardProps {
  title: string;
  company: string;
  location: string;
  payment: string;
  date: string;
  rating: number;
  tags: string[];
  matchPercent?: number;
  onAccept?: () => void;
  onReject?: () => void;
}

const GigCard = ({ title, company, location, payment, date, rating, tags, matchPercent }: GigCardProps) => {
  return (
    <div className="gradient-card rounded-2xl border border-border p-5 card-hover">
      {matchPercent && (
        <div className="mb-3 flex items-center gap-2">
          <div className="gradient-primary rounded-full px-3 py-1">
            <span className="text-xs font-bold text-primary-foreground">{matchPercent}% match</span>
          </div>
        </div>
      )}
      <h3 className="text-lg font-bold text-foreground">{title}</h3>
      <div className="mt-1 flex items-center gap-2 text-muted-foreground">
        <Building2 className="h-4 w-4" />
        <span className="text-sm">{company}</span>
        <div className="flex items-center gap-1">
          <Star className="h-3 w-3 fill-primary text-primary" />
          <span className="text-xs font-semibold">{rating.toFixed(1)}</span>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4 text-primary" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <DollarSign className="h-4 w-4 text-primary" />
          <span>{payment}</span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="bg-secondary text-secondary-foreground text-xs">
            {tag}
          </Badge>
        ))}
      </div>
    </div>
  );
};

export default GigCard;
