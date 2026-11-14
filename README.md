# 🚀 NEET 2027 Prep Command Center

<div align="center">

![NEET 2027 Command Center](https://img.shields.io/badge/Target-700%2B-55e357?style=for-the-badge&logo=target)
![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase_Auth-Ready-FFA611?style=for-the-badge&logo=firebase&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)

An ultra-modern, aesthetic web application built for medical aspirants targeting a 700+ score in **NEET UG 2027**. Features the complete NTA rationalized syllabus, study heatmaps, dual focus timers, YouTube Music integration, examiner trap flashcards, and mock test analytics.

[Live Demo](https://neet-2027-prep.vercel.app) • [Report Bug](https://github.com/Om-Meena-UI/neet-2027-prep/issues) • [Request Feature](https://github.com/Om-Meena-UI/neet-2027-prep/issues)

</div>

---

## ✨ Key Features

### 🧭 1. Complete NTA Rationalized Syllabus Grid
- **Divided by Subject**: Dedicated responsive grids for **Physics**, **Chemistry**, and **Biology**.
- **3-Stage Tracking per Chapter**:
  - 📖 **NCERT** (Concept reading completed)
  - 📝 **PYQs** (Past 10-15 year questions solved)
  - 🔁 **Rev** (Active recall revision completed)
- **Custom Chapter Difficulty**: Mark any chapter as `● Easy`, `● Medium`, or `● Hard` with one click.
- **Multi-Filter Engine**: Filter by Subject, Class (11 / 12), Weightage (`High Yield ⭐`, `Moderate`, `Low`), and Difficulty.

### 📊 2. Dynamic Analytics & 365-Day Study Heatmap
- **Syllabus Readiness Gauge**: Real-time circular percentage calculation across all 97 chapters.
- **Subject Progress Bars**: Instant breakdown for Physics, Chemistry, and Biology.
- **GitHub-Style Heatmap**: Modern rounded study cells tracking your consistency over the last 365 days.
- **Live Streaks**: Current streak, best streak, today's focus minutes, and daily checks count.

### ⏱️ 3. Dual-Mode Study Timer & NEET Countdown
- **25m Pomodoro Sprint** & **180m Full NEET Exam Simulation** (3-hour mock test timer).
- **Chapter Linking**: Bind timer sessions to specific chapters.
- **Live Countdown Card**: Real-time days, hours, minutes, and seconds remaining until **NEET 2027** (May 2, 2027).

### ⚡ 4. Smart Focus Queue
- Algorithmic recommendation engine that dynamically analyzes your progress and highlights uncompleted **High-Yield** chapters for maximum score impact.

### 🎵 5. Synced YouTube Music & Study Radio
- **Floating Bottom Player Bar** (Spotify / YouTube Music style) with track covers, volume slider, mute toggle, and playlist selector.
- **Sidebar YouTube Embed Screen**: Watch streams or hide the video screen while the **music continues playing in the background**.
- **Custom Embed Bar**: Paste any YouTube / YT Music URL to play custom audio directly inside the app.

### 📝 6. Daily Prep To-Do List
- Add study tasks with priority tags (`High`, `Med`, `Low`).
- Filter by `All`, `Active`, or `Done` with progress counter.

### ⚡ 7. Examiner Trap Cards Deck
- Curated recurring tricky questions and traps (thermodynamics sign conventions, biology exceptions, optics focal signs).
- Flip-card animation, mastered status toggles, and ability to add your own custom flashcards.

### 📈 8. Mock Test Score Analytics
- Log full test results: **Physics (/180)**, **Chemistry (/180)**, and **Biology (/360)** (Total 720).
- Tracks average score, highest score, test history, and mistake notes.

### 🔐 9. Google / Gmail Firebase Authentication & Backups
- Authenticate with your real Google account or email/password.
- **1-Click JSON Backup & Restore**: Export all your data to a JSON file and restore your entire progress on any computer or phone.

### 📱 10. Mobile-First "Habify" Aesthetic
- Ultra-dark obsidian (`#0e1013`) and neon lime (`#55e357`) theme.
- Top rolling 5-day streak capsules and bottom floating navigation dock for one-handed mobile use.

---

## 🛠️ Tech Stack

- **Framework**: [React 18](https://react.dev/) + [Vite 5](https://vitejs.dev/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Heatmap**: [react-calendar-heatmap](https://github.com/patientslikeme/react-calendar-heatmap)
- **Authentication**: [Firebase Auth](https://firebase.google.com/) (Google OAuth + Email/Password)
- **Deployment**: [Vercel](https://vercel.com/)
- **State Persistence**: Browser `localStorage` + JSON Import/Export

---

## 🚀 Getting Started

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Om-Meena-UI/neet-2027-prep.git
   cd neet-2027-prep
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   ```
   http://localhost:5173
   ```

### Building for Production

```bash
npm run build
```
The compiled production bundle will be in the `dist/` directory.

---

## 📁 Project Structure

```
neet-2027-prep/
├── src/
│   ├── components/
│   │   ├── AnalyticsStrip.jsx       # Readiness gauge, streak banner & 5-day strip
│   │   ├── AuthModal.jsx            # Google OAuth & Email sign-in modal
│   │   ├── CountdownCard.jsx        # Live countdown to NEET 2027
│   │   ├── DualTimer.jsx            # 25m Pomodoro & 180m exam timer
│   │   ├── FlashcardModal.jsx       # NEET trap card flip deck
│   │   ├── FloatingBottomPlayer.jsx # Persistent floating Spotify/YT Music bar
│   │   ├── Heatmap.jsx              # 365-day consistency heatmap
│   │   ├── MobileBottomNav.jsx      # Mobile floating navigation dock
│   │   ├── MockTestAnalytics.jsx    # Mock test tracker & 720 score analysis
│   │   ├── Navbar.jsx               # Floating header capsule navigation
│   │   ├── Sidebar.jsx              # Right-hand tool panel
│   │   ├── SyllabusView.jsx         # Subject-wise grid chapter checklist
│   │   ├── ThemeProvider.jsx        # Dark/Light theme provider
│   │   ├── TodoList.jsx             # Daily priority to-do widget
│   │   └── YoutubeMusicEmbed.jsx    # Synced YouTube Music embed player
│   ├── context/
│   │   ├── MusicContext.jsx         # Central music player state engine
│   │   └── PrepContext.jsx          # App state, syllabus & user progress provider
│   ├── data/
│   │   ├── defaultTraps.json        # Curated NEET trap questions
│   │   └── syllabus.json            # NTA rationalized Physics, Chem & Bio syllabus
│   ├── utils/
│   │   ├── firebase.js              # Firebase authentication initialization
│   │   └── storage.js               # Central localStorage & JSON backup engine
│   ├── App.jsx                      # Root application component
│   ├── index.css                    # Tailwind CSS & custom rounded styles
│   └── main.jsx                     # Vite entry point
├── package.json
├── tailwind.config.cjs
└── vite.config.js
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
  <b>Built with ❤️ for NEET 2027 Aspirants</b>
</div>
