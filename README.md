# Tailgate 🏈🏀⚾🏒⚽

**Social Sports Analytics & Community App**

A mobile app built with Expo React Native TypeScript for sports analytics, analyst picks, leaderboards, and community discussions.

## Prerequisites

- Node.js 18+
- npm 9+
- Expo Go app on iOS/Android (for device testing)

## Installation

```bash
npm install
```

## Running the App

```bash
# Start Expo development server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run in web browser
npx expo start --web
```

Scan the QR code with the **Expo Go** app to run on your physical device.

## Project Structure

```
Tailgate/
├── app/                      # Expo Router screens (file-based routing)
│   ├── _layout.tsx           # Root layout with tab navigation
│   ├── index.tsx             # Dashboard screen
│   ├── games.tsx             # Games list with league filter
│   ├── analysts.tsx          # Analysts list with search
│   ├── analyst/[id].tsx      # Dynamic analyst profile
│   ├── picks.tsx             # Picks/Insights feed
│   ├── leaderboard.tsx       # Analyst leaderboard
│   └── community.tsx         # Community discussions
│
├── components/               # Reusable UI components
│   ├── GameCard.tsx
│   ├── AnalystCard.tsx
│   ├── PickCard.tsx
│   ├── LeaderboardRow.tsx
│   ├── StatCard.tsx
│   └── FilterChips.tsx
│
├── lib/
│   ├── types.ts              # TypeScript type definitions
│   └── mockData.ts           # Mock data (25+ games, 10 analysts, 20+ picks)
│
├── database/
│   └── schema.sql            # PostgreSQL schema for Supabase
│
└── assets/                   # App icons and splash screen
```

## Features

- **Dashboard** – Quick stats, featured games, trending analysts, recent picks
- **Games** – Filtered game list with win probability bars and form indicators
- **Analysts** – Searchable analyst list with follow/unfollow
- **Analyst Profiles** – Stats grid, league accuracy charts, pick history
- **Picks** – Feed with result/league filters and like system
- **Leaderboard** – Ranked analysts with movement indicators
- **Community** – Post creation modal, discussion feed with league filters

## Tech Stack

| Technology | Version |
|-----------|---------|
| Expo SDK | ~51.0.0 |
| React Native | 0.74.5 |
| TypeScript | ~5.3.3 |
| Expo Router | ~3.5.0 |
| @expo/vector-icons | ^14.0.0 |

## Future Backend

`database/schema.sql` contains a complete PostgreSQL/Supabase-ready schema with RLS policies.
