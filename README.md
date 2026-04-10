# Todo List Collaboration Mobile App

A simple Expo React Native mobile app for managing shared tasks with a lightweight collaboration experience.

## Features

- Shared team todo board
- Task assignment to collaborators
- Filters for `All`, `Open`, `Done`, and `Mine`
- Activity feed for recent team updates
- Invite/share action and simulated teammate updates
- Mobile-friendly UI built in a single screen for quick demo and extension

## Run locally

```bash
npm install
npm start
```

Then scan the QR code using **Expo Go**, or press:

- `a` for Android emulator
- `i` for iOS simulator
- `w` for web preview

## Project files

- `App.tsx` — main Todo + collaboration UI
- `package.json` — Expo app scripts and dependencies
- `app.json` — Expo configuration

## Next upgrade ideas

- Connect to Supabase or Firebase for true real-time sync
- Add authentication and shared workspaces
- Store tasks in a database instead of in-memory state
- Push notifications for assignments and due dates
