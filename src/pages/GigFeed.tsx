import { useState, useMemo, useEffect } from "react";
import { Filter, Info, Loader2 } from "lucide-react";
import SwipeableGigCard, { GigData } from "@/components/SwipeableGigCard";
import BottomNav from "@/components/BottomNav";
import GigFilters, { ActiveFiltersBanner, GigFilterValues, getDefaultFilters } from "@/components/GigFilters";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
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
      if (saved) {
        const ids = JSON.parse(saved) as string[];
        // Don't persist mock dismissals across sessions
        return new Set(ids.filter((id) => !id.startsWith("mock-")));
      }
      return new Set();
    } catch {
      return new Set();
    }
  });

  // Fetch gigs from database
  useEffect(() => {
    const fetchGigs = async () => {
      if (!user) return;
      setLoading(true);

      // Fetch published gigs not created by the current user
      const { data: gigsData, error } = await supabase
        .from("gigs")
        .select("*")
        .eq("status", "published")
        .neq("company_id", user.id)
        .gte("date_end", new Date().toISOString())
        .order("date_start", { ascending: true });

      if (error) {
        console.error("Error fetching gigs:", error);
        setLoading(false);
        return;
      }

      // Fetch already matched gig IDs to exclude them
      const { data: matchedData } = await supabase
        .from("gig_matches")
        .select("gig_id")
        .eq("worker_id", user.id);

      const matchedGigIds = new Set((matchedData || []).map((m) => m.gig_id));

      // Fetch company profiles for names
      const companyIds = [...new Set((gigsData || []).map((g) => g.company_id))];
      const { data: profiles } = await supabase
        .from("profiles_public")
        .select("user_id, full_name")
        .in("user_id", companyIds.length > 0 ? companyIds : ["none"]);

      const profileMap = new Map((profiles || []).map((p) => [p.user_id, p.full_name || "Empresa"]));

      // Get match scores
      const mapped: GigData[] = (gigsData || [])
        .filter((g) => !matchedGigIds.has(g.id))
        .map((g) => ({
          id: g.id,
          title: g.title,
          company_name: profileMap.get(g.company_id) || "Empresa",
          company_id: g.company_id,
          location: g.location,
          payment_amount: Number(g.payment_amount),
          payment_type: g.payment_type,
          date_start: g.date_start,
          date_end: g.date_end,
          description: g.description,
          tags: g.tags,
        }));

      // Get match score for current user
      if (mapped.length > 0) {
        const { data: scoreData } = await supabase.rpc("get_match_score", {
          p_user_id: user.id,
        });
        const baseScore = Number(scoreData) || 50;
        mapped.forEach((g) => {
          // Vary score slightly per gig for visual variety
          g.match_score = Math.min(99, Math.max(60, Math.round(baseScore + (Math.random() * 10 - 5))));
        });
        // Sort by match score descending
        mapped.sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
      }

      // Fallback: if no real gigs, use mock data for prototype testing
      if (mapped.length === 0) {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 86400000);
        const mockGigs: GigData[] = [
          {
            id: "mock-1",
            title: "Garçom para evento corporativo",
            company_name: "Buffet Premium",
            company_id: "mock-company-1",
            location: "São Paulo, SP",
            payment_amount: 180,
            payment_type: "daily",
            date_start: tomorrow.toISOString(),
            date_end: new Date(tomorrow.getTime() + 28800000).toISOString(),
            description: "Servir em evento corporativo de 200 pessoas. Experiência com serviço de mesa desejável.",
            tags: ["garçom", "eventos", "corporativo"],
            match_score: 92,
          },
          {
            id: "mock-2",
            title: "Auxiliar de cozinha – Festival",
            company_name: "Gastrô Eventos",
            company_id: "mock-company-2",
            location: "Rio de Janeiro, RJ",
            payment_amount: 25,
            payment_type: "hourly",
            date_start: new Date(now.getTime() + 172800000).toISOString(),
            date_end: new Date(now.getTime() + 172800000 + 36000000).toISOString(),
            description: "Auxiliar no preparo e montagem de pratos durante festival gastronômico.",
            tags: ["cozinha", "festival", "gastronomia"],
            match_score: 87,
          },
          {
            id: "mock-3",
            title: "Promotor de vendas – Shopping",
            company_name: "MegaStore",
            company_id: "mock-company-3",
            location: "Belo Horizonte, MG",
            payment_amount: 150,
            payment_type: "daily",
            date_start: new Date(now.getTime() + 259200000).toISOString(),
            date_end: new Date(now.getTime() + 259200000 + 32400000).toISOString(),
            description: "Abordagem de clientes e demonstração de produtos eletrônicos.",
            tags: ["vendas", "promotor", "shopping"],
            match_score: 81,
          },
          {
            id: "mock-4",
            title: "Barista para café especial",
            company_name: "Café & Arte",
            company_id: "mock-company-4",
            location: "Curitiba, PR",
            payment_amount: 22,
            payment_type: "hourly",
            date_start: new Date(now.getTime() + 345600000).toISOString(),
            date_end: new Date(now.getTime() + 345600000 + 28800000).toISOString(),
            description: "Preparo de cafés especiais e atendimento ao cliente em cafeteria artesanal.",
            tags: ["barista", "café", "atendimento"],
            match_score: 76,
          },
          {
            id: "mock-5",
            title: "Recepcionista para conferência",
            company_name: "EventoPro",
            company_id: "mock-company-5",
            location: "São Paulo, SP",
            payment_amount: 200,
            payment_type: "daily",
            date_start: new Date(now.getTime() + 432000000).toISOString(),
            date_end: new Date(now.getTime() + 432000000 + 36000000).toISOString(),
            description: "Recepcionar participantes, entregar crachás e orientar sobre a programação.",
            tags: ["recepção", "conferência", "atendimento"],
            match_score: 70,
          },
        ];
        setGigs(mockGigs);
      } else {
        setGigs(mapped);
      }
      setLoading(false);
    };

    fetchGigs();
  }, [user]);

  // Filter gigs
  const filteredGigs = useMemo(() => {
    let result = gigs.filter((g) => !dismissedGigIds.has(g.id));

    // Value filter
    result = result.filter(
      (g) => g.payment_amount >= filters.minValue && (filters.maxValue >= 500 || g.payment_amount <= filters.maxValue)
    );

    // Keyword filter
    if (filters.keywords.trim()) {
      const kw = filters.keywords.toLowerCase().trim();
      result = result.filter(
        (g) =>
          g.title.toLowerCase().includes(kw) ||
          (g.description || "").toLowerCase().includes(kw) ||
          (g.tags || []).some((t) => t.toLowerCase().includes(kw))
      );
    }

    // City filter
    if (filters.city.trim()) {
      const city = filters.city.toLowerCase().trim();
      result = result.filter((g) => (g.location || "").toLowerCase().includes(city));
    }

    // Date filter
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

  const handleAccept = async (gig: GigData) => {
    if (!user || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Create gig_match record
      const { error: matchError } = await supabase.from("gig_matches").insert({
        gig_id: gig.id,
        worker_id: user.id,
        company_id: gig.company_id,
        worker_accepted: true,
        worker_accepted_at: new Date().toISOString(),
        status: "matched",
      });

      if (matchError) {
        console.error("Match error:", matchError);
        toast.error("Erro ao aceitar o flink. Tente novamente.");
        setIsSubmitting(false);
        return;
      }

      // Notify the company
      await supabase.rpc("create_notification", {
        p_user_id: gig.company_id,
        p_type: "new_match",
        p_title: "Novo interesse em seu Flink!",
        p_body: `Um profissional se interessou pelo flink "${gig.title}". Acesse Matches para aceitar.`,
        p_data: { gig_id: gig.id, worker_id: user.id },
      });

      toast.success("Flink aceito! Aguardando confirmação da empresa.", {
        icon: "🎉",
      });

      // Dismiss and advance
      setDismissedGigIds((prev) => {
        const next = new Set(prev);
        next.add(gig.id);
        localStorage.setItem("flinker_dismissed_gigs", JSON.stringify([...next]));
        return next;
      });
      setCurrentIndex((prev) => prev + 1);
    } catch (err) {
      console.error("Unexpected error:", err);
      toast.error("Erro inesperado. Tente novamente.");
    }

    setIsSubmitting(false);
  };

  const handleReject = (gig: GigData) => {
    setDismissedGigIds((prev) => {
      const next = new Set(prev);
      next.add(gig.id);
      localStorage.setItem("flinker_dismissed_gigs", JSON.stringify([...next]));
      return next;
    });
    setCurrentIndex((prev) => prev + 1);
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

        {/* Active filters banner */}
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
