'use client';

import React, { useState } from 'react';
import { useFamily, ChoreTask } from '@/context/FamilyContext';
import { PlusCircle, CheckCircle, Clock, Trash2, Shield, Calendar, User, Sparkles, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export default function TasksManager() {
  const { user, tasks, members, addTask, proposeTask, approveTask, deleteTask, toggleTaskComplete, triggerAlarmaRoja } = useFamily();

  // Filter tab State: "all" | "pending" | "completed" | "proposal"
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'completed' | 'proposal'>('all');

  // New task Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('all');
  const [points, setPoints] = useState(15);
  const [deadline, setDeadline] = useState('');

  const [showForm, setShowForm] = useState(false);

  // Proposal Form State for Children
  const [propTitle, setPropTitle] = useState('');
  const [propDesc, setPropDesc] = useState('');
  const [propPoints, setPropPoints] = useState(10);
  const [showChildForm, setShowChildForm] = useState(false);

  const handleSubmitAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || points <= 0 || isNaN(points)) {
      triggerAlarmaRoja();
      return;
    }
    addTask(title.trim(), description.trim(), assignedTo, Number(points), deadline || null);
    
    // Clear state
    setTitle('');
    setDescription('');
    setAssignedTo('all');
    setPoints(15);
    setDeadline('');
    setShowForm(false);
  };

  const handleSubmitChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!propTitle.trim() || propPoints <= 0 || isNaN(propPoints)) {
      triggerAlarmaRoja();
      return;
    }
    proposeTask(propTitle.trim(), propDesc.trim(), Number(propPoints));
    
    // Clear state
    setPropTitle('');
    setPropDesc('');
    setPropPoints(10);
    setShowChildForm(false);
  };

  const getMemberName = (uid: string) => {
    if (uid === 'all') return 'Todos';
    const found = members.find(m => m.uid === uid);
    return found ? found.displayName : 'Desconocido';
  };

  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return !task.completed && !task.isProposal;
    if (activeTab === 'completed') return task.completed && !task.isProposal;
    if (activeTab === 'proposal') return task.isProposal;
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            📋 Gestión de Tareas
          </h1>
          <p className="text-slate-500 text-xs">Organiza los quehaceres cotidianos cómodamente.</p>
        </div>

        {user?.role === 'admin' ? (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md text-xs cursor-pointer select-none"
          >
            <PlusCircle size={15} />
            {showForm ? 'Cerrar Formulario' : 'Crear Tarea Admin'}
          </button>
        ) : (
          <button
            onClick={() => setShowChildForm(!showChildForm)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md text-xs cursor-pointer select-none"
          >
            <Sparkles size={15} />
            {showChildForm ? 'Cerrar Formulario' : 'Proponer Tarea'}
          </button>
        )}
      </div>

      {/* ADMIN CREATION FORM */}
      {showForm && user?.role === 'admin' && (
        <motion.form 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmitAdmin}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md space-y-4 max-w-xl"
        >
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 border-b border-light-200 pb-2">
            <Shield size={16} className="text-blue-500" /> Crear Nueva Tarea Familiar (Como Admin)
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold mb-0.5">Título de la Tarea</label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej. Fregar el baño, Ordenar la despensa"
                className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold mb-0.5">Asignar a</label>
              <select
                value={assignedTo}
                onChange={e => setAssignedTo(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2 focus:outline-none focus:border-blue-500"
              >
                <option value="all">Familiar (Todos)</option>
                {members.map(m => (
                  <option key={m.uid} value={m.uid}>
                    {m.displayName} ({m.role === 'admin' ? 'Padre' : 'Hijo'})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold mb-0.5">Puntos de Recompensa</label>
              <input
                type="number"
                required
                min={1}
                value={points}
                onChange={e => setPoints(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold mb-0.5">Fecha Límite</label>
              <input
                type="date"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="block text-slate-700 font-semibold mb-0.5">Descripción o Condiciones</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Escribe detalles adicionales de cómo debe quedar la tarea completada."
              className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2 h-16 focus:outline-none focus:border-blue-500 focus:ring-0 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl shadow transition cursor-pointer"
            >
              Publicar Tarea
            </button>
          </div>
        </motion.form>
      )}

      {/* CHILD PROPOSAL FORM */}
      {showChildForm && (
        <motion.form 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={handleSubmitChild}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-md space-y-4 max-w-xl"
        >
          <div className="flex gap-2 items-center text-sm font-bold text-indigo-700 border-b border-light-200 pb-2">
            <Sparkles size={16} /> Proponer Nueva Tarea / Reto
          </div>

          <p className="text-slate-500 text-xs">
            Propón una tarea que pienses realizar tú mismo. Quedará en borrador hasta que tus padres la aprueben y le pongan puntos oficiales.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold mb-0.5">Qué vas a hacer (Título)</label>
              <input
                type="text"
                required
                value={propTitle}
                onChange={e => setPropTitle(e.target.value)}
                placeholder="Ej. Limpiar el jaulón del canario, Lijar mesa"
                className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-700 font-semibold mb-0.5">Puntos Sugeridos</label>
              <input
                type="number"
                required
                min={1}
                value={propPoints}
                onChange={e => setPropPoints(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="block text-slate-700 font-semibold mb-0.5">Detalles de la Propuesta</label>
            <textarea
              value={propDesc}
              onChange={e => setPropDesc(e.target.value)}
              placeholder="Por qué mereces estos puntos o cómo realizarás este trabajo extra."
              className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2 h-16 focus:outline-none focus:border-indigo-500 focus:ring-0 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 text-xs">
            <button
              type="button"
              onClick={() => setShowChildForm(false)}
              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2 rounded-xl shadow cursor-pointer"
            >
              Enviar Propuesta
            </button>
          </div>
        </motion.form>
      )}

      {/* FILTER TABS */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto text-xs font-semibold py-1">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl transition ${
            activeTab === 'all' 
              ? 'bg-blue-50 text-blue-700' 
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          Todas ({tasks.length})
        </button>
        <button
          onClick={() => setActiveTab('pending')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl transition ${
            activeTab === 'pending' 
              ? 'bg-amber-50 text-amber-700 border-amber-200' 
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Clock size={14} />
          Pendientes ({tasks.filter(t => !t.completed && !t.isProposal).length})
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl transition ${
            activeTab === 'completed' 
              ? 'bg-emerald-50 text-emerald-700' 
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <CheckCircle size={14} />
          Completadas ({tasks.filter(t => t.completed && !t.isProposal).length})
        </button>
        <button
          onClick={() => setActiveTab('proposal')}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl transition ${
            activeTab === 'proposal' 
              ? 'bg-indigo-50 text-indigo-700' 
              : 'text-slate-500 hover:bg-slate-100'
          }`}
        >
          <Sparkles size={14} />
          Propuestas ({tasks.filter(t => t.isProposal).length})
        </button>
      </div>

      {/* TASK LIST */}
      {filteredTasks.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <p className="font-extrabold text-slate-700 text-sm">No se encontraron tareas en esta pestaña.</p>
          <p className="text-slate-400 text-xs mt-1">Intenta cambiar de filtro o agregar una nueva tarea para arrancar.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map(task => {
            const isAssignedToMe = task.assignedTo === 'all' || task.assignedTo === user?.uid;
            
            return (
              <motion.div
                key={task.id}
                layout
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                  task.completed 
                    ? 'border-emerald-250 bg-emerald-50/15' 
                    : task.isProposal 
                    ? 'border-indigo-200 bg-indigo-50/10' 
                    : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Status header badge */}
                  <div className="flex justify-between items-center gap-2 mb-3">
                    {task.completed ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full uppercase">
                        ✅ COMPLETADA
                      </span>
                    ) : task.isProposal ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full uppercase">
                        💡 PROPUESTA
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full uppercase">
                        🕒 PENDIENTE
                      </span>
                    )}

                    <span className="text-sm font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full shrink-0">
                      +{task.points} pts
                    </span>
                  </div>

                  {/* Title & info */}
                  <h3 className={`font-black text-sm text-slate-900 leading-tight capitalize ${task.completed ? 'line-through text-slate-400' : ''}`}>
                    {task.title}
                  </h3>
                  <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">{task.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 font-medium text-xs text-slate-600 space-y-2.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <User size={13} className="text-slate-400" />
                      <span>Asignación: <strong className="text-slate-800">{getMemberName(task.assignedTo)}</strong></span>
                    </div>

                    {task.deadline && (
                      <div className="flex items-center gap-1 text-[11px]">
                        <Calendar size={13} className="text-slate-400" />
                        <span>Plazo: <strong className="text-slate-800">{new Date(task.deadline).toLocaleDateString('es-ES')}</strong></span>
                      </div>
                    )}
                  </div>

                  {task.completed && (
                    <div className="bg-emerald-100/50 p-2 rounded-lg text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                      <CheckCircle size={12} />
                      <span>Completado por: {getMemberName(task.completedBy || '')} el {new Date(task.completedAt || 0).toLocaleDateString()}</span>
                    </div>
                  )}

                  {/* ADMIN ACTION PANELS */}
                  <div className="flex flex-wrap gap-1.5 justify-end pt-1">
                    {user?.role === 'admin' ? (
                      <>
                        {task.isProposal ? (
                          <button
                            onClick={() => approveTask(task.id)}
                            className="bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] py-1.5 px-3 rounded-lg transition cursor-pointer"
                          >
                            Aprobar Propuesta
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleTaskComplete(task.id)}
                            className={`font-extrabold text-[11px] py-1.5 px-3 rounded-lg transition text-white cursor-pointer ${
                              task.completed 
                                ? 'bg-amber-600 hover:bg-amber-500' 
                                : 'bg-emerald-600 hover:bg-emerald-500'
                            }`}
                          >
                            {task.completed ? 'Marcar NO completada' : 'Marcar Completada'}
                          </button>
                        )}

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 p-1.5 rounded-lg border border-red-200 transition"
                          title="Eliminar tarea"
                        >
                          <Trash2 size={13} />
                        </button>
                      </>
                    ) : (
                      // CHILDS PANEL
                      task.isProposal && task.createdBy === user?.uid && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <AlertCircle size={10} /> Esperando aprobación del admin
                        </div>
                      )
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
