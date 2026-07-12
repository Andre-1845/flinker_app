import { useState } from "react";
import { ArrowLeft, Plus, History, Info, CheckCircle, Clock, AlertCircle, Wallet } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import BottomNavCompany from "@/components/BottomNavCompany";

const COMMISSION_RATE = 0.08;

const mockTransactions = [
  { flink: "Atendente de loja", worker: 120, date: "12/03/2026", status: "paid" },
  { flink: "Garçom evento corporativo", worker: 200, date: "10/03/2026", status: "paid" },
  { flink: "Promotor de vendas", worker: 150, date: "08/03/2026", status: "pending" },
  { flink: "Auxiliar de carga", worker: 180, date: "05/03/2026", status: "paid" },
];

const statusConfig = {
  paid: { label: "Pago", icon: CheckCircle, color: "text-green-400" },
  pending: { label: "Pendente", icon: Clock, color: "text-yellow-400" },
  failed: { label: "Falhou", icon: AlertCircle, color: "text-destructive" },
};

const CompanyWallet = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [workerValue, setWorkerValue] = useState("");

  const numericValue = parseFloat(workerValue.replace(",", ".")) || 0;
  const fee = numericValue * COMMISSION_RATE;
  const total = numericValue + fee;

  const totalPaidWorkers = mockTransactions.filter(t => t.status === "paid").reduce((s, t) => s + t.worker, 0);
  const totalFees = mockTransactions.filter(t => t.status === "paid").reduce((s, t) => s + t.worker * COMMISSION_RATE, 0);
  const totalSpent = totalPaidWorkers + totalFees;

  const formatBRL = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const handlePayment = () => {
    if (numericValue <= 0) return;
    toast({
      title: "Pagamento realizado com sucesso",
      description: "O valor será processado e repassado ao profissional.",
    });
    setWorkerValue("");
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="gradient-navy px-5 pb-6 pt-12">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="rounded-full bg-secondary p-2">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Carteira da Empresa</h1>
            <p className="text-xs text-muted-foreground">Gerencie seus pagamentos e acompanhe seus gastos com flinks</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 pt-5">
        {/* Saldo */}
        <Card className="border-border">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground">Saldo disponível</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{formatBRL(4250)}</p>
            <div className="mt-4 flex gap-3">
              <Button
                size="sm"
                className="flex-1 gap-1.5 gradient-primary text-primary-foreground rounded-xl"
                onClick={() =>
                  toast({ title: "Adicionar saldo", description: "Adicione saldo à sua carteira para pagar seus flinks com mais rapidez e segurança." })
                }
              >
                <Plus className="h-4 w-4" /> Adicionar saldo
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="flex-1 gap-1.5 rounded-xl"
                onClick={() => navigate("/financial-history")}
              >
                <History className="h-4 w-4" /> Ver histórico
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Resumo financeiro */}
        <Card className="border-border">
          <CardHeader className="pb-2 p-5">
            <CardTitle className="text-base">Resumo das atividades</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5 pt-0">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total pago aos profissionais</span>
              <span className="font-semibold text-foreground">{formatBRL(totalPaidWorkers)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Taxas da Flinker</span>
              <span className="font-semibold text-foreground">{formatBRL(totalFees)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-foreground">Total geral gasto</span>
              <span className="font-bold text-primary">{formatBRL(totalSpent)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Explicação da taxa */}
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-5">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <div>
                <p className="text-sm font-semibold text-foreground">Como funciona a taxa da Flinker</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  A Flinker aplica uma taxa de 8% sobre cada pagamento realizado pela plataforma. Essa taxa garante a intermediação segura, registro das transações e funcionamento do sistema.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  O valor definido por sua empresa para o profissional permanece o mesmo. A taxa é adicionada separadamente ao total pago.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Simulação de pagamento */}
        <Card className="border-border">
          <CardHeader className="pb-2 p-5">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Simulação de pagamento</CardTitle>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-[200px] text-xs">Você define o valor do profissional. A Flinker adiciona 8% ao total como taxa operacional.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 p-5 pt-0">
            <div>
              <label className="text-xs text-muted-foreground">Valor para o profissional</label>
              <div className="relative mt-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
                <Input
                  className="pl-9"
                  placeholder="0,00"
                  value={workerValue}
                  onChange={(e) => setWorkerValue(e.target.value)}
                  inputMode="decimal"
                />
              </div>
            </div>

            <div className="space-y-2 rounded-xl bg-secondary/50 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Valor profissional</span>
                <span className="text-foreground">{formatBRL(numericValue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa Flinker (8%)</span>
                <span className="text-foreground">{formatBRL(fee)}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between text-sm font-bold">
                <span className="text-foreground">Total a pagar</span>
                <span className="text-primary">{formatBRL(total)}</span>
              </div>
            </div>

            <Button
              className="w-full gradient-primary glow-orange rounded-xl py-5 text-base font-bold text-primary-foreground"
              disabled={numericValue <= 0}
              onClick={handlePayment}
            >
              Confirmar pagamento
            </Button>
          </CardContent>
        </Card>

        {/* Histórico de transações */}
        <Card className="border-border">
          <CardHeader className="pb-2 p-5">
            <CardTitle className="text-base">Histórico de pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5 pt-0">
            {mockTransactions.map((tx, i) => {
              const txFee = tx.worker * COMMISSION_RATE;
              const txTotal = tx.worker + txFee;
              const st = statusConfig[tx.status as keyof typeof statusConfig];
              return (
                <div key={i} className="rounded-xl border border-border p-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-foreground">{tx.flink}</h4>
                    <div className={`flex items-center gap-1 text-xs font-medium ${st.color}`}>
                      <st.icon className="h-3.5 w-3.5" />
                      {st.label}
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Profissional</span>
                      <span className="text-foreground">{formatBRL(tx.worker)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Taxa Flinker</span>
                      <span className="text-foreground">{formatBRL(txFee)}</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-foreground">Total pago</span>
                      <span className="text-primary">{formatBRL(txTotal)}</span>
                    </div>
                  </div>
                  <p className="mt-1 text-right text-[10px] text-muted-foreground">{tx.date}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <BottomNavCompany />
    </div>
  );
};

export default CompanyWallet;
