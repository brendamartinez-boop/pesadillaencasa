'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { Gamepad2, Lock, Navigation, RefreshCw, Dices, HelpCircle, User, Users, ShieldAlert, Check } from 'lucide-react';
import { motion } from 'motion/react';

export default function GamesPage() {
  const { user, members, triggerAlarmaRoja } = useFamily();

  // Selected game status: null | 'ruleta' | 'impostor' | 'parchis' | 'trivial'
  const [activeGame, setActiveGame] = useState<'ruleta' | 'impostor' | 'parchis' | 'trivial' | null>(null);

  // Check Parental Control block
  if (user?.blocked.all || user?.blocked.games) {
    return (
      <div className="bg-white p-10 max-w-xl mx-auto rounded-3xl border border-red-200 text-center shadow-lg my-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-red-600"></div>
        <div className="h-16 w-16 bg-red-50 text-red-650 rounded-full flex items-center justify-center mx-auto mb-5 border border-red-150 animate-bounce">
          <Lock size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-950 uppercase tracking-tight">Acceso Restringido</h2>
        <p className="text-slate-650 text-xs mt-3 leading-relaxed">
          El administrador de tu familia ha <strong className="text-red-650">desactivado la sala de juegos</strong> para tu perfil.
        </p>
        <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-150 text-slate-500 font-medium text-[11px] leading-relaxed">
          💡 Cumple tus tareas del hogar pendientes para convencer al administrador de que te devuelva el permiso.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
          🎮 La Sala de Juegos
        </h1>
        <p className="text-slate-500 text-xs">Despájate jugando y tomando decisiones familiares divertidas.</p>
      </div>

      {activeGame === null ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Game 1: Ruleta de Decisiones */}
          <div 
            onClick={() => setActiveGame('ruleta')}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
                <Navigation className="rotate-45" size={24} />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">1. Ruleta de Decisiones</h3>
              <p className="text-slate-450 text-xs mt-1.5 leading-relaxed">
                ¿Quién fregar el plato gordo o saca la basura de Toby? Deja que el azar decida de forma justa y divertida.
              </p>
            </div>
            <span className="text-blue-600 font-bold text-xs mt-6 flex items-center gap-1">Entrar a jugar &rarr;</span>
          </div>

          {/* Game 2: El Impostor */}
          <div 
            onClick={() => setActiveGame('impostor')}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 bg-red-50 text-red-650 rounded-2xl flex items-center justify-center mb-4">
                <Users size={24} />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">2. El Impostor</h3>
              <p className="text-slate-450 text-xs mt-1.5 leading-relaxed">
                ¿Quién se terminó las natillas de vainilla ayer? Un juego social de debates familiares y votación secreta.
              </p>
            </div>
            <span className="text-red-550 font-bold text-xs mt-6 flex items-center gap-1">Entrar a jugar &rarr;</span>
          </div>

          {/* Game 3: Parchís Express */}
          <div 
            onClick={() => setActiveGame('parchis')}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
                <Dices size={24} />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">3. Parchís Mini</h3>
              <p className="text-slate-450 text-xs mt-1.5 leading-relaxed">
                Parchís simplificado sobre el navegador. Lanza el dado en turnos simulados contra tus hermanos y sé el primero en llegar.
              </p>
            </div>
            <span className="text-amber-600 font-bold text-xs mt-6 flex items-center gap-1">Entrar a jugar &rarr;</span>
          </div>

          {/* Game 4: Trivial Familiar */}
          <div 
            onClick={() => setActiveGame('trivial')}
            className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
                <HelpCircle size={24} />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">4. Trivial Familiar</h3>
              <p className="text-slate-450 text-xs mt-1.5 leading-relaxed">
                ¿Quién ronca más, quién odia el pepino o de quién es el turno anual de limpiar? Contesta trivialidades del hogar.
              </p>
            </div>
            <span className="text-emerald-700 font-bold text-xs mt-6 flex items-center gap-1">Entrar a jugar &rarr;</span>
          </div>
        </div>
      ) : (
        /* ACTIVE MOCK GAME VIEWER */
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
          <button 
            onClick={() => setActiveGame(null)}
            className="mb-4 bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-3 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            &larr; Volver a la Sala
          </button>

          {activeGame === 'ruleta' && <DecisionRoulette />}
          {activeGame === 'impostor' && <ImpostorGame />}
          {activeGame === 'parchis' && <MiniParchis />}
          {activeGame === 'trivial' && <FamilyTrivial />}
        </div>
      )}
    </div>
  );
}

// ============================================
// SUB COMPONENT 1: DecisionRoulette
// ============================================
function DecisionRoulette() {
  const options = ['Fregar Platos 🍽️', 'Barrer Salón 🧹', 'Sacar Basura 🗑️', 'Librarte de hoy 🎉', 'Pasear Perro 🐕', 'Limpiar Baño 🧽'];
  
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);

    // Turn 5-10 complete rotations + segment rotation
    const totalRotation = rotation + 1800 + Math.floor(Math.random() * 360);
    setRotation(totalRotation);

    setTimeout(() => {
      setSpinning(false);
      
      // Calculate selected segment (6 options, each segment is 60 degrees)
      const normalizedAngle = (totalRotation % 360);
      const index = Math.floor(((360 - normalizedAngle + 30) % 360) / 60) % 6;
      setWinner(options[index]);
    }, 3000);
  };

  return (
    <div className="text-center py-6 space-y-6 max-w-sm mx-auto">
      <h2 className="text-sm font-extrabold uppercase tracking-widest text-blue-600">🎯 Ruleta del Destino Familiar</h2>
      <p className="text-slate-500 text-xs leading-relaxed">Pulsa Girar para resolver disputas domésticas de forma divertida y equilibrada.</p>
      
      <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
        {/* Needle/pointer */}
        <div className="absolute top-0 w-4 h-8 bg-red-600 rounded-full z-20 drop-shadow-md transform -translate-y-2 flex justify-center">
          <div className="h-4 w-4 bg-yellow-300 rounded-full border border-red-800 self-center"></div>
        </div>

        {/* Roulette Wheel Graphics */}
        <motion.div 
          animate={{ rotate: rotation }}
          transition={{ duration: spinning ? 3 : 0, ease: 'easeOut' }}
          className="w-full h-full rounded-full border-4 border-slate-900 shadow-xl overflow-hidden relative flex items-center justify-center text-[10px] font-black"
          style={{
            background: 'conic-gradient(#DBEAFE 0deg 60deg, #F9A8D4 60deg 120deg, #FDE68A 120deg 180deg, #A7F3D0 180deg 240deg, #FCA5A5 240deg 300deg, #C7D2FE 300deg 360deg)'
          }}
        >
          {options.map((opt, idx) => {
            const angle = idx * 60;
            return (
              <div 
                key={idx}
                className="absolute text-center origin-center w-24 translate-x-1"
                style={{
                  transform: `rotate(${angle + 30}deg) translate(40px) rotate(-${angle + 30}deg)`
                }}
              >
                <div className="text-slate-805 origin-center font-extrabold max-w-[50px] leading-tight break-words">{opt.split(' ')[0]}</div>
              </div>
            );
          })}
          {/* Center axis lock */}
          <div className="absolute h-8 w-8 bg-slate-900 border border-white rounded-full z-10"></div>
        </motion.div>
      </div>

      <button
        onClick={spin}
        disabled={spinning}
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow transition text-xs cursor-pointer disabled:opacity-50"
      >
        {spinning ? '¿Girando la suerte?...' : '¡GIRAR RULETA! 🚀'}
      </button>

      {winner && (
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-yellow-50 p-4 border border-yellow-250 rounded-2xl"
        >
          <span className="block text-slate-500 font-bold text-[10px] uppercase tracking-wider">Has recibido:</span>
          <strong className="text-base font-extrabold text-blue-700 block mt-1">{winner}</strong>
          <span className="text-[10px] text-slate-450 block mt-1">¡Sin protestas ni regañinas en casa!</span>
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// SUB COMPONENT 2: ImpostorGame
// ============================================
function ImpostorGame() {
  const rounds = [
    { suspect: 'Sofía', crime: '¿Quién dejó la tapa de la pasta de dientes abierta?', desc: 'La tapa apareció rodando detrás del lavabo.' },
    { suspect: 'Papá Carlos', crime: '¿Quién se comió las últimas galletas de chocolate?', desc: 'Quedó el paquete vacío clavado en el armario de dulces.' },
    { suspect: 'Lucas', crime: '¿Quién ha derramado zumo de naranja sin secar?', desc: 'Una huella pegajosa se extiende en la encimera.' }
  ];

  const [activeRound, setActiveRound] = useState(0);
  const [selectedSuspect, setSelectedSuspect] = useState<string | null>(null);
  const [voted, setVoted] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const handleVote = (suspectName: string) => {
    if (voted) return;
    setSelectedSuspect(suspectName);
    setVoted(true);

    const actualRound = rounds[activeRound];
    
    // Simulating family votes
    const isIndeedImpostor = suspectName.toLowerCase() === actualRound.suspect.toLowerCase();
    
    setTimeout(() => {
      const familyLogs = [
        `Tú has votado a: ${suspectName}`,
        `Mamá Elena votó a: ${actualRound.suspect}`,
        `Sofía sospecha de: Lucas`,
        `Lucas declara: ¡Yo no fui!`
      ];
      setLog(familyLogs);
    }, 500);
  };

  const handleNext = () => {
    setActiveRound((prev) => (prev + 1) % rounds.length);
    setVoted(false);
    setSelectedSuspect(null);
    setLog([]);
  };

  const current = rounds[activeRound];

  return (
    <div className="max-w-md mx-auto space-y-5 text-sm">
      <div className="text-center">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-red-600">🔎 El Impostor Familiar</h2>
        <p className="text-xs text-slate-500 mt-1">Investiga quién cometió el delito menor del hogar en esta ronda.</p>
      </div>

      <div className="bg-red-50/50 p-4 border border-red-150 rounded-2xl">
        <span className="block text-[10px] uppercase font-black text-red-600 tracking-wider">Misión en curso:</span>
        <h3 className="font-extrabold text-xs text-slate-900 mt-1">{current.crime}</h3>
        <p className="text-slate-500 text-xs leading-normal mt-1">{current.desc}</p>
      </div>

      <div className="space-y-2">
        <label className="block text-xs text-slate-550 font-bold">Elige a quién señalar con el dedo:</label>
        
        <div className="grid grid-cols-3 gap-2">
          {['Papá Carlos', 'Sofía', 'Lucas'].map((suspect) => {
            const votedForThis = selectedSuspect === suspect;
            return (
              <button
                key={suspect}
                disabled={voted}
                onClick={() => handleVote(suspect)}
                className={`py-3 px-2 rounded-xl border text-xs font-bold transition flex flex-col items-center justify-center gap-2 cursor-pointer ${
                  votedForThis 
                    ? 'bg-red-600 text-white border-red-500' 
                    : voted 
                    ? 'bg-slate-50 border-slate-200 text-slate-400 opacity-60' 
                    : 'bg-white hover:bg-slate-50 border-slate-250 text-slate-800'
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center border text-[11px] font-black">
                  {suspect.charAt(0)}
                </div>
                <span className="truncate w-full text-center block text-[10px]">{suspect}</span>
              </button>
            );
          })}
        </div>
      </div>

      {voted && (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-slate-900 text-slate-100 p-4 rounded-2xl text-xs space-y-2 border border-slate-800"
        >
          <h4 className="font-extrabold text-red-400 uppercase tracking-widest text-[9px]">Veredicto del Juicio Familiar:</h4>
          
          <div className="space-y-1 font-mono text-slate-300">
            {log.map((line, i) => (
              <div key={i} className="flex gap-1 items-center">
                <span className="text-slate-500">&gt;</span>
                <span>{line}</span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 mt-3 flex justify-between items-center text-[10px]">
            <span>El verdadero culpable era: <strong className="text-yellow-300">{current.suspect}</strong></span>
            <button
              onClick={handleNext}
              className="bg-red-600 hover:bg-red-500 text-white font-black py-1 px-3 rounded-lg hover:shadow transition"
            >
              Siguiente Caso
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ============================================
// SUB COMPONENT 3: MiniParchis
// ============================================
function MiniParchis() {
  const [myPosition, setMyPosition] = useState(0);
  const [lucasPosition, setLucasPosition] = useState(0);
  const [sofiaPosition, setSofiaPosition] = useState(0);

  const [activeTurn, setActiveTurn] = useState<'me' | 'lucas' | 'sofia'>('me');
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);

  const rollDice = () => {
    if (rolling || winner || activeTurn !== 'me') return;
    setRolling(true);
    setLastRoll(null);

    setTimeout(() => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setLastRoll(roll);
      setRolling(false);

      const nextPos = Math.min(20, myPosition + roll);
      setMyPosition(nextPos);

      if (nextPos === 20) {
        setWinner('Tú');
        return;
      }

      // Chain automated CPU turns
      setActiveTurn('lucas');
    }, 1200);
  };

  // Simulating CPU turns on state change
  useEffect(() => {
    if (winner) return;

    if (activeTurn === 'lucas') {
      const timer = setTimeout(() => {
        const roll = Math.floor(Math.random() * 6) + 1;
        const nextPos = Math.min(20, lucasPosition + roll);
        setLucasPosition(nextPos);
        setLastRoll(roll);

        if (nextPos === 20) {
          setWinner('Lucas');
        } else {
          setActiveTurn('sofia');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }

    if (activeTurn === 'sofia') {
      const timer = setTimeout(() => {
        const roll = Math.floor(Math.random() * 6) + 1;
        const nextPos = Math.min(20, sofiaPosition + roll);
        setSofiaPosition(nextPos);
        setLastRoll(roll);

        if (nextPos === 20) {
          setWinner('Sofía');
        } else {
          setActiveTurn('me');
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [activeTurn, winner]);

  const handleReset = () => {
    setMyPosition(0);
    setLucasPosition(0);
    setSofiaPosition(0);
    setActiveTurn('me');
    setLastRoll(null);
    setWinner(null);
  };

  return (
    <div className="max-w-md mx-auto space-y-6 text-xs font-semibold">
      <div className="text-center">
        <h2 className="text-sm font-extrabold uppercase tracking-widest text-amber-600">🎲 Parchís Express (Llegar a la meta)</h2>
        <p className="text-slate-500 text-[11px] mt-1">Sé el primero en recorrer el circuito circular de 20 casillas rítmicas.</p>
      </div>

      {/* Grid status of player steps */}
      <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 space-y-3">
        <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest pb-2 border-b border-slate-800">
          <span>Ocultar Circuito</span>
          <span>Progreso ({activeTurn === 'me' ? 'Tu Turno' : `Turno de ${activeTurn}`})</span>
        </div>

        {/* Player 1 (Me) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-blue-400 font-extrabold flex items-center gap-1">🔴 Tú</span>
            <span>{myPosition}/20 casillas</span>
          </div>
          <div className="h-2 w-full bg-slate-850 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${(myPosition/20)*100}%` }}></div>
          </div>
        </div>

        {/* Player 2 (Lucas) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-yellow-400 font-extrabold flex items-center gap-1">🟡 Lucas (Hijo)</span>
            <span>{lucasPosition}/20 casillas</span>
          </div>
          <div className="h-2 w-full bg-slate-850 rounded-full overflow-hidden">
            <div className="h-full bg-yellow-500 rounded-full transition-all duration-300" style={{ width: `${(lucasPosition/20)*100}%` }}></div>
          </div>
        </div>

        {/* Player 3 (Sofía) */}
        <div className="space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-emerald-400 font-extrabold flex items-center gap-1">🟢 Sofía (Hija)</span>
            <span>{sofiaPosition}/20 casillas</span>
          </div>
          <div className="h-2 w-full bg-slate-850 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 rounded-full transition-all duration-300" style={{ width: `${(sofiaPosition/20)*100}%` }}></div>
          </div>
        </div>
      </div>

      {/* Control panel buttons */}
      <div className="text-center space-y-4">
        {winner ? (
          <div className="p-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-250 flex flex-col items-center">
            <h3 className="font-extrabold text-sm uppercase tracking-wide">🏆 ¡Victoria!</h3>
            <p className="text-xs text-slate-600 mt-1">El ganador de esta carrera ha sido: <strong className="text-emerald-950 font-black">{winner}</strong></p>
            <button
              onClick={handleReset}
              className="mt-3 py-1.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
            >
              Carrera Nueva
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            {/* Display Virtual Die */}
            <div className="h-14 w-14 bg-slate-50 border-2 border-slate-800 rounded-xl flex items-center justify-center text-xl font-bold font-mono shadow-md">
              {rolling ? (
                <span className="animate-spin block text-slate-400">🎲</span>
              ) : lastRoll ? (
                <span>{lastRoll}</span>
              ) : (
                <span className="text-xs font-sans text-slate-300 font-normal">Tirar</span>
              )}
            </div>

            <button
              onClick={rollDice}
              disabled={rolling || activeTurn !== 'me'}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-extrabold text-xs transition cursor-pointer disabled:opacity-50"
            >
              {rolling 
                ? 'Lanzando dado...' 
                : activeTurn === 'me' 
                ? 'LANZAR EL DADO 🎲' 
                : `Esperando Turno de ${activeTurn}...`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// SUB COMPONENT 4: FamilyTrivial
// ============================================
function FamilyTrivial() {
  const dataset = [
    {
      q: '¿A quién de la familia se le queman siempre las tostadas de desayuno?',
      opts: ['Papá Carlos', 'Mamá Elena', 'Los niños'],
      correct: 0,
    },
    {
      q: '¿Cuál es la excusa preferida de los niños para evitar limpiar?',
      opts: ['"Tengo muchos deberes"', '"Ya lo barrí ayer"', '"Le toca a Sofía"'],
      correct: 0,
    },
    {
      q: '¿Quién duerme la siesta más larga en el sofá los domingos?',
      opts: ['Papá', 'Mamá', 'El perro Toby de casa'],
      correct: 2,
    }
  ];

  const [index, setIndex] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [localScore, setLocalScore] = useState(0);

  const handleSelect = (optIdx: number) => {
    if (answered) return;
    setSelectedIdx(optIdx);
    setAnswered(true);

    if (optIdx === dataset[index].correct) {
      setLocalScore((p) => p + 10);
    }
  };

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % dataset.length);
    setSelectedIdx(null);
    setAnswered(false);
  };

  const qObj = dataset[index];

  return (
    <div className="max-w-md mx-auto space-y-5 text-xs font-semibold">
      <div className="flex justify-between items-center bg-emerald-50 p-3 rounded-xl border border-emerald-150">
        <h2 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 uppercase tracking-wider">
          <HelpCircle size={14} /> Trivial Doméstico
        </h2>
        <span className="font-bold text-slate-600">Puntaje hoy: <strong className="text-emerald-700 text-sm">{localScore}</strong></span>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-150 space-y-3 shadow-sm min-h-24 flex flex-col justify-center">
        <span className="text-[10px] text-slate-400 font-bold uppercase block tracking-wider">Pregunta {index + 1}:</span>
        <h3 className="font-extrabold text-xs text-slate-800 leading-normal">{qObj.q}</h3>
      </div>

      <div className="space-y-2">
        {qObj.opts.map((opt, i) => {
          const isCorrect = i === qObj.correct;
          const isChosen = selectedIdx === i;
          
          let btnClass = 'bg-white hover:bg-slate-50 border-slate-250 text-slate-750';
          if (answered) {
            if (isCorrect) btnClass = 'bg-emerald-600 text-white border-emerald-500';
            else if (isChosen) btnClass = 'bg-red-650 text-white border-red-500';
            else btnClass = 'bg-slate-100 text-slate-400 border-slate-200 opacity-60';
          }

          return (
            <button
              key={i}
              disabled={answered}
              onClick={() => handleSelect(i)}
              className={`w-full text-left p-3.5 rounded-xl border text-xs font-extrabold transition flex justify-between items-center cursor-pointer ${btnClass}`}
            >
              <span>{opt}</span>
              {answered && isCorrect && <Check size={14} className="text-white" />}
            </button>
          );
        })}
      </div>

      {answered && (
        <div className="flex gap-2 items-center justify-between bg-slate-50 p-3.5 rounded-xl border border-slate-150">
          <span className="text-[11px] leading-snug">
            {selectedIdx === qObj.correct 
              ? '🎉 ¡Correcto! Sabes de sobra cómo funciona el hogar.' 
              : '❌ ¡Incorrecto! En este hogar hay que fijarse más.'}
          </span>
          <button
            onClick={handleNext}
            className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-650 text-white rounded-lg hover:shadow font-black"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
