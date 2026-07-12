import { useState } from "react";
import { AlertCircle, Lock, Shield } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { containsBlockedContent, getFilterWarning } from "@/lib/chatFilter";
import { toast } from "sonner";

const conversations = [
  { id: 1, name: "Festa & Cia", lastMessage: "Ótimo, te esperamos às 16h!", time: "14:30", unread: 2, avatar: "FC", confirmed: true },
  { id: 2, name: "SuperMart", lastMessage: "Pode confirmar sua presença?", time: "Ontem", unread: 0, avatar: "SM", confirmed: true },
  { id: 3, name: "CaféTop", lastMessage: "Pagamento enviado via PIX ✓", time: "10 Abr", unread: 0, avatar: "CT", confirmed: true },
];

const Chat = () => {
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [blocked, setBlocked] = useState(false);

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

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="px-5 pt-12">
        <h1 className="text-2xl font-bold text-foreground">Mensagens</h1>

        {/* Contact policy notice */}
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-primary/5 border border-primary/10 p-3">
          <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
          <p className="text-[11px] text-muted-foreground">
            O chat é liberado somente após o aceite bilateral do flink. Dados de contato são protegidos pela plataforma.
          </p>
        </div>

        <div className="mt-4 space-y-1">
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

        {/* Message input demo */}
        <div className="mt-6 rounded-xl bg-card p-4">
          <p className="mb-2 text-xs font-semibold text-muted-foreground">ENVIAR MENSAGEM</p>
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
            🛡️ Mensagens são filtradas para sua segurança. Dados de contato e negociações por fora são bloqueados.
          </p>
        </div>

        {/* Transaction security notice */}
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-warning/5 border border-warning/10 p-3">
          <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
          <p className="text-[11px] text-muted-foreground">
            Todas as transações devem ocorrer dentro da plataforma. Tentativas de negociação por fora resultam em penalidades.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Chat;
