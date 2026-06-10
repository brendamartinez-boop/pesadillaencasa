'use client';

import React, { useState } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { 
  Menu, X, Home, ClipboardList, ShoppingBasket, MessageCircle, Users, 
  Gift, TrendingUp, Gamepad2, Radio, Sparkles, User, LogOut, Lock, 
  ShieldAlert, Sparkle, LogIn, Plus, Play, Moon, Sun 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Subcomponents imports
import SimulationConsole from '@/components/SimulationConsole';
import DashboardHome from '@/components/DashboardHome';
import TasksManager from '@/components/TasksManager';
import ShoppingManager from '@/components/ShoppingManager';
import FamilyChat from '@/components/FamilyChat';
import ParentalControls from '@/components/ParentalControls';
import RewardsShop from '@/components/RewardsShop';
import StatsManager from '@/components/StatsManager';
import GamesPage from '@/components/GamesPage';
import WalkieTalkie from '@/components/WalkieTalkie';
import WrappedYearly from '@/components/WrappedYearly';
import ProfilePage from '@/components/ProfilePage';

type ViewTab = 'home' | 'tasks' | 'shopping' | 'chat' | 'family' | 'rewards' | 'stats' | 'games' | 'walkie' | 'wrapped' | 'profile';

export default function AppMainPage() {
  const { 
    user, 
    family, 
    loginWithGoogle, 
    createFamily, 
    joinFamily, 
    setDarkMode, 
    darkMode, 
    alarmActive,
    logout,
    tasks,
    shopping
  } = useFamily();

  // Tab routing
  const [activeTab, setActiveTab] = useState<ViewTab>('home');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auth form states
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customRole, setCustomRole] = useState<'admin' | 'child'>('child');

  // Family creation states
  const [newFamName, setNewFamName] = useState('');
  const [newWrappedReward, setNewWrappedReward] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [showCreateOption, setShowCreateOption] = useState(false);

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    const email = customEmail.trim() || `${customName.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
    loginWithGoogle(email, customName.trim(), `https://picsum.photos/seed/${customName}/150/150`, customRole);
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    const success = await joinFamily(joinCodeInput.trim());
    if (success) {
      setActiveTab('home');
    } else {
      alert('Código incorrecto. Prueba con "MART15" para cargar la familia Demo Martínez.');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamName.trim()) return;
    await createFamily(newFamName.trim(), newWrappedReward.trim() || undefined);
    setActiveTab('home');
  };

  // Render respective child module view
  const renderContentView = () => {
    switch(activeTab) {
      case 'home': return <DashboardHome />;
      case 'tasks': return <TasksManager />;
      case 'shopping': return <ShoppingManager />;
      case 'chat': return <FamilyChat />;
      case 'family': return <ParentalControls />;
      case 'rewards': return <RewardsShop />;
      case 'stats': return <StatsManager />;
      case 'games': return <GamesPage />;
      case 'walkie': return <WalkieTalkie />;
      case 'wrapped': return <WrappedYearly />;
      case 'profile': return <ProfilePage />;
      default: return <DashboardHome />;
    }
  };

  const getTabLabel = (tab: ViewTab) => {
    switch(tab) {
      case 'home': return 'Inicio';
      case 'tasks': return 'Tareas de Casa';
      case 'shopping': return 'Lista de Compra';
      case 'chat': return 'Chat Familiar';
      case 'family': return 'Control Parental';
      case 'rewards': return 'Tienda de Premios';
      case 'stats': return 'Historial y Gráficas';
      case 'games': return 'Sala de Juegos';
      case 'walkie': return 'Walkie-Talkie';
      case 'wrapped': return 'Spotify Wrapped 🎁';
      case 'profile': return 'Mi Perfil';
    }
  };

  // Counts of pending chores for small counter badges in menus
  const pendingTasksBadge = tasks.filter(t => !t.completed && !t.isProposal).length;
  const pendingShoppingBadge = shopping.filter(s => !s.bought).length;

  // --- 1. AUTH SCREEN (Logged out) ---
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-100 flex flex-col justify-center items-center p-4">
        {/* RED ALARM overlay flashing */}
        {alarmActive && (
          <div className="fixed inset-0 bg-red-650 z-50 pointer-events-none animate-alert-flash opacity-0 mix-blend-multiply" />
        )}

        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 relative overflow-hidden">
          {/* Logo */}
          <div className="text-center space-y-2">
            <div className="h-16 w-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto text-white shadow-xl rotate-post-it-right">
              <Sparkle size={36} className="text-yellow-300 fill-yellow-300" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-none mt-4">
              Pesadilla en Casa 🏡
            </h1>
            <p className="text-slate-500 text-xs">
              PWA de Gestión Familiar de Tareas Domésticas
            </p>
          </div>

          <p className="text-slate-655 text-xs text-center leading-relaxed font-semibold">
            ¡Organiza tu casa con diversión y gamificación! Gana puntos haciendo camas y barriendo para canjearlos por premios familiares.
          </p>

          {/* PRIMARY ROUTE: Real Google Login */}
          <button
            type="button"
            id="google-login-btn"
            onClick={() => loginWithGoogle()}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white hover:bg-slate-50 text-slate-800 font-extrabold rounded-xl border border-slate-300 shadow-sm hover:shadow transition duration-150 cursor-pointer text-sm"
          >
            <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            Inicia sesión real con Google
          </button>

          <div className="relative flex py-1 items-center text-xs text-slate-400">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">ó simular usuarios demo</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Quick login simulations (SUPER CONVENIENT FOR SPEED TESTING) */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-2.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider text-center">Simular Cuenta Google:</span>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="sim-papa-btn"
                onClick={() => loginWithGoogle('carlosperez@consolacionburriana.com', 'Papá Carlos', 'https://picsum.photos/seed/papa/150/150', 'admin')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-850 font-bold text-left transition text-[11px] border border-indigo-150 cursor-pointer"
              >
                <span className="shrink-0 font-bold block text-sm">🔑</span>
                <span className="truncate block">Papá Carlos (Admin)</span>
              </button>

              <button
                type="button"
                id="sim-mama-btn"
                onClick={() => loginWithGoogle('elena@gmail.com', 'Mamá Elena', 'https://picsum.photos/seed/mama/150/150', 'admin')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-850 font-bold text-left transition text-[11px] border border-indigo-150 cursor-pointer"
              >
                <span className="shrink-0 font-bold block text-sm">🔑</span>
                <span className="truncate block">Mamá Elena (Admin)</span>
              </button>

              <button
                type="button"
                id="sim-sofia-btn"
                onClick={() => loginWithGoogle('sofia@gmail.com', 'Sofía (Hija)', 'https://picsum.photos/seed/sofia/150/150', 'child')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-850 font-bold text-left transition text-[11px] border border-emerald-150 cursor-pointer"
              >
                <span className="shrink-0 font-bold block text-sm">👦</span>
                <span className="truncate block">Sofía (135 pts)</span>
              </button>

              <button
                type="button"
                id="sim-lucas-btn"
                onClick={() => loginWithGoogle('lucas@gmail.com', 'Lucas (Hijo)', 'https://picsum.photos/seed/lucas/150/150', 'child')}
                className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-850 font-bold text-left transition text-[11px] border border-emerald-150 cursor-pointer"
              >
                <span className="shrink-0 font-bold block text-sm">👦</span>
                <span className="truncate block">Lucas (Castigado)</span>
              </button>
            </div>
          </div>

          <div className="relative flex py-2 items-center text-xs text-slate-400">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400">ó crear nuevo</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {/* Form manual custom login simulating Google popup */}
          <form onSubmit={handleCustomLogin} className="space-y-3 font-semibold text-xs">
            <div className="space-y-1">
              <label className="block text-slate-700">Nombre de pila</label>
              <input
                type="text"
                required
                value={customName}
                onChange={e => setCustomName(e.target.value)}
                placeholder="Ej. Tío Alberto, Abuela Carmen"
                className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2.5 focus:outline-none focus:border-blue-500 font-normal"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-700">Email Google (Simulador)</label>
              <input
                type="email"
                value={customEmail}
                onChange={e => setCustomEmail(e.target.value)}
                placeholder="Dejar vacío para autogenerar"
                className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2.5 focus:outline-none focus:border-blue-500 font-normal"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-slate-700">Rol Inicial</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="initial_role"
                    checked={customRole === 'child'}
                    onChange={() => setCustomRole('child')}
                    className="accent-blue-600"
                  />
                  Hijo/a (Rol General)
                </label>
                <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                  <input
                    type="radio"
                    name="initial_role"
                    checked={customRole === 'admin'}
                    onChange={() => setCustomRole('admin')}
                    className="accent-blue-600"
                  />
                  Padre (Administrador)
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-xl shadow-lg transition duration-200 cursor-pointer text-xs"
            >
              <LogIn size={15} /> Simular Inicio Sesión Google
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- 2. FAMILY ENROLLER (Logged in, but homeless) ---
  if (!family) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-slate-100 flex flex-col justify-center items-center p-4">
        {/* RED ALARM overlay flashing */}
        {alarmActive && (
          <div className="fixed inset-0 bg-red-650 z-50 pointer-events-none animate-alert-flash opacity-0 mix-blend-multiply" />
        )}

        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-slate-100 space-y-6 relative overflow-hidden">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <span className="text-xs text-slate-500 font-bold truncate">Bienvenido, <strong>{user.displayName}</strong></span>
            <button
              onClick={logout}
              className="text-red-650 hover:text-red-700 text-xs font-bold leading-none cursor-pointer"
            >
              Cerrar Sesión
            </button>
          </div>

          <div className="text-center space-y-2">
            <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">
              🔑 Necesitas un Hogar Familiar
            </h2>
            <p className="text-slate-500 text-xsleading-normal mt-1.5">
              Escoge entrar en un hogar existente o fundar tu propio nido familiar desde cero hoy.
            </p>
          </div>

          {/* SIMULATION CARD ADVICE */}
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-150 inline-block text-center w-full">
            <span className="text-[10px] font-bold text-blue-700 block uppercase tracking-wide leading-none mb-1">💡 ATAJO CON DEMO INICIAL:</span>
            <p className="text-[11px] text-blue-900 italic font-semibold leading-normal">
              Escribe el código <strong className="text-blue-950 font-black tracking-widest bg-blue-200 px-1 rounded">MART15</strong> abajo para ingresar en el hogar precargado de &quot;Los Martínez&quot; con rankings, walkies y tareas ya listas.
            </p>
          </div>

          {/* BRANCH SELECTION: JOIN VS CREATE */}
          {!showCreateOption ? (
            <div className="space-y-4">
              <form onSubmit={handleJoin} className="space-y-2 text-xs font-semibold">
                <label className="block text-slate-700">Introduce código de 6 caracteres:</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={joinCodeInput}
                    onChange={e => setJoinCodeInput(e.target.value.toUpperCase())}
                    placeholder="Ej. MART15"
                    className="flex-1 bg-slate-50 border border-slate-250 rounded-xl px-3 py-2 text-sm text-center font-mono focus:outline-none focus:border-blue-500 tracking-widest placeholder-slate-400 font-bold uppercase"
                  />
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white font-extrabold px-5 rounded-xl cursor-pointer"
                  >
                    Ingresar
                  </button>
                </div>
              </form>

              <button
                type="button"
                onClick={() => setShowCreateOption(true)}
                className="w-full text-center text-xs text-indigo-700 hover:text-indigo-805 hover:underline font-bold"
              >
                O prefiero fundar un hogar familiar nuevo &rarr;
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <form onSubmit={handleCreate} className="space-y-3.5 text-xs font-semibold">
                <div className="space-y-1">
                  <label className="block text-slate-700">Nombre de la Familia (Ej: Los Pérez)</label>
                  <input
                    type="text"
                    required
                    value={newFamName}
                    onChange={e => setNewFamName(e.target.value)}
                    placeholder="Ej. Los Pérez de Burriana"
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2.5 font-normal focus:outline-none focus:border-indigo-505"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-slate-700">Premio Especial del Wrapped Anual (Opcional)</label>
                  <input
                    type="text"
                    value={newWrappedReward}
                    onChange={e => setNewWrappedReward(e.target.value)}
                    placeholder="Ej. Un fin de semana en EuroDisney 🏰"
                    className="w-full bg-slate-50 border border-slate-250 rounded-xl p-2.5 font-normal focus:outline-none focus:border-indigo-505"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-600 text-white font-black rounded-xl shadow-md transition cursor-pointer"
                >
                  Fundar Hogar Familiar (Admin)
                </button>
              </form>

              <button
                type="button"
                onClick={() => setShowCreateOption(false)}
                className="w-full text-center text-xs text-blue-700 hover:text-blue-805 hover:underline font-bold"
              >
                &larr; Volver a unirse con un código
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // --- 3. GLOBAL APP LOCK (If Parents cast a full block on the user) ---
  if (user.blocked.all) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center p-4">
        {/* RED ALARM overlay flashing */}
        {alarmActive && (
          <div className="fixed inset-0 bg-red-650 z-50 pointer-events-none animate-alert-flash opacity-0 mix-blend-multiply" />
        )}

        <div className="bg-slate-900 border border-red-500/20 rounded-3xl p-8 max-w-sm text-center shadow-2xl space-y-6 relative overflow-hidden">
          {/* Crimson glow */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-red-600"></div>

          <div className="h-16 w-16 bg-red-950 text-red-400 rounded-full flex items-center justify-center mx-auto border border-red-900 shadow">
            <Lock size={32} />
          </div>

          <h2 className="text-xl font-black uppercase tracking-tight text-red-500">Candidato Bloqueado</h2>
          
          <p className="text-slate-300 text-xs text-center leading-normal">
            &quot;El admin ha desactivado el acceso a la aplicación para ti&quot;
          </p>

          <p className="text-slate-450 text-[11px] leading-relaxed">
            La cuenta correspondiente ha sido castigada o desvinculada por los padres encargados. No tienes derecho a leer o escribir datos.
          </p>

          <div className="pt-4 flex flex-col gap-2">
            <button
              onClick={() => {
                logout();
                window.location.reload();
              }}
              className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl text-xs transition cursor-pointer"
            >
              Cerrar Sesión / Cambiar Cuenta
            </button>
            <span className="text-[9px] text-slate-500 leading-normal block uppercase">
              Inicia sesión como &quot;Papá Carlos&quot; u otro Admin para indultar esta cuenta.
            </span>
          </div>
        </div>
      </div>
    );
  }

  // --- 4. SECURE LOGGED-IN FAMILY DASHBOARD FRAME ---
  const navSidebarItems: { tab: ViewTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { tab: 'home', label: 'Inicio', icon: <Home size={15} /> },
    { tab: 'tasks', label: 'Tareas de Casa', icon: <ClipboardList size={15} />, badge: pendingTasksBadge > 0 ? pendingTasksBadge : undefined },
    { tab: 'shopping', label: 'Lista de Compra', icon: <ShoppingBasket size={15} />, badge: pendingShoppingBadge > 0 ? pendingShoppingBadge : undefined },
    { tab: 'chat', label: 'Chat Familiar', icon: <MessageCircle size={15} /> },
    { tab: 'family', label: 'Control Parental', icon: <Users size={15} /> },
    { tab: 'rewards', label: 'Tienda Premios', icon: <Gift size={15} /> },
    { tab: 'stats', label: 'Historial y Gráficas', icon: <TrendingUp size={15} /> },
    { tab: 'games', label: 'Sala de Juegos', icon: <Gamepad2 size={15} /> },
    { tab: 'walkie', label: 'Walkie-Talkie', icon: <Radio size={15} /> },
    { tab: 'wrapped', label: 'Spotify Wrapped 🎁', icon: <Sparkles size={15} /> },
    { tab: 'profile', label: 'Mi Perfil', icon: <User size={15} /> }
  ];

  return (
    <div className="min-h-screen pb-24 lg:flex bg-blue-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-none relative animate-fade-in transition-colors duration-200">
      {/* RED ALARM overlay flashing */}
      {alarmActive && (
        <div className="fixed inset-0 bg-red-650 z-50 pointer-events-none animate-alert-flash opacity-0 mix-blend-multiply" />
      )}

      {/* DESKTOP SIDEBAR PERSISTENT PANEL */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-r border-blue-100 dark:border-slate-800 shrink-0 select-none p-5 h-screen sticky top-0 shadow-sm z-10 transition-colors duration-200">
        {/* App banner */}
        <div className="flex items-center gap-2 mb-8 border-b border-blue-100 dark:border-slate-800 pb-4">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-black rotate-1 shadow shrink-0">
            🏡
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-tight leading-none text-blue-950 dark:text-slate-100 uppercase">Pesadilla en Casa</h1>
            <span className="text-[9px] text-blue-600 dark:text-blue-400 block font-bold tracking-widest leading-none mt-1">ORGANIZADOR</span>
          </div>
        </div>

        {/* Sidebar Nav anchors */}
        <nav className="flex-1 space-y-1 overflow-y-auto pr-1">
          {navSidebarItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => {
                  setActiveTab(item.tab);
                  setDrawerOpen(false);
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-[12px] font-bold text-left cursor-pointer group select-none ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 dark:shadow-blue-950/20' 
                    : 'text-slate-500 dark:text-slate-450 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50/70 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-white' : 'text-slate-400 dark:text-slate-550 group-hover:text-blue-500 dark:group-hover:text-blue-400 font-normal shrink-0'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`h-4.5 min-w-4.5 flex justify-center items-center rounded-full text-[9px] px-1.5 font-black shrink-0 ${
                    isActive ? 'bg-white text-blue-600' : 'bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Dark Mode toggle row in sidebar */}
        <div className="py-3 border-t border-blue-100 dark:border-slate-800 flex items-center justify-between mt-auto text-xs font-bold text-slate-600 dark:text-slate-400 transition-colors duration-200">
          <span className="flex items-center gap-2">
            {darkMode ? <Moon size={15} className="text-yellow-400" /> : <Sun size={15} className="text-amber-500" />}
            Modo Oscuro
          </span>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-9 h-5 rounded-full p-0.5 transition duration-200 cursor-pointer focus:outline-none ${darkMode ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-750'}`}
            aria-label="Alternar modo oscuro"
          >
            <div className={`w-4 h-4 rounded-full bg-white shadow transition duration-200 ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
          </button>
        </div>

        {/* User profile footnote section */}
        <div className="pt-4 border-t border-blue-100 dark:border-slate-800 flex items-center justify-between transition-colors duration-200">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-8 h-8 rounded-full object-cover border border-blue-100 dark:border-slate-800 shrink-0 shadow-sm"
            />
            <div className="min-w-0 font-bold leading-tight">
              <span className="text-[11px] block text-slate-850 dark:text-slate-200 truncate capitalize">{user.displayName.split(' ')[0]}</span>
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block leading-none">{user.role === 'admin' ? '🔑 Padre' : '👧 Hijo/a'}</span>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 rounded-lg cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut size={14} />
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER BAR */}
      <header className="lg:hidden bg-white dark:bg-slate-900 border-b border-blue-100 dark:border-slate-800 px-4 py-3 sticky top-0 z-40 flex justify-between items-center select-none shadow-sm h-14 transition-colors duration-200">
        <button
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="p-1.5 text-slate-700 dark:text-slate-300 hover:bg-blue-50/50 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-455 rounded-xl transition cursor-pointer"
        >
          {drawerOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <span className="font-extrabold text-xs tracking-tight text-blue-955 dark:text-slate-100 flex items-center gap-1.5 leading-none">
          🏡 <span className="uppercase text-[11px] tracking-wider font-extrabold">{getTabLabel(activeTab)}</span>
        </span>

        {/* Avatar right block */}
        <button
          onClick={() => setActiveTab('profile')}
          className="shrink-0 relative focus:outline-none"
        >
          <img
            src={user.photoURL}
            alt=""
            className="w-7 h-7 rounded-full object-cover border border-blue-100 dark:border-slate-800 shadow-sm"
          />
        </button>
      </header>

      {/* MOBILE DRAWER TOGGLE SHEET */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop cover */}
            <div 
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/40 z-40 lg:hidden"
            />
            {/* Drawer sheet body */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.25 }}
              className="fixed top-0 left-0 bottom-0 select-none z-45 bg-slate-900 text-slate-100 max-w-[240px] w-full p-4 flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="font-extrabold text-xs text-blue-400">Menú Navegación</span>
                  <button onClick={() => setDrawerOpen(false)} className="text-slate-400">
                    <X size={18} />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navSidebarItems.map((item) => {
                    const isActive = activeTab === item.tab;
                    return (
                      <button
                        key={item.tab}
                        onClick={() => {
                          setActiveTab(item.tab);
                          setDrawerOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl transition text-[12px] font-bold text-left cursor-pointer ${
                          isActive 
                            ? 'bg-blue-600 text-white' 
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          {item.icon}
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className={`h-4.5 min-w-4.5 flex justify-center items-center rounded-full text-[9px] px-1 font-black ${
                            isActive ? 'bg-white text-blue-600' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              {/* Drawer footer content (dark mode & user details) */}
              <div className="space-y-3.5">
                {/* Dark Mode switcher inside drawer */}
                <div className="py-2.5 border-t border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300">
                  <span className="flex items-center gap-2">
                    {darkMode ? <Moon size={15} className="text-yellow-400" /> : <Sun size={15} className="text-amber-500" />}
                    Modo Oscuro
                  </span>
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className={`w-9 h-5 rounded-full p-0.5 transition duration-200 cursor-pointer focus:outline-none ${darkMode ? 'bg-blue-600' : 'bg-slate-700'}`}
                    aria-label="Alternar modo oscuro"
                  >
                    <div className={`w-4 h-4 rounded-full bg-white transition duration-200 ${darkMode ? 'translate-x-4' : 'translate-x-0'}`} />
                  </button>
                </div>

                {/* Drawer footer log profile */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover border border-slate-850" />
                    <div className="min-w-0 font-bold leading-tight text-[11px]">
                      <span className="truncate block max-w-[100px] text-white capitalize">{user.displayName.split(' ')[0]}</span>
                      <span className="text-slate-500 block text-[9px] leading-none">{user.role === 'admin' ? '🔑 Admin' : '👦 Hijo/a'}</span>
                    </div>
                  </div>

                  <button onClick={logout} className="p-1 px-2.5 bg-red-955 text-red-400 hover:text-red-500 font-black border border-red-900 rounded-lg text-[10px] cursor-pointer">
                    LogOut
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CORE FRAME CONTENT WRAPPER */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl">
        <div className="mx-auto">
          {renderContentView()}
        </div>
      </main>

      {/* PERSISTENT FLOATING bottom diagnostic control */}
      <SimulationConsole />
    </div>
  );
}
