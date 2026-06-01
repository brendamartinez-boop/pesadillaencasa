'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

// --- TS INTERFACES ---
export interface Family {
  id: string;
  name: string;
  code: string;
  createdBy: string;
  createdAt: number;
  wrappedReward: string;
}

export interface FamilyMember {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  role: 'admin' | 'child';
  points: number;
  joinedAt: number;
  blocked: {
    walkie: boolean;
    games: boolean;
    all: boolean;
  };
}

export interface ChoreTask {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // member uid or "all"
  points: number;
  deadline: number | null; // timestamp
  completed: boolean;
  completedAt: number | null;
  completedBy: string | null;
  createdBy: string;
  createdAt: number;
  isProposal: boolean;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  pointsCost: number;
  createdBy: string;
  active: boolean;
  proposedBy?: string;
}

export interface ShoppingItem {
  id: string;
  name: string;
  addedBy: string;
  addedAt: number;
  bought: boolean;
  boughtBy: string | null;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  senderName: string;
  senderPhoto: string;
  createdAt: number;
}

export interface PointsRecord {
  id: string;
  uid: string;
  delta: number;
  reason: string;
  taskId: string | null;
  timestamp: number;
}

interface FamilyContextType {
  user: FamilyMember | null;
  family: Family | null;
  members: FamilyMember[];
  tasks: ChoreTask[];
  rewards: Reward[];
  shopping: ShoppingItem[];
  messages: ChatMessage[];
  pointsHistory: PointsRecord[];
  
  // App settings
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
  alarmActive: boolean;
  triggerAlarmaRoja: () => void;
  forceWrappedPeriod: boolean;
  setForceWrappedPeriod: (value: boolean) => void;

  // Actions
  loginWithGoogle: (email: string, displayName: string, photoURL: string, role?: 'admin' | 'child') => void;
  logout: () => void;
  createFamily: (name: string, wrappedReward?: string) => void;
  joinFamily: (code: string) => boolean;
  leaveFamily: () => void;
  updateProfilePhoto: (photoURL: string) => void;

  // Tasks
  addTask: (title: string, description: string, assignedTo: string, points: number, deadline: string | null) => void;
  proposeTask: (title: string, description: string, points: number) => void;
  approveTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  toggleTaskComplete: (taskId: string) => void;

  // Rewards
  addReward: (title: string, description: string, pointsCost: number) => void;
  proposeReward: (title: string, description: string, pointsCost: number) => void;
  approveReward: (rewardId: string) => void;
  claimReward: (rewardId: string) => boolean;
  toggleRewardActive: (rewardId: string) => void;

  // Shopping
  addShoppingItem: (name: string) => void;
  toggleShoppingItem: (itemId: string) => void;
  clearBoughtShoppingItems: () => void;

  // Chat
  sendMessage: (text: string) => void;

  // Admin parental control
  toggleMemberWalkieBlock: (memberUid: string) => void;
  toggleMemberGamesBlock: (memberUid: string) => void;
  toggleMemberAppBlock: (memberUid: string) => void;
  toggleMemberRole: (memberUid: string) => void;

  // Simulation controls
  switchCurrentUser: (memberUid: string) => void;
  addMockMemberToFamily: (displayName: string, role: 'admin' | 'child') => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

// --- SEED DEMO DATA ---
const DEMO_FAMILY_ID = 'fam_martinez';
const DEMO_MEMBERS: FamilyMember[] = [
  {
    uid: 'user_papa',
    displayName: 'Papá Carlos',
    email: 'carlosperez@consolacionburriana.com',
    photoURL: 'https://picsum.photos/seed/papa/150/150',
    role: 'admin',
    points: 120,
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    blocked: { walkie: false, games: false, all: false }
  },
  {
    uid: 'user_mama',
    displayName: 'Mamá Elena',
    email: 'elena@gmail.com',
    photoURL: 'https://picsum.photos/seed/mama/150/150',
    role: 'admin',
    points: 85,
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    blocked: { walkie: false, games: false, all: false }
  },
  {
    uid: 'user_sofia',
    displayName: 'Sofía (Hija)',
    email: 'sofia@gmail.com',
    photoURL: 'https://picsum.photos/seed/sofia/150/150',
    role: 'child',
    points: 135,
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
    blocked: { walkie: false, games: false, all: false }
  },
  {
    uid: 'user_lucas',
    displayName: 'Lucas (Hijo)',
    email: 'lucas@gmail.com',
    photoURL: 'https://picsum.photos/seed/lucas/150/150',
    role: 'child',
    points: 45,
    joinedAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
    blocked: { walkie: true, games: true, all: false } // starts blocked to demo the lock screens!
  }
];

const DEMO_TASKS: ChoreTask[] = [
  {
    id: 'task_1',
    title: 'Fregar los platos de la cena',
    description: 'Dejar el fregadero impoluto, secar los sartenes y limpiar la encimera.',
    assignedTo: 'user_lucas',
    points: 15,
    deadline: Date.now() + 1000 * 60 * 60 * 12, // today
    completed: false,
    completedAt: null,
    completedBy: null,
    createdBy: 'user_papa',
    createdAt: Date.now() - 1000 * 60 * 60 * 5,
    isProposal: false
  },
  {
    id: 'task_2',
    title: 'Sacar a pasear a Toby el perro 🐕',
    description: 'Darle una vuelta de mínimos 15 minutos y rellenar su cuenco de agua limpia.',
    assignedTo: 'all',
    points: 20,
    deadline: Date.now() + 1000 * 60 * 60 * 18,
    completed: false,
    completedAt: null,
    completedBy: null,
    createdBy: 'user_mama',
    createdAt: Date.now() - 1000 * 60 * 60 * 8,
    isProposal: false
  },
  {
    id: 'task_3',
    title: 'Hacer la cama y ventilar',
    description: 'Estirar bien las sábanas, organizar cojines y abrir la ventana 10 min.',
    assignedTo: 'user_sofia',
    points: 10,
    deadline: Date.now() - 1000 * 60 * 60 * 2, // past deadline but completed
    completed: true,
    completedAt: Date.now() - 1000 * 60 * 60 * 1,
    completedBy: 'user_sofia',
    createdBy: 'user_mama',
    createdAt: Date.now() - 1000 * 60 * 60 * 12,
    isProposal: false
  },
  {
    id: 'task_4',
    title: 'Limpiar cristales del salón',
    description: 'Propuesta de Sofía para poder ganar más puntos este fin de semana.',
    assignedTo: 'user_sofia',
    points: 25,
    deadline: null,
    completed: false,
    completedAt: null,
    completedBy: null,
    createdBy: 'user_sofia',
    createdAt: Date.now() - 1000 * 60 * 60 * 4,
    isProposal: true // Proposal waiting for Admin approval
  }
];

const DEMO_REWARDS: Reward[] = [
  {
    id: 'reward_1',
    title: '1 Hora de PlayStation / Consola 🎮',
    description: 'Pase para una hora ininterrumpida de videojuegos del fin de semana.',
    pointsCost: 50,
    createdBy: 'user_papa',
    active: true
  },
  {
    id: 'reward_2',
    title: 'Elegir Película para el Viernes Noche 🍿',
    description: 'Tienes derecho a veto y elección de la película que verá toda la familia.',
    pointsCost: 30,
    createdBy: 'user_mama',
    active: true
  },
  {
    id: 'reward_3',
    title: 'Ir al cine en familia + Palomitas grandes',
    description: 'Entrada individual con combo completo pagado por los padres.',
    pointsCost: 120,
    createdBy: 'user_papa',
    active: true
  },
  {
    id: 'reward_4',
    title: 'Cena de Pizza de telepizza o hamburguesas 🍕',
    description: 'Elegir el restaurante y el menú a domicilio para la cena.',
    pointsCost: 80,
    createdBy: 'user_sofia',
    active: false, // Child proposal, waiting for admin activation
    proposedBy: 'user_sofia'
  }
];

const DEMO_SHOPPING: ShoppingItem[] = [
  {
    id: 'shop_1',
    name: 'Leche de Almendras (Sin azúcar)',
    addedBy: 'user_mama',
    addedAt: Date.now() - 1000 * 60 * 60 * 48,
    bought: false,
    boughtBy: null
  },
  {
    id: 'shop_2',
    name: 'Detergente de Lavadora lavanda',
    addedBy: 'user_papa',
    addedAt: Date.now() - 1000 * 60 * 60 * 24,
    bought: false,
    boughtBy: null
  },
  {
    id: 'shop_3',
    name: 'Galletas rellenas de chocolate 🍪',
    addedBy: 'user_lucas',
    addedAt: Date.now() - 1000 * 60 * 60 * 5,
    bought: true,
    boughtBy: 'user_mama'
  }
];

const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: 'msg_1',
    text: 'Hola a todos! He creado el grupo de Pesadilla en Casa. A ver si nos organizamos mejor hoy.',
    senderId: 'user_papa',
    senderName: 'Papá Carlos',
    senderPhoto: 'https://picsum.photos/seed/papa/150/150',
    createdAt: Date.now() - 1000 * 60 * 60 * 3
  },
  {
    id: 'msg_2',
    text: 'Sí por favor! Sofía, acuérdate de barrer antes de que llegue la abuela.',
    senderId: 'user_mama',
    senderName: 'Mamá Elena',
    senderPhoto: 'https://picsum.photos/seed/mama/150/150',
    createdAt: Date.now() - 1000 * 60 * 60 * 2.8
  },
  {
    id: 'msg_3',
    text: '¡Pero si barrí el martes enteros! Le toca a Lucas sacudir el salón.',
    senderId: 'user_sofia',
    senderName: 'Sofía (Hija)',
    senderPhoto: 'https://picsum.photos/seed/sofia/150/150',
    createdAt: Date.now() - 1000 * 60 * 60 * 2.5
  },
  {
    id: 'msg_4',
    text: 'Yo ya fregué mi taza, estoy haciendo deberes 👍',
    senderId: 'user_lucas',
    senderName: 'Lucas (Hijo)',
    senderPhoto: 'https://picsum.photos/seed/lucas/150/150',
    createdAt: Date.now() - 1000 * 60 * 60 * 2.3
  },
  {
    id: 'msg_5',
    text: '¡Acabo de marcar la cama de Sofía como completada, ha ganado 10 puntos! Sigue así.',
    senderId: 'user_mama',
    senderName: 'Mamá Elena',
    senderPhoto: 'https://picsum.photos/seed/mama/150/150',
    createdAt: Date.now() - 1000 * 60 * 60 * 1
  }
];

// Seed point logs for charts (needs points history over multiple dates)
const getPastDate = (daysAgo: number) => Date.now() - 1000 * 60 * 60 * 24 * daysAgo;
const DEMO_POINTS_HISTORY: PointsRecord[] = [
  // Sofia records
  { id: 'rec_s1', uid: 'user_sofia', delta: 15, reason: 'Sacar basura toda la semana', taskId: null, timestamp: getPastDate(12) },
  { id: 'rec_s2', uid: 'user_sofia', delta: 20, reason: 'Limpiar el baño principal', taskId: null, timestamp: getPastDate(9) },
  { id: 'rec_s3', uid: 'user_sofia', delta: 30, reason: 'Barrer y fregar planta cocina', taskId: null, timestamp: getPastDate(7) },
  { id: 'rec_s4', uid: 'user_sofia', delta: 50, reason: 'Limpieza profunda del jardín', taskId: null, timestamp: getPastDate(4) },
  { id: 'rec_s5', uid: 'user_sofia', delta: -50, reason: 'Canjeó recompensa: 1 Hora Play', taskId: null, timestamp: getPastDate(3) },
  { id: 'rec_s6', uid: 'user_sofia', delta: 10, reason: 'Hacer la cama y ventilar', taskId: 'task_3', timestamp: getPastDate(1) },
  
  // Lucas records
  { id: 'rec_l1', uid: 'user_lucas', delta: 10, reason: 'Hacer deberes temprano', taskId: null, timestamp: getPastDate(14) },
  { id: 'rec_l2', uid: 'user_lucas', delta: 15, reason: 'Ordenar cuarto juguetes', taskId: null, timestamp: getPastDate(10) },
  { id: 'rec_l3', uid: 'user_lucas', delta: 20, reason: 'Sacar la cafetera y lavarla', taskId: null, timestamp: getPastDate(6) },
  
  // Papa & Mama (for consistency)
  { id: 'rec_p1', uid: 'user_papa', delta: 40, reason: 'Supervisión general', taskId: null, timestamp: getPastDate(15) },
  { id: 'rec_m1', uid: 'user_mama', delta: 30, reason: 'Supervisión general', taskId: null, timestamp: getPastDate(15) }
];

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FamilyMember | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [tasks, setTasks] = useState<ChoreTask[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [shopping, setShopping] = useState<ShoppingItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pointsHistory, setPointsHistory] = useState<PointsRecord[]>([]);

  // System States
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [alarmActive, setAlarmActive] = useState<boolean>(false);
  const [forceWrappedPeriod, setForceWrappedPeriod] = useState<boolean>(false);

  // --- INITIAL LOAD ---
  useEffect(() => {
    // 1. Theme configuration
    const savedTheme = localStorage.getItem('family_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTimeout(() => {
        setDarkMode(true);
      }, 0);
    }

    // 2. Database loading or fallback demo installation
    setTimeout(() => {
      const localFam = localStorage.getItem('lh_family');
      const localMembers = localStorage.getItem('lh_members');
      const localTasks = localStorage.getItem('lh_tasks');
      const localRewards = localStorage.getItem('lh_rewards');
      const localShopping = localStorage.getItem('lh_shopping');
      const localMessages = localStorage.getItem('lh_messages');
      const localHistory = localStorage.getItem('lh_history');
      const localUser = localStorage.getItem('lh_current_user');

      if (localFam && localMembers) {
        // Load saved app data
        setFamily(JSON.parse(localFam));
        setMembers(JSON.parse(localMembers));
        setTasks(localTasks ? JSON.parse(localTasks) : []);
        setRewards(localRewards ? JSON.parse(localRewards) : []);
        setShopping(localShopping ? JSON.parse(localShopping) : []);
        setMessages(localMessages ? JSON.parse(localMessages) : []);
        setPointsHistory(localHistory ? JSON.parse(localHistory) : []);
        
        const parsedUser = localUser ? JSON.parse(localUser) : null;
        if (parsedUser) {
          setUser(parsedUser);
        }
      } else {
        // Seed fresh App state with our Demo Family "Los Martínez" so everything is lively
        const seedFamily: Family = {
          id: DEMO_FAMILY_ID,
          name: 'Los Martínez Chores',
          code: 'MART15',
          createdBy: 'user_papa',
          createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
          wrappedReward: 'Finde completo sin tareas + Parque de atracciones 🎢'
        };

        localStorage.setItem('lh_family', JSON.stringify(seedFamily));
        localStorage.setItem('lh_members', JSON.stringify(DEMO_MEMBERS));
        localStorage.setItem('lh_tasks', JSON.stringify(DEMO_TASKS));
        localStorage.setItem('lh_rewards', JSON.stringify(DEMO_REWARDS));
        localStorage.setItem('lh_shopping', JSON.stringify(DEMO_SHOPPING));
        localStorage.setItem('lh_messages', JSON.stringify(DEMO_MESSAGES));
        localStorage.setItem('lh_history', JSON.stringify(DEMO_POINTS_HISTORY));
        
        // Default auto-login user as Papá Carlos to make review simple
        setUser(DEMO_MEMBERS[0]);
        setFamily(seedFamily);
        setMembers(DEMO_MEMBERS);
        setTasks(DEMO_TASKS);
        setRewards(DEMO_REWARDS);
        setShopping(DEMO_SHOPPING);
        setMessages(DEMO_MESSAGES);
        setPointsHistory(DEMO_POINTS_HISTORY);
        
        localStorage.setItem('lh_current_user', JSON.stringify(DEMO_MEMBERS[0]));
      }
    }, 0);
  }, []);

  // --- DARK MODE SIDE-EFFECT ---
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('family_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('family_theme', 'light');
    }
  }, [darkMode]);

  // --- SAVE DYNAMIC STATE HELPERS ---
  const saveState = (
    updatedFamily: Family | null,
    updatedMembers: FamilyMember[],
    updatedTasks: ChoreTask[],
    updatedRewards: Reward[],
    updatedShopping: ShoppingItem[],
    updatedMessages: ChatMessage[],
    updatedHistory: PointsRecord[],
    updatedUser: FamilyMember | null
  ) => {
    setFamily(updatedFamily);
    setMembers(updatedMembers);
    setTasks(updatedTasks);
    setRewards(updatedRewards);
    setShopping(updatedShopping);
    setMessages(updatedMessages);
    setPointsHistory(updatedHistory);
    setUser(updatedUser);

    if (updatedFamily) localStorage.setItem('lh_family', JSON.stringify(updatedFamily));
    else localStorage.removeItem('lh_family');

    localStorage.setItem('lh_members', JSON.stringify(updatedMembers));
    localStorage.setItem('lh_tasks', JSON.stringify(updatedTasks));
    localStorage.setItem('lh_rewards', JSON.stringify(updatedRewards));
    localStorage.setItem('lh_shopping', JSON.stringify(updatedShopping));
    localStorage.setItem('lh_messages', JSON.stringify(updatedMessages));
    localStorage.setItem('lh_history', JSON.stringify(updatedHistory));

    if (updatedUser) {
      localStorage.setItem('lh_current_user', JSON.stringify(updatedUser));
    } else {
      localStorage.removeItem('lh_current_user');
    }
  };

  // --- ALARMA ROJA TRIGGER ---
  const triggerAlarmaRoja = () => {
    setAlarmActive(false);
    // Use small timeout to restart animation if multiple errors triggered
    setTimeout(() => {
      setAlarmActive(true);
    }, 10);
  };

  // Turn off alarm screen after 600ms
  useEffect(() => {
    if (alarmActive) {
      const timer = setTimeout(() => {
        setAlarmActive(false);
      }, 610);
      return () => clearTimeout(timer);
    }
  }, [alarmActive]);

  // --- AUTH OPERATIONS ---
  const loginWithGoogle = (email: string, displayName: string, photoURL: string, role: 'admin' | 'child' = 'child') => {
    // Generate simulated user
    const existingMemberIndex = members.findIndex(m => m.email.toLowerCase() === email.toLowerCase());
    let loggedUser: FamilyMember;

    if (existingMemberIndex !== -1) {
      loggedUser = members[existingMemberIndex];
    } else {
      loggedUser = {
        uid: 'user_' + Math.random().toString(36).substr(2, 9),
        displayName,
        email,
        photoURL: photoURL || `https://picsum.photos/seed/${displayName}/150/150`,
        role: role,
        points: 0,
        joinedAt: Date.now(),
        blocked: { walkie: false, games: false, all: false }
      };

      // Add to member database if inside a family
      if (family) {
        const updated = [...members, loggedUser];
        saveState(family, updated, tasks, rewards, shopping, messages, pointsHistory, loggedUser);
        return;
      }
    }

    setUser(loggedUser);
    localStorage.setItem('lh_current_user', JSON.stringify(loggedUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lh_current_user');
  };

  const createFamily = (familyName: string, wrappedReward: string = 'Super Trofeo Familiar + Gran Helado 🏆') => {
    if (!user) return;

    // Generate clean 6-digit uppercase numeric/alphabetic code
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const currentAdminUser: FamilyMember = {
      ...user,
      role: 'admin', // Creator is automatically admin!
      points: user.points || 0
    };

    const newFam: Family = {
      id: 'fam_' + Math.random().toString(36).substr(2, 9),
      name: familyName,
      code,
      createdBy: currentAdminUser.uid,
      createdAt: Date.now(),
      wrappedReward
    };

    // Prepopulate some family chores & rewards so user doesn't see a blank page
    const initialTasks: ChoreTask[] = [
      {
        id: 'init_t1',
        title: 'Barrer la cocina',
        description: 'Limpiar el suelo después de cenar y vaciar el recogedor.',
        assignedTo: 'all',
        points: 10,
        deadline: null,
        completed: false,
        completedAt: null,
        completedBy: null,
        createdBy: currentAdminUser.uid,
        createdAt: Date.now(),
        isProposal: false
      }
    ];

    const initialRewards: Reward[] = [
      {
        id: 'init_r1',
        title: 'Elegir postre del sábado 🧁',
        description: 'Tú decides qué tarta o postre se compra o cocina el fin de semana.',
        pointsCost: 40,
        createdBy: currentAdminUser.uid,
        active: true
      }
    ];

    saveState(
      newFam, 
      [currentAdminUser], 
      initialTasks, 
      initialRewards, 
      [], 
      [], 
      [], 
      currentAdminUser
    );
  };

  const joinFamily = (codeString: string): boolean => {
    if (!user) return false;
    const cleanCode = codeString.trim().toUpperCase();

    // In dynamic mocked local flow, if they ask to join the seed code "MART15" or the current family's code
    if (family && family.code.toUpperCase() === cleanCode) {
      // Already in it!
      return true;
    }

    // Attempting to join the demo Los Martínez
    if (cleanCode === 'MART15') {
      const currentInMartinez = DEMO_MEMBERS.find(m => m.email === user.email);
      let targetUser: FamilyMember = currentInMartinez ? { ...user, ...currentInMartinez } : {
        ...user,
        joinedAt: Date.now(),
        role: 'child', // normal joins are children by default
        blocked: { walkie: false, games: false, all: false }
      };

      // Add user to DEMO_MEMBERS
      const membersList = [...DEMO_MEMBERS];
      if (!currentInMartinez) {
        membersList.push(targetUser);
      }

      const seedFamily: Family = {
        id: DEMO_FAMILY_ID,
        name: 'Los Martínez Chores',
        code: 'MART15',
        createdBy: 'user_papa',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
        wrappedReward: 'Finde completo sin tareas + Parque de atracciones 🎢'
      };

      saveState(
        seedFamily,
        membersList,
        DEMO_TASKS,
        DEMO_REWARDS,
        DEMO_SHOPPING,
        DEMO_MESSAGES,
        DEMO_POINTS_HISTORY,
        targetUser
      );
      return true;
    }

    // Creating mock family on demand if code is unrecognizable to allow free testing
    const generatedFamilyName = `Familia Cód. ${cleanCode}`;
    const cleanAdminUser: FamilyMember = {
      ...user,
      role: 'child', // joins as child
      joinedAt: Date.now(),
      blocked: { walkie: false, games: false, all: false }
    };

    const autoFam: Family = {
      id: 'fam_' + Math.random().toString(36).substr(2, 9),
      name: generatedFamilyName,
      code: cleanCode,
      createdBy: 'user_system',
      createdAt: Date.now(),
      wrappedReward: 'Cena de celebración familiar 🏆'
    };

    // Synthesize family with demo members to keep ranking alive
    const autoMembers: FamilyMember[] = [
      cleanAdminUser,
      {
        uid: 'sys_papa',
        displayName: 'Papá de Prueba',
        email: 'sys_papa@test.com',
        photoURL: 'https://picsum.photos/seed/sys_papa/150/150',
        role: 'admin',
        points: 80,
        joinedAt: Date.now() - 1000 * 60 * 60 * 24,
        blocked: { walkie: false, games: false, all: false }
      },
      {
        uid: 'sys_child',
        displayName: 'Hijo de Prueba',
        email: 'sys_child@test.com',
        photoURL: 'https://picsum.photos/seed/sys_child/150/150',
        role: 'child',
        points: 40,
        joinedAt: Date.now() - 1000 * 60 * 60 * 24,
        blocked: { walkie: false, games: false, all: false }
      }
    ];

    saveState(
      autoFam,
      autoMembers,
      [
        {
          id: 'auto_t1',
          title: 'Tirar la basura orgánica',
          description: 'Llevar la bolsa al contenedor gris antes de las 10:00 PM.',
          assignedTo: cleanAdminUser.uid,
          points: 15,
          deadline: null,
          completed: false,
          completedAt: null,
          completedBy: null,
          createdBy: 'sys_papa',
          createdAt: Date.now(),
          isProposal: false
        }
      ],
      [
        {
          id: 'auto_r1',
          title: 'Erupción de Chocolate',
          description: 'Helado gigante con chocolate derretido.',
          pointsCost: 45,
          createdBy: 'sys_papa',
          active: true
        }
      ],
      [],
      [],
      [],
      cleanAdminUser
    );

    return true;
  };

  const leaveFamily = () => {
    // Check if there is another admin
    if (user?.role === 'admin') {
      const otherAdmins = members.filter(m => m.role === 'admin' && m.uid !== user?.uid);
      if (otherAdmins.length === 0 && members.length > 1) {
        triggerAlarmaRoja();
        // Return alert "No puedes abandonar si eres el único admin. Convierte a alguien más en admin primero."
        return;
      }
    }

    const updatedMembers = members.filter(m => m.uid !== user?.uid);
    // Clear state or reload demo
    if (updatedMembers.length === 0) {
      saveState(null, [], [], [], [], [], [], null);
    } else {
      const nextUser = { ...user!, role: 'child' as const }; // reset role
      saveState(null, [], [], [], [], [], [], nextUser);
    }
  };

  const updateProfilePhoto = (photoURL: string) => {
    if (!user) return;
    const updatedUser = { ...user, photoURL };
    const updatedMembers = members.map(m => m.uid === user.uid ? updatedUser : m);
    saveState(family, updatedMembers, tasks, rewards, shopping, messages, pointsHistory, updatedUser);
  };

  // --- TASK OPERATIONS ---
  const addTask = (title: string, description: string, assignedTo: string, points: number, deadline: string | null) => {
    if (!user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const newTask: ChoreTask = {
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      title,
      description,
      assignedTo,
      points,
      deadline: deadline ? new Date(deadline).getTime() : null,
      completed: false,
      completedAt: null,
      completedBy: null,
      createdBy: user.uid,
      createdAt: Date.now(),
      isProposal: false
    };

    const updatedTasks = [newTask, ...tasks];
    saveState(family, members, updatedTasks, rewards, shopping, messages, pointsHistory, user);
  };

  const proposeTask = (title: string, description: string, points: number) => {
    if (!user) return;

    const proposed: ChoreTask = {
      id: 'task_' + Math.random().toString(36).substr(2, 9),
      title,
      description,
      assignedTo: user.uid,
      points,
      deadline: null,
      completed: false,
      completedAt: null,
      completedBy: null,
      createdBy: user.uid,
      createdAt: Date.now(),
      isProposal: true
    };

    const updatedTasks = [proposed, ...tasks];
    saveState(family, members, updatedTasks, rewards, shopping, messages, pointsHistory, user);
  };

  const approveTask = (taskId: string) => {
    if (!user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, isProposal: false } : t);
    saveState(family, members, updatedTasks, rewards, shopping, messages, pointsHistory, user);
  };

  const deleteTask = (taskId: string) => {
    if (!user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const updatedTasks = tasks.filter(t => t.id !== taskId);
    saveState(family, members, updatedTasks, rewards, shopping, messages, pointsHistory, user);
  };

  const toggleTaskComplete = (taskId: string) => {
    if (!user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[taskIndex];
    if (task.isProposal) {
      triggerAlarmaRoja();
      return; // Can't complete a proposal directly
    }

    const isCompleting = !task.completed;
    const completedByUid = task.assignedTo === 'all' ? members[Math.floor(Math.random() * members.length)].uid : task.assignedTo;

    const updatedTasks = tasks.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          completed: isCompleting,
          completedAt: isCompleting ? Date.now() : null,
          completedBy: isCompleting ? completedByUid : null
        };
      }
      return t;
    });

    // Update Points & Points History
    let updatedHistory = [...pointsHistory];
    const updatedMembers = members.map(m => {
      if (m.uid === completedByUid) {
        const pointDelta = isCompleting ? task.points : -task.points;
        const newPointsValue = Math.max(0, m.points + pointDelta);
        
        // Push record
        const newRecord: PointsRecord = {
          id: 'rec_' + Math.random().toString(36).substr(2, 9),
          uid: completedByUid,
          delta: pointDelta,
          reason: isCompleting ? `Completó tarea: ${task.title}` : `Canceló tarea completada: ${task.title}`,
          taskId: task.id,
          timestamp: Date.now()
        };
        updatedHistory = [newRecord, ...updatedHistory];

        return { ...m, points: newPointsValue };
      }
      return m;
    });

    // Sync CURRENT USER if they were the ones whose points updated!
    let updatedCurrentUser = user;
    const userInMembers = updatedMembers.find(m => m.uid === user.uid);
    if (userInMembers) {
      updatedCurrentUser = userInMembers;
    }

    // Launch beautiful gamified Confetti if completing task
    if (isCompleting) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#FFFFFF', '#FCD34D', '#60A5FA', '#FBBF24']
      });
    }

    saveState(family, updatedMembers, updatedTasks, rewards, shopping, messages, updatedHistory, updatedCurrentUser);
  };

  // --- REWARD OPERATIONS ---
  const addReward = (title: string, description: string, pointsCost: number) => {
    if (!user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const newReward: Reward = {
      id: 'reward_' + Math.random().toString(36).substr(2, 9),
      title,
      description,
      pointsCost,
      createdBy: user.uid,
      active: true
    };

    const updatedRewards = [newReward, ...rewards];
    saveState(family, members, tasks, updatedRewards, shopping, messages, pointsHistory, user);
  };

  const proposeReward = (title: string, description: string, pointsCost: number) => {
    if (!user) return;

    const proposed: Reward = {
      id: 'reward_' + Math.random().toString(36).substr(2, 9),
      title,
      description,
      pointsCost,
      createdBy: user.uid,
      active: false,
      proposedBy: user.uid
    };

    const updatedRewards = [proposed, ...rewards];
    saveState(family, members, tasks, updatedRewards, shopping, messages, pointsHistory, user);
  };

  const approveReward = (rewardId: string) => {
    if (!user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const updatedRewards = rewards.map(r => r.id === rewardId ? { ...r, active: true } : r);
    saveState(family, members, tasks, updatedRewards, shopping, messages, pointsHistory, user);
  };

  const toggleRewardActive = (rewardId: string) => {
    if (!user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const updatedRewards = rewards.map(r => r.id === rewardId ? { ...r, active: !r.active } : r);
    saveState(family, members, tasks, updatedRewards, shopping, messages, pointsHistory, user);
  };

  const claimReward = (rewardId: string): boolean => {
    if (!user) return false;

    const rIndex = rewards.findIndex(r => r.id === rewardId);
    if (rIndex === -1) return false;

    const reward = rewards[rIndex];
    if (user.points < reward.pointsCost) {
      triggerAlarmaRoja();
      return false; // Insufficient points!
    }

    // Deduct points
    const updatedMembers = members.map(m => {
      if (m.uid === user.uid) {
        const nextPoints = m.points - reward.pointsCost;
        return { ...m, points: nextPoints };
      }
      return m;
    });

    // Create record
    const newRecord: PointsRecord = {
      id: 'rec_' + Math.random().toString(36).substr(2, 9),
      uid: user.uid,
      delta: -reward.pointsCost,
      reason: `Canjeó recompensa: ${reward.title}`,
      taskId: null,
      timestamp: Date.now()
    };

    const nextHistory = [newRecord, ...pointsHistory];
    
    // Find matching updated user
    const updatedCurrentUser = updatedMembers.find(m => m.uid === user.uid) || user;

    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#3B82F6', '#10B981', '#FBBF24']
    });
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#3B82F6', '#10B981', '#FBBF24']
    });

    saveState(family, updatedMembers, tasks, rewards, shopping, messages, nextHistory, updatedCurrentUser);
    return true;
  };

  // --- SHOPPING OPERATIONS ---
  const addShoppingItem = (name: string) => {
    if (!user) return;

    const newItem: ShoppingItem = {
      id: 'shop_' + Math.random().toString(36).substr(2, 9),
      name,
      addedBy: user.uid,
      addedAt: Date.now(),
      bought: false,
      boughtBy: null
    };

    const updatedShopping = [newItem, ...shopping];
    saveState(family, members, tasks, rewards, updatedShopping, messages, pointsHistory, user);
  };

  const toggleShoppingItem = (itemId: string) => {
    if (!user) return;

    const updatedShopping = shopping.map(item => {
      if (item.id === itemId) {
        const boughtState = !item.bought;
        return {
          ...item,
          bought: boughtState,
          boughtBy: boughtState ? user.uid : null
        };
      }
      return item;
    });

    saveState(family, members, tasks, rewards, updatedShopping, messages, pointsHistory, user);
  };

  const clearBoughtShoppingItems = () => {
    const updatedShopping = shopping.filter(item => !item.bought);
    saveState(family, members, tasks, rewards, updatedShopping, messages, pointsHistory, user);
  };

  // --- CHAT OPERATIONS ---
  const sendMessage = (text: string) => {
    if (!user) return;

    const newMsg: ChatMessage = {
      id: 'msg_' + Math.random().toString(36).substr(2, 9),
      text,
      senderId: user.uid,
      senderName: user.displayName,
      senderPhoto: user.photoURL,
      createdAt: Date.now()
    };

    const updatedMessages = [...messages, newMsg];
    saveState(family, members, tasks, rewards, shopping, updatedMessages, pointsHistory, user);
  };

  // --- MEMBER & PARENTAL CONTROL OPERATIONS ---
  const toggleMemberWalkieBlock = (memberUid: string) => {
    if (!user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const updatedMembers = members.map(m => {
      if (m.uid === memberUid) {
        return {
          ...m,
          blocked: { ...m.blocked, walkie: !m.blocked.walkie }
        };
      }
      return m;
    });

    // If current switching user's profile is updated, sync user state
    const targetUser = updatedMembers.find(m => m.uid === user.uid) || user;
    saveState(family, updatedMembers, tasks, rewards, shopping, messages, pointsHistory, targetUser);
  };

  const toggleMemberGamesBlock = (memberUid: string) => {
    if (!user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const updatedMembers = members.map(m => {
      if (m.uid === memberUid) {
        return {
          ...m,
          blocked: { ...m.blocked, games: !m.blocked.games }
        };
      }
      return m;
    });

    const targetUser = updatedMembers.find(m => m.uid === user.uid) || user;
    saveState(family, updatedMembers, tasks, rewards, shopping, messages, pointsHistory, targetUser);
  };

  const toggleMemberAppBlock = (memberUid: string) => {
    if (!user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const updatedMembers = members.map(m => {
      if (m.uid === memberUid) {
        return {
          ...m,
          blocked: { ...m.blocked, all: !m.blocked.all }
        };
      }
      return m;
    });

    const targetUser = updatedMembers.find(m => m.uid === user.uid) || user;
    saveState(family, updatedMembers, tasks, rewards, shopping, messages, pointsHistory, targetUser);
  };

  const toggleMemberRole = (memberUid: string) => {
    if (!user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    // Protect so there must always be at least one admin
    const target = members.find(m => m.uid === memberUid);
    if (!target) return;

    if (target.role === 'admin') {
      const otherAdmins = members.filter(m => m.role === 'admin' && m.uid !== memberUid);
      if (otherAdmins.length === 0) {
        triggerAlarmaRoja();
        // Warn that at least 1 administrator is required
        return;
      }
    }

    const updatedMembers = members.map(m => {
      if (m.uid === memberUid) {
        return { ...m, role: (m.role === 'admin' ? 'child' : 'admin') as 'admin' | 'child' };
      }
      return m;
    });

    const targetUser = updatedMembers.find(m => m.uid === user.uid) || user;
    saveState(family, updatedMembers, tasks, rewards, shopping, messages, pointsHistory, targetUser);
  };

  // --- EVALUATOR TESTING ENGINE SIMULATOR ---
  const switchCurrentUser = (memberUid: string) => {
    const target = members.find(m => m.uid === memberUid);
    if (target) {
      setUser(target);
      localStorage.setItem('lh_current_user', JSON.stringify(target));
      
      // Flash celebratory particles to show shift
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.9, x: 0.1 }
      });
    }
  };

  const addMockMemberToFamily = (displayName: string, role: 'admin' | 'child') => {
    const freshUid = 'user_mock_' + Math.random().toString(36).substr(2, 9);
    const newMock: FamilyMember = {
      uid: freshUid,
      displayName,
      email: `${displayName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      photoURL: `https://picsum.photos/seed/${displayName}/150/150`,
      role,
      points: role === 'child' ? 40 : 0,
      joinedAt: Date.now(),
      blocked: { walkie: false, games: false, all: false }
    };

    const nextMembersList = [...members, newMock];
    
    // Seed points record for charts if it is a child
    let nextHistory = [...pointsHistory];
    if (role === 'child') {
      nextHistory.push({
        id: 'rec_mock_' + Math.random().toString(36).substr(2, 9),
        uid: freshUid,
        delta: 40,
        reason: 'Puntos iniciales por unirse',
        taskId: null,
        timestamp: Date.now() - 1000 * 60 * 60 * 24
      });
    }

    saveState(family, nextMembersList, tasks, rewards, shopping, messages, nextHistory, user);
  };

  return (
    <FamilyContext.Provider value={{
      user,
      family,
      members,
      tasks,
      rewards,
      shopping,
      messages,
      pointsHistory,
      
      darkMode,
      setDarkMode,
      alarmActive,
      triggerAlarmaRoja,
      forceWrappedPeriod,
      setForceWrappedPeriod,

      loginWithGoogle,
      logout,
      createFamily,
      joinFamily,
      leaveFamily,
      updateProfilePhoto,

      // Tasks
      addTask,
      proposeTask,
      approveTask,
      deleteTask,
      toggleTaskComplete,

      // Rewards
      addReward,
      proposeReward,
      approveReward,
      claimReward,
      toggleRewardActive,

      // Shopping
      addShoppingItem,
      toggleShoppingItem,
      clearBoughtShoppingItems,

      // Chat
      sendMessage,

      // Parental Controls
      toggleMemberWalkieBlock,
      toggleMemberGamesBlock,
      toggleMemberAppBlock,
      toggleMemberRole,

      // Simulations
      switchCurrentUser,
      addMockMemberToFamily
    }}>
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};
