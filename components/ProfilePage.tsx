'use client';

import React, { useState } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { User, Shield, LogOut, Camera, Check, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProfilePage() {
  const { user, family, updateProfilePhoto, logout, darkMode, setDarkMode } = useFamily();
  const [customPhotoUrl, setCustomPhotoUrl] = useState('');

  // 12 fun household avatar presets to choose from instantly
  const presetAvatars = [
    { url: 'https://picsum.photos/seed/papa/150/150', label: 'Papa Carlos' },
    { url: 'https://picsum.photos/seed/mama/150/150', label: 'Mama Elena' },
    { url: 'https://picsum.photos/seed/sofia/150/150', label: 'Sofia Hija' },
    { url: 'https://picsum.photos/seed/lucas/150/150', label: 'Lucas Hijo' },
    { url: 'https://picsum.photos/seed/grandpa/150/150', label: 'Abuelo' },
    { url: 'https://picsum.photos/seed/grandma/150/150', label: 'Abuela' },
    { url: 'https://picsum.photos/seed/toby/150/150', label: 'Toby Perro' },
    { url: 'https://picsum.photos/seed/kitty/150/150', label: 'Cat Kitty' }
  ];

  const handleCustomPhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPhotoUrl.trim()) return;
    updateProfilePhoto(customPhotoUrl.trim());
    setCustomPhotoUrl('');
    alert('📷 ¡Foto de perfil personalizada actualizada con éxito!');
  };

  const handlePresetSelect = (url: string) => {
    updateProfilePhoto(url);
  };

  if (!user) return null;

  return (
    <div className="space-y-6 pb-12 max-w-xl animate-fade-in text-slate-800 dark:text-slate-100">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
          👤 Mi Perfil Familiar
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs">Administra tus detalles individuales de convivencia en el hogar.</p>
      </div>

      {/* CORE PROFILE HEADER */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-250/60 dark:border-slate-800 p-6 flex flex-col sm:flex-row items-center gap-5 shadow-sm transition-colors duration-200">
        <div className="relative group cursor-pointer shrink-0">
          <img
            src={user.photoURL}
            alt={user.displayName}
            className="w-20 h-20 rounded-full object-cover border-4 border-slate-100 dark:border-slate-800 shadow-md group-hover:opacity-90 transition"
          />
          <div className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full border border-white dark:border-slate-800">
            <Camera size={13} />
          </div>
        </div>

        <div className="text-center sm:text-left space-y-1">
          <h2 className="text-base font-black text-slate-900 dark:text-slate-100 capitalize flex items-center justify-center sm:justify-start gap-1.5">
            {user.displayName}
            <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase leading-none ${
              user.role === 'admin' 
                ? 'bg-indigo-100 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-400' 
                : 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400'
            }`}>
              {user.role === 'admin' ? 'Admin' : 'Hijo'}
            </span>
          </h2>
          <p className="text-slate-400 dark:text-slate-500 text-xs">{user.email}</p>
          <p className="text-xs text-slate-605 dark:text-slate-400">
            Adscrito el: <strong className="text-slate-800 dark:text-slate-200">{new Date(user.joinedAt).toLocaleDateString('es-ES')}</strong>
          </p>
        </div>
      </div>

      {/* CHOOSE PRESET AVATARS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-250/60 dark:border-slate-800 p-5 shadow-sm space-y-3.5 transition-colors duration-200">
        <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
          <Camera size={14} className="text-blue-500" /> Sube tu Avatar (Simulado)
        </h3>
        
        <p className="text-slate-450 dark:text-slate-400 text-xs leading-relaxed">
          Escoge un avatar de la residencia para adaptarlo a tu parentesco en el menú familiar, o escribe el enlace de una foto propia:
        </p>

        {/* Preset grid */}
        <div className="grid grid-cols-4 gap-3">
          {presetAvatars.map((av, index) => {
            const isSelected = user.photoURL === av.url;
            return (
              <button
                key={index}
                onClick={() => handlePresetSelect(av.url)}
                className={`relative rounded-xl overflow-hidden border-2 transition duration-150 aspect-square cursor-pointer flex items-center justify-center ${
                  isSelected ? 'border-blue-500 scale-95 ring-2 ring-blue-10/70' : 'border-slate-150 dark:border-slate-850 hover:border-slate-300 dark:hover:border-slate-705'
                }`}
                title={av.label}
              >
                <img src={av.url} alt="" className="w-full h-full object-cover" />
                {isSelected && (
                  <div className="absolute inset-0 bg-blue-900/40 flex items-center justify-center text-white">
                    <Check size={16} strokeWidth={3} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* URL Custom input */}
        <form onSubmit={handleCustomPhotoSubmit} className="pt-3 border-t border-slate-100 dark:border-slate-805 flex gap-2">
          <input
            type="url"
            value={customPhotoUrl}
            onChange={(e) => setCustomPhotoUrl(e.target.value)}
            placeholder="Introduce enlace de imagen (ej: https://...)"
            className="flex-1 bg-slate-50 dark:bg-slate-850 border border-slate-250 dark:border-slate-750 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl text-xs transition cursor-pointer"
          >
            Guardar
          </button>
        </form>
      </div>

      {/* APP PREFERENCES / DARK MODE CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-250/60 dark:border-slate-800 p-5 shadow-sm space-y-4 transition-colors duration-200">
        <h3 className="text-xs font-bold text-slate-705 dark:text-slate-305 uppercase tracking-widest flex items-center gap-1.5">
          {darkMode ? <Moon size={14} className="text-yellow-400" /> : <Sun size={14} className="text-amber-500" />} Preferencias Visuales
        </h3>
        
        <p className="text-slate-450 dark:text-slate-400 text-xs leading-relaxed">
          Determina las configuraciones de aspecto estético para tu dispositivo. Amigable para leer en la cama o por la noche.
        </p>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-805">
          <div className="space-y-0.5">
            <span className="text-xs font-black text-slate-900 dark:text-slate-100 block">Modo Oscuro</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 block">Activa el aspecto nocturno en el teléfono, tablet o computadora.</span>
          </div>
          
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className={`w-11 h-6 rounded-full p-0.5 transition duration-200 cursor-pointer focus:outline-none flex items-center ${
              darkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-800'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition duration-200 ${
              darkMode ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* GROUP HOUSEHOLD METADATA CARD */}
      {family && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3 shrink-0 transition-colors duration-200">
          <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
            <Shield size={14} className="text-blue-500" /> Informaciones de Residencia
          </h3>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150 dark:border-slate-800 leading-normal">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase leading-none">Tu Residencia</span>
              <strong className="text-slate-805 dark:text-slate-200 text-xs mt-1 block truncate">{family.name}</strong>
            </div>

            <div className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-150 dark:border-slate-800 leading-normal">
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-bold uppercase leading-none">Código</span>
              <strong className="font-mono text-emerald-600 dark:text-emerald-400 font-bold text-xs mt-1 block tracking-wider">{family.code}</strong>
            </div>
          </div>
        </div>
      )}

      {/* CORE LOGOUT */}
      <div className="pt-4 flex justify-end">
        <button
          onClick={() => {
            if (confirm('¿Quieres cerrar tu sesión simulación?')) {
              logout();
            }
          }}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-950/20 dark:hover:bg-red-900/30 text-red-700 dark:text-red-400 font-black rounded-xl border border-red-200 dark:border-red-900/40 transition text-xs shadow-sm cursor-pointer"
        >
          <LogOut size={14} /> Cerrar Sesión Google
        </button>
      </div>
    </div>
  );
}
