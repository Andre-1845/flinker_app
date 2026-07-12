import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Filter, DollarSign, Calendar } from "lucide-react";
import BottomNav from "@/components/BottomNav";

const months = [
  {
    month: "Abril 2026",
    total: 632.4,
    gigs: [
      { title: "Garçom VIP", company: "Eventos Premium", gross: 200, commission: 16, net: 184, date: "10 Abr", status: "paid" },
      { title: "Promotor", company: "SuperMart", gross: 120, commission: 9.6, net: 110.4, date: "08 Abr", status: "paid" },
      { title: "Auxiliar de Carga", company: "LogiTrans", gross: 150, commission: 12, net: 138, date: "05 Abr", status: "paid" },
      { title: "Garçom Evento", company: "Festa & Cia", gross: 220, commission: 17.6, net: 200, date: "Hoje", status: "pending" },
    ],
  },
  {
    month: "Março 2026",
    total: 1410.0,
    gigs: [
      { title: "Barista", company: "CaféTop", gross: 180, commission: 14.4, net: 165.6, date: "28 Mar", status: "paid" },
      { title: "Garçom", company: "Restaurante Bom", gross: 200, commission: 16, net: 184, date: "22 Mar", status: "paid" },
    ],
  },
];

const FinancialHistory = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-navy px-5 pb-6 pt-12">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="rounded-full bg-secondary p-2">
              <ArrowLeft className="h-5 w-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Histórico Financeiro</h1>
              <p className="text-xs text-muted-foreground">Seus ganhos detalhados</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="rounded-full bg-secondary p-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
            </button>
            <button className="rounded-full bg-secondary p-2">
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5">
        {months.map((m) => (
          <div key={m.month} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">{m.month}</h3>
              </div>
              <span className="text-sm font-bold text-[hsl(var(--success))]">
                R$ {m.total.toFixed(2).replace(".", ",")}
              </span>
            </div>
            <div className="space-y-2">
              {m.gigs.map((gig, i) => (
                <div key={i} className="rounded-xl bg-card p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-foreground">{gig.title}</p>
                      <p className="text-[11px] text-muted-foreground">{gig.company} • {gig.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-foreground">R$ {gig.net.toFixed(2)}</p>
                      <p className="text-[10px] text-muted-foreground">
                        Bruto: R$ {gig.gross.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-primary" />
                      <span className="text-[10px] text-primary">Comissão: R$ {gig.commission.toFixed(2)}</span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        gig.status === "paid"
                          ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]"
                          : "bg-warning/10 text-warning"
                      }`}
                    >
                      {gig.status === "paid" ? "Pago" : "Pendente"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default FinancialHistory;
