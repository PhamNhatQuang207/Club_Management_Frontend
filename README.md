# 🎱 CLUB Management System - Frontend (React)

Real-time interactive live map for billiards and bowling clubs.

## 📝 Project Overview

A lightweight Single Page Application (SPA) built with React and Vite. This app serves as the visual interface for club customers and administrators to track and manage resource availability in real time.

- **Client Experience**: A dynamic, SVG-driven floor plan showing live status.
- **Admin Dashboard**: A fast, mobile-responsive interface for staff to toggle table states.
- **Architecture**: Communicates with a NestJS backend via REST (initial fetch) and WebSockets (live updates).

## 🛠 Tech Stack

- **Build Tool**: Vite (fast, modern development experience)
- **Library**: React 18/19
- **State Management**: TanStack Query (React Query)
- **Real-time**: Socket.io-client
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS + Shadcn UI
- **Animations**: Framer Motion

## 🤖 AI Agent Guidelines

> **IMPORTANT**: AI agents must follow these architectural constraints for the React SPA.

### 1) Project Organization

**Folder structure**:

- `/src/components`: Reusable UI components.
- `/src/features`: Domain-specific logic (e.g., `/features/map`, `/features/admin`).
- `/src/hooks`: Custom hooks for Socket.io and API calls.
- `/src/pages`: Main routes (Home, Admin, Login).

**SVG management**:

- Store the floor plan as a React component (`/components/FloorPlan.tsx`) to allow dynamic prop injection into SVG elements.

### 2) Networking & Lifecycle

- **Socket lifecycle**: Initialize the Socket.io connection in a `SocketProvider` wrapping the main `App`. Clean up listeners on unmount to prevent memory leaks.
- **API integration**: Use Axios or Fetch within TanStack Query hooks.
- **Environment handling**: Use `import.meta.env.VITE_BACKEND_URL` for backend connectivity.

### 3) Real-time UX Strategy

- **Event handling**: Listen for `status_changed` events. Update the local cache of TanStack Query immediately to reflect changes across all components.
- **Visual cues**: When a table status changes, use Framer Motion to animate the color transition (e.g., a smooth fade from green to red).
- **Timer logic**: For occupied tables, implement a local timer that calculates “Time Elapsed” based on the `started_at` timestamp provided by the backend.

### 4) Admin Guard

- **Simplistic UI**: The Admin route must be optimized for one-handed use on mobile devices, featuring large, high-contrast toggle buttons.

## 🚀 Development Setup

### Environment variables

Create a `.env` file:

```env
VITE_BACKEND_URL=http://localhost:3000
```

### Installation

```bash
npm install
```

### Launch

```bash
npm run dev
```