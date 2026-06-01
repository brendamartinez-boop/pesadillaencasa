'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { Radio, Lock, Volume2, Mic, Activity, Signal } from 'lucide-react';
import { motion } from 'motion/react';

export default function WalkieTalkie() {
  const { user, members, triggerAlarmaRoja } = useFamily();
  const [isTalking, setIsTalking] = useState(false);
  const [channelNoise, setChannelNoise] = useState(false);

  // Check Parental Lock Restriction
  if (user?.blocked.all || user?.blocked.walkie) {
    return (
      <div className="bg-white p-10 max-w-xl mx-auto rounded-3xl border border-red-200 text-center shadow-lg my-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-red-600"></div>
        <div className="h-16 w-16 bg-red-50 text-red-650 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-150 animate-bounce">
          <Lock size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">Walkie-Talkie Desactivado</h2>
        <p className="text-slate-650 text-xs mt-3 leading-relaxed">
          El administrador de tu familia ha <strong className="text-red-650">desactivado tu Walkie-Talkie</strong>.
        </p>
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-150 text-slate-500 font-medium text-[11px] leading-relaxed">
          🔒 &quot;El admin ha desactivado el walkie-talkie&quot; para evitar molestias de ruido o por castigo doméstico.
        </div>
      </div>
    );
  }

  // Handle Push To Talk toggle (press to talk, release to silence)
  const handleStartTalk = () => {
    setIsTalking(true);
    setChannelNoise(true);
    // Beep signal at load
    playBeep(440, 0.1); 
  };

  const handleStopTalk = () => {
    setIsTalking(false);
    // Roger beep at release
    playBeep(880, 0.15);
    setTimeout(() => {
      setChannelNoise(false);
    }, 300);
  };

  // Safe Web Audio API generator for retro walkie static beeps
  const playBeep = (frequency: number, duration: number) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = frequency;
      
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (err) {
      // AudioContext fails silently inside strict browser iframe sandbox
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-md mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          📻 Walkie-Talkie Familiar
        </h1>
        <p className="text-slate-500 text-xs">Mantén contacto por voz inmediato con cualquier rincón de la casa.</p>
      </div>

      {/* WALKI DEVICE SHELL */}
      <div className="bg-slate-900 text-white rounded-[32px] p-6 shadow-2xl relative border-4 border-slate-800 flex flex-col items-center">
        {/* Antenna */}
        <div className="absolute top-0 left-10 w-4 h-16 bg-slate-800 rounded-lg -translate-y-14 z-0 flex flex-col justify-end">
          <div className="w-6 h-4 bg-orange-500 rounded-full self-center -translate-y-4 shadow-md"></div>
        </div>

        {/* Status Led Bar */}
        <div className="w-full h-8 bg-slate-950 rounded-xl px-4 flex items-center justify-between text-[10px] font-mono border border-slate-800">
          <div className="flex items-center gap-1">
            <Signal size={12} className="text-emerald-400 animate-pulse" />
            <span className="text-slate-400">CH-09 FRECUENCIA</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[9px] text-slate-500 font-bold uppercase">Estado:</span>
            {isTalking ? (
              <span className="h-2 w-2 bg-red-500 rounded-full animate-ping"></span>
            ) : (
              <span className="h-2 w-2 bg-emerald-500 rounded-full"></span>
            )}
            <strong className="text-white">{isTalking ? 'TALK' : 'SILENT'}</strong>
          </div>
        </div>

        {/* Equalizer Wave Canvas */}
        <div className="h-28 w-full bg-slate-950 rounded-2xl my-5 flex items-center justify-center border border-slate-800 overflow-hidden relative">
          {isTalking ? (
            <div className="flex items-end gap-1.5 h-16">
              {[1, 2, 3, 4, 5, 6, 7, 8, 7, 6, 5, 4, 3, 2, 1].map((val, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [10, val * 8, 10] }}
                  transition={{ repeat: Infinity, duration: 0.4 + (i % 4) * 0.12, ease: 'easeInOut' }}
                  className="w-1.5 bg-blue-400 rounded-full"
                />
              ))}
            </div>
          ) : (
            <div className="text-center text-slate-550 flex flex-col items-center gap-1 text-[11px]">
              <Activity size={24} className="text-slate-650 opacity-40" />
              <span>Pulsa y mantén para transmitir voz</span>
            </div>
          )}
        </div>

        {/* CONNECTED USERS ROSTER */}
        <div className="w-full bg-slate-950 rounded-2xl p-3 border border-slate-800 mb-6 text-[10px] text-slate-400">
          <div className="font-bold text-slate-500 mb-2 border-b border-slate-850 pb-1 flex justify-between">
            <span>🔴 DISPOSITIVOS EN RANGO (CANAL COMPARTIDO)</span>
            <span className="text-emerald-400">{members.filter(m => !m.blocked.walkie).length} online</span>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {members.map(m => {
              const isBlocked = m.blocked.walkie;
              return (
                <div 
                  key={m.uid} 
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border ${
                    isBlocked 
                      ? 'bg-red-950/20 border-red-900/40 text-red-400/80 strike-through' 
                      : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}
                >
                  <img src={m.photoURL} alt="" className="w-3.5 h-3.5 rounded-full object-cover" />
                  <span className="truncate max-w-[70px] leading-none">{m.displayName.split(' ')[0]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* BIG MIC BUTTON */}
        <div className="relative">
          <motion.button
            onMouseDown={handleStartTalk}
            onMouseUp={handleStopTalk}
            onTouchStart={handleStartTalk}
            onTouchEnd={handleStopTalk}
            whileTap={{ scale: 0.92 }}
            className={`h-24 w-24 rounded-full flex flex-col justify-center items-center shadow-2xl cursor-pointer border-4 select-none touch-none transition-all duration-200 ${
              isTalking 
                ? 'bg-red-600 hover:bg-red-500 border-red-300 text-white' 
                : 'bg-blue-600 hover:bg-blue-500 border-blue-400 text-blue-100'
            }`}
          >
            <Mic size={28} className={isTalking ? 'animate-pulse' : ''} />
            <span className="text-[8px] font-black uppercase mt-1 tracking-wider">{isTalking ? 'SOLTAR' : 'PULSAR'}</span>
          </motion.button>
        </div>

        {/* Helper footer instructions */}
        <span className="text-[10px] text-slate-500 mt-5 block text-center font-medium">
          🎙️ También para móviles: Mantén pulsado el gran botón redondo azul para hablar, suéltalo para escuchar.
        </span>
      </div>
    </div>
  );
}
