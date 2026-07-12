/**
 * ⚠️ PENDENTE (ver docs/FRONTEND_MIGRATION.md): esta tela permite a empresa "dar swipe"
 * diretamente em profissionais (sem estar ligado a um Flink específico). Isso não tem
 * endpoint correspondente no backend Laravel — lá, o fluxo é sempre profissional demonstra
 * interesse em um Flink publicado, e a empresa aceita (ver Fase 3 do backend). Ainda 100%
 * mock. Precisa de uma decisão de produto antes de migrar: vira uma feature nova no
 * backend, ou é substituída pelo fluxo de Match já existente?
 */
import { useState, useMemo } from "react";
import { Filter, Info, Loader2 } from "lucide-react";
import BottomNavCompany from "@/components/BottomNavCompany";
import CompanyWorkerFilters, {
  CompanyActiveFiltersBanner,
  CompanyFilterValues,
  getDefaultCompanyFilters,
} from "@/components/CompanyWorkerFilters";
import SwipeableWorkerCard, { WorkerData } from "@/components/SwipeableWorkerCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const STORAGE_KEY = "flinker_company_worker_filters";

const mockWorkers: WorkerData[] = [
  {
    id: "w1", name: "Ana Souza", role: "Garçonete", rating: 4.9, flinks: 52,
    location: "São Paulo", medal: "Ouro", avatar: "AS",
    trainings: ["Garçom", "Atendimento", "Eventos"], verified: true,
    matchScore: 96, comment: "Excelente profissional, super pontual.",
  },
  {
    id: "w2", name: "Bruno Lima", role: "Auxiliar de Carga", rating: 4.7, flinks: 38,
    location: "Guarulhos", medal: "Prata", avatar: "BL",
    trainings: ["Logística", "Estoque"], verified: false,
    matchScore: 91, comment: "Muito dedicado e confiável.",
  },
  {
    id: "w3", name: "Carla Mendes", role: "Promotora", rating: 4.6, flinks: 29,
    location: "São Paulo", medal: "Prata", avatar: "CM",
    trainings: ["Vendas", "Comércio", "Atendimento"], verified: true,
    matchScore: 87, comment: "Ótima comunicação com clientes.",
  },
  {
    id: "w4", name: "Diego Santos", role: "Garçom", rating: 4.4, flinks: 15,
    location: "Osasco", medal: "Bronze", avatar: "DS",
    trainings: ["Garçom", "Eventos"], verified: false,
    matchScore: 78, comment: "Proativo e esforçado.",
  },
  {
    id: "w5", name: "Elisa Ferreira", role: "Recepcionista", rating: 4.8, flinks: 63,
    location: "São Paulo", medal: "Ouro", avatar: "EF",
    trainings: ["Recepção", "Atendimento", "Eventos"], verified: true,
    matchScore: 94, comment: "Referência em eventos corporativos.",
  },
  {
    id: "w6", name: "Fábio Rocha", role: "Estoquista", rating: 4.1, flinks: 8,
    location: "Santo André", medal: "Bronze", avatar: "FR",
    trainings: ["Estoque", "Logística"], verified: false,
    matchScore: 65, comment: "Começando bem na plataforma.",
  },
];

function loadSavedFilters(): CompanyFilterValues {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...getDefaultCompanyFilters(),
        ...parsed,
        dateFrom: parsed.dateFrom ? new Date(parsed.dateFrom) : undefined,
        dateTo: parsed.dateTo ? new Date(parsed.dateTo) : undefined,
      };
    }
  } catch {}
  return getDefaultCompanyFilters();
}

function saveFilters(f: CompanyFilterValues) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(f));
}

function isFiltersActive(f: CompanyFilterValues): boolean {
  const d = getDefaultCompanyFilters();
  return (
    f.minRating > d.minRating ||
    f.medals.length > 0 ||
    f.radiusKm !== d.radiusKm ||
    f.trainings.length > 0 ||
    !!f.dateFrom ||
    !!f.experienceLevel ||
    !!f.city ||
    !!f.keywords ||
    f.autoMatch
  );
}

const CompanyGigFeed = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<CompanyFilterValues>(loadSavedFilters);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem("flinker_dismissed_workers");
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const filteredWorkers = useMemo(() => {
    let workers = mockWorkers.filter((w) => !dismissedIds.has(w.id));

    if (filters.minRating > 1) {
      workers = workers.filter((w) => w.rating >= filters.minRating);
    }
    if (filters.medals.length > 0) {
      workers = workers.filter((w) => filters.medals.includes(w.medal));
    }
    if (filters.trainings.length > 0) {
      workers = workers.filter((w) =>
        filters.trainings.some((t) => w.trainings.includes(t))
      );
    }
    if (filters.experienceLevel) {
      workers = workers.filter((w) => {
        if (filters.experienceLevel === "beginner") return w.flinks <= 10;
        if (filters.experienceLevel === "intermediate") return w.flinks > 10 && w.flinks <= 50;
        if (filters.experienceLevel === "expert") return w.flinks > 50;
        return true;
      });
    }
    if (filters.city.trim()) {
      const city = filters.city.toLowerCase().trim();
      workers = workers.filter((w) => w.location.toLowerCase().includes(city));
    }
    if (filters.keywords.trim()) {
      const kw = filters.keywords.toLowerCase().trim();
      workers = workers.filter(
        (w) =>
          w.name.toLowerCase().includes(kw) ||
          w.role.toLowerCase().includes(kw) ||
          w.trainings.some((t) => t.toLowerCase().includes(kw)) ||
          w.comment.toLowerCase().includes(kw)
      );
    }

    workers.sort((a, b) => b.matchScore - a.matchScore);
    return workers;
  }, [filters, dismissedIds]);

  const dismissWorker = (id: string) => {
    setDismissedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem("flinker_dismissed_workers", JSON.stringify([...next]));
      return next;
    });
    setCurrentIndex((prev) => prev + 1);
  };

  const handleAccept = (worker: WorkerData) => {
    toast.success(`Interesse enviado para ${worker.name}!`, { icon: "🎉" });
    dismissWorker(worker.id);
  };

  const handleReject = (worker: WorkerData) => {
    dismissWorker(worker.id);
  };

  const handleApplyFilters = (f: CompanyFilterValues) => {
    setFilters(f);
    saveFilters(f);
    setCurrentIndex(0);
  };

  const handleClearFilters = () => {
    const d = getDefaultCompanyFilters();
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
            <h1 className="text-2xl font-bold text-foreground">Buscar Profissionais</h1>
            <p className="text-sm text-muted-foreground">Deslize para avaliar profissionais</p>
          </div>
          <button
            onClick={() => setFiltersOpen(true)}
            className={cn(
              "relative rounded-full p-2.5 transition-colors",
              hasActiveFilters ? "bg-primary/20" : "bg-secondary"
            )}
          >
            <Filter className={cn("h-5 w-5", hasActiveFilters ? "text-primary" : "text-foreground")} />
            {hasActiveFilters && (
              <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 rounded-full bg-primary" />
            )}
          </button>
        </div>

        {hasActiveFilters ? (
          <CompanyActiveFiltersBanner filters={filters} onClear={handleClearFilters} />
        ) : (
          <div className="mt-3 flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2.5">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Busca inteligente.</span>{" "}
              Deslize para a direita para demonstrar interesse ou para a esquerda para pular.
            </p>
          </div>
        )}

        <div className="mt-6 flex items-center justify-center">
          {currentIndex < filteredWorkers.length ? (
            <SwipeableWorkerCard
              key={filteredWorkers[currentIndex].id}
              worker={filteredWorkers[currentIndex]}
              onAccept={handleAccept}
              onReject={handleReject}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="flex flex-col items-center gap-4 py-20">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
                <span className="text-3xl">🔍</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {filteredWorkers.length === 0 && dismissedIds.size === 0
                  ? "Nenhum profissional disponível no momento."
                  : "Todos avaliados!"}
              </p>
              <p className="text-sm text-muted-foreground text-center">
                {hasActiveFilters
                  ? "Tente ajustar seus filtros"
                  : "Novos profissionais chegam em breve"}
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

      <CompanyWorkerFilters
        open={filtersOpen}
        onOpenChange={setFiltersOpen}
        filters={filters}
        onApply={handleApplyFilters}
        onClear={handleClearFilters}
      />

      <BottomNavCompany />
    </div>
  );
};

export default CompanyGigFeed;
