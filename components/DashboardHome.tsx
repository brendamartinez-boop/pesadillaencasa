'use client';

import React from 'react';
import { useFamily, ChoreTask } from '@/context/FamilyContext';
import { CheckCircle2, Award, Calendar, AlertCircle, Sparkles, Pin } from 'lucide-react';
import { motion } from 'motion/react';

export default function DashboardHome() {
  const { user, tasks, members, toggleTaskComplete } = useFamily();

  // Tasks assigned to current logged in user that are NOT completed yet
  const myPendingTasks = tasks.filter(t => {
    if (t.completed || t.isProposal) return false;
    return t.assignedTo === 'all' || t.assignedTo === user?.uid;
  });

  // Sort member list by points descending
  const ranking = [...members].sort((a, b) => b.points - a.points);

  const getOrdinalEmoji = (index: number) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return `${index + 1}º`;
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Intro Hero banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-6 lg:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
        <div className="absolute bottom-0 right-1/3 w-32 h-32 bg-blue-400/20 rounded-full blur-xl"></div>
        
        <div className="relative z-10 max-w-xl space-y-3">
          <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold">
            <Sparkles size={12} className="text-yellow-300" />
            <span>Panel Residencial Organizado</span>
          </div>
          <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-none">
            ¡Hola, {user?.displayName || 'Familiar'}!
          </h1>
          <p className="text-blue-100 text-sm md:text-base">
            {user?.role === 'admin' 
              ? 'Tienes permisos de Padre (Admin). Puedes revisar listas, crear tareas, canjear recompensas y activar/desactivar controles familiares.'
              : '¡Bienvenido! Cumple tus tareas asignadas para acumular puntos y reclamar fantásticas sorpresas en la tienda de recompensas.'}
          </p>
          
          <div className="flex gap-4 pt-2 text-xs">
            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/5">
              Tus puntos: <strong className="text-yellow-300 text-sm font-bold ml-1">{user?.points || 0} pts</strong>
            </div>
            <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/5">
              Rol actual: <strong className="text-emerald-300 text-sm ml-1">{user?.role === 'admin' ? 'Padre 🔐' : 'Hijo 👦'}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Main Board Post-it section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Post-it #1: Mis tareas pendientes */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-[#FEF9C3] dark:bg-slate-900 text-yellow-950 dark:text-slate-100 p-8 shadow-xl rounded-xl rotate-[-1deg] border border-yellow-250/80 dark:border-slate-800 relative overflow-hidden selection:bg-yellow-200 transition-colors duration-200"
        >
          {/* Decorative Pin */}
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-red-500/80 flex justify-center z-10">
            <Pin size={24} className="fill-red-500 drop-shadow-md" />
          </div>

          <div className="border-b-2 border-yellow-250 dark:border-slate-800 pb-3 mb-5 mt-2 flex justify-between items-center">
            <h2 className="font-bold text-2xl font-sans tracking-tight text-yellow-905 dark:text-amber-400 flex items-center gap-2">
              📌 Tareas Pendientes
            </h2>
            <span className="text-[11px] bg-yellow-200 dark:bg-slate-850 text-yellow-805 dark:text-amber-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {myPendingTasks.length} activas
            </span>
          </div>

          {myPendingTasks.length === 0 ? (
            <div className="text-center py-10 text-yellow-800 dark:text-slate-400 bg-white/40 dark:bg-slate-950/40 rounded-xl border border-dashed border-yellow-300 dark:border-slate-800 p-4">
              <CheckCircle2 className="mx-auto text-emerald-605 dark:text-emerald-450 mb-2" size={36} />
              <p className="font-extrabold text-sm">¡Al día! Todo ordenado y limpio.</p>
              <p className="text-xs text-yellow-750 dark:text-slate-500 mt-1">Buen trabajo. Puedes proponer nuevas labores si quieres ganar más puntos.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
              {myPendingTasks.map((task) => (
                <div 
                  key={task.id} 
                  className="bg-white/50 hover:bg-white/85 dark:bg-slate-950/60 dark:hover:bg-slate-950/90 rounded-lg p-4 border border-yellow-300 dark:border-slate-800 shadow-sm transition duration-150 group"
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <h4 className="font-bold text-yellow-950 dark:text-slate-200 text-sm capitalize">{task.title}</h4>
                      <p className="text-xs text-yellow-800 dark:text-slate-400 leading-normal">{task.description}</p>
                    </div>
                    <span className="shrink-0 bg-yellow-200 dark:bg-slate-800 text-yellow-905 dark:text-amber-400 text-xs font-black px-2.5 py-1 rounded-md shadow-sm text-center">
                      +{task.points} pts
                    </span>
                  </div>

                  {/* Task details bar */}
                  <div className="flex items-center justify-between mt-3 text-[11px] text-yellow-700 dark:text-slate-405 border-t border-yellow-200/50 dark:border-slate-805 pt-2">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>{task.deadline ? new Date(task.deadline).toLocaleDateString('es-ES') : 'Sin fecha límite'}</span>
                    </div>

                    <div>
                      {task.assignedTo === 'all' && (
                        <span className="bg-yellow-200 dark:bg-slate-800 text-yellow-850 dark:text-amber-400 font-black px-2 py-0.5 rounded text-[9px] uppercase tracking-wide">Para todos</span>
                      )}
                    </div>
                  </div>

                  {/* Complete buttons */}
                  <div className="mt-3 flex justify-end">
                    {user?.role === 'admin' ? (
                      <button
                        onClick={() => toggleTaskComplete(task.id)}
                        className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-yellow-400 hover:bg-yellow-500 dark:bg-blue-600 dark:hover:bg-blue-500 text-yellow-950 dark:text-white text-xs font-bold shadow-inner border-b-2 border-yellow-600 dark:border-blue-800 cursor-pointer transition select-none"
                      >
                        <CheckCircle2 size={13} /> Marcar como completada
                      </button>
                    ) : (
                      <span className="text-[10px] text-yellow-800/80 dark:text-slate-400 flex items-center gap-1">
                        <AlertCircle size={10} className="text-yellow-600 dark:text-yellow-500" />
                        Avisar a tus padres para que la marquen
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Post-it #2: Ranking familiar */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-[#F0FDFA] dark:bg-slate-900 text-teal-950 dark:text-slate-100 p-8 shadow-xl rounded-xl rotate-[1deg] border border-teal-100 dark:border-slate-800 relative overflow-hidden selection:bg-teal-100 transition-colors duration-200"
        >
          {/* Decorative Pin */}
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 text-teal-500/80 flex justify-center z-10">
            <Pin size={24} className="fill-blue-500 drop-shadow-md" />
          </div>

          <div className="border-b-2 border-teal-200 dark:border-slate-800 pb-3 mb-5 mt-2 flex justify-between items-center">
            <h2 className="font-bold text-2xl font-sans tracking-tight text-teal-900 dark:text-teal-400 flex items-center gap-2">
              🏆 Ranking Familiar
            </h2>
            <span className="text-[11px] bg-teal-100 dark:bg-slate-850 text-teal-800 dark:text-teal-400 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {members.length} miembros
            </span>
          </div>

          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
            {ranking.map((member, index) => {
              const isCurrentUser = member.uid === user?.uid;
              return (
                <div 
                  key={member.uid} 
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition shadow-sm ${
                    isCurrentUser 
                      ? 'bg-teal-500 dark:bg-teal-600 text-white border-teal-600 dark:border-teal-700 shadow-md ring-2 ring-teal-300 ring-offset-1 ring-offset-teal-50 transform scale-[1.03]' 
                      : 'bg-white dark:bg-slate-950/60 hover:bg-teal-50/50 dark:hover:bg-slate-950 border-teal-100 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Medal / Position */}
                    <span className={`font-black text-sm shrink-0 w-6 text-center ${isCurrentUser ? 'text-teal-100' : 'text-teal-200 text-lg'}`}>
                      {getOrdinalEmoji(index)}
                    </span>
                    
                    {/* Avatar */}
                    <div className="relative shrink-0">
                      <img 
                        src={member.photoURL} 
                        alt={member.displayName} 
                        className={`w-10 h-10 rounded-full object-cover shadow-sm ${
                          isCurrentUser ? 'border-2 border-white' : 'border border-teal-200 dark:border-slate-805 bg-teal-50 dark:bg-slate-850'
                        }`}
                      />
                      {member.role === 'admin' && (
                        <span className={`absolute -top-1.5 -right-1 text-[8px] font-bold px-1 rounded-full ${
                          isCurrentUser ? 'bg-white text-teal-600 border border-teal-500' : 'bg-teal-600 text-white border border-teal-100 dark:border-slate-800'
                        }`}>
                          Padre
                        </span>
                      )}
                    </div>

                    {/* Meta info */}
                    <div className="min-w-0">
                      <h4 className={`font-bold text-sm truncate flex items-center gap-1.5 capitalize ${isCurrentUser ? 'text-white font-black' : 'text-teal-950 dark:text-slate-205'}`}>
                        {member.displayName}
                        {isCurrentUser && <span className="text-[10px] text-teal-100 font-extrabold bg-teal-600 px-1 py-0.5 rounded-md">tú</span>}
                      </h4>
                      <p className={`text-[10px] ${isCurrentUser ? 'text-teal-100' : 'text-teal-650 dark:text-slate-450 font-semibold'}`}>
                        {member.role === 'admin' ? 'ADMIN' : 'HIJO/A'}
                      </p>
                    </div>
                  </div>

                  {/* Points Count */}
                  <div className="text-right shrink-0">
                    <span className={`text-base font-black block ${isCurrentUser ? 'text-white' : 'text-teal-700 dark:text-teal-400'}`}>{member.points}</span>
                    <span className={`text-[9.5px] font-bold uppercase tracking-wider ${isCurrentUser ? 'text-teal-100 text-[10px]' : 'text-slate-500 dark:text-slate-400'}`}>puntos</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Inspirational text */}
          <div className="mt-5 bg-teal-50/50 dark:bg-slate-950/40 border border-teal-100 dark:border-slate-800 p-2.5 rounded-xl text-center text-xs text-teal-800 dark:text-slate-400 leading-relaxed font-semibold">
            💡 ¡Aprovecha la tienda de recompensas! Las tareas hechas te dan puntos canjeables por privilegios reales.
          </div>
        </motion.div>
      </div>
    </div>
  );
}
