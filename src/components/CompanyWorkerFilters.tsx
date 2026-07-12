import { useState, useEffect } from "react";
import { X, Star, Award, MapPin, GraduationCap, Calendar, Briefcase, Search, SlidersHorizontal, Zap } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface CompanyFilterValues {
  minRating: number;
  medals: string[];
  radiusKm: number;
  city: string;
  trainings: string[];
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  experienceLevel: string;
  keywords: string;
  autoMatch: boolean;
}

const DEFAULT_FILTERS: CompanyFilterValues = {
  minRating: 1,
  medals: [],
  radiusKm: 30,
  city: "",
  trainings: [],
  dateFrom: undefined,
  dateTo: undefined,
  experienceLevel: "",
  keywords: "",
  autoMatch: false,
};

const RADIUS_OPTIONS = [5, 10, 30, 50, 100];
const MEDAL_OPTIONS = ["Ouro", "Prata", "Bronze"];
const TRAINING_OPTIONS = ["Atendimento", "Garçom", "Logística", "Estoque", "Comércio", "Vendas", "Eventos", "Recepção"];
const EXPERIENCE_OPTIONS = [
  { key: "beginner", label: "Iniciante", desc: "até 10 flinks" },
  { key: "intermediate", label: "Intermediário", desc: "10–50 flinks" },
  { key: "expert", label: "Experiente", desc: "50+ flinks" },
];

const MEDAL_COLORS: Record<string, string> = {
  Ouro: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Prata: "bg-gray-400/20 text-gray-300 border-gray-400/30",
  Bronze: "bg-orange-700/20 text-orange-400 border-orange-700/30",
};

interface CompanyWorkerFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: CompanyFilterValues;
  onApply: (filters: CompanyFilterValues) => void;
  onClear: () => void;
}

const CompanyWorkerFilters = ({ open, onOpenChange, filters, onApply, onClear }: CompanyWorkerFiltersProps) => {
  const [local, setLocal] = useState<CompanyFilterValues>(filters);

  useEffect(() => {
    setLocal(filters);
  }, [filters, open]);

  const handleApply = () => {
    onApply(local);
    onOpenChange(false);
  };

  const handleClear = () => {
    setLocal(DEFAULT_FILTERS);
    onClear();
    onOpenChange(false);
  };

  const toggleArrayItem = (arr: string[], item: string) =>
    arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex flex-row items-center justify-between pb-2">
          <DrawerTitle className="text-lg font-bold text-foreground">Filtrar Profissionais</DrawerTitle>
          <DrawerClose asChild>
            <button className="rounded-full p-1.5 hover:bg-secondary">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-4 space-y-6">
          {/* Auto Match */}
          <section>
            <button
              onClick={() => setLocal((p) => ({ ...p, autoMatch: !p.autoMatch }))}
              className={cn(
                "w-full rounded-xl border p-3 text-left transition-all flex items-center gap-3",
                local.autoMatch
                  ? "border-primary bg-primary/10"
                  : "border-border bg-card"
              )}
            >
              <Zap className={cn("h-5 w-5", local.autoMatch ? "text-primary" : "text-muted-foreground")} />
              <div className="flex-1">
                <span className="font-semibold text-sm text-foreground">Match Automático</span>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  O sistema sugere os melhores profissionais automaticamente
                </p>
              </div>
            </button>
          </section>

          {/* Rating */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Star className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Avaliação</h3>
            </div>
            <div className="px-1">
              <Slider
                min={1}
                max={5}
                step={0.5}
                value={[local.minRating]}
                onValueChange={([v]) => setLocal((p) => ({ ...p, minRating: v }))}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1.0 ⭐</span>
                <span className="font-semibold text-foreground">{local.minRating.toFixed(1)} ⭐</span>
                <span>5.0 ⭐</span>
              </div>
            </div>
          </section>

          {/* Medal */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Medalha de Reputação</h3>
            </div>
            <div className="flex gap-2">
              {MEDAL_OPTIONS.map((medal) => (
                <button
                  key={medal}
                  onClick={() => setLocal((p) => ({ ...p, medals: toggleArrayItem(p.medals, medal) }))}
                  className={cn(
                    "flex-1 rounded-xl border px-3 py-2.5 text-center text-xs font-semibold transition-all",
                    local.medals.includes(medal)
                      ? MEDAL_COLORS[medal]
                      : "bg-secondary text-secondary-foreground border-border"
                  )}
                >
                  {medal === "Ouro" ? "🥇" : medal === "Prata" ? "🥈" : "🥉"} {medal}
                </button>
              ))}
            </div>
          </section>

          {/* Location */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Raio de busca</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {RADIUS_OPTIONS.map((km) => (
                <button
                  key={km}
                  onClick={() => setLocal((p) => ({ ...p, radiusKm: km }))}
                  className={cn(
                    "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all",
                    local.radiusKm === km
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  )}
                >
                  {km}km
                </button>
              ))}
            </div>
            <Input
              placeholder="Buscar por cidade..."
              value={local.city}
              onChange={(e) => setLocal((p) => ({ ...p, city: e.target.value }))}
              className="mt-3 h-9 text-sm"
            />
          </section>

          {/* Trainings */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Capacitações</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {TRAINING_OPTIONS.map((t) => (
                <button
                  key={t}
                  onClick={() => setLocal((p) => ({ ...p, trainings: toggleArrayItem(p.trainings, t) }))}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-xs font-medium transition-all border",
                    local.trainings.includes(t)
                      ? "bg-primary/15 text-primary border-primary/30"
                      : "bg-secondary text-secondary-foreground border-border"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          {/* Availability */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Disponibilidade</h3>
            </div>
            <div className="flex gap-2">
              <DatePickerButton
                label="De"
                date={local.dateFrom}
                onSelect={(d) => setLocal((p) => ({ ...p, dateFrom: d }))}
              />
              <DatePickerButton
                label="Até"
                date={local.dateTo}
                onSelect={(d) => setLocal((p) => ({ ...p, dateTo: d }))}
              />
            </div>
          </section>

          {/* Experience */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Briefcase className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Experiência</h3>
            </div>
            <div className="flex flex-col gap-2">
              {EXPERIENCE_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() =>
                    setLocal((p) => ({ ...p, experienceLevel: p.experienceLevel === opt.key ? "" : opt.key }))
                  }
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-left text-sm transition-all",
                    local.experienceLevel === opt.key
                      ? "border-primary bg-primary/10 text-foreground"
                      : "border-border bg-card text-muted-foreground"
                  )}
                >
                  <span className="font-medium">{opt.label}</span>
                  <span className="ml-2 text-xs text-muted-foreground">({opt.desc})</span>
                </button>
              ))}
            </div>
          </section>

          {/* Keywords */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Palavras-chave</h3>
            </div>
            <Input
              placeholder="Ex: garçom, evento, caixa..."
              value={local.keywords}
              onChange={(e) => setLocal((p) => ({ ...p, keywords: e.target.value }))}
              className="h-9 text-sm"
            />
          </section>
        </div>

        <DrawerFooter className="flex-row gap-3 border-t border-border pt-4">
          <Button variant="outline" className="flex-1" onClick={handleClear}>
            Limpar tudo
          </Button>
          <Button className="flex-1" onClick={handleApply}>
            Aplicar filtros
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

/* Small date picker button */
function DatePickerButton({
  label,
  date,
  onSelect,
}: {
  label: string;
  date: Date | undefined;
  onSelect: (d: Date | undefined) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "flex-1 justify-start text-left text-xs font-normal h-9",
            !date && "text-muted-foreground"
          )}
        >
          <Calendar className="mr-1.5 h-3.5 w-3.5" />
          {date ? format(date, "dd/MM/yyyy") : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={onSelect}
          locale={ptBR}
          initialFocus
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
}

/* Active filters banner for company */
export function CompanyActiveFiltersBanner({
  filters,
  onClear,
}: {
  filters: CompanyFilterValues;
  onClear: () => void;
}) {
  const parts: string[] = [];
  const d = DEFAULT_FILTERS;

  if (filters.autoMatch) parts.push("⚡ Auto");
  if (filters.minRating > d.minRating) parts.push(`${filters.minRating.toFixed(1)}⭐`);
  if (filters.medals.length > 0) parts.push(filters.medals.join(", "));
  if (filters.radiusKm !== d.radiusKm) parts.push(`${filters.radiusKm}km`);
  if (filters.trainings.length > 0) parts.push(filters.trainings.slice(0, 2).join(", ") + (filters.trainings.length > 2 ? "..." : ""));
  if (filters.dateFrom) {
    const from = format(filters.dateFrom, "dd/MM");
    const to = filters.dateTo ? format(filters.dateTo, "dd/MM") : "...";
    parts.push(`${from} a ${to}`);
  }
  if (filters.experienceLevel) {
    const exp = EXPERIENCE_OPTIONS.find((e) => e.key === filters.experienceLevel);
    if (exp) parts.push(exp.label);
  }
  if (filters.city) parts.push(filters.city);
  if (filters.keywords) parts.push(`"${filters.keywords}"`);

  if (parts.length === 0) return null;

  return (
    <div className="mt-3 flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
      <SlidersHorizontal className="h-3.5 w-3.5 flex-shrink-0 text-primary" />
      <p className="flex-1 text-xs text-muted-foreground truncate">
        {parts.join(" • ")}
      </p>
      <button onClick={onClear} className="text-xs font-semibold text-primary">
        Limpar
      </button>
    </div>
  );
}

export const getDefaultCompanyFilters = () => ({ ...DEFAULT_FILTERS });

export default CompanyWorkerFilters;
