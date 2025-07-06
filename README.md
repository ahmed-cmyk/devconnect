## 🚀 DevConnect — Developer Collaboration Platform

A real-time platform for developers to chat & collaborate.
Login with your favorite provider, join or create a channel, chat (group & private), and hop on video calls — all in one place.

---

### ✨ Features

* 🔐 Multi-provider authentication (email, GitHub, Google)
* 📋 Channel list — join, leave, or create public/private channels
* 💬 Real-time group chat in channels
* 🗨️ Private 1:1 chat with other users
* 🎥 Video calls (group or private)
* 👀 Typing indicators & online/offline status (stretch)
* 📁 File sharing in chat (stretch)

---

### 🛠️ Tech Stack

| Layer            | Technology                                      |
| ---------------- | ----------------------------------------------- |
| Frontend         | React (or Next.js) + TailwindCSS                |
| State Management | React Query / Zustand                           |
| Backend          | Node.js + Express                               |
| Realtime         | Socket.io                                       |
| Video            | WebRTC (via simple-peer / Daily SDK / Agora)    |
| Database         | PostgreSQL (or MongoDB if you prefer)           |
| Auth             | NextAuth.js (if Next.js) or Passport.js / Clerk |
| Deployment       | Vercel (frontend) + Railway/Render (backend)    |

---

### 🌟 Setup

```bash
# clone the repo
git clone https://github.com/your-username/devconnect.git
cd devconnect

# setup backend
cd backend
cp .env.example .env
npm install
npm run dev

# setup frontend
cd frontend
npm install
npm run dev
```

---

# 🪜 Milestones & Tasks

## MVP

- Multi-provider auth (email + GitHub)
- Channel list — create/join/leave
- Group chat in channel
- User profile (avatar & name)
- Store chat history in DB
- Online/offline indicator
- Deploy on Vercel + Render

---

## Stretch Goals

- Private 1:1 chat
- Video call in channel (basic WebRTC P2P)
- Typing indicators & read receipts
- File sharing in chat
- Notifications (email or in-app)
- Advanced channel settings (invite-only, roles)

---
