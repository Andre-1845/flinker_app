import { useState, useEffect, useMemo } from "react";
import { Calendar, Clock, MapPin, ChevronLeft, ChevronRight, AlertCircle, MessageSquare } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { containsBlockedContent, getFilterWarning } from "@/lib/chatFilter";
import { listMyMatches } from "@/lib/matches";
import type { FlinkMatch } from "@/lib/types";
import { toast } from "sonner";

interface ScheduleItem {
  id: number;
  title: string;
  company: string;
  location: string;
  date: string;
  time: string;
  payment: string;
  status: "pending" | "confirmed" | "in_progress" | "cancelled";
}

function matchToScheduleItem(match: FlinkMatch): ScheduleItem | null {
  const flink = match.flink;
  if (!flink) return null;

  const start = new Date(flink.start_date_time);
  const end = new Date(flink.end_date_time);
  const fmtTime = (d: Date) => d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  let status: ScheduleItem["status"] = "pending";
  if (match.status === "confirmed") {
    status = flink.status === "in_progress" || flink.status === "completed" ? "in_progress" : "confirmed";
  } else if (match.status === "rejected" || match.status === "cancelled") {
    status = "cancelled";
  }

  return {
    id: match.id,
    title: flink.activity_type,
    company: flink.company?.responsible_name ?? "Empresa",
    location: flink.location,
    date: flink.start_date_time.slice(0, 10),
    time: `${fmtTime(start)}-${fmtTime(end)}`,
    payment: `R$ ${flink.pricing.net_value.toFixed(2)}`,
    status,
  };
}

const conversations = [
  { id: 1, name: "Festa & Cia", lastMessage: "Ótimo, te esperamos às 16h!", time: "14:30", unread: 2, avatar: "FC", flinkTitle: "Garçom para Casamento" },
  { id: 2, name: "SuperMart", lastMessage: "Pode confirmar sua presença?", time: "Ontem", unread: 0, avatar: "SM", flinkTitle: "Promotor de Vendas" },
  { id: 3, name: "CaféTop", lastMessage: "Pagamento enviado via PIX ✓", time: "10 Abr", unread: 0, avatar: "CT", flinkTitle: "Barista Café Premium" },
];

const statusColors = {
  pending: { bg: "bg-warning/10", border: "border-warning/30", dot: "bg-warning", label: "Pendente" },
  confirmed: { bg: "bg-success/10", border: "border-success/30", dot: "bg-success", label: "Confirmado" },
  in_progress: { bg: "bg-primary/10", border: "border-primary/30", dot: "bg-primary", label: "Em andamento" },
  cancelled: { bg: "bg-destructive/10", border: "border-destructive/30", dot: "bg-destructive", label: "Cancelado" },
};

const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

const Schedule = () => {
  const [activeTab, setActiveTab] = useState<"agenda" | "chat">("agenda");
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);

  useEffect(() => {
    listMyMatches()
      .then((res) => {
        const items = res.data.map(matchToScheduleItem).filter((i): i is ScheduleItem => i !== null);
        setSchedule(items);
      })
      .catch(() => toast.error("Não foi possível carregar sua agenda."));
  }, []);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const flinkDates = new Set(schedule.filter(s => s.status !== "cancelled").map(s => s.date));

  const filteredFlinks = useMemo(
    () => (selectedDate ? schedule.filter((g) => g.date === selectedDate) : schedule),
    [schedule, selectedDate]
  );

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const handleSend = () => {
    if (!message.trim()) return;
    if (containsBlockedContent(message)) {
      setBlocked(true);
      toast.error(getFilterWarning());
      setTimeout(() => setBlocked(false), 3000);
      return;
    }
    setMessage("");
  };

  const totalUnread = conversations.reduce((sum, c) => sum + c.unread, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-12">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <Calendar className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Agenda</h1>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Seus compromissos e conversas</p>

        {/* Tab Navigation */}
        <div className="flex rounded-xl bg-secondary/50 p-1 mb-5">
          <button
            onClick={() => setActiveTab("agenda")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors ${
              activeTab === "agenda"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Agenda
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors relative ${
              activeTab === "chat"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
            {totalUnread > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {totalUnread}
              </span>
            )}
          </button>
        </div>

        {/* AGENDA TAB */}
        {activeTab === "agenda" && (
          <>
            {/* Mini Calendar */}
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between mb-3">
                <button onClick={prevMonth} className="p-1 rounded-full hover:bg-secondary">
                  <ChevronLeft className="h-5 w-5 text-muted-foreground" />
                </button>
                <span className="font-semibold text-foreground">
                  {months[currentMonth]} {currentYear}
                </span>
                <button onClick={nextMonth} className="p-1 rounded-full hover:bg-secondary">
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {weekdays.map((d) => (
                  <span key={d} className="text-[10px] font-medium text-muted-foreground py-1">{d}</span>
                ))}
                {Array.from({ length: firstDay }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const hasFlink = flinkDates.has(dateStr);
                  const isSelected = selectedDate === dateStr;

                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                      className={`relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-medium transition-colors mx-auto
                        ${isSelected ? "bg-primary text-primary-foreground" : hasFlink ? "bg-primary/15 text-primary" : "text-foreground hover:bg-secondary"}`}
                    >
                      {day}
                      {hasFlink && !isSelected && (
                        <span className="absolute bottom-0.5 h-1 w-1 rounded-full bg-primary" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-3">
              {Object.entries(statusColors).map(([key, val]) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${val.dot}`} />
                  <span className="text-[10px] text-muted-foreground">{val.label}</span>
                </div>
              ))}
            </div>

            {/* Flink List */}
            <div className="mt-5 space-y-3">
              {selectedDate && filteredFlinks.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">Nenhum flink nesta data</p>
              )}
              {filteredFlinks.map((flink) => {
                const sc = statusColors[flink.status];
                return (
                  <div key={flink.id} className={`rounded-2xl border ${sc.border} ${sc.bg} p-4`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`h-2.5 w-2.5 rounded-full ${sc.dot}`} />
                          <h3 className="font-bold text-foreground">{flink.title}</h3>
                        </div>
                        <p className="ml-[18px] text-xs text-muted-foreground">{flink.company}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-foreground">{flink.payment}</p>
                        <span className="text-[10px] text-muted-foreground">{sc.label}</span>
                      </div>
                    </div>
                    <div className="mt-3 ml-[18px] flex flex-col gap-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>{flink.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        <span>{flink.location}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* CHAT TAB */}
        {activeTab === "chat" && (
          <>
            {selectedChat ? (
              <div>
                <button
                  onClick={() => setSelectedChat(null)}
                  className="flex items-center gap-2 text-sm text-primary font-medium mb-4"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Voltar às conversas
                </button>

                {/* Chat header */}
                {(() => {
                  const conv = conversations.find(c => c.id === selectedChat);
                  return conv ? (
                    <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-card border border-border">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                        {conv.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{conv.name}</p>
                        <p className="text-xs text-muted-foreground">{conv.flinkTitle}</p>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Messages area */}
                <div className="rounded-xl bg-card border border-border p-4 min-h-[200px] mb-4">
                  <p className="text-center text-xs text-muted-foreground py-8">
                    Início da conversa
                  </p>
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Digite sua mensagem..."
                    className={`flex-1 rounded-xl border bg-secondary p-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none ${
                      blocked ? "border-destructive" : "border-border focus:border-primary"
                    }`}
                  />
                  <button
                    onClick={handleSend}
                    className="rounded-xl gradient-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"
                  >
                    Enviar
                  </button>
                </div>
                {blocked && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg bg-destructive/10 p-2">
                    <AlertCircle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-destructive" />
                    <p className="text-[11px] text-destructive">{getFilterWarning()}</p>
                  </div>
                )}
                <p className="mt-2 text-[10px] text-muted-foreground">
                  🛡️ Mensagens são filtradas para sua segurança.
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedChat(conv.id)}
                    className="flex w-full items-center gap-3 rounded-xl p-3 transition-colors hover:bg-secondary/50"
                  >
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full gradient-primary text-sm font-bold text-primary-foreground">
                      {conv.avatar}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-foreground">{conv.name}</p>
                        <span className="text-xs text-muted-foreground">{conv.time}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{conv.flinkTitle}</p>
                      <p className="truncate text-sm text-muted-foreground">{conv.lastMessage}</p>
                    </div>
                    {conv.unread > 0 && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                        {conv.unread}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Schedule;
