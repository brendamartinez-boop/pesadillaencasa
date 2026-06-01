import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { FamilyProvider } from '@/context/FamilyContext';

export const metadata: Metadata = {
  title: 'Pesadilla en Casa — PWA de Tareas Familiares',
  description: 'Gestiona las tareas de casa con diversión, puntos, ranking, recompensas, walkie-talkie y chat familiar.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="bg-slate-50 text-slate-900 font-sans selection:bg-blue-200">
        <FamilyProvider>
          {children}
        </FamilyProvider>
      </body>
    </html>
  );
}
