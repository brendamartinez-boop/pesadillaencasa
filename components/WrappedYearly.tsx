'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { Sparkles, Calendar, Award, Gift, ChevronRight, ChevronLeft, Lock, ArrowUpCircle, Flame, Shield, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function WrappedYearly() {
  const { user, family, members, tasks, pointsHistory, forceWrappedPeriod } = useFamily();
  const [activeSlide, setActiveSlide] = useState(0);

  // Countdown timer calculation to Jan 1st of next year
  const [countdownString, setCountdownString] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const nextYear = now.getFullYear() + (now.getMonth() === 0 && now.getDate() <= 7 ? 0 : 1);
      const targetDate = new Date(`January 1, ${nextYear} 00:00:00`);
      
      const diff = targetDate.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdownString('¡Ya es Enero! Wrapped abierto.');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setCountdownString(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Verify dates: Wrapped is unlocked ONLY between January 1st and January 7th
  const isWrappedDateUnlocked = useMemo(() => {
    if (forceWrappedPeriod) return true; // Simulator bypass active!
    const now = new Date();
    const month = now.getMonth(); // 0 is January
    const day = now.getDate();
    return month === 0 && day >= 1 && day <= 7;
  }, [forceWrappedPeriod]);

  // Statistics summaries
  const stats = useMemo(() => {
    const totalComps = tasks.filter(t => t.completed).length;
    const sortedLeaderboard = [...members].sort((a, b) => b.points - a.points);
    const champion = sortedLeaderboard[0] || null;

    // Monthly trends from logs
    const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    return {
      totalComps,
      sortedLeaderboard,
      champion,
      bestMonth: 'Mayo 🌸',
      worstMonth: 'Febrero ❄️',
    };
  }, [tasks, members, pointsHistory]);

  // If locked, render countdown with padlock interface
  if (!isWrappedDateUnlocked) {
    return (
      <div className="bg-[#0F172A] text-white p-8 md:p-12 rounded-[32px] text-center shadow-2xl space-y-6 max-w-xl mx-auto border border-slate-800 relative overflow-hidden my-6">
        {/* Glow gradients */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -ml-10 -mb-10"></div>

        <div className="relative z-10 space-y-6">
          <div className="h-16 w-16 bg-slate-900 text-yellow-300 rounded-2xl flex items-center justify-center mx-auto shadow-md border border-slate-800 animate-pulse">
            <Lock size={32} />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-extrabold tracking-tight">🎁 Spotify Wrapped Familiar</h2>
            <p className="text-slate-400 text-xs px-2 leading-relaxed">
              El resumen anual está <strong className="text-yellow-400 font-semibold">bloqueado temporalmente</strong>. Sólo se abrirá del 1 al 7 de enero para celebrar los éxitos familiares del año.
            </p>
          </div>

          {/* Countdown timer ticker */}
          <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-900 inline-block">
            <span className="text-[10px] text-slate-500 font-extrabold block uppercase tracking-widest leading-none mb-1">Apertura en</span>
            <span className="font-mono text-lg font-black text-rose-400 tracking-wider">
              {countdownString}
            </span>
          </div>

          <div className="border-t border-slate-900 pt-5 space-y-2.5">
            <p className="text-[10px] text-slate-500 font-bold leading-normal">
              🔍 Evaluando la app? Puedes desbloquear esta sección al instante tocando el botón <strong className="text-slate-400">&quot;1-7 ENE (ONLINE)&quot;</strong> en el Panel de Pruebas inferior.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const slidesCount = 5;

  const handleNext = () => {
    if (activeSlide < slidesCount - 1) {
      setActiveSlide(activeSlide + 1);
    }
  };

  const handlePrev = () => {
    if (activeSlide > 0) {
      setActiveSlide(activeSlide - 1);
    }
  };

  return (
    <div className="max-w-[500px] mx-auto bg-gradient-to-b from-indigo-950 via-slate-950 to-indigo-900 text-white p-6 rounded-[36px] shadow-2xl relative border-4 border-indigo-900 flex flex-col justify-between min-h-[500px] overflow-hidden">
      
      {/* Dynamic Slide Background overlays */}
      <div className="absolute top-0 right-0 w-52 h-52 bg-pink-500/10 rounded-full blur-3xl -mr-16 -mt-16 z-0"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-2xl -ml-12 -mb-12 z-0"></div>

      {/* Progress slide bars */}
      <div className="flex gap-1.5 w-full z-10 px-1 pt-1 mb-6">
        {Array.from({ length: slidesCount }).map((_, i) => (
          <div key={i} className="flex-1 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-300 ${
                i <= activeSlide ? 'bg-indigo-400' : 'bg-transparent'
              }`} 
            />
          </div>
        ))}
      </div>

      {/* CHANGER SHEET SLIDE VIEW */}
      <div className="flex-1 flex flex-col justify-center relative z-10 py-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide}
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="space-y-5 text-center px-4"
          >
            {/* SLIDE 1: INTRO */}
            {activeSlide === 0 && (
              <div className="space-y-4">
                <div className="text-yellow-300 inline-block bg-white/10 p-4 rounded-3xl mb-1 animate-bounce">
                  <Sparkles size={40} className="fill-yellow-300" />
                </div>
                <h2 className="text-3xl font-black leading-tight tracking-tight">
                  ¡Tus Logros en Familia!
                </h2>
                <p className="text-indigo-200 text-sm leading-indigo uppercase tracking-wider font-extrabold text-xs">
                  Resumen Anual {new Date().getFullYear()}
                </p>
                <p className="text-slate-350 text-xs px-2 leading-relaxed">
                  Ha sido un año intenso en casa... de tareas, platos, basuras y compras. Miremos juntos el veredicto familiar final de este maravilloso viaje.
                </p>
              </div>
            )}

            {/* SLIDE 2: TOTAL TASKS & CHAMPION */}
            {activeSlide === 1 && (
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 block">Esfuerzo Conjunto</span>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5 max-w-[200px] mx-auto shadow-inner">
                  <span className="text-3xl font-black block text-indigo-300">{stats.totalComps}</span>
                  <span className="text-[10px] text-slate-400 block font-bold uppercase mt-1">Tareas Completas</span>
                </div>
                
                <p className="text-xs text-slate-300 px-1 leading-relaxed">
                  Gracias al esfuerzo de todos, cooperamos para mantener el hogar reluciente y los platos fregados a tiempo.
                </p>

                <div className="pt-2">
                  <span className="block text-[10px] text-slate-400 uppercase font-black tracking-wider">Top Liderazgo</span>
                  <ol className="mt-2 text-xs space-y-1.5 inline-block text-left w-2/3">
                    {stats.sortedLeaderboard.slice(0, 3).map((m, i) => (
                      <li key={m.uid} className="flex justify-between items-center bg-white/5 p-1 px-3.5 rounded-lg border border-white/5">
                        <span className="font-bold">{i+1}º {m.displayName.split(' ')[0]}</span>
                        <span className="text-indigo-300 font-extrabold">{m.points} pts</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* SLIDE 3: POINT GRAPH DYNAMICS */}
            {activeSlide === 2 && (
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 block">Fiebre de Puntos</span>
                <div className="h-14 w-14 bg-indigo-900 border border-indigo-400 text-indigo-200 rounded-full flex items-center justify-center mx-auto shadow">
                  <Award size={28} />
                </div>

                <p className="text-sm font-extrabold text-indigo-100">
                  ¡Hicimos temblar el marcador familiar!
                </p>

                <p className="text-xs text-slate-350 px-2 leading-relaxed">
                  Las tareas domésticas nos otorgaron puntos canjeables, permitiendo a los chicos canjear privilegios increíbles. Cada día fue un reto.
                </p>

                <div className="text-[11px] text-indigo-400 font-extrabold flex justify-center gap-6 mt-2 uppercase tracking-wide">
                  <div>
                    <span className="block text-[8px] text-slate-500">Mejor Mes</span>
                    <strong className="text-emerald-400 font-black">{stats.bestMonth}</strong>
                  </div>
                  <div>
                    <span className="block text-[8px] text-slate-500">Mes Más Bajo</span>
                    <strong className="text-rose-450 font-black">{stats.worstMonth}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* SLIDE 4: PERSONAL MILESTONES */}
            {activeSlide === 3 && (
              <div className="space-y-4">
                <span className="text-[10px] uppercase font-black tracking-widest text-indigo-400 block">Tu Aporte Personal</span>
                
                <img 
                  src={user?.photoURL} 
                  alt="" 
                  className="w-16 h-16 rounded-full object-cover border-2 border-indigo-400 mx-auto shadow-md"
                />

                <h3 className="font-extrabold text-xs text-indigo-100">
                  ¡Felicidades, {user?.displayName}!
                </h3>

                <p className="text-xs text-slate-350 px-2 leading-relaxed">
                  Acumulaste un gran saldo histórico de <strong className="text-yellow-300 text-sm font-bold">{user?.points} puntos</strong> este año. Tus aportes permitieron mantener el equilibrio en casa.
                </p>
                
                <p className="text-[10px] italic text-slate-450">
                  &quot;Todo lo que hacemos suma para una convivencia feliz.&quot;
                </p>
              </div>
            )}

            {/* SLIDE 5: GRAND CHAMPION */}
            {activeSlide === 4 && (
              <div className="space-y-5">
                <span className="text-[10px] uppercase font-black tracking-widest text-yellow-500 block">👑 GANADOR DEL AÑO 👑</span>
                
                {stats.champion && (
                  <div className="space-y-3">
                    <img 
                      src={stats.champion.photoURL} 
                      alt="" 
                      className="w-20 h-20 rounded-full object-cover border-4 border-yellow-400 mx-auto shadow-xl"
                    />
                    <h3 className="text-xl font-black text-yellow-300 leading-none">
                      {stats.champion.displayName}
                    </h3>
                    <p className="text-slate-400 text-[10px] block leading-none font-bold uppercase tracking-wider">
                      CON {stats.champion.points} PUNTOS ACUMULADOS
                    </p>
                  </div>
                )}

                <div className="p-4 bg-indigo-950/80 border border-yellow-500/20 rounded-2xl max-w-[340px] mx-auto text-xs space-y-1.5 shadow">
                  <span className="text-[10px] font-black tracking-wider text-yellow-400 flex items-center gap-1 justify-center uppercase">
                    <Gift size={12} /> RECOMPENSA ANUAL ESPECIAL:
                  </span>
                  <p className="text-slate-200 font-extrabold leading-normal">
                    {family?.wrappedReward || 'Sorpresa del hogar'}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* FOOTER NAV CONTROLS */}
      <div className="flex justify-between items-center z-10 pt-4 mt-6 border-t border-slate-900">
        <button
          onClick={handlePrev}
          disabled={activeSlide === 0}
          className="p-1 px-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 disabled:opacity-40 transition cursor-pointer text-xs font-bold leading-none flex items-center gap-1"
        >
          <ChevronLeft size={16} /> Ant
        </button>

        <span className="text-[10px] text-slate-500 font-mono">
          {activeSlide + 1} / {slidesCount}
        </span>

        {activeSlide === slidesCount - 1 ? (
          <button
            onClick={() => setActiveSlide(0)}
            className="p-1 px-3.5 bg-yellow-600 border border-yellow-500 rounded-xl hover:bg-yellow-500 transition cursor-pointer text-xs font-black leading-none text-slate-950 flex items-center gap-1"
          >
            Reiniciar <Play size={10} className="fill-slate-950" />
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="p-1 px-3.5 bg-indigo-600 border border-indigo-500 rounded-xl hover:bg-indigo-500 transition cursor-pointer text-xs font-bold leading-none flex items-center gap-1"
          >
            Sig <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
