'use client';

import React, { useState } from 'react';
import { useFamily, Reward } from '@/context/FamilyContext';
import { Gift, PlusCircle, CheckCircle, Flame, Shield, Award, Sparkles, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function RewardsShop() {
  const {
    user,
    rewards,
    addReward,
    proposeReward,
    approveReward,
    claimReward,
    toggleRewardActive,
    triggerAlarmaRoja
  } = useFamily();

  const [showAdminForm, setShowAdminForm] = useState(false);
  const [showChildForm, setShowChildForm] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [cost, setCost] = useState(50);

  const handleSubmitAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || cost <= 0 || isNaN(cost)) {
      triggerAlarmaRoja();
      return;
    }
    addReward(title.trim(), description.trim(), Number(cost));
    setTitle('');
    setDescription('');
    setCost(50);
    setShowAdminForm(false);
  };

  const handleSubmitChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || cost <= 0 || isNaN(cost)) {
      triggerAlarmaRoja();
      return;
    }
    proposeReward(title.trim(), description.trim(), Number(cost));
    setTitle('');
    setDescription('');
    setCost(50);
    setShowChildForm(false);
  };

  const handleClaim = (reward: Reward) => {
    if (!user) return;
    if (user.points < reward.pointsCost) {
      triggerAlarmaRoja();
      alert(`❌ No tienes suficientes puntos para reclamar "${reward.title}". ¡Necesitas ${reward.pointsCost} pts y tienes ${user.points} pts! Haz más tareas familiares.`);
      return;
    }

    if (confirm(`¿Quieres canjear ${reward.pointsCost} puntos por "${reward.title}"? El saldo se descontará de tu cuenta de inmediato.`)) {
      const success = claimReward(reward.id);
      if (success) {
        alert(`🎉 ¡Excelente! Has canjeado "${reward.title}". Avísale a papá y mamá para disfrutar de tu premio.`);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Points Stats Badge Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-500 to-indigo-600 p-5 rounded-2xl text-white shadow-md">
        <div>
          <h1 className="text-xl font-black flex items-center gap-2">
            <Gift size={20} /> Tienda de Recompensas
          </h1>
          <p className="text-blue-100 text-xs mt-0.5">Invierte tus puntos acumulados en increíbles sorpresas.</p>
        </div>

        <div className="bg-white/15 px-4 py-2 rounded-xl border border-white/10 flex items-center gap-2.5 shrink-0">
          <Award className="text-yellow-300" size={24} />
          <div>
            <span className="text-[10px] uppercase font-bold text-blue-200 block leading-none">Tu saldo actual</span>
            <span className="text-lg font-black text-yellow-300">{user?.points || 0} <span className="text-[11px] font-bold text-white uppercase">Puntos</span></span>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">Catálogo Disponible</h2>

        {user?.role === 'admin' ? (
          <button
            onClick={() => setShowAdminForm(!showAdminForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs shadow cursor-pointer"
          >
            <PlusCircle size={14} /> {showAdminForm ? 'Cerrar' : 'Añadir Premio'}
          </button>
        ) : (
          <button
            onClick={() => setShowChildForm(!showChildForm)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-505 text-white font-bold rounded-xl text-xs shadow cursor-pointer"
          >
            <Sparkles size={14} /> {showChildForm ? 'Cerrar' : 'Proponer Premio'}
          </button>
        )}
      </div>

      {/* ADMIN ADD REWARD FORM */}
      {showAdminForm && user?.role === 'admin' && (
        <motion.form
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmitAdmin}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow space-y-4 max-w-xl text-xs"
        >
          <div className="flex items-center gap-2 font-bold text-slate-800 text-sm border-b border-light-200 pb-2">
            <Shield size={15} className="text-blue-500" /> Crear Recompensa Familiar (Admin)
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold mb-0.5">Nombre del Premio</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej. Tarde de piscina, Pizza el viernes"
                className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold mb-0.5">Coste en Puntos</label>
              <input
                type="number"
                required
                min={1}
                value={cost}
                onChange={e => setCost(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2.5 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-700 font-semibold mb-0.5">Descripción de lo que incluye</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Detalla qué condiciones rigen la recompensa familiar."
              className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2 h-16 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowAdminForm(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl shadow cursor-pointer"
            >
              Crear Recompensa
            </button>
          </div>
        </motion.form>
      )}

      {/* CHILD PROPOSAL FORM */}
      {showChildForm && (
        <motion.form
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmitChild}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow space-y-4 max-w-xl text-xs"
        >
          <div className="flex items-center gap-2 font-bold text-indigo-700 text-sm border-b border-light-200 pb-2">
            <Sparkles size={15} /> Proponer Premio a la Tienda
          </div>
          <p className="text-slate-500">
            Propón un premio que te gustaría poder canjear más adelante. Tus padres lo revisarán y decidirán si lo aprueban para el catálogo familiar.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold mb-0.5">Título del Premio</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej. Comida china, Ir al parque de camas elásticas"
                className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold mb-0.5">Puntos Propuestos</label>
              <input
                type="number"
                required
                min={1}
                value={cost}
                onChange={e => setCost(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-slate-700 font-semibold mb-0.5">Descripción de la Recompensa</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Explica por qué propones este premio."
              className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2 h-16 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowChildForm(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl shadow transition"
            >
              Enviar Propuesta
            </button>
          </div>
        </motion.form>
      )}

      {/* REWARDS GRID */}
      {rewards.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Gift className="mx-auto text-slate-300 mb-2" size={32} />
          <p className="font-bold text-slate-650 text-sm">No hay recompensas creadas.</p>
          <p className="text-slate-400 text-xs mt-1">Espera a que un administrador cree premios o propón una idea.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward) => {
            const isClaimable = user && user.points >= reward.pointsCost;
            return (
              <motion.div
                key={reward.id}
                layout
                className={`bg-white rounded-2xl border p-5 flex flex-col justify-between shadow-sm transition-all duration-200 relative overflow-hidden ${
                  !reward.active 
                    ? 'bg-slate-50/50 border-slate-200/60 opacity-75' 
                    : isClaimable 
                    ? 'border-emerald-300 ring-1 ring-emerald-50' 
                    : 'border-slate-200'
                }`}
              >
                {/* Upper cost banner */}
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-1">
                      {!reward.active ? (
                        <span className="bg-indigo-50 text-indigo-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-indigo-150">
                          Borrador
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-700 text-[9px] font-black px-2 py-0.5 rounded-full uppercase border border-emerald-150">
                          Activa
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-0.5 font-black text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full shrink-0 border border-amber-100 shadow-sm">
                      <Flame size={12} className="fill-amber-400 text-amber-500" />
                      <span>{reward.pointsCost} <span className="text-[10px] font-bold">pts</span></span>
                    </div>
                  </div>

                  <h3 className="font-extrabold text-xs text-slate-900 leading-tight block truncate text-wrap">
                    {reward.title}
                  </h3>
                  <p className="text-slate-500 text-[11px] mt-1 line-clamp-3 leading-relaxed">
                    {reward.description || 'Sin descripción detallada.'}
                  </p>
                </div>

                {/* Claim trigger panel */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {user?.role === 'admin' ? (
                    <div className="flex items-center gap-1.5 w-full justify-between">
                      {/* Admin switch trigger toggles */}
                      <button
                        onClick={() => toggleRewardActive(reward.id)}
                        className={`font-black text-[10px] px-2.5 py-1.5 rounded-lg transition border cursor-pointer ${
                          reward.active 
                            ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' 
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {reward.active ? 'Desactivar' : 'Activar'}
                      </button>

                      {!reward.active && reward.proposedBy && (
                        <button
                          onClick={() => approveReward(reward.id)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] px-2.5 py-1.5 rounded-lg transition"
                        >
                          Aprobar Propuesta
                        </button>
                      )}
                    </div>
                  ) : (
                    // KID TRIGGERS
                    <div className="w-full">
                      {reward.active ? (
                        <button
                          onClick={() => handleClaim(reward)}
                          className={`w-full font-black text-xs py-2 px-3 rounded-xl transition cursor-pointer flex justify-center items-center gap-1 text-white shadow-sm ${
                            isClaimable
                              ? 'bg-emerald-600 hover:bg-emerald-500 hover:shadow shadow-emerald-200'
                              : 'bg-slate-350 cursor-not-allowed opacity-80'
                          }`}
                        >
                          <Gift size={13} /> {isClaimable ? '¡Canjear Premio!' : 'Puntos insuficientes'}
                        </button>
                      ) : (
                        <div className="text-[10px] text-slate-400 italic flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-dashed border-slate-200">
                          <AlertCircle size={10} /> Esperando aprobación del admin
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
