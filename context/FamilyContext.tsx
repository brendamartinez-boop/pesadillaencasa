'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  onAuthStateChanged, 
  signInAnonymously,
  signInWithPopup, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { db, auth, googleProvider, OperationType, handleFirestoreError } from '@/lib/firebase';

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
  loginWithGoogle: (email?: string, displayName?: string, photoURL?: string, role?: 'admin' | 'child') => Promise<void>;
  logout: () => Promise<void>;
  createFamily: (name: string, wrappedReward?: string) => Promise<void>;
  joinFamily: (code: string) => Promise<boolean>;
  leaveFamily: () => Promise<void>;
  updateProfilePhoto: (photoURL: string) => Promise<void>;

  // Tasks
  addTask: (title: string, description: string, assignedTo: string, points: number, deadline: string | null) => Promise<void>;
  proposeTask: (title: string, description: string, points: number) => Promise<void>;
  approveTask: (taskId: string) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskComplete: (taskId: string) => Promise<void>;

  // Rewards
  addReward: (title: string, description: string, pointsCost: number) => Promise<void>;
  proposeReward: (title: string, description: string, pointsCost: number) => Promise<void>;
  approveReward: (rewardId: string) => Promise<void>;
  claimReward: (rewardId: string) => Promise<boolean>;
  toggleRewardActive: (rewardId: string) => Promise<void>;

  // Shopping
  addShoppingItem: (name: string) => Promise<void>;
  toggleShoppingItem: (itemId: string) => Promise<void>;
  clearBoughtShoppingItems: () => Promise<void>;

  // Chat
  sendMessage: (text: string) => Promise<void>;

  // Admin parental control
  toggleMemberWalkieBlock: (memberUid: string) => Promise<void>;
  toggleMemberGamesBlock: (memberUid: string) => Promise<void>;
  toggleMemberAppBlock: (memberUid: string) => Promise<void>;
  toggleMemberRole: (memberUid: string) => Promise<void>;

  // Simulation controls
  switchCurrentUser: (memberUid: string) => void;
  addMockMemberToFamily: (displayName: string, role: 'admin' | 'child') => Promise<void>;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

const DEMO_FAMILY_ID = 'fam_martinez';

// --- FORCE SEED MARTINEZ DEMO HOISTED FUNCTION (Declared early to prevent block access limits) ---
async function ensureDemoFamilySeeded() {
  try {
    const familyRef = doc(db, 'families', 'fam_martinez');
    const familySnap = await getDoc(familyRef);
    
    if (!familySnap.exists()) {
      console.log("Seeding Demo Family Martinez into Firestore...");
      
      await setDoc(familyRef, {
        id: 'fam_martinez',
        name: 'Los Martínez Chores',
        code: 'MART15',
        createdBy: 'user_papa',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
        wrappedReward: 'Finde completo sin tareas + Parque de atracciones 🎢'
      });

      const DEMO_MEMBERS_LOCAL = [
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
          blocked: { walkie: true, games: true, all: false }
        }
      ];

      for (const m of DEMO_MEMBERS_LOCAL) {
        await setDoc(doc(db, 'families', 'fam_martinez', 'members', m.uid), m);
      }

      const DEMO_TASKS_LOCAL = [
        {
          id: 'task_1',
          title: 'Fregar los platos de la cena',
          description: 'Dejar el fregadero impoluto, secar los sartenes y limpiar la encimera.',
          assignedTo: 'user_lucas',
          points: 15,
          deadline: Date.now() + 1000 * 60 * 60 * 12,
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
          deadline: Date.now() - 1000 * 60 * 60 * 2,
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
          isProposal: true
        }
      ];

      for (const t of DEMO_TASKS_LOCAL) {
        await setDoc(doc(db, 'families', 'fam_martinez', 'tasks', t.id), t);
      }

      const DEMO_REWARDS_LOCAL = [
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
          active: false,
          proposedBy: 'user_sofia'
        }
      ];

      for (const r of DEMO_REWARDS_LOCAL) {
        await setDoc(doc(db, 'families', 'fam_martinez', 'rewards', r.id), r);
      }

      const DEMO_SHOPPING_LOCAL = [
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

      for (const s of DEMO_SHOPPING_LOCAL) {
        await setDoc(doc(db, 'families', 'fam_martinez', 'shopping', s.id), s);
      }

      const DEMO_MESSAGES_LOCAL = [
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

      for (const msg of DEMO_MESSAGES_LOCAL) {
        await setDoc(doc(db, 'families', 'fam_martinez', 'messages', msg.id), msg);
      }

      const getPastDate = (daysAgo: number) => Date.now() - 1000 * 60 * 60 * 24 * daysAgo;
      const DEMO_POINTS_HISTORY_LOCAL = [
        { id: 'rec_s1', uid: 'user_sofia', delta: 15, reason: 'Sacar basura toda la semana', taskId: null, timestamp: getPastDate(12) },
        { id: 'rec_s2', uid: 'user_sofia', delta: 20, reason: 'Limpiar el baño principal', taskId: null, timestamp: getPastDate(9) },
        { id: 'rec_s3', uid: 'user_sofia', delta: 30, reason: 'Barrer y fregar planta cocina', taskId: null, timestamp: getPastDate(7) },
        { id: 'rec_s4', uid: 'user_sofia', delta: 50, reason: 'Limpieza profunda del jardín', taskId: null, timestamp: getPastDate(4) },
        { id: 'rec_s5', uid: 'user_sofia', delta: -50, reason: 'Canjeó recompensa: 1 Hora Play', taskId: null, timestamp: getPastDate(3) },
        { id: 'rec_s6', uid: 'user_sofia', delta: 10, reason: 'Hacer la cama y ventilar', taskId: 'task_3', timestamp: getPastDate(1) },
        { id: 'rec_l1', uid: 'user_lucas', delta: 10, reason: 'Hacer deberes temprano', taskId: null, timestamp: getPastDate(14) },
        { id: 'rec_l2', uid: 'user_lucas', delta: 15, reason: 'Ordenar cuarto juguetes', taskId: null, timestamp: getPastDate(10) },
        { id: 'rec_l3', uid: 'user_lucas', delta: 20, reason: 'Sacar la cafetera y lavarla', taskId: null, timestamp: getPastDate(6) },
        { id: 'rec_p1', uid: 'user_papa', delta: 40, reason: 'Supervisión general', taskId: null, timestamp: getPastDate(15) },
        { id: 'rec_m1', uid: 'user_mama', delta: 30, reason: 'Supervisión general', taskId: null, timestamp: getPastDate(15) }
      ];

      for (const h of DEMO_POINTS_HISTORY_LOCAL) {
        await setDoc(doc(db, 'families', 'fam_martinez', 'pointsHistory', h.id), h);
      }
    }
  } catch (e) {
    console.warn("Failed to seed demo family Martinez: ", e);
  }
}

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [simulatedUid, setSimulatedUid] = useState<string | null>(null);

  const [user, setUser] = useState<FamilyMember | null>(null);
  const [family, setFamily] = useState<Family | null>(null);
  const [familyId, setFamilyId] = useState<string | null>(null);
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

  const unsubscribesRef = useRef<(() => void)[]>([]);

  const clearSubscriptions = () => {
    unsubscribesRef.current.forEach(unsub => unsub());
    unsubscribesRef.current = [];
  };

  // --- INITIAL LOAD & AUTH STATE LISTENERS ---
  useEffect(() => {
    // 1. Theme configuration (asynchronous setup to avoid set-state nested renders)
    const savedTheme = localStorage.getItem('family_theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTimeout(() => {
        setDarkMode(true);
      }, 0);
    }

    // 2. Firebase Connection Test (from checklist)
    const testConnection = async () => {
      try {
        await getDoc(doc(db, 'test', 'connection'));
      } catch (err) {
        if (err instanceof Error && err.message.includes('offline')) {
          console.warn("Firestore appears offline");
        }
      }
    };
    testConnection();

    // 3. Auth state sync
    const unsubscribeAuth = onAuthStateChanged(auth, async (fUser) => {
      clearSubscriptions();

      if (fUser) {
        setFirebaseUser(fUser);
        setActiveUid(fUser.uid);

        // Fetch user metadata document
        const userRef = doc(db, 'users', fUser.uid);
        let userSnap = await getDoc(userRef).catch(err => {
          handleFirestoreError(err, OperationType.GET, `users/${fUser.uid}`);
          return null;
        });

        let currentFamilyId: string | null = null;

        // If user document does not exist, initialize it
        if (!userSnap || !userSnap.exists()) {
          const defaultEmail = fUser.email || '';
          
          // Auto-link seed simulated users to Martinez demo family
          if (['carlosperez@consolacionburriana.com', 'elena@gmail.com', 'sofia@gmail.com', 'lucas@gmail.com'].includes(defaultEmail.toLowerCase())) {
            currentFamilyId = DEMO_FAMILY_ID;
            await ensureDemoFamilySeeded();
          }

          const newUserDoc = {
            uid: fUser.uid,
            displayName: fUser.displayName || defaultEmail.split('@')[0] || 'Nuevo Miembro',
            email: defaultEmail,
            photoURL: fUser.photoURL || `https://picsum.photos/seed/${fUser.uid}/150/150`,
            familyId: currentFamilyId
          };

          await setDoc(userRef, newUserDoc).catch(err => {
            handleFirestoreError(err, OperationType.WRITE, `users/${fUser.uid}`);
          });
          
          setFamilyId(currentFamilyId);
        } else {
          const uData = userSnap.data();
          setFamilyId(uData.familyId || null);
        }
      } else {
        setFirebaseUser(null);
        setActiveUid(null);
        setSimulatedUid(null);
        setUser(null);
        setFamily(null);
        setFamilyId(null);
        setMembers([]);
        setTasks([]);
        setRewards([]);
        setShopping([]);
        setMessages([]);
        setPointsHistory([]);
      }
    });

    return () => {
      unsubscribeAuth();
      clearSubscriptions();
    };
  }, []);

  // --- REACTIVE FAMILY DB SUBSCRIPTIONS ---
  useEffect(() => {
    if (!familyId) {
      setTimeout(() => {
        setFamily(null);
        setMembers([]);
        setTasks([]);
        setRewards([]);
        setShopping([]);
        setMessages([]);
        setPointsHistory([]);
      }, 0);
      return;
    }

    clearSubscriptions();

    // 1. Subscribe to family unit
    const unsubFam = onSnapshot(doc(db, 'families', familyId), (snap) => {
      if (snap.exists()) {
        setFamily(snap.data() as Family);
      }
    }, (err) => handleFirestoreError(err, OperationType.GET, `families/${familyId}`));
    unsubscribesRef.current.push(unsubFam);

    // 2. Subscribe to members list
    const unsubMem = onSnapshot(collection(db, 'families', familyId, 'members'), (snap) => {
      const list: FamilyMember[] = [];
      snap.forEach(d => list.push(d.data() as FamilyMember));
      setMembers(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, `families/${familyId}/members`));
    unsubscribesRef.current.push(unsubMem);

    // 3. Subscribe to Chores & Tasks
    const unsubTasks = onSnapshot(collection(db, 'families', familyId, 'tasks'), (snap) => {
      const list: ChoreTask[] = [];
      snap.forEach(d => list.push(d.data() as ChoreTask));
      list.sort((a, b) => b.createdAt - a.createdAt);
      setTasks(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, `families/${familyId}/tasks`));
    unsubscribesRef.current.push(unsubTasks);

    // 4. Subscribe to rewards Catalog
    const unsubRewards = onSnapshot(collection(db, 'families', familyId, 'rewards'), (snap) => {
      const list: Reward[] = [];
      snap.forEach(d => list.push(d.data() as Reward));
      setRewards(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, `families/${familyId}/rewards`));
    unsubscribesRef.current.push(unsubRewards);

    // 5. Subscribe to shopping list
    const unsubShop = onSnapshot(collection(db, 'families', familyId, 'shopping'), (snap) => {
      const list: ShoppingItem[] = [];
      snap.forEach(d => list.push(d.data() as ShoppingItem));
      // Sort unbought items first, then bought items, then sort by addedAt desc
      list.sort((a, b) => {
        if (a.bought !== b.bought) return a.bought ? 1 : -1;
        return b.addedAt - a.addedAt;
      });
      setShopping(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, `families/${familyId}/shopping`));
    unsubscribesRef.current.push(unsubShop);

    // 6. Subscribe to messages (max last 100)
    const unsubMsg = onSnapshot(collection(db, 'families', familyId, 'messages'), (snap) => {
      const list: ChatMessage[] = [];
      snap.forEach(d => list.push(d.data() as ChatMessage));
      list.sort((a, b) => a.createdAt - b.createdAt);
      setMessages(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, `families/${familyId}/messages`));
    unsubscribesRef.current.push(unsubMsg);

    // 7. Subscribe to Points Logs
    const unsubHistory = onSnapshot(collection(db, 'families', familyId, 'pointsHistory'), (snap) => {
      const list: PointsRecord[] = [];
      snap.forEach(d => list.push(d.data() as PointsRecord));
      list.sort((a, b) => b.timestamp - a.timestamp);
      setPointsHistory(list);
    }, (err) => handleFirestoreError(err, OperationType.GET, `families/${familyId}/pointsHistory`));
    unsubscribesRef.current.push(unsubHistory);

    return () => {
      clearSubscriptions();
    };
  }, [familyId]);

  // --- DERIVED CURRENT ACCOUNT USER PROFILE ---
  useEffect(() => {
    const updateDerivedProfile = () => {
      if (!activeUid) {
        setUser(null);
        return;
      }
      const targetUid = simulatedUid || activeUid;
      const matchedProfile = members.find(m => m.uid === targetUid);

      if (matchedProfile) {
        setUser(matchedProfile);
      } else if (firebaseUser) {
        // If the authenticated user is brand new or hasn't had their subcollection member profile created yet
        setUser({
          uid: targetUid,
          displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Nuevo Miembro',
          email: firebaseUser.email || '',
          photoURL: firebaseUser.photoURL || `https://picsum.photos/seed/${targetUid}/150/150`,
          role: 'child',
          points: 0,
          joinedAt: Date.now(),
          blocked: { walkie: false, games: false, all: false }
        });
      }
    };

    setTimeout(updateDerivedProfile, 0);
  }, [members, activeUid, simulatedUid, firebaseUser]);

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

  // --- ALARMA ROJA TRIGGER ---
  const triggerAlarmaRoja = () => {
    setAlarmActive(false);
    setTimeout(() => {
      setAlarmActive(true);
    }, 10);
  };

  useEffect(() => {
    if (alarmActive) {
      const timer = setTimeout(() => {
        setAlarmActive(false);
      }, 610);
      return () => clearTimeout(timer);
    }
  }, [alarmActive]);

  // --- ACTIONS ---
  const loginWithGoogle = async (email?: string, displayName?: string, photoURL?: string, role: 'admin' | 'child' = 'child') => {
    try {
      if (email) {
        // Fast dynamic simulation using Anonymous login session
        const credential = await signInAnonymously(auth);
        const fUser = credential.user;

        const simulatedEmail = email.toLowerCase();
        let targetFamilyId: string | null = null;
        let isSeedAccount = false;
        let seedUid = fUser.uid;

        if (['carlosperez@consolacionburriana.com', 'elena@gmail.com', 'sofia@gmail.com', 'lucas@gmail.com'].includes(simulatedEmail)) {
          targetFamilyId = DEMO_FAMILY_ID;
          isSeedAccount = true;
          await ensureDemoFamilySeeded();
          if (simulatedEmail === 'carlosperez@consolacionburriana.com') seedUid = 'user_papa';
          else if (simulatedEmail === 'elena@gmail.com') seedUid = 'user_mama';
          else if (simulatedEmail === 'sofia@gmail.com') seedUid = 'user_sofia';
          else if (simulatedEmail === 'lucas@gmail.com') seedUid = 'user_lucas';
        }

        // Initialize User Doc
        const userRef = doc(db, 'users', fUser.uid);
        await setDoc(userRef, {
          uid: fUser.uid,
          displayName: displayName || email.split('@')[0],
          email: email,
          photoURL: photoURL || `https://picsum.photos/seed/${displayName}/150/150`,
          familyId: targetFamilyId
        });

        // Register in Family Members subcollection
        if (targetFamilyId) {
          // If they selected a seed account, use their predefined profile points
          let initialPoints = 0;
          if (seedUid === 'user_papa') initialPoints = 120;
          else if (seedUid === 'user_mama') initialPoints = 85;
          else if (seedUid === 'user_sofia') initialPoints = 135;
          else if (seedUid === 'user_lucas') initialPoints = 45;

          const memberDocRef = doc(db, 'families', targetFamilyId, 'members', fUser.uid);
          await setDoc(memberDocRef, {
            uid: fUser.uid,
            displayName: displayName || 'Miembro',
            email: email,
            photoURL: photoURL || `https://picsum.photos/seed/${displayName}/150/150`,
            role: isSeedAccount ? (['user_papa', 'user_mama'].includes(seedUid) ? 'admin' : 'child') : role,
            points: initialPoints,
            joinedAt: Date.now(),
            blocked: seedUid === 'user_lucas' ? { walkie: true, games: true, all: false } : { walkie: false, games: false, all: false }
          });
        }

        setFamilyId(targetFamilyId);
      } else {
        // Real Google Login with Popup
        const result = await signInWithPopup(auth, googleProvider);
        const fUser = result.user;
        
        const userRef = doc(db, 'users', fUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          await setDoc(userRef, {
            uid: fUser.uid,
            displayName: fUser.displayName || 'Miembro',
            email: fUser.email || '',
            photoURL: fUser.photoURL || `https://picsum.photos/seed/${fUser.uid}/150/150`,
            familyId: null
          });
          setFamilyId(null);
        } else {
          setFamilyId(userSnap.data().familyId || null);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Error al iniciar sesión con Google. El bloqueo de ventanas emergentes (Popup) u otras restricciones del navegador pueden impedirlo. Por favor, utiliza los botones rápidos de simulación.");
    }
  };

  const logout = async () => {
    clearSubscriptions();
    await signOut(auth);
    setFirebaseUser(null);
    setActiveUid(null);
    setSimulatedUid(null);
    setUser(null);
    setFamily(null);
    setFamilyId(null);
    setMembers([]);
    setTasks([]);
    setRewards([]);
    setShopping([]);
    setMessages([]);
    setPointsHistory([]);
  };

  const createFamily = async (familyName: string, wrappedReward: string = 'Super Trofeo Familiar + Gran Helado 🏆') => {
    if (!firebaseUser) return;

    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    const currentUid = firebaseUser.uid;
    const newFamId = 'fam_' + Math.random().toString(36).substr(2, 9);

    // 1. Create family document
    await setDoc(doc(db, 'families', newFamId), {
      id: newFamId,
      name: familyName,
      code,
      createdBy: currentUid,
      createdAt: Date.now(),
      wrappedReward
    }).catch(err => handleFirestoreError(err, OperationType.WRITE, `families/${newFamId}`));

    // 2. Register owner member as admin
    const cleanUser = user || {
      uid: currentUid,
      displayName: firebaseUser.displayName || 'Padre/Madre',
      email: firebaseUser.email || '',
      photoURL: firebaseUser.photoURL || `https://picsum.photos/seed/${currentUid}/150/150`
    };

    await setDoc(doc(db, 'families', newFamId, 'members', currentUid), {
      uid: currentUid,
      displayName: cleanUser.displayName,
      email: cleanUser.email,
      photoURL: cleanUser.photoURL,
      role: 'admin',
      points: 0,
      joinedAt: Date.now(),
      blocked: { walkie: false, games: false, all: false }
    }).catch(err => handleFirestoreError(err, OperationType.WRITE, `families/${newFamId}/members/${currentUid}`));

    // 3. Populate default task
    const initTaskId = 'init_t1';
    await setDoc(doc(db, 'families', newFamId, 'tasks', initTaskId), {
      id: initTaskId,
      title: 'Barrer la cocina',
      description: 'Limpiar el suelo después de cenar y vaciar el recogedor.',
      assignedTo: 'all',
      points: 10,
      deadline: null,
      completed: false,
      completedAt: null,
      completedBy: null,
      createdBy: currentUid,
      createdAt: Date.now(),
      isProposal: false
    }).catch(err => handleFirestoreError(err, OperationType.WRITE, `families/${newFamId}/tasks/${initTaskId}`));

    // 4. Populate default reward
    const initRewardId = 'init_r1';
    await setDoc(doc(db, 'families', newFamId, 'rewards', initRewardId), {
      id: initRewardId,
      title: 'Elegir postre del sábado 🧁',
      description: 'Tú decides qué tarta o postre se compra o cocina el fin de semana.',
      pointsCost: 40,
      createdBy: currentUid,
      active: true
    }).catch(err => handleFirestoreError(err, OperationType.WRITE, `families/${newFamId}/rewards/${initRewardId}`));

    // 5. Link user meta document to active family
    await updateDoc(doc(db, 'users', currentUid), { familyId: newFamId })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${currentUid}`));

    setFamilyId(newFamId);
  };

  const joinFamily = async (codeString: string): Promise<boolean> => {
    if (!firebaseUser) return false;
    const cleanCode = codeString.trim().toUpperCase();

    // Query for family with given code
    const q = query(collection(db, 'families'), where('code', '==', cleanCode));
    const snaps = await getDocs(q).catch(err => {
      handleFirestoreError(err, OperationType.LIST, 'families');
      return null;
    });

    if (!snaps || snaps.empty) {
      // If MART15 and not available in cloud, attempt seeding it
      if (cleanCode === 'MART15') {
        await ensureDemoFamilySeeded();
        // Re-run query
        const snaps2 = await getDocs(q);
        if (snaps2 && !snaps2.empty) {
          return await joinWithFamilyDoc(snaps2.docs[0].data() as Family);
        }
      }
      return false;
    }

    return await joinWithFamilyDoc(snaps.docs[0].data() as Family);
  };

  const joinWithFamilyDoc = async (fData: Family): Promise<boolean> => {
    const currentUid = firebaseUser!.uid;

    const cleanUser = user || {
      uid: currentUid,
      displayName: firebaseUser!.displayName || 'Miembro',
      email: firebaseUser!.email || '',
      photoURL: firebaseUser!.photoURL || `https://picsum.photos/seed/${currentUid}/150/150`
    };

    // Determine role - default is child unless we already are in it as admin, or are papa/mama seed and the family is MART15
    let resolvedRole: 'admin' | 'child' = 'child';
    if (fData.id === 'fam_martinez' && (cleanUser.email.toLowerCase() === 'carlosperez@consolacionburriana.com' || cleanUser.email.toLowerCase() === 'elena@gmail.com')) {
      resolvedRole = 'admin';
    }

    // 1. Join family collection
    await setDoc(doc(db, 'families', fData.id, 'members', currentUid), {
      uid: currentUid,
      displayName: cleanUser.displayName,
      email: cleanUser.email,
      photoURL: cleanUser.photoURL,
      role: resolvedRole,
      points: 0,
      joinedAt: Date.now(),
      blocked: { walkie: false, games: false, all: false }
    }).catch(err => handleFirestoreError(err, OperationType.WRITE, `families/${fData.id}/members/${currentUid}`));

    // 2. Link user meta doc
    await updateDoc(doc(db, 'users', currentUid), { familyId: fData.id })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${currentUid}`));

    setFamilyId(fData.id);
    return true;
  };

  const leaveFamily = async () => {
    if (!firebaseUser || !familyId) return;
    const currentUid = firebaseUser.uid;

    const matchedMem = members.find(m => m.uid === currentUid);
    if (matchedMem?.role === 'admin') {
      const otherAdmins = members.filter(m => m.role === 'admin' && m.uid !== currentUid);
      if (otherAdmins.length === 0 && members.length > 1) {
        triggerAlarmaRoja();
        return;
      }
    }

    // Unsubscribe and clear first
    clearSubscriptions();

    // 1. Delete from members subcollection
    await deleteDoc(doc(db, 'families', familyId, 'members', currentUid))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `families/${familyId}/members/${currentUid}`));

    // 2. Clear from user doc
    await updateDoc(doc(db, 'users', currentUid), { familyId: null })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${currentUid}`));

    setFamilyId(null);
    setFamily(null);
  };

  const updateProfilePhoto = async (photoURL: string) => {
    if (!activeUid) return;
    
    // Update top level doc
    await updateDoc(doc(db, 'users', activeUid), { photoURL })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `users/${activeUid}`));

    if (familyId) {
      await updateDoc(doc(db, 'families', familyId, 'members', activeUid), { photoURL })
        .catch(err => handleFirestoreError(err, OperationType.UPDATE, `families/${familyId}/members/${activeUid}`));
    }
  };

  // --- TASK OPERATIONS ---
  const addTask = async (title: string, description: string, assignedTo: string, points: number, deadline: string | null) => {
    if (!familyId || !user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const tId = 'task_' + Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'families', familyId, 'tasks', tId), {
      id: tId,
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
    }).catch(err => handleFirestoreError(err, OperationType.WRITE, `families/${familyId}/tasks/${tId}`));
  };

  const proposeTask = async (title: string, description: string, points: number) => {
    if (!familyId || !user) return;

    const tId = 'task_' + Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'families', familyId, 'tasks', tId), {
      id: tId,
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
    }).catch(err => handleFirestoreError(err, OperationType.WRITE, `families/${familyId}/tasks/${tId}`));
  };

  const approveTask = async (taskId: string) => {
    if (!familyId || !user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    await updateDoc(doc(db, 'families', familyId, 'tasks', taskId), { isProposal: false })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `families/${familyId}/tasks/${taskId}`));
  };

  const deleteTask = async (taskId: string) => {
    if (!familyId || !user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    await deleteDoc(doc(db, 'families', familyId, 'tasks', taskId))
      .catch(err => handleFirestoreError(err, OperationType.DELETE, `families/${familyId}/tasks/${taskId}`));
  };

  const toggleTaskComplete = async (taskId: string) => {
    if (!familyId || !user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.isProposal) {
      triggerAlarmaRoja();
      return;
    }

    const isCompleting = !task.completed;
    const completedByUid = task.assignedTo === 'all' 
      ? (members[Math.floor(Math.random() * members.length)]?.uid || user.uid) 
      : task.assignedTo;

    const targetMember = members.find(m => m.uid === completedByUid);
    if (!targetMember) return;

    const pointDelta = isCompleting ? task.points : -task.points;
    const nextPoints = Math.max(0, targetMember.points + pointDelta);

    // 1. Update task completed status
    await updateDoc(doc(db, 'families', familyId, 'tasks', taskId), {
      completed: isCompleting,
      completedAt: isCompleting ? Date.now() : null,
      completedBy: isCompleting ? completedByUid : null
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `families/${familyId}/tasks/${taskId}`));

    // 2. Update member points
    await updateDoc(doc(db, 'families', familyId, 'members', completedByUid), { points: nextPoints })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `families/${familyId}/members/${completedByUid}`));

    // 3. Log into Ledger
    const recId = 'rec_' + Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'families', familyId, 'pointsHistory', recId), {
      id: recId,
      uid: completedByUid,
      delta: pointDelta,
      reason: isCompleting ? `Completó tarea: ${task.title}` : `Canceló tarea completada: ${task.title}`,
      taskId,
      timestamp: Date.now()
    }).catch(err => handleFirestoreError(err, OperationType.WRITE, `families/${familyId}/pointsHistory/${recId}`));

    if (isCompleting) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#3B82F6', '#FFFFFF', '#FCD34D', '#60A5FA', '#FBBF24']
      });
    }
  };

  // --- REWARD OPERATIONS ---
  const addReward = async (title: string, description: string, pointsCost: number) => {
    if (!familyId || !user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const rId = 'reward_' + Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'families', familyId, 'rewards', rId), {
      id: rId,
      title,
      description,
      pointsCost,
      createdBy: user.uid,
      active: true
    }).catch(err => handleFirestoreError(err, OperationType.WRITE, `families/${familyId}/rewards/${rId}`));
  };

  const proposeReward = async (title: string, description: string, pointsCost: number) => {
    if (!familyId || !user) return;

    const rId = 'reward_' + Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'families', familyId, 'rewards', rId), {
      id: rId,
      title,
      description,
      pointsCost,
      createdBy: user.uid,
      active: false,
      proposedBy: user.uid
    }).catch(err => handleFirestoreError(err, OperationType.WRITE, `families/${familyId}/rewards/${rId}`));
  };

  const approveReward = async (rewardId: string) => {
    if (!familyId || !user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    await updateDoc(doc(db, 'families', familyId, 'rewards', rewardId), { active: true })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `families/${familyId}/rewards/${rewardId}`));
  };

  const toggleRewardActive = async (rewardId: string) => {
    if (!familyId || !user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const rMatch = rewards.find(r => r.id === rewardId);
    if (!rMatch) return;

    await updateDoc(doc(db, 'families', familyId, 'rewards', rewardId), { active: !rMatch.active })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `families/${familyId}/rewards/${rewardId}`));
  };

  const claimReward = async (rewardId: string): Promise<boolean> => {
    if (!familyId || !user) return false;

    const reward = rewards.find(r => r.id === rewardId);
    if (!reward) return false;

    if (user.points < reward.pointsCost) {
      triggerAlarmaRoja();
      return false;
    }

    const nextPoints = Math.max(0, user.points - reward.pointsCost);
    
    // 1. Deduct points from claimant member doc
    await updateDoc(doc(db, 'families', familyId, 'members', user.uid), { points: nextPoints })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `families/${familyId}/members/${user.uid}`));

    // 2. Create ledger log
    const recId = 'rec_' + Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'families', familyId, 'pointsHistory', recId), {
      id: recId,
      uid: user.uid,
      delta: -reward.pointsCost,
      reason: `Canjeó recompensa: ${reward.title}`,
      taskId: null,
      timestamp: Date.now()
    }).catch(err => handleFirestoreError(err, OperationType.WRITE, `families/${familyId}/pointsHistory/${recId}`));

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

    return true;
  };

  // --- SHOPPING OPERATIONS ---
  const addShoppingItem = async (name: string) => {
    if (!familyId || !user) return;

    const sId = 'shop_' + Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'families', familyId, 'shopping', sId), {
      id: sId,
      name,
      addedBy: user.uid,
      addedAt: Date.now(),
      bought: false,
      boughtBy: null
    }).catch(err => handleFirestoreError(err, OperationType.WRITE, `families/${familyId}/shopping/${sId}`));
  };

  const toggleShoppingItem = async (itemId: string) => {
    if (!familyId || !user) return;

    const sMatch = shopping.find(s => s.id === itemId);
    if (!sMatch) return;

    const boughtState = !sMatch.bought;
    await updateDoc(doc(db, 'families', familyId, 'shopping', itemId), {
      bought: boughtState,
      boughtBy: boughtState ? user.uid : null
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `families/${familyId}/shopping/${itemId}`));
  };

  const clearBoughtShoppingItems = async () => {
    if (!familyId) return;

    const boughtItems = shopping.filter(s => s.bought);
    for (const item of boughtItems) {
      await deleteDoc(doc(db, 'families', familyId, 'shopping', item.id))
        .catch(err => handleFirestoreError(err, OperationType.DELETE, `families/${familyId}/shopping/${item.id}`));
    }
  };

  // --- CHAT OPERATIONS ---
  const sendMessage = async (text: string) => {
    if (!familyId || !user) return;

    const msgId = 'msg_' + Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'families', familyId, 'messages', msgId), {
      id: msgId,
      text,
      senderId: user.uid,
      senderName: user.displayName,
      senderPhoto: user.photoURL,
      createdAt: Date.now()
    }).catch(err => handleFirestoreError(err, OperationType.WRITE, `families/${familyId}/messages/${msgId}`));
  };

  // --- PARENTAL CONTROL / LOCK OPERATIONS ---
  const toggleMemberWalkieBlock = async (memberUid: string) => {
    if (!familyId || !user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const tMatch = members.find(m => m.uid === memberUid);
    if (!tMatch) return;

    await updateDoc(doc(db, 'families', familyId, 'members', memberUid), {
      "blocked.walkie": !tMatch.blocked.walkie
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `families/${familyId}/members/${memberUid}`));
  };

  const toggleMemberGamesBlock = async (memberUid: string) => {
    if (!familyId || !user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const tMatch = members.find(m => m.uid === memberUid);
    if (!tMatch) return;

    await updateDoc(doc(db, 'families', familyId, 'members', memberUid), {
      "blocked.games": !tMatch.blocked.games
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `families/${familyId}/members/${memberUid}`));
  };

  const toggleMemberAppBlock = async (memberUid: string) => {
    if (!familyId || !user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const tMatch = members.find(m => m.uid === memberUid);
    if (!tMatch) return;

    await updateDoc(doc(db, 'families', familyId, 'members', memberUid), {
      "blocked.all": !tMatch.blocked.all
    }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `families/${familyId}/members/${memberUid}`));
  };

  const toggleMemberRole = async (memberUid: string) => {
    if (!familyId || !user || user.role !== 'admin') {
      triggerAlarmaRoja();
      return;
    }

    const tMatch = members.find(m => m.uid === memberUid);
    if (!tMatch) return;

    if (tMatch.role === 'admin') {
      const otherAdmins = members.filter(m => m.role === 'admin' && m.uid !== memberUid);
      if (otherAdmins.length === 0) {
        triggerAlarmaRoja();
        return;
      }
    }

    const nextRole = tMatch.role === 'admin' ? 'child' : 'admin';
    await updateDoc(doc(db, 'families', familyId, 'members', memberUid), { role: nextRole })
      .catch(err => handleFirestoreError(err, OperationType.UPDATE, `families/${familyId}/members/${memberUid}`));
  };

  // --- ACCOUNT SIMULATION SWITCH (REAL-TIME REACTIVE Personalities) ---
  const switchCurrentUser = (memberUid: string) => {
    const matched = members.find(m => m.uid === memberUid);
    if (matched) {
      setSimulatedUid(memberUid);
      confetti({
        particleCount: 20,
        spread: 40,
        origin: { y: 0.9, x: 0.1 }
      });
    }
  };

  const addMockMemberToFamily = async (displayName: string, role: 'admin' | 'child') => {
    if (!familyId) return;

    const mockId = 'user_mock_' + Math.random().toString(36).substr(2, 9);
    await setDoc(doc(db, 'families', familyId, 'members', mockId), {
      uid: mockId,
      displayName,
      email: `${displayName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      photoURL: `https://picsum.photos/seed/${displayName}/150/150`,
      role,
      points: role === 'child' ? 40 : 0,
      joinedAt: Date.now(),
      blocked: { walkie: false, games: false, all: false }
    }).catch(err => handleFirestoreError(err, OperationType.WRITE, `families/${familyId}/members/${mockId}`));

    if (role === 'child') {
      const recId = 'rec_mock_' + Math.random().toString(36).substr(2, 9);
      await setDoc(doc(db, 'families', familyId, 'pointsHistory', recId), {
        id: recId,
        uid: mockId,
        delta: 40,
        reason: 'Puntos iniciales por unirse',
        taskId: null,
        timestamp: Date.now() - 1000 * 60 * 60 * 24
      }).catch(err => handleFirestoreError(err, OperationType.WRITE, `families/${familyId}/pointsHistory/${recId}`));
    }
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
