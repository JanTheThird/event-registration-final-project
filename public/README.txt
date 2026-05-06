();// Rules:// - Title: EVENT-REGISTRATION-SYSTEM  - 5.6.2026 , 
high-performance management dashboard designed to make event organization effortless for everyone! 
🌟 This application streamlines the entire lifecycle of event management, from user registration to deep-dive analytics.
✨ Main Features🔔 
Notification SystemCreate: Send instant alerts for upcoming events.
Read: Access a full history of past notifications.
Update: Personalize reminder preferences and settings.
Delete: Keep your workspace clean by removing old logs.

📊 Reporting & Analytics
Create: Generate detailed participation reports.
Read: Visualize engagement metrics and success rates.
Update: Filter and adjust analytics parameters on the fly.
Delete: Manage data retention by removing legacy reports.
🔐 Admin Dashboard
User Role Management: Granular control over user access levels.
Access Control: Secure management of system permissions.

🛠️ Tech StackCore: React 18+ & TypeScript (Strict Mode)
Build Tool: Vite ⚡Routing: React Router DOM 6+Form 
Management: React Hook Form 7+UI Framework: React Bootstrap 2+
Icons: React Icons / Emojis

📂 Project StructurePlaintextsrc/
├── pages/
│   ├── admin/              # Admin-specific views (AdminPage.tsx)
│   │   └── components/     # Admin tools (AddEventForm, UserTable)
│   ├── student/            # User-facing views (StudentPage.tsx)
│   │   └── components/     # UI Cards & Notification logs
│   └── LandingPage.tsx     # Public entry point
├── components/             # Shared reusable components
├── utils/
│   ├── context/            # AuthContext.tsx for state management
│   ├── localdb/            # Mock database & logic (db.ts)
│   └── types/              # Global TypeScript interfaces
├── App.tsx                 # Routing & Layout configuration
└── main.tsx                # Application entry point
🚀 Quick StartPrerequisites
Node.js (v16 or higher) npm or yarn
InstallationClone the repo
git clone https://github.com/your-username/event-registration-system.git
Install dependencies
npm install
Set up environment variables

VITE_APP_TITLE= EventRegistrationSystem

Launch Dev Server
npm run dev