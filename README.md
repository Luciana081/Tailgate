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

## Live Scores and Odds

Tailgate can connect to [The Odds API](https://the-odds-api.com/) for live scores, upcoming games, and betting odds. The API key is kept out of the mobile app by using a small local proxy server.

### 1. Create your environment file

Copy `.env.example` to `.env`, then add your real API key:

```bash
THE_ODDS_API_KEY=your_the_odds_api_key_here
EXPO_PUBLIC_ODDS_PROXY_URL=http://localhost:8787
```

For Expo web on the same computer, `http://localhost:8787` is fine.

For Expo Go on your phone, replace `localhost` with your computer's local network IP address:

```bash
EXPO_PUBLIC_ODDS_PROXY_URL=http://192.168.1.25:8787
```

Your phone and computer must be on the same Wi-Fi network.

### 2. Start the odds proxy

Open a terminal in the project folder and run:

```bash
npm run proxy
```

Leave this terminal running.

### 3. Start the app

Open a second terminal in the project folder and run:

```bash
npm start
```

The Games screen will use live data when the proxy and API key are available. If not, it will fall back to mock data so the app still runs.

## User Login

Tailgate uses Supabase Auth for email/password accounts. Create a Supabase project, then copy your Project URL and anon/publishable key into `.env`:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_or_publishable_key
```

These two `EXPO_PUBLIC_` values are allowed in the app. Supabase protects private data with Auth and Row Level Security. Do not put a Supabase service role key in the Expo app.

After changing `.env`, restart Expo:

```bash
npx expo start --clear
```

If new users are asked to confirm email, either check the email inbox or change the setting in your Supabase Auth dashboard during local testing.

## Saving Picks to Supabase

User-created picks can sync across devices with Supabase. In your Supabase dashboard, open **SQL Editor**, paste the contents of `database/user_picks.sql`, and run it once.

After that, picks created from the Games tab are saved to the signed-in user's Supabase account. If the table is missing or Supabase is unavailable, the app falls back to local device storage so the pick flow still works during development.

## Admin Login

Admins use the same login screen as regular users. To make an account an admin, add that email address to `.env`:

```bash
EXPO_PUBLIC_ADMIN_EMAILS=your-email@example.com
```

For multiple admins, separate emails with commas:

```bash
EXPO_PUBLIC_ADMIN_EMAILS=you@example.com,partner@example.com
```

After changing admin emails, restart Expo:

```bash
npx expo start --clear
```

Admin accounts see an Admin button in the dashboard account bar. The current admin screen is a protected placeholder for app-management tools; production database edits should be backed by Supabase admin-only policies before launch.

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Expo dev server |
| `npm run proxy` | Start local The Odds API proxy server |
| `npm run android` | Open on Android |
| `npm run ios` | Open on iOS |
| `npm run web` | Open in browser |

## Project Structure

```
tailgate/
├── app/                    # expo-router screens (file-based routing)
│   ├── _layout.tsx         # Root tab navigator
│   ├── admin.tsx           # Protected admin console placeholder
│   ├── index.tsx           # Dashboard screen
│   ├── games.tsx           # Games browser
│   ├── analysts.tsx        # Analysts list
│   ├── analyst/
│   │   └── [id].tsx        # Analyst detail (dynamic route)
│   ├── picks.tsx           # Picks & Insights
│   ├── leaderboard.tsx     # Leaderboard
│   ├── profile.tsx         # User profile and pick stats
│   └── community.tsx       # Community posts
├── components/             # Reusable UI components
│   ├── AccountBar.tsx
│   ├── AnalystCard.tsx
│   ├── AuthScreen.tsx
│   ├── CommunitySectionComponent.tsx
│   ├── FilterChips.tsx
│   ├── GameCard.tsx
│   ├── LeaderboardRow.tsx
│   ├── PickCard.tsx
│   └── StatCard.tsx
├── lib/
│   ├── AuthContext.tsx     # Supabase auth session state
│   ├── supabase.ts         # Supabase client
│   ├── types.ts            # Shared TypeScript interfaces
│   ├── oddsApi.ts          # Live scores/odds client
│   └── mockData.ts         # Mock data (5 leagues, 20 teams, 15 games, 10 analysts, 20 picks, 15 posts)
├── server/
│   └── oddsProxy.js        # Local proxy for The Odds API
├── database/
│   ├── schema.sql          # Supabase-ready PostgreSQL schema with RLS
│   └── user_picks.sql      # User-created picks table for Supabase sync
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
- 🏈 **Games** — Browse live games with league filters, odds, and tracked pick creation
- 👥 **Analysts** — Follow/unfollow analysts, view profiles and performance stats
- ⭐ **Picks** — User-created and expert picks with confidence ratings, reasoning, and results
- 🏆 **Leaderboard** — Ranked analysts by accuracy with trend indicators
- 💬 **Community** — Sports discussion feed with post creation
- 👤 **Profile** — Username, avatar URL, favorite sports, and real user pick stats

## Backend (Supabase)

The `database/schema.sql` file contains a production-ready PostgreSQL schema including:

- Row Level Security (RLS) policies on every table
- Proper indexes for common query patterns
- Tables: `profiles`, `follows`, `leagues`, `teams`, `games`, `picks`, `posts`, `comments`, `likes`, `analyst_stats`

To bootstrap: create a Supabase project, then run the schema in the SQL editor.
