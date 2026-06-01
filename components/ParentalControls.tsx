'use client';

import React from 'react';
import { useFamily, FamilyMember } from '@/context/FamilyContext';
import { Shield, ToggleLeft, ToggleRight, Loader, Share2, LogOut, Radio, Gamepad2, Ban, UserCheck, Users, HelpCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function ParentalControls() {
  const {
    user,
    family,
    members,
    toggleMemberWalkieBlock,
    toggleMemberGamesBlock,
    toggleMemberAppBlock,
    toggleMemberRole,
    leaveFamily,
    triggerAlarmaRoja
  } = useFamily();

  if (!family) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(family.code);
    alert(`¡Código de invitación "${family.code}" copiado al portapapeles! Compártelo con tu familia.`);
  };

  const handleLeave = () => {
    // Validation matches FamilyContext rules
    if (user?.role === 'admin') {
      const otherAdmins = members.filter(m => m.role === 'admin' && m.uid !== user?.uid);
      if (otherAdmins.length === 0 && members.length > 1) {
        triggerAlarmaRoja();
        alert('❌ No puedes abandonar la familia porque eres el único administrador. Promueve a otro miembro a Admin antes de salir.');
        return;
      }
    }

    if (confirm('¿Estás seguro de que quieres abandonar este grupo familiar? Tus datos se preservarán localmente, pero saldrás de este hogar.')) {
      leaveFamily();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header code generator */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border border-slate-700">
        <div>
          <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider">Hogar actual</span>
          <h2 className="text-lg font-black">{family.name}</h2>
          <p className="text-[11px] text-slate-450 mt-1">
            Creador del grupo: <strong className="text-slate-300">Admin</strong> | {members.length} integrantes registrados
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-xl border border-slate-800">
          <div className="text-left">
            <span className="text-[9px] text-slate-400 block font-bold leading-none">CÓDIGO DE ACCESO</span>
            <span className="text-base font-black tracking-widest text-emerald-400">{family.code}</span>
          </div>
          <button
            onClick={handleCopyCode}
            className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition cursor-pointer"
            title="Copiar código familia"
          >
            <Share2 size={15} />
          </button>
        </div>
      </div>

      <div>
        <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
          <Users size={20} className="text-blue-500" /> Miembros de la Residencia
        </h1>
        <p className="text-slate-500 text-xs">Administra los permisos de tus hijos o cambia privilegios jerárquicos.</p>
      </div>

      {/* MEMBERS LISTING GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {members.map((member) => {
          const isCurrentUser = member.uid === user?.uid;
          const isAdminControlAllowed = user?.role === 'admin' && !isCurrentUser;

          return (
            <motion.div
              key={member.uid}
              layout
              className={`bg-white rounded-2xl border p-5 shadow-sm transition-all duration-200 ${
                isCurrentUser ? 'border-blue-400 ring-1 ring-blue-100' : 'border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={member.photoURL}
                      alt={member.displayName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-200"
                    />
                    {member.blocked.all && (
                      <span className="absolute -bottom-1 -right-1 bg-red-600 text-white rounded-full p-1 border border-white" title="Cuenta bloqueada">
                        <Ban size={10} />
                      </span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-extrabold text-xs text-slate-900 truncate flex items-center gap-1">
                      {member.displayName}
                      {isCurrentUser && (
                        <span className="text-[9px] bg-slate-105 px-1 py-0.5 rounded text-blue-650 font-black">Tú</span>
                      )}
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate">{member.email}</p>
                    
                    {/* Points detail */}
                    <p className="text-xs font-bold text-slate-800 mt-1">
                      Saldo: <span className="text-blue-600">{member.points} pts</span>
                    </p>
                  </div>
                </div>

                {/* Role badge */}
                <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase shrink-0 ${
                  member.role === 'admin' 
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                    : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                }`}>
                  {member.role === 'admin' ? '🔑 Padre / Admin' : '👦 Hijo/a'}
                </span>
              </div>

              {/* PARENTAL CONTROLS SUBPANEL */}
              {user?.role === 'admin' ? (
                <div className="mt-4 pt-4 border-t border-slate-100 space-y-3 shrink-0">
                  <div className="flex justify-between items-center text-xs text-slate-500 font-bold mb-1">
                    <span>Panel de Control de Padres:</span>
                    {isCurrentUser && <span className="text-[10px] text-slate-400 normal-case">(No puedes autolimitarte)</span>}
                  </div>

                  {isAdminControlAllowed ? (
                    <div className="space-y-2 text-xs">
                      {/* Control 1: Walkie Talkie Block */}
                      <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-150">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Radio size={14} className={member.blocked.walkie ? 'text-red-500' : 'text-slate-400'} /> Block Walkie-Talkie
                        </span>
                        <button
                          onClick={() => toggleMemberWalkieBlock(member.uid)}
                          className={`text-lg font-bold transition focus:outline-none cursor-pointer ${
                            member.blocked.walkie ? 'text-red-600' : 'text-slate-350 hover:text-slate-450'
                          }`}
                        >
                          {member.blocked.walkie ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                        </button>
                      </div>

                      {/* Control 2: Games Block */}
                      <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-150">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Gamepad2 size={14} className={member.blocked.games ? 'text-red-500' : 'text-slate-400'} /> Block Juegos
                        </span>
                        <button
                          onClick={() => toggleMemberGamesBlock(member.uid)}
                          className={`text-lg font-bold transition focus:outline-none cursor-pointer ${
                            member.blocked.games ? 'text-red-600' : 'text-slate-350 hover:text-slate-450'
                          }`}
                        >
                          {member.blocked.games ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                        </button>
                      </div>

                      {/* Control 3: Complete App Lock */}
                      <div className="flex justify-between items-center p-2 rounded-xl bg-slate-50 border border-slate-150">
                        <span className="flex items-center gap-1.5 font-bold text-slate-700">
                          <Ban size={14} className={member.blocked.all ? 'text-red-500' : 'text-slate-400'} /> Bloquear Toda la App 🔒
                        </span>
                        <button
                          onClick={() => toggleMemberAppBlock(member.uid)}
                          className={`text-lg font-bold transition focus:outline-none cursor-pointer ${
                            member.blocked.all ? 'text-red-600' : 'text-slate-350 hover:text-slate-450'
                          }`}
                        >
                          {member.blocked.all ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                        </button>
                      </div>

                      {/* Role Alter Toggle */}
                      <div className="pt-2 flex justify-end">
                        <button
                          onClick={() => toggleMemberRole(member.uid)}
                          className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg px-2.5 py-1.5 font-bold text-[10px] cursor-pointer"
                        >
                          <UserCheck size={12} /> Cambiar Rol a {member.role === 'admin' ? 'Hijo' : 'Admin'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-slate-400 text-[11px] p-2 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                      🔒 No se permiten modificaciones jerárquicas en tu propio usuario ni si eres un usuario menor.
                    </div>
                  )}
                </div>
              ) : (
                // IF CHILDS, SHOW LOCK INDICATORS
                (member.blocked.walkie || member.blocked.games || member.blocked.all) && (
                  <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-1.5 text-[10px]">
                    {member.blocked.walkie && (
                      <span className="bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full border border-red-100">Walkie bloqueado</span>
                    )}
                    {member.blocked.games && (
                      <span className="bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full border border-red-100">Juegos restringidos</span>
                    )}
                    {member.blocked.all && (
                      <span className="bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full border border-red-100">Acceso app filtrado</span>
                    )}
                  </div>
                )
              )}
            </motion.div>
          );
        })}
      </div>

      {/* FOOTER GENERAL ACTIONS */}
      <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2 text-xs text-slate-550 leading-relaxed max-w-lg">
          <HelpCircle size={16} className="text-slate-400 shrink-0 mt-0.5" />
          <p>
            * El código de acceso permite invitar a otros familiares para ingresar a tu hogar. Cualquier miembro que se registre ingresará con su rol inicial listo para usar.
          </p>
        </div>

        <button
          onClick={handleLeave}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-205 text-red-700 font-black rounded-xl border border-red-200 transition text-xs whitespace-nowrap cursor-pointer select-none"
        >
          <LogOut size={14} /> Abandonar esta Familia
        </button>
      </div>
    </div>
  );
}
