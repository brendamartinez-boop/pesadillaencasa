'use client';

import React, { useState } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { ShoppingBasket, Plus, Check, Circle, Trash2, CheckSquare } from 'lucide-react';
import { motion } from 'motion/react';

export default function ShoppingManager() {
  const { user, shopping, addShoppingItem, toggleShoppingItem, clearBoughtShoppingItems, members } = useFamily();
  const [newItemName, setNewItemName] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addShoppingItem(newItemName.trim());
    setNewItemName('');
  };

  const getMemberName = (uid: string) => {
    const found = members.find(m => m.uid === uid);
    return found ? found.displayName : 'Alguien';
  };

  // Sort bought items to the bottom, and sort by addedAt descending
  const sortedShopping = [...shopping].sort((a, b) => {
    if (a.bought !== b.bought) {
      return a.bought ? 1 : -1;
    }
    return b.addedAt - a.addedAt;
  });

  const pendingCount = shopping.filter(item => !item.bought).length;

  return (
    <div className="space-y-6 pb-12 max-w-xl">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          🛒 Lista de la Compra
        </h1>
        <p className="text-slate-500 text-xs">Añade los suministros que falten en la despensa o nevera.</p>
      </div>

      {/* INPUT FORM */}
      <form onSubmit={handleAdd} className="flex gap-2">
        <input
          type="text"
          value={newItemName}
          onChange={e => setNewItemName(e.target.value)}
          placeholder="Ej. Detergente, Manzanas, Papel higiénico..."
          className="flex-1 bg-white border border-slate-250 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:border-blue-500 shadow-sm"
        />
        <button
          type="submit"
          className="flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl shadow-md transition shrink-0 cursor-pointer text-xs"
        >
          <Plus size={16} className="mr-1" /> Añadir
        </button>
      </form>

      {/* SHOPPING LIST */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-600">
            {pendingCount === 0 ? '¡Despensa llena! 🎉' : `${pendingCount} artículos pendientes`}
          </span>

          {shopping.some(item => item.bought) && (
            <button
              onClick={clearBoughtShoppingItems}
              className="font-bold text-red-650 hover:text-red-700 flex items-center gap-1 cursor-pointer"
            >
              <Trash2 size={12} /> Limpiar comprados
            </button>
          )}
        </div>

        {sortedShopping.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            <ShoppingBasket className="mx-auto text-slate-350 mb-2" size={32} />
            <p className="font-semibold text-slate-500">¿No falta nada en casa?</p>
            <p className="text-[10px] text-slate-400 mt-1">Escribe arriba para recordar qué comprar en el súper.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {sortedShopping.map(item => (
              <div
                key={item.id}
                onClick={() => toggleShoppingItem(item.id)}
                className={`px-5 py-3 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition duration-150 select-none ${
                  item.bought ? 'bg-slate-50/40 text-slate-400' : ''
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {item.bought ? (
                    <div className="bg-emerald-100 hover:bg-emerald-250 border border-emerald-300 rounded-full p-0.5 text-emerald-700 shrink-0">
                      <Check size={14} strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="border border-slate-300 rounded-full h-[18px] w-[18px] hover:border-blue-500 hover:bg-blue-50 shrink-0 transition" />
                  )}

                  <div className="min-w-0">
                    <span className={`text-xs font-bold leading-tight truncate ${item.bought ? 'line-through text-slate-400 font-medium' : 'text-slate-850'}`}>
                      {item.name}
                    </span>
                    <p className="text-[9px] text-slate-400">
                      Añadido por {getMemberName(item.addedBy)}
                    </p>
                  </div>
                </div>

                {item.bought && item.boughtBy && (
                  <span className="shrink-0 bg-emerald-50 text-emerald-700 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase border border-emerald-100">
                    Súper: {getMemberName(item.boughtBy)}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
