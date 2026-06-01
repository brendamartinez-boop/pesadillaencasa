'use client';

import React, { useState, useMemo } from 'react';
import { useFamily, PointsRecord } from '@/context/FamilyContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Calendar, Clock, User, Shield, ArrowUpRight, ArrowDownRight, ClipboardList } from 'lucide-react';
import { motion } from 'motion/react';

export default function StatsManager() {
  const { user, members, pointsHistory } = useFamily();

  // Stable timestamp reference to avoid impure calls during render path
  const [stableNow] = useState(() => Date.now());

  // Selected member to inspect (Admins can toggle, kids locked)
  const [selectedUid, setSelectedUid] = useState<string>(user?.uid || '');
  
  // Period Selection: 7 | 30 | 365 (in days)
  const [daysPeriod, setDaysPeriod] = useState<7 | 30 | 365>(30);

  const selectedMember = useMemo(() => {
    return members.find(m => m.uid === selectedUid) || user;
  }, [selectedUid, members, user]);

  // If active user is kid, reset/enforce they can only see their own stats
  React.useEffect(() => {
    if (user && user.role !== 'admin' && selectedUid !== user.uid) {
      setTimeout(() => {
        setSelectedUid(user.uid);
      }, 0);
    }
  }, [user, selectedUid]);

  // Filter and compute points history
  const filteredRecords = useMemo(() => {
    if (!selectedMember) return [];
    
    const cutoff = stableNow - 1000 * 60 * 60 * 24 * daysPeriod;
    return pointsHistory
      .filter(rec => rec.uid === selectedMember.uid && rec.timestamp >= cutoff)
      .sort((a, b) => b.timestamp - a.timestamp); // newest first for listing
  }, [pointsHistory, selectedMember, daysPeriod, stableNow]);

  // Generate dynamic chart data by reconstructing user score back-and-forth
  const chartData = useMemo(() => {
    if (!selectedMember) return [];

    // Filter ALL records of this user to find baseline
    const userAllRecords = pointsHistory
      .filter(rec => rec.uid === selectedMember.uid)
      .sort((a, b) => a.timestamp - b.timestamp); // oldest first

    // Find starting baseline
    const totalDeltas = userAllRecords.reduce((sum, rec) => sum + rec.delta, 0);
    let cumulativePoints = Math.max(0, selectedMember.points - totalDeltas);

    // Filter based on period for the chart
    const cutoff = stableNow - 1000 * 60 * 60 * 24 * daysPeriod;
    
    const dataPoints: { date: string; puntos: number; delta: number; reason: string }[] = [];

    // Add initial baseline state
    dataPoints.push({
      date: 'Orígenes',
      puntos: cumulativePoints,
      delta: 0,
      reason: 'Puntos iniciales'
    });

    userAllRecords.forEach(rec => {
      cumulativePoints = Math.max(0, cumulativePoints + rec.delta);
      
      // Only include it if it fits the selected period
      if (rec.timestamp >= cutoff) {
        const dateStr = new Date(rec.timestamp).toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        dataPoints.push({
          date: dateStr,
          puntos: cumulativePoints,
          delta: rec.delta,
          reason: rec.reason
        });
      }
    });

    // If we only have the baseline point, pad with a second point containing current points
    if (dataPoints.length === 1) {
      dataPoints.push({
        date: 'Actualmente',
        puntos: selectedMember.points,
        delta: 0,
        reason: 'Estado sin cambios'
      });
    }

    return dataPoints;
  }, [pointsHistory, selectedMember, daysPeriod]);

  // Calculations
  const calculations = useMemo(() => {
    const gained = filteredRecords
      .filter(r => r.delta > 0)
      .reduce((sum, r) => sum + r.delta, 0);
    const spent = filteredRecords
      .filter(r => r.delta < 0)
      .reduce((sum, r) => sum + Math.abs(r.delta), 0);

    return { gained, spent };
  }, [filteredRecords]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            📈 Rendimiento e Historial
          </h1>
          <p className="text-slate-500 text-xs">Monitorea los puntos ganados y el esfuerzo acumulado.</p>
        </div>

        {/* Member dropdown (exclusive to admins) */}
        <div className="flex items-center gap-2.5 text-xs shrink-0 self-start md:self-auto font-semibold">
          {user?.role === 'admin' && (
            <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-slate-200">
              <User size={14} className="text-slate-400" />
              <span className="text-slate-500">Miembro:</span>
              <select
                value={selectedUid}
                onChange={e => setSelectedUid(e.target.value)}
                className="bg-transparent font-bold text-slate-800 focus:outline-none focus:ring-0 cursor-pointer"
              >
                {members.map(m => (
                  <option key={m.uid} value={m.uid}>
                    {m.displayName} ({m.role === 'admin' ? 'Padre' : 'Hijo'})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Time Filter Tabs */}
          <div className="bg-slate-100 p-1 rounded-xl flex">
            {([7, 30, 365] as const).map(period => (
              <button
                key={period}
                onClick={() => setDaysPeriod(period)}
                className={`px-3 py-1.5 rounded-lg text-xs leading-none font-bold transition cursor-pointer select-none ${
                  daysPeriod === period 
                    ? 'bg-white text-slate-850 shadow' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {period === 7 ? 'Semana' : period === 30 ? 'Mes' : 'Año'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* THREE HEADER STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
            <TrendingUp size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold leading-none uppercase">Puntos actuales</span>
            <span className="text-base font-black text-slate-900 mt-1 block">{selectedMember?.points || 0} pts</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
            <ArrowUpRight size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold leading-none uppercase">Ganado en período</span>
            <span className="text-base font-black text-slate-900 mt-1 block">+{calculations.gained} pts</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="h-10 w-10 bg-red-50 text-red-650 rounded-xl flex items-center justify-center shrink-0">
            <ArrowDownRight size={18} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block font-bold leading-none uppercase">Canjeado en período</span>
            <span className="text-base font-black text-slate-900 mt-1 block">-{calculations.spent} pts</span>
          </div>
        </div>
      </div>

      {/* CHART PLOT CANVASES */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest mb-4 flex items-center gap-1.5">
          📈 Progresión Temporal de Puntos
        </h3>

        <div className="h-64 sm:h-80 w-full select-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 9 }} 
                stroke="#94A3B8" 
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 9 }} 
                stroke="#94A3B8" 
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ 
                  borderRadius: '12px', 
                  backgroundColor: '#0F172A', 
                  color: '#F8FAFC', 
                  fontSize: '11px',
                  border: 'none',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                }}
                labelStyle={{ fontWeight: 'bold', color: '#93C5FD' }}
              />
              <Area 
                type="monotone" 
                dataKey="puntos" 
                stroke="#3B82F6" 
                strokeWidth={3} 
                fillOpacity={1} 
                fill="url(#colorPoints)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DETAILED LEDGER */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
          <ClipboardList size={16} className="text-slate-500" />
          <h3 className="font-extrabold text-xs text-slate-700 uppercase tracking-widest leading-none">
            Libro de Operaciones ({filteredRecords.length})
          </h3>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            <ClipboardList className="mx-auto text-slate-350 mb-1" size={28} />
            <p className="font-semibold text-slate-550">Sin movimientos registrados</p>
            <p className="text-[10px] text-slate-400 mt-1">Completa tareas para iniciar el registro histórico.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-150 max-h-96 overflow-y-auto">
            {filteredRecords.map((log) => {
              const IsPositive = log.delta > 0;
              return (
                <div key={log.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-50/50 transition duration-100">
                  <div className="space-y-1 min-w-0 pr-2">
                    <p className="font-bold text-slate-800 break-words leading-tight capitalize">{log.reason}</p>
                    <div className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Clock size={11} />
                      <span>{new Date(log.timestamp).toLocaleDateString('es-ES')} {new Date(log.timestamp).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <span className={`shrink-0 font-black px-3 py-1 rounded-full text-center ${
                    IsPositive 
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-100' 
                      : 'bg-red-50 text-red-750 border border-red-100'
                  }`}>
                    {IsPositive ? `+${log.delta}` : log.delta} pts
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
