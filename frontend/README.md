# AI Learning Platform - Frontend

A premium Next.js 14 dashboard for AI-powered learning and productivity tools.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Radix UI**
- **Framer Motion**
- **Lucide Icons**

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

### Build

```bash
npm run build
npm start
```

## Features

### Layout Architecture
- Fixed sidebar (desktop) with collapsible mobile view
- Sticky header with persona switcher
- Responsive grid layouts
- Smooth animations and transitions

### Persona System
The app supports three persona modes:
- **Beginner**: Friendly tone, spacious layout, expanded explanations
- **Student**: Academic tone, balanced density, mixed content
- **Senior**: Professional tone, compact layout, efficient interface

Switch personas using the dropdown in the header.

### Pages
- `/dashboard` - Main dashboard with feature cards
- `/summarize` - Document summarization (placeholder)
- `/mcqs` - MCQ generation (placeholder)
- `/code` - Code intelligence (placeholder)
- `/simplify` - Concept simplification (placeholder)

## Project Structure

```
frontend/
├── app/
│   ├── (dashboard)/          # Dashboard route group
│   │   ├── layout.tsx        # Dashboard layout with sidebar
│   │   ├── dashboard/        # Main dashboard page
│   │   ├── summarize/        # Feature pages
│   │   ├── mcqs/
│   │   ├── code/
│   │   └── simplify/
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── layout/               # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── MainContent.tsx
│   └── dashboard/            # Dashboard components
│       └── FeatureCard.tsx
├── contexts/
│   └── PersonaContext.tsx    # Persona state management
└── lib/
    └── utils.ts              # Utility functions
```

## Design System

See `../design.md` for complete design guidelines including:
- Color palette
- Typography scale
- Spacing system
- Animation guidelines
- Component patterns

## Accessibility

- WCAG AA compliant contrast ratios
- Keyboard navigation support
- Focus indicators on all interactive elements
- ARIA labels and roles
- Semantic HTML structure

## Development Notes

- All feature pages are placeholders - no backend integration yet
- Persona system is scaffolded but only affects UI copy and tone
- Layout is fully responsive and production-ready
- Animations are optimized for performance
