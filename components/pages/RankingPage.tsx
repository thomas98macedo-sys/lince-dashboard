"use client";

import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Camera } from "lucide-react";
import { formatBRL } from "@/lib/utils";

const META = 14000;

interface Vendedor {
  id: number;
  nome: string;
  foto: string;
  initials: string;
  vendas: number;
}

const VENDEDORES_INICIAL: Vendedor[] = [
  { id: 1, nome: "Thomas Macedo", foto: "/vendedores/thomas.svg", initials: "TM", vendas: 0 },
  { id: 2, nome: "Léo Fernandes", foto: "/vendedores/leo.svg", initials: "LF", vendas: 0 },
  { id: 3, nome: "Filipe Dantas", foto: "/vendedores/filipe.svg", initials: "FD", vendas: 0 },
  { id: 4, nome: "Matheus Bueno", foto: "/vendedores/matheus.svg", initials: "MB", vendas: 0 },
];

const MEDAL = ["🥇", "🥈", "🥉", "4º"];

// ========== CONFETTI SYSTEM ==========
function launchConfetti(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const particles: {
    x: number; y: number; vx: number; vy: number;
    color: string; size: number; rotation: number; rotSpeed: number;
    life: number;
  }[] = [];

  const colors = ["#ff0088", "#ff44aa", "#cc0066", "#00ffff", "#ffdd00", "#ff6600", "#ffffff"];

  for (let i = 0; i < 150; i++) {
    particles.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 200,
      y: canvas.height / 2,
      vx: (Math.random() - 0.5) * 15,
      vy: Math.random() * -18 - 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 10,
      life: 1,
    });
  }

  let frameId: number;
  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;

    particles.forEach((p) => {
      if (p.life <= 0) return;
      alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.4; // gravity
      p.rotation += p.rotSpeed;
      p.life -= 0.008;
      p.vx *= 0.99;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (alive) {
      frameId = requestAnimationFrame(animate);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  animate();
  setTimeout(() => {
    cancelAnimationFrame(frameId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }, 5000);
}

// ========== MAIN COMPONENT ==========
export default function RankingPage() {
  const [vendedores, setVendedores] = useState<Vendedor[]>(VENDEDORES_INICIAL);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [celebratedIds, setCelebratedIds] = useState<Set<number>>(new Set());
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({});
  const confettiRef = useRef<HTMLCanvasElement>(null);
  const fileInputRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // Load photos from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lince-ranking-photos");
      if (saved) setPhotoUrls(JSON.parse(saved));
    } catch {}
  }, []);

  const handlePhotoUpload = useCallback((vendedorId: number, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPhotoUrls((prev) => {
        const updated = { ...prev, [vendedorId]: dataUrl };
        try { localStorage.setItem("lince-ranking-photos", JSON.stringify(updated)); } catch {}
        return updated;
      });
    };
    reader.readAsDataURL(file);
  }, []);

  // Sorted ranking
  const ranked = useMemo(() => {
    return [...vendedores].sort((a, b) => b.vendas - a.vendas);
  }, [vendedores]);

  const leaderId = ranked[0]?.vendas > 0 ? ranked[0].id : -1;

  const handleUpdateVendas = useCallback(
    (id: number, value: string) => {
      const num = parseFloat(value.replace(/[^\d.,]/g, "").replace(",", ".")) || 0;
      setVendedores((prev) =>
        prev.map((v) => (v.id === id ? { ...v, vendas: num } : v))
      );
      setEditingId(null);
      setEditValue("");

      // Fire confetti if meta reached and not celebrated yet
      if (num >= META && !celebratedIds.has(id)) {
        setCelebratedIds((prev) => new Set([...prev, id]));
        if (confettiRef.current) {
          launchConfetti(confettiRef.current);
        }
      }
    },
    [celebratedIds]
  );

  const startEdit = (v: Vendedor) => {
    setEditingId(v.id);
    setEditValue(v.vendas > 0 ? v.vendas.toString() : "");
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === "Enter") {
      handleUpdateVendas(id, editValue);
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditValue("");
    }
  };

  return (
    <div className="space-y-8 relative">
      {/* Confetti Canvas */}
      <canvas
        ref={confettiRef}
        className="fixed inset-0 z-50 pointer-events-none"
        style={{ width: "100vw", height: "100vh" }}
      />

      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-matrix-pink/20 border border-matrix-pink/40 flex items-center justify-center">
            <Trophy size={20} className="text-matrix-pink" />
          </div>
          <div>
            <h2 className="font-display text-xl font-bold tracking-wider text-neon">
              RANKING DE VENDAS DO MÊS
            </h2>
            <p className="text-xs text-gray-600 font-mono">
              Meta individual: {formatBRL(META)} // Competição em tempo real
            </p>
          </div>
        </div>
      </motion.div>

      {/* Ranking Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnimatePresence mode="popLayout">
          {ranked.map((vendedor, index) => {
            const progresso = Math.min((vendedor.vendas / META) * 100, 100);
            const isLeader = vendedor.id === leaderId;
            const isEditing = editingId === vendedor.id;
            const metaBatida = vendedor.vendas >= META;

            return (
              <motion.div
                key={vendedor.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{
                  opacity: 1,
                  scale: isLeader ? 1.03 : 1,
                  transition: { duration: 0.4, ease: "easeOut" },
                }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ scale: isLeader ? 1.06 : 1.03, transition: { duration: 0.2 } }}
                className={`relative rounded-2xl p-6 flex flex-col items-center text-center transition-all duration-500 ${
                  isLeader
                    ? "bg-gradient-to-b from-matrix-pink/15 via-black/40 to-black/60 border-2 border-matrix-pink/50 shadow-neon-lg"
                    : "glass-panel"
                }`}
                style={
                  isLeader
                    ? {
                        boxShadow: "0 0 30px rgba(255, 0, 136, 0.25), 0 0 60px rgba(255, 0, 136, 0.1)",
                      }
                    : undefined
                }
              >
                {/* Crown for leader */}
                {isLeader && (
                  <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2"
                  >
                    <div className="relative">
                      <Crown
                        size={36}
                        className="text-yellow-400 drop-shadow-lg"
                        fill="#fbbf24"
                        strokeWidth={1.5}
                      />
                      <div
                        className="absolute inset-0 animate-pulse"
                        style={{
                          filter: "blur(8px)",
                          background: "radial-gradient(circle, rgba(251,191,36,0.4) 0%, transparent 70%)",
                        }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Position Badge */}
                <div className="absolute top-3 left-3 text-lg">{MEDAL[index]}</div>

                {/* Photo — click to upload */}
                <div className={`relative mt-2 mb-3 ${isLeader ? "mt-4" : ""}`}>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={(el) => { fileInputRefs.current[vendedor.id] = el; }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handlePhotoUpload(vendedor.id, file);
                      e.target.value = "";
                    }}
                  />
                  <button
                    onClick={() => fileInputRefs.current[vendedor.id]?.click()}
                    className={`w-28 h-28 aspect-square rounded-full overflow-hidden relative group cursor-pointer ${
                      isLeader
                        ? "border-matrix-pink shadow-neon"
                        : metaBatida
                        ? "border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                        : "border-gray-700"
                    }`}
                    style={{ borderWidth: isLeader ? 3 : 2, borderStyle: "solid" }}
                    title={photoUrls[vendedor.id] ? "Clique para trocar foto" : "Clique para adicionar foto"}
                  >
                    {photoUrls[vendedor.id] ? (
                      <img
                        src={photoUrls[vendedor.id]}
                        alt={vendedor.nome}
                        className="w-full h-full object-cover"
                        style={{ objectPosition: "center 20%" }}
                      />
                    ) : (
                      <img
                        src={vendedor.foto}
                        alt={vendedor.nome}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const parent = target.parentElement;
                          if (parent && !parent.querySelector(".initials-fallback")) {
                            const div = document.createElement("div");
                            div.className =
                              "initials-fallback w-full h-full flex items-center justify-center bg-gradient-to-br from-matrix-pink/20 to-black text-matrix-pink font-display text-2xl font-bold";
                            div.textContent = vendedor.initials;
                            parent.appendChild(div);
                          }
                        }}
                      />
                    )}
                    {/* Camera overlay on hover with label */}
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                      <Camera size={20} className="text-white mb-1" />
                      <span className="text-[9px] text-white/80 font-mono">
                        {photoUrls[vendedor.id] ? "TROCAR" : "ADICIONAR"}
                      </span>
                    </div>
                  </button>
                  {/* Pulsing ring for leader */}
                  {isLeader && (
                    <div className="absolute inset-0 rounded-full animate-ping border-2 border-matrix-pink/30 pointer-events-none" style={{ animationDuration: "2s" }} />
                  )}
                </div>

                {/* Name */}
                <h3 className={`font-display text-sm font-bold tracking-wider mb-1 ${isLeader ? "text-matrix-pink" : "text-gray-200"}`}>
                  {vendedor.nome.toUpperCase()}
                </h3>

                {/* Meta */}
                <p className="text-[10px] text-gray-600 font-mono mb-3">
                  META: {formatBRL(META)}
                </p>

                {/* Sales Input */}
                <div className="w-full mb-4">
                  <p className="text-[10px] text-gray-500 font-mono mb-1 text-left">VENDAS ATUAIS:</p>
                  {isEditing ? (
                    <input
                      type="text"
                      autoFocus
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, vendedor.id)}
                      onBlur={() => handleUpdateVendas(vendedor.id, editValue)}
                      className="w-full bg-black/60 border border-matrix-pink/40 rounded-lg px-3 py-2 text-matrix-pink font-mono text-sm text-center focus:outline-none focus:border-matrix-pink focus:shadow-neon transition-all"
                      placeholder="Digite o valor..."
                    />
                  ) : (
                    <button
                      onClick={() => startEdit(vendedor)}
                      className="w-full bg-black/40 border border-gray-700/50 rounded-lg px-3 py-2 text-sm font-mono text-center hover:border-matrix-pink/40 hover:text-matrix-pink transition-all cursor-pointer group"
                    >
                      <span className={vendedor.vendas > 0 ? "text-matrix-pink" : "text-gray-600"}>
                        {vendedor.vendas > 0 ? formatBRL(vendedor.vendas) : "Clique para editar"}
                      </span>
                      <span className="ml-1 text-gray-700 group-hover:text-matrix-pink/50 text-[10px]">✎</span>
                    </button>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="w-full">
                  <div className="w-full h-3 rounded-full bg-black/60 border border-gray-800/50 overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-full relative"
                      initial={{ width: 0 }}
                      animate={{ width: `${progresso}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      style={{
                        background: metaBatida
                          ? "linear-gradient(90deg, #00cc88, #00ffaa)"
                          : "linear-gradient(90deg, #cc0066, #ff0088, #ff44aa)",
                        boxShadow: metaBatida
                          ? "0 0 10px rgba(0,204,136,0.5), 0 0 20px rgba(0,204,136,0.2)"
                          : "0 0 10px rgba(255,0,136,0.5), 0 0 20px rgba(255,0,136,0.2)",
                      }}
                    >
                      {/* Shimmer effect */}
                      <div
                        className="absolute inset-0 opacity-30"
                        style={{
                          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                          animation: "shimmer 2s infinite",
                        }}
                      />
                    </motion.div>
                  </div>
                  <div className="flex justify-between items-center mt-1.5">
                    <span className="text-[10px] font-mono text-gray-600">
                      {vendedor.vendas > 0 ? formatBRL(vendedor.vendas) : "R$ 0"}
                    </span>
                    <span
                      className={`text-xs font-mono font-bold ${
                        metaBatida ? "text-green-400" : progresso > 60 ? "text-matrix-pink" : "text-gray-500"
                      }`}
                    >
                      {progresso.toFixed(0)}%
                    </span>
                  </div>
                </div>

                {/* Meta achieved badge */}
                {metaBatida && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-3 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/30 text-green-400 text-[10px] font-mono font-bold"
                  >
                    🎯 META BATIDA!
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Summary Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-panel p-4"
      >
        <div className="flex flex-wrap gap-6 justify-center items-center text-center">
          <div>
            <p className="text-[10px] text-gray-600 font-mono mb-1">TOTAL EQUIPE</p>
            <p className="text-lg font-display text-matrix-pink font-bold">
              {formatBRL(vendedores.reduce((s, v) => s + v.vendas, 0))}
            </p>
          </div>
          <div className="w-px h-8 bg-gray-800 hidden sm:block" />
          <div>
            <p className="text-[10px] text-gray-600 font-mono mb-1">META TOTAL</p>
            <p className="text-lg font-display text-gray-400 font-bold">
              {formatBRL(META * 4)}
            </p>
          </div>
          <div className="w-px h-8 bg-gray-800 hidden sm:block" />
          <div>
            <p className="text-[10px] text-gray-600 font-mono mb-1">PROGRESSO EQUIPE</p>
            <p className={`text-lg font-display font-bold ${
              vendedores.reduce((s, v) => s + v.vendas, 0) >= META * 4 ? "text-green-400" : "text-cyan-400"
            }`}>
              {((vendedores.reduce((s, v) => s + v.vendas, 0) / (META * 4)) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="w-px h-8 bg-gray-800 hidden sm:block" />
          <div>
            <p className="text-[10px] text-gray-600 font-mono mb-1">METAS BATIDAS</p>
            <p className="text-lg font-display text-green-400 font-bold">
              {vendedores.filter((v) => v.vendas >= META).length} / 4
            </p>
          </div>
        </div>
      </motion.div>

      {/* Shimmer keyframe */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}
