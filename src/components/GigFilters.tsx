import { useState, useEffect } from "react";
import { X, DollarSign, MapPin, Calendar, GraduationCap, Search, SlidersHorizontal } from "lucide-react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerFooter, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

export interface GigFilterValues {
  minValue: number;
  maxValue: number;
  dateFrom: Date | undefined;
  dateTo: Date | undefined;
  radiusKm: number;
  city: string;
  prioritizeTraining: boolean;
  keywords: string;
}

const DEFAULT_FILTERS: GigFilterValues = {
  minValue: 50,
  maxValue: 500,
  dateFrom: undefined,
  dateTo: undefined,
  radiusKm: 30,
  city: "",
  prioritizeTraining: false,
  keywords: "",
};

const RADIUS_OPTIONS = [5, 10, 30, 50, 100];

interface GigFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: GigFilterValues;
  onApply: (filters: GigFilterValues) => void;
  onClear: () => void;
}

const GigFilters = ({ open, onOpenChange, filters, onApply, onClear }: GigFiltersProps) => {
  const [local, setLocal] = useState<GigFilterValues>(filters);

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

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="flex flex-row items-center justify-between pb-2">
          <DrawerTitle className="text-lg font-bold text-foreground">Filtros</DrawerTitle>
          <DrawerClose asChild>
            <button className="rounded-full p-1.5 hover:bg-secondary">
              <X className="h-5 w-5 text-muted-foreground" />
            </button>
          </DrawerClose>
        </DrawerHeader>

        <div className="overflow-y-auto px-4 pb-4 space-y-6">
          {/* Value Range */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Faixa de valor</h3>
            </div>
            <div className="px-1">
              <Slider
                min={50}
                max={500}
                step={10}
                value={[local.minValue, local.maxValue]}
                onValueChange={([min, max]) => setLocal((p) => ({ ...p, minValue: min, maxValue: max }))}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>R$ {local.minValue}</span>
                <span>R$ {local.maxValue}{local.maxValue >= 500 ? "+" : ""}</span>
              </div>
            </div>
          </section>

          {/* Date Range */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Período</h3>
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

          {/* Location Radius */}
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

          {/* Training Priority */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <GraduationCap className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Capacitação</h3>
            </div>
            <button
              onClick={() => setLocal((p) => ({ ...p, prioritizeTraining: !p.prioritizeTraining }))}
              className={cn(
                "w-full rounded-xl border p-3 text-left text-sm transition-all",
                local.prioritizeTraining
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-card text-muted-foreground"
              )}
            >
              <span className="font-medium">Priorizar flinks das minhas capacitações</span>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Mostra primeiro os flinks relacionados aos seus treinamentos concluídos
              </p>
            </button>
          </section>

          {/* Keywords */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <Search className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Palavras-chave</h3>
            </div>
            <Input
              placeholder="Ex: garçom, evento, estoque..."
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

export function ActiveFiltersBanner({
  filters,
  onClear,
}: {
  filters: GigFilterValues;
  onClear: () => void;
}) {
  const parts: string[] = [];
  const d = DEFAULT_FILTERS;

  if (filters.minValue !== d.minValue || filters.maxValue !== d.maxValue) {
    parts.push(`R$${filters.minValue}–R$${filters.maxValue}${filters.maxValue >= 500 ? "+" : ""}`);
  }
  if (filters.radiusKm !== d.radiusKm) {
    parts.push(`${filters.radiusKm}km`);
  }
  if (filters.dateFrom) {
    const from = format(filters.dateFrom, "dd/MM");
    const to = filters.dateTo ? format(filters.dateTo, "dd/MM") : "...";
    parts.push(`${from} a ${to}`);
  }
  if (filters.city) parts.push(filters.city);
  if (filters.prioritizeTraining) parts.push("Capacitação");
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

export const getDefaultFilters = () => ({ ...DEFAULT_FILTERS });

export default GigFilters;
