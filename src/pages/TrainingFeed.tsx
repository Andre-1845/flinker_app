import { useState, useRef } from "react";
import { ArrowLeft, Heart, MessageCircle, Share2, BookmarkPlus, CheckCircle, Play, Volume2, VolumeX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Progress } from "@/components/ui/progress";

import thumb1 from "@/assets/training-thumb-1.jpg";
import thumb2 from "@/assets/training-thumb-2.jpg";
import thumb3 from "@/assets/training-thumb-3.jpg";
import thumb4 from "@/assets/training-thumb-4.jpg";

interface TrainingVideo {
  id: number;
  title: string;
  description: string;
  category: string;
  duration: string;
  likes: number;
  comments: number;
  author: string;
  authorAvatar: string;
  thumbnail: string;
  completed: boolean;
  xpReward: number;
}

const trainingVideos: TrainingVideo[] = [
  {
    id: 1, title: "Atendimento 5 estrelas", description: "Aprenda as técnicas de atendimento que garantem avaliação máxima",
    category: "Atendimento", duration: "0:45", likes: 1240, comments: 89, author: "Flinker Academy",
    authorAvatar: "FA", thumbnail: thumb1, completed: false, xpReward: 50,
  },
  {
    id: 2, title: "Logística eficiente", description: "Como organizar cargas e otimizar tempo em operações de logística",
    category: "Logística", duration: "1:20", likes: 856, comments: 42, author: "Flinker Academy",
    authorAvatar: "FA", thumbnail: thumb2, completed: true, xpReward: 75,
  },
  {
    id: 3, title: "Barista profissional", description: "Domine as técnicas de preparo de café especial e latte art",
    category: "Gastronomia", duration: "0:58", likes: 2103, comments: 156, author: "Café Expert",
    authorAvatar: "CE", thumbnail: thumb3, completed: false, xpReward: 60,
  },
  {
    id: 4, title: "Recepção corporativa", description: "Postura, comunicação e etiqueta para recepção em eventos corporativos",
    category: "Atendimento", duration: "1:05", likes: 967, comments: 73, author: "Flinker Academy",
    authorAvatar: "FA", thumbnail: thumb4, completed: false, xpReward: 50,
  },
];

const formatNumber = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n));

const TrainingFeed = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState<Set<number>>(new Set());
  const [muted, setMuted] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isDragging = useRef(false);

  const handleStart = (y: number) => { startY.current = y; isDragging.current = true; };
  const handleEnd = (y: number) => {
    if (!isDragging.current) return;
    isDragging.current = false;
    const diff = startY.current - y;
    if (diff > 60 && currentIndex < trainingVideos.length - 1) setCurrentIndex(prev => prev + 1);
    else if (diff < -60 && currentIndex > 0) setCurrentIndex(prev => prev - 1);
  };

  const toggleLike = (id: number) => setLiked(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  const toggleSave = (id: number) => setSaved(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });

  const video = trainingVideos[currentIndex];

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      {/* Video Container */}
      <div
        ref={containerRef}
        className="relative h-full w-full"
        onTouchStart={e => handleStart(e.touches[0].clientY)}
        onTouchEnd={e => handleEnd(e.changedTouches[0].clientY)}
        onMouseDown={e => handleStart(e.clientY)}
        onMouseUp={e => handleEnd(e.clientY)}
      >
        {/* Thumbnail as background */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{ backgroundImage: `url(${video.thumbnail})`, backgroundSize: "cover", backgroundPosition: "center" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-transparent to-background/90" />
        </div>

        {/* Top Bar */}
        <div className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-4 pt-12">
          <button onClick={() => navigate(-1)} className="rounded-full bg-background/30 p-2 backdrop-blur-sm">
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </button>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-bold text-primary-foreground">
              +{video.xpReward} XP
            </span>
            <button onClick={() => setMuted(!muted)} className="rounded-full bg-background/30 p-2 backdrop-blur-sm">
              {muted ? <VolumeX className="h-4 w-4 text-foreground" /> : <Volume2 className="h-4 w-4 text-foreground" />}
            </button>
          </div>
        </div>

        {/* Play button overlay */}
        <div className="absolute inset-0 z-10 flex items-center justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/30 backdrop-blur-sm">
            <Play className="h-8 w-8 text-foreground ml-1" />
          </div>
        </div>

        {/* Side Actions */}
        <div className="absolute right-3 bottom-36 z-20 flex flex-col items-center gap-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-full gradient-primary text-xs font-bold text-primary-foreground">
            {video.authorAvatar}
          </div>

          <button onClick={() => toggleLike(video.id)} className="flex flex-col items-center gap-1">
            <Heart className={`h-7 w-7 ${liked.has(video.id) ? "fill-destructive text-destructive" : "text-foreground"}`} />
            <span className="text-[10px] font-semibold text-foreground">{formatNumber(video.likes + (liked.has(video.id) ? 1 : 0))}</span>
          </button>

          <button className="flex flex-col items-center gap-1">
            <MessageCircle className="h-7 w-7 text-foreground" />
            <span className="text-[10px] font-semibold text-foreground">{formatNumber(video.comments)}</span>
          </button>

          <button onClick={() => toggleSave(video.id)} className="flex flex-col items-center gap-1">
            <BookmarkPlus className={`h-7 w-7 ${saved.has(video.id) ? "fill-primary text-primary" : "text-foreground"}`} />
            <span className="text-[10px] font-semibold text-foreground">Salvar</span>
          </button>

          <button className="flex flex-col items-center gap-1">
            <Share2 className="h-7 w-7 text-foreground" />
            <span className="text-[10px] font-semibold text-foreground">Enviar</span>
          </button>
        </div>

        {/* Bottom Info */}
        <div className="absolute bottom-0 left-0 right-16 z-20 px-4 pb-8">
          <div className="flex items-center gap-2 mb-2">
            <span className="rounded-md bg-secondary/80 px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground backdrop-blur-sm">
              {video.category}
            </span>
            <span className="text-xs text-foreground/70">{video.duration}</span>
            {video.completed && (
              <span className="flex items-center gap-1 text-xs text-success">
                <CheckCircle className="h-3 w-3" /> Concluído
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-foreground leading-tight">{video.title}</h2>
          <p className="mt-1 text-xs text-foreground/70 leading-relaxed line-clamp-2">{video.description}</p>
          <p className="mt-2 text-xs font-semibold text-foreground/80">@{video.author}</p>
        </div>

        {/* Progress dots */}
        <div className="absolute bottom-2 left-0 right-0 z-20 flex items-center justify-center gap-1.5">
          {trainingVideos.map((_, i) => (
            <div key={i} className={`h-1 rounded-full transition-all ${i === currentIndex ? "w-6 bg-primary" : "w-1.5 bg-foreground/30"}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrainingFeed;
