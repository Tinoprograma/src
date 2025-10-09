// src/pages/Intro.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";

const HOME_ROUTE = "/home";

export default function Intro() {
  const nav = useNavigate();
  const reduceMotion = useReducedMotion();

  // Ocultar header/footer SOLO mientras la intro está visible
  useEffect(() => {
    document.body.classList.add("is-intro");
    return () => document.body.classList.remove("is-intro");
  }, []);

  // (Opcional) saltar intro si ya se vio
  useEffect(() => {
    if (localStorage.getItem("sabelo_seen_intro") === "1") {
      // nav(HOME_ROUTE, { replace: true });
    }
  }, [nav]);

  const goHome = () => {
    localStorage.setItem("sabelo_seen_intro", "1");
    nav(HOME_ROUTE);
  };

  // Variantes de animación con soporte a "prefers-reduced-motion"
  const fadeUp = reduceMotion
    ? {}
    : { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 } };

  return (
    <div
      className="relative min-h-screen overflow-hidden bg-black text-white"
      style={{
        // safe areas (iOS)
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Fondo con degradé y blobs (más chicos en mobile) */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-20 -left-20 h-56 w-56 rounded-full bg-fuchsia-600/30 blur-3xl sm:h-80 sm:w-80 md:h-96 md:w-96" />
        <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-sky-500/25 blur-3xl sm:h-96 sm:w-96 md:h-[28rem] md:w-[28rem]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.08),transparent_50%)]" />
      </div>

      {/* Rayita animada arriba (sin animación si reduceMotion) */}
      <motion.div
        className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-fuchsia-500 via-emerald-400 to-sky-400"
        {...(reduceMotion
          ? {}
          : { initial: { scaleX: 0, originX: 0 }, animate: { scaleX: 1 }, transition: { duration: 1.2, ease: "easeOut" } })}
      />

      {/* Contenido */}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 sm:px-6">
        <div className="w-full max-w-3xl text-center">
          <motion.h1
            className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1]"
            {...fadeUp}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="text-white">SABELO</span>
            <span className="ml-2 bg-gradient-to-r from-fuchsia-400 via-emerald-300 to-sky-400 bg-clip-text text-transparent">
              Lyrics
            </span>
          </motion.h1>

          <motion.p
            className="mt-4 sm:mt-5 text-base sm:text-lg md:text-xl text-zinc-300"
            {...fadeUp}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
          >
            Agregá letras, asociá artistas y álbumes, y compartí tus anotaciones.
          </motion.p>

          {/* Pills estáticas en mobile, marquee solo en >= sm */}
          <div className="mt-8">
            {/* Mobile/XS: chips */}
            <div className="flex flex-wrap justify-center gap-2 sm:hidden">
              {["Letras", "Artistas", "Álbumes", "Anotaciones"].map((t) => (
                <span
                  key={t}
                  className="text-xs px-3 py-1 rounded-full bg-zinc-900/60 border border-zinc-800 text-zinc-300"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* >= sm: marquee (se oculta en mobile) */}
            <motion.div
              className="hidden sm:block overflow-hidden rounded-2xl border border-zinc-800/70 bg-zinc-900/40"
              {...(reduceMotion ? {} : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { delay: 0.2 } })}
            >
              <div className="animate-[marquee_18s_linear_infinite] whitespace-nowrap py-3 text-zinc-400">
                ♪ Letras • Artistas • Álbumes • Anotaciones • Traducciones • Favoritos • Playlists • Búsqueda
                inteligente •
              </div>
            </motion.div>
          </div>

          {/* CTA: full-width en mobile, auto en desktop */}
          <motion.div
            className="mt-10 sm:mt-12"
            {...(reduceMotion ? {} : { initial: { scale: 0.98, opacity: 0 }, animate: { scale: 1, opacity: 1 }, transition: { delay: 0.35 } })}
          >
            <button
              onClick={goHome}
              className="w-full sm:w-auto px-6 sm:px-8 py-3 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-500 active:bg-fuchsia-700 font-semibold shadow-lg shadow-fuchsia-600/30 transition"
            >
              Entrar a SABELO
            </button>
          </motion.div>

          <p className="mt-5 sm:mt-6 text-xs sm:text-sm text-zinc-500">
            Tip: iniciá sesión para guardar tus letras y anotaciones.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </div>
  );
}
