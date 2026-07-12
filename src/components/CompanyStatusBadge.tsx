import { CompanyStatus } from "@/hooks/useCompanyProfile";

const statusConfig: Record<CompanyStatus, { color: string; label: string; dot: string }> = {
  incomplete: { color: "text-destructive", label: "Cadastro incompleto", dot: "🔴" },
  complete: { color: "text-warning", label: "Cadastro completo", dot: "🟡" },
  verified: { color: "text-[hsl(var(--success))]", label: "Empresa verificada", dot: "🟢" },
};

const CompanyStatusBadge = ({ status }: { status: CompanyStatus }) => {
  const cfg = statusConfig[status];
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs">{cfg.dot}</span>
      <span className={`text-[10px] font-semibold ${cfg.color}`}>{cfg.label}</span>
    </div>
  );
};

export default CompanyStatusBadge;
