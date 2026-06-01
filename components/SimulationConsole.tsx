'use client';

import React, { useState } from 'react';
import { useFamily, FamilyMember } from '@/context/FamilyContext';
import { Users, Shield, User, Clock, AlertTriangle, RefreshCw, ChevronUp, ChevronDown } from 'lucide-react';

export default function SimulationConsole() {
  const {
    user,
    members,
    switchCurrentUser,
    addMockMemberToFamily,
    triggerAlarmaRoja,
    forceWrappedPeriod,
    setForceWrappedPeriod,
    family
  } = useFamily();

  const [isOpen, setIsOpen] = useState(true);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'admin' | 'child'>('child');

  const handleCreateMock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    addMockMemberToFamily(newMemberName.trim(), newMemberRole);
    setNewMemberName('');
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de restablecer el simulador con los datos demo iniciales? Se borrará el almacenamiento local.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (!family) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 text-slate-100 border-t border-slate-850 shadow-2xl transition-all duration-300">
      {/* Header Bar */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between px-4 py-2 cursor-pointer bg-slate-950 hover:bg-slate-900 text-xs font-semibold text-blue-400 select-none"
      >
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>SIMULADOR FAMILIAR (🛠️ Panel de Pruebas Offline)</span>
        </div>
        
        <div className="flex items-center gap-4">
          <span className="text-slate-400 font-normal">
            Usuario activo: <strong className="text-white">{user?.displayName} ({user?.role === 'admin' ? 'Padre/Admin' : 'Hijo'})</strong>
          </span>
          {isOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </div>

      {/* Panel Content */}
      {isOpen && (
        <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm max-h-[40vh] overflow-y-auto">
          {/* Section 1: Switch active role */}
          <div className="space-y-2">
            <h4 className="font-bold text-blue-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Users size={14} /> Ver App como otra persona:
            </h4>
            <p className="text-slate-400 text-xs leading-relaxed">
              Selecciona un miembro para probar roles en tiempo real (un Admin tiene control parental; los Hijos ven límites/tiendas).
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {members.map((m) => {
                const isActive = m.uid === user?.uid;
                return (
                  <button
                    key={m.uid}
                    onClick={() => switchCurrentUser(m.uid)}
                    className={`flex items-center gap-2 p-2 rounded-lg text-left transition text-xs border ${
                      isActive 
                        ? 'bg-blue-600 border-blue-400 text-white font-semibold' 
                        : 'bg-slate-850 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <img 
                      src={m.photoURL} 
                      alt={m.displayName} 
                      className="w-6 h-6 rounded-full object-cover border border-slate-700"
                    />
                    <div className="truncate">
                      <div className="truncate font-medium">{m.displayName}</div>
                      <div className="text-[9px] opacity-75">{m.role === 'admin' ? 'Padre 🔑' : 'Hijo 👦'}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Quick System overrides */}
          <div className="space-y-3">
            <h4 className="font-bold text-yellow-400 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Clock size={14} /> Forzar Escenarios de Prueba:
            </h4>
            
            <div className="space-y-2.5">
              {/* Force Wrapped period */}
              <div className="flex items-center justify-between bg-slate-850 p-2.5 rounded-lg border border-slate-800">
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-slate-200">Burlar Restricción Temporal</span>
                  <span className="text-[10px] text-slate-400">Ver Wrapped Anual (sólo 1-7 Ene)</span>
                </div>
                <button
                  onClick={() => setForceWrappedPeriod(!forceWrappedPeriod)}
                  className={`px-3 py-1 rounded text-xs font-bold transition ${
                    forceWrappedPeriod 
                      ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {forceWrappedPeriod ? '1-7 ENE (ONLINE)' : 'Normal (May)'}
                </button>
              </div>

              {/* Reset/Alarma triggers */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={triggerAlarmaRoja}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 text-xs font-semibold transition"
                >
                  <AlertTriangle size={14} /> Alarma Roja (Flashing)
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-755 border border-slate-700 text-slate-300 text-xs transition"
                  title="Restablecer Datos Demo"
                >
                  <RefreshCw size={14} /> Reset
                </button>
              </div>
            </div>
          </div>

          {/* Section 3: Register custom mock children/admins */}
          <div className="space-y-2">
            <h4 className="font-bold text-blue-300 flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <User size={14} /> Añadir Familiar Simulado:
            </h4>
            <p className="text-slate-400 text-xs">
              Crea otro hijo o padre ficticio para el ranking y chat.
            </p>
            <form onSubmit={handleCreateMock} className="space-y-2 mt-2">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Nombre (ej. Abuela Carmen)"
                className="w-full bg-slate-850 border border-slate-750 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
              />
              <div className="flex gap-2 items-center">
                <label className="flex items-center gap-1 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="mock_role"
                    checked={newMemberRole === 'child'}
                    onChange={() => setNewMemberRole('child')}
                    className="accent-blue-500"
                  />
                  Hijo/a
                </label>
                <label className="flex items-center gap-1 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="mock_role"
                    checked={newMemberRole === 'admin'}
                    onChange={() => setNewMemberRole('admin')}
                    className="accent-blue-500"
                  />
                  Padre (Admin)
                </label>
                <button
                  type="submit"
                  className="ml-auto bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs py-1.5 px-3 rounded-lg transition"
                >
                  Añadir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
