# 🏆 Tailgate

> Your AI-powered sports intelligence hub — follow expert analysts, track picks, discover game insights, and engage with the sports betting community.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | [Expo](https://expo.dev) SDK 51 |
| Mobile | React Native 0.74 |
| Language | TypeScript (strict mode) |
| Navigation | [expo-router](https://expo.github.io/router) v3 (file-based) |
| Icons | @expo/vector-icons (Ionicons) |
| Backend (planned) | [Supabase](https://supabase.com) (PostgreSQL + Auth + Realtime) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+
- Expo Go app (iOS/Android) **or** a simulator

### Installation

```bash
git clone https://github.com/your-org/tailgate.git
cd tailgate
npm install
```

### Run the App

```bash
# Start the Expo dev server
npm start

# Open on Android
npm run android

# Open on iOS
npm run ios

# Open in browser
npm run web
```

Scan the QR code with Expo Go or press `a`/`i` to open in a simulator.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run android` | Open on Android |
| `npm run ios` | Open on iOS |
| `npm run web` | Open in browser |

## Project Structure

```
tailgate/
├── app/                    # expo-router screens (file-based routing)
│   ├── _layout.tsx         # Root tab navigator
│   ├── index.tsx           # Dashboard screen
│   ├── games.tsx           # Games browser
│   ├── analysts.tsx        # Analysts list
│   ├── analyst/
│   │   └── [id].tsx        # Analyst detail (dynamic route)
│   ├── picks.tsx           # Picks & Insights
│   ├── leaderboard.tsx     # Leaderboard
│   └── community.tsx       # Community posts
├── components/             # Reusable UI components
│   ├── AnalystCard.tsx
│   ├── CommunitySectionComponent.tsx
│   ├── FilterChips.tsx
│   ├── GameCard.tsx
│   ├── LeaderboardRow.tsx
│   ├── PickCard.tsx
│   └── StatCard.tsx
├── lib/
│   ├── types.ts            # Shared TypeScript interfaces
│   └── mockData.ts         # Mock data (5 leagues, 20 teams, 15 games, 10 analysts, 20 picks, 15 posts)
├── database/
│   └── schema.sql          # Supabase-ready PostgreSQL schema with RLS
├── app.json                # Expo config
├── babel.config.js
├── package.json
└── tsconfig.json
```

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| `#1a1a2e` | Deep navy | Background |
| `#16213e` | Card background | Cards, panels |
| `#0f3460` | Mid navy | Borders, secondary bg |
| `#6c63ff` | Purple | Primary accent, CTA |
| `#2ecc71` | Green | Wins, positive |
| `#e74c3c` | Red | Losses, negative |
| `#e67e22` | Orange | Push, warning |
| `#ffffff` | White | Primary text |
| `#a0a0a0` | Gray | Secondary text |

## Features

- 📊 **Dashboard** — Quick stats, featured games, top analysts, recent picks
- 🏈 **Games** — Browse all games with league filters, win probability bars, recent form
- 👥 **Analysts** — Follow/unfollow analysts, view profiles and performance stats
- ⭐ **Picks** — Expert picks with confidence ratings, reasoning, and results
- 🏆 **Leaderboard** — Ranked analysts by accuracy with trend indicators
- 💬 **Community** — Sports discussion feed with post creation

## Backend (Supabase)

The `database/schema.sql` file contains a production-ready PostgreSQL schema including:

- Row Level Security (RLS) policies on every table
- Proper indexes for common query patterns
- Tables: `profiles`, `follows`, `leagues`, `teams`, `games`, `picks`, `posts`, `comments`, `likes`, `analyst_stats`

To bootstrap: create a Supabase project, then run the schema in the SQL editor.