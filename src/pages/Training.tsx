import { useNavigate } from "react-router-dom";
import { GraduationCap, Play, Trophy, TrendingUp, ChevronRight, CheckCircle, Lock, Flame } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import BottomNav from "@/components/BottomNav";

import thumb1 from "@/assets/training-thumb-1.jpg";
import thumb2 from "@/assets/training-thumb-2.jpg";
import thumb3 from "@/assets/training-thumb-3.jpg";
import thumb4 from "@/assets/training-thumb-4.jpg";

const categories = [
  { name: "Todos", count: 12, active: true },
  { name: "Atendimento", count: 5, active: false },
  { name: "Logística", count: 3, active: false },
  { name: "Gastronomia", count: 4, active: false },
];

const courses = [
  { id: 1, title: "Atendimento 5 estrelas", videos: 4, completed: 2, thumbnail: thumb1, category: "Atendimento", xp: 200, locked: false },
  { id: 2, title: "Logística eficiente", videos: 3, completed: 3, thumbnail: thumb2, category: "Logística", xp: 225, locked: false },
  { id: 3, title: "Barista profissional", videos: 5, completed: 0, thumbnail: thumb3, category: "Gastronomia", xp: 300, locked: false },
  { id: 4, title: "Recepção corporativa", videos: 4, completed: 0, thumbnail: thumb4, category: "Atendimento", xp: 200, locked: true },
];

const Training = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <div className="gradient-navy px-5 pb-6 pt-12">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <GraduationCap className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Treinamentos</h1>
            <p className="text-xs text-muted-foreground">Aprenda e suba no ranking</p>
          </div>
        </div>

        {/* XP Progress */}
        <div className="mt-5 rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span className="text-sm font-bold text-foreground">Nível 3</span>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold text-primary">425 XP</span>
            </div>
          </div>
          <Progress value={65} className="mt-3 h-2 bg-secondary" />
          <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
            <span>425 / 650 XP</span>
            <span>Próximo: Nível 4</span>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-card p-3 text-center border border-border">
            <p className="text-lg font-bold text-foreground">5</p>
            <p className="text-[10px] text-muted-foreground">Concluídos</p>
          </div>
          <div className="rounded-xl bg-card p-3 text-center border border-border">
            <p className="text-lg font-bold text-foreground">2</p>
            <p className="text-[10px] text-muted-foreground">Em progresso</p>
          </div>
          <div className="rounded-xl bg-card p-3 text-center border border-border">
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="h-4 w-4 text-primary" />
              <p className="text-lg font-bold text-foreground">12%</p>
            </div>
            <p className="text-[10px] text-muted-foreground">Ranking ↑</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5">
        {/* Quick Access - TikTok Feed */}
        <button
          onClick={() => navigate("/training/feed")}
          className="mb-6 flex w-full items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-4 transition-all active:scale-[0.98]"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary glow-orange">
            <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-bold text-foreground">Assistir Vídeos</p>
            <p className="text-xs text-muted-foreground">Deslize para aprender — estilo TikTok</p>
          </div>
          <ChevronRight className="h-5 w-5 text-primary" />
        </button>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.name}
              className={`flex-shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                cat.active
                  ? "gradient-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground"
              }`}
            >
              {cat.name} ({cat.count})
            </button>
          ))}
        </div>

        {/* Courses */}
        <h2 className="mt-4 text-base font-bold text-foreground">Cursos</h2>
        <div className="mt-3 space-y-3">
          {courses.map((course) => {
            const progress = course.videos > 0 ? (course.completed / course.videos) * 100 : 0;
            const isComplete = course.completed === course.videos && course.videos > 0;
            return (
              <button
                key={course.id}
                onClick={() => !course.locked && navigate("/training/feed")}
                className={`flex w-full items-center gap-3 rounded-2xl border border-border bg-card p-3 text-left transition-all card-hover ${course.locked ? "opacity-50" : ""}`}
              >
                <div className="relative h-20 w-14 flex-shrink-0 overflow-hidden rounded-xl">
                  <img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" loading="lazy" />
                  {course.locked && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  {isComplete && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/40">
                      <CheckCircle className="h-6 w-6 text-success" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="truncate text-sm font-bold text-foreground">{course.title}</h3>
                  </div>
                  <p className="text-[10px] text-muted-foreground">{course.category} • {course.videos} vídeos • {course.xp} XP</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={progress} className="h-1.5 flex-1 bg-secondary" />
                    <span className="text-[10px] font-semibold text-muted-foreground">{course.completed}/{course.videos}</span>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              </button>
            );
          })}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Training;
