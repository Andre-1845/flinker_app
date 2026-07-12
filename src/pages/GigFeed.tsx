import { useState, useMemo, useEffect } from "react";
import { Filter, Info, Loader2 } from "lucide-react";
import SwipeableGigCard, { GigData } from "@/components/SwipeableGigCard";
import BottomNav from "@/components/BottomNav";
import GigFilters, { ActiveFiltersBanner, GigFilterValues, getDefaultFilters } from "@/components/GigFilters";
import { useAuth } from "@/contexts/AuthContext";
import { listActiveFlinks } from "@/lib/flinks";
import { listMyMatches, expressInterest } from "@/lib/matches";
import type { Flink } from "@/lib/types";
import { ApiError } from "@/lib/api";
import { toast } from "sonner";

const STORAGE_KEY = "flinker_gig_filters";

function loadSavedFilters(): GigFilterValues {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...getDefaultFilters(),
        ...parsed,
        dateFrom: parsed.dateFrom ? new Date(parsed.dateFrom) : undefined,
        dateTo: parsed.dateTo ? new Date(parsed.dateTo) : undefined,
      };
    }
  } catch {}
  return getDefaultFilters();
}

function saveFilters(f: GigFilterValues) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(f));
}

function isFiltersActive(f: GigFilterValues): boolean {
  const d = getDefaultFilters();
  return (
    f.minValue !== d.minValue ||
    f.maxValue !== d.maxValue ||
    f.radiusKm !== d.radiusKm ||
    !!f.dateFrom ||
    !!f.city ||
    f.prioritizeTraining ||
    !!f.keywords
  );
}

function flinkToGigData(flink: Flink): GigData {
  return {
    id: String(flink.id),
    title: flink.activity_type,
    company_name: flink.company?.responsible_name ?? "Empresa",
    company_id: String(flink.company_id),
    location: flink.location,
    payment_amount: flink.pricing.net_value,
    payment_type: "daily",
    date_start: flink.start_date_time,
    date_end: flink.end_date_time,
    description: flink.requirements,
    tags: null,
  };
}

const GigFeed = () => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<GigFilterValues>(loadSavedFilters);
  const [gigs, setGigs] = useState<GigData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dismissedGigIds, setDismissedGigIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("flinker_dismissed_gigs");
      return saved ? new Set(JSON.parse(saved) as string[]) : new Set();
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    if (!user?.professional) {
      setLoading(false);
      return;
    }

    const fetchGigs = async (coords?: { latitude: number; longitude: number }) => {
      setLoading(true);
      try {
        const [flinksRes, matchesRes] = await Promise.all([
          listActiveFlinks(
            coords ? { latitude: coords.latitude, longitude: coords.longitude, radius_km: 50 } : undefined
          ),
          listMyMatches(),
        ]);

        const alreadyMatchedFlinkIds = new Set(matchesRes.data.map((m) => m.flink_id));
        const available = flinksRes.data.filter((f) => !alreadyMatchedFlinkIds.has(f.id));

        setGigs(available.map(flinkToGigData));
      } catch (error) {
        toast.error("Não foi possível carregar os Flinks disponíveis.");
      } finally {
        setLoading(false);
      }
    };

    // Tenta usar a localização do dispositivo para priorizar Flinks próximos;
    // se o usuário negar a permissão, busca sem filtro de distância.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => fetchGigs({ latitude: position.coords.latitude, longitude: position.coords.longitude }),
        () => fetchGigs(),
        { timeout: 5000 }
      );
    } else {
      fetchGigs();
    }
  }, [user]);

  const filteredGigs = useMemo(() => {
    let result = gigs.filter((g) => !dismissedGigIds.has(g.id));

    result = result.filter(
      (g) => g.payment_amount >= filters.minValue && (filters.maxValue >= 500 || g.payment_amount <= filters.maxValue)
    );

    if (filters.keywords.trim()) {
      const kw = filters.keywords.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(kw) ||
          (g.description || "").toLowerCase().includes(kw) ||
          (g.tags || []).some((t) => t.toLowerCase().includes(kw))
      );
    }

    if (filters.city.trim()) {
      const city = filters.city.toLowerCase().trim();
      result = result.filter((g) => (g.location || "").toLowerCase().includes(city));
    }

    if (filters.dateFrom) {
      const from = filters.dateFrom.getTime();
      result = result.filter((g) => new Date(g.date_start).getTime() >= from);
    }
    if (filters.dateTo) {
      const to = filters.dateTo.getTime();
      result = result.filter((g) => new Date(g.date_end).getTime() <= to);
    }

    return result;
  }, [gigs, filters, dismissedGigIds]);

  const dismissGig = (id: string) => {
    setDismissedGigIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("flinker_dismissed_gigs", JSON.stringify([...next]));
      return next;
    });
    setCurrentIndex((prev) => prev + 1);
  };

  const handleAccept = async (gig: GigData) => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      await expressInterest(Number(gig.id));
      toast.success("Interesse enviado! Aguardando a empresa escolher.", { icon: "🎉" });
      dismissGig(gig.id);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "Erro ao demonstrar interesse. Tente novamente.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = (gig: GigData) => {
    dismissGig(gig.id);
  };

  const handleApplyFilters = (f: GigFilterValues) => {
    setFilters(f);
    saveFilters(f);
    setCurrentIndex(0);
  };

  const handleClearFilters = () => {
    const d = getDefaultFilters();
    setFilters(d);
    saveFilters(d);
    setCurrentIndex(0);
  };

  const hasActiveFilters = isFiltersActive(filters);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-12">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Flinks disponíveis na sua região</h1>
            <p className="text-sm text-muted-foreground">Cada Flink é um trabalho temporário (extra), sem vínculo fixo.</p>
          </div>
          <button
            onClick={() => setFiltersOpen(true)}
            className={`relative rounded-full p-2.5 transition-colors ${hasActiveFilters ? "bg-primary/20" : "bg-secondary"}`}
          >
            <Filter className={`h-5 w-5 ${hasActiveFilters ? "text-primary" : "text-foreground"}`} />
            {hasActiveFilters && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 rounded-full bg-primary" />
            )}
          </button>
        </div>

        {hasActiveFilters ? (
          <ActiveFiltersBanner filters={filters} onClear={handleClearFilters} />
        ) : (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Novo por aqui?</span>{" "}
              Flink = trabalho rápido, pago por tarefa. Deslize para aceitar ou recusar.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4 py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Buscando flinks...</p>
            </div>
          ) : currentIndex < filteredGigs.length ? (
            <SwipeableGigCard
              key={filteredGigs[currentIndex].id}
              gig={filteredGigs[currentIndex]}
              onAccept={handleAccept}
              onReject={handleReject}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 py-20">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                <span className="text-3xl">🎉</span>
              </div>
              <p className="text-lg font-bold text-foreground">Tudo visto!</p>
              <p className="text-sm text-muted-foreground text-center">
                {hasActiveFilters
                  ? "Tente ajustar seus filtros"
                  : gigs.length === 0
                  ? "Nenhum flink disponível no momento. Ajuste seus filtros ou volte mais tarde."
                  : "Novos flinks chegam em breve"}
              </p>
              {hasActiveFilters && (
                <button onClick={handleClearFilters} className="text-sm font-semibold text-primary">
                  Limpar filtros
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <GigFilters
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      <BottomNav />
    </div>
  );
};

export default GigFeed;
