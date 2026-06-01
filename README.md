# 🏡 Pesadilla en Casa — PWA de Tareas Familiares

¡Bienvenido a **Pesadilla en Casa**, una aplicación web progresiva (PWA) divertida y altamente interactiva para gestionar los quehaceres cotidianos en familia de forma colectiva y gamificada!

## 🚀 Arquitectura y Modo Local de Pruebas

Siguiendo las especificaciones técnicas del proyecto, **esta versión funciona al 100% de manera Local-First**, simulando todos los servicios de Firebase (Authentication Google popup login, Firestore database en tiempo real, Firestore Storage, Control Parental y Wrapped) en el almacenamiento local del navegador (`localStorage`).

* **Atajo Demostrable (Los Martínez)**: Al iniciar por primera vez, la aplicación se autoinicializa con una familia demo de ejemplo precargada llamada **"Los Martínez" (Código: `MART15`)**. Podrás ver tareas pendientes, rankings de puntos realistas, mensajes simpáticos de chat y un catálogo de premios de inmediato.
* **Panel de Pruebas Inferior (Simulador)**: En la parte inferior, tienes un panel flotante de desarrollo donde puedes:
  1. **Cambiar usuario al instante**: Cambiar de rol de visualización entre Papá Carlos (Admin), Mamá Elena (Admin), Sofía (Hija, 135 pts) o Lucas (Hijo, Castigado con blocks). Es ideal para auditar cómo cambia el menú y las pantallas según la persona.
  2. **Burlar restricción del Wrapped**: Forzar el periodo del Wrapped Anual (sólo abierto del 1 al 7 de enero) para previsualizar los slides de Spotify Wrapped.
  3. **Disparar Alarma Roja**: Forzar la animación de error parpadeante en pantalla.
  4. **Añadir familiares simulados** y **Restablecer** el simulador a su estado original de fábrica.

---

## 📂 Carpeta del Proyecto y Estructura

* `/context/FamilyContext.tsx`: Almacén de estado React Context que simula Firestore, Google Auth, transacciones de puntos y logs de historial en el cliente.
* `/components/`:
  * `SimulationConsole.tsx`: Panel flotante para cambiar de roles y burlar fechas.
  * `DashboardHome.tsx`: Dashboard de tablón de anuncios con las notas Post-It de Tareas Pendientes y Ranking Familiar con rotaciones orgánicas.
  * `TasksManager.tsx`: Gestión, publicación y validación de tareas completadas.
  * `ShoppingManager.tsx`: Lista de la compra compartida interactiva con tachado de comprados.
  * `FamilyChat.tsx`: Chat familiar en tiempo real con burbujas conversacionales.
  * `ParentalControls.tsx`: Gestión de bloqueos parentales e invitaciones.
  * `RewardsShop.tsx`: Tienda para proponer e invertir puntos en privilegios domésticos.
  * `StatsManager.tsx`: Gráficos dinámicos con Recharts para analizar la progresión de puntos.
  * `GamesPage.tsx`: Sala con 4 mini-juegos interactivos completos (Ruleta, Impostor, Parchís, Trivial).
  * `WalkieTalkie.tsx`: Simulador físico de Walkie Talkie con beeps y ecualizador dinámico.
  * `WrappedYearly.tsx`: Resumen anual estilo Spotify Wrapped con 5 slides animados de premios.
  * `ProfilePage.tsx`: Editor de foto de perfil (avatares caseros) y cierre de sesión.
* `/app/page.tsx`: Enrutador central y pasarela de Auth Google o Bloqueo General de padres.
* `/app/globals.css`: Estilos de Tailwind v4, animaciones de @keyframes para la **Alarma Roja** y efectos giratorios en Post-its.
* `/firestore.rules`: Reglas de seguridad declaradas para la producción de Firebase.

---

## 🛠️ Instalación y Arranque Local

1. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo local:
   ```bash
   npm run dev
   ```
3. Abre el navegador en `http://localhost:3000` para disfrutar de la experiencia.

---

## ⚡ Guía de Despliegue en Firebase

Una vez que decidas conectar el backend de Firebase a producción, sigue estos pasos:

### 1. Inicialización de Firebase
Asegúrate de tener instalada la CLI de Firebase globalmente (`npm install -g firebase-tools`):
```bash
firebase login
firebase init
```
En el asistente de inicialización:
* Elige **Firestore** (Database) y **Hosting** (Hosting: Configure files for Firebase Hosting and setup GitHub Actions).
* Selecciona tu proyecto creado en la Firebase Console.
* Configura la carpeta pública como `dist/` (o `.next/` según configuraciones de Next, Next standalone export se despliega con Cloud Run idealmente).

### 2. Desplegar Reglas de Base de Datos (Firestore Rules)
El archivo `firestore.rules` del proyecto ya contiene todas las directivas de seguridad solicitadas (solo miembros leen su hogar, solo padres marcan tareas, se restringe Wrapped fuera de enero, etc.). Despliégalas directamente:
```bash
firebase deploy --only firestore:rules
```

### 3. Configurar del API Key en Producción
Define las variables de entorno dentro del panel de configuración de alojamiento, manteniendo a buen recaudo el `GEMINI_API_KEY` en tus secretos de servidor privados.
