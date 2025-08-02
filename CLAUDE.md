# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 IMPORTANT: Workspace Setup

**ALWAYS START HERE when beginning a new session:**

1. **Navigate to SnapMeal workspace:**
   ```bash
   cd /home/developer/workspace
   pwd  # Should show: /home/developer/workspace
   ```

2. **Verify you're in the correct project:**
   - Look for `package.json` with SnapMeal project
   - Check for `src/` directory with Next.js app structure
   - Confirm `.taskmaster/` directory exists with PRDs and templates

3. **Check MCP server status:**
   ```bash
   claude mcp list
   # Should show: context7 ✓ Connected, taskmaster-ai ✓ Connected
   ```

4. **Reference key files:**
   - `SYSTEM_INSTRUCTIONS.md` - Complete development guidance
   - `.taskmaster/docs/` - PRDs for implemented features
   - `docs/mcp-server-setup.md` - MCP server configuration guide

5. **🧪 PENDING: Unit Testing Implementation**
   - **Status**: Phase 1.1 complete, Phase 1.2+ pending
   - **Framework**: Vitest configured and ready
   - **Next Tasks**: Complete test utilities setup, resolve npm dependencies
   - **PRD**: See `.taskmaster/docs/unit_testing_implementation.txt`
   - **Progress**: TodoRead will show current testing tasks
   - **Priority**: High - Continue unit testing implementation

**If MCP servers are not connected, run:**
```bash
claude mcp add taskmaster-ai "npx -y --package=task-master-ai task-master-ai"
claude mcp add context7 "npx @upstash/context7-mcp"
```

## Project: SnapMeal

SnapMeal is a meal logging Progressive Web App built with Next.js 15 that allows users to capture photos of their meals and estimate calories/macros using AI vision. The app uses Firebase for backend services and Google's Gemini AI for food analysis.

## Development Commands

**Start Development Server:**
```bash
npm run dev
# Runs on port 9005 with Turbopack for fast development
```

**AI Development:**
```bash
npm run genkit:dev    # Start Genkit AI development server
npm run genkit:watch  # Watch mode for AI development
```

**Code Quality:**
```bash
npm run typecheck     # TypeScript type checking
npm run biome:check   # Lint and format checking with Biome
npm run biome:format  # Auto-format code with Biome
npm run lint          # Next.js linting
```

**Build & Deploy:**
```bash
npm run build         # Production build
npm run start         # Start production server
npm run version:bump-build  # Update build number
```

## Architecture Overview

### Core Technologies
- **Next.js 15** with App Router and Turbopack
- **Firebase** (Auth, Firestore, Storage, App Hosting)
- **Google Genkit** for AI workflows with Gemini vision model
- **TanStack React Query** for server state management
- **Shadcn/ui** component library with Radix UI primitives
- **Biome** for linting and formatting (replaces ESLint/Prettier)
- **Sentry** for error monitoring and performance tracking

### Key Architectural Patterns

**1. Server Actions Pattern:**
- All database operations use Next.js server actions in `src/actions/`
- Type-safe with Zod validation
- Firebase Admin SDK for server-side operations

**2. AI Integration:**
- `src/ai/` contains Genkit-based AI workflows
- Multimodal vision processing with Gemini
- Custom flows for calorie/macro estimation from meal photos

**3. State Management:**
- React Query for server state and caching
- React Context for authentication (`AuthContext`), meal logs (`MealLogContext`), and shared logs (`SharedLogContext`)
- React Hook Form with Zod validation for forms

**4. Component Organization:**
```
src/components/
├── auth/          # Login/register forms
├── layout/        # App and auth layout wrappers
├── meal/          # Meal logging, estimation, and display components
├── profile/       # User profile components
├── shared/        # Reusable components like ImageCapture
└── ui/           # Shadcn/ui design system components
```

**5. Mobile/PWA Features:**
- Capacitor integration for native camera access
- PWA Elements for web camera functionality
- Progressive Web App configuration

### Firebase Integration

**Authentication:**
- Firebase Auth with context provider in `src/context/auth-context.tsx`
- Server-side auth validation using Firebase Admin SDK

**Database:**
- Firestore collections: `users`, `meals`
- Server actions handle all CRUD operations
- Type-safe with interfaces in `src/types/`

**Storage:**
- Firebase Storage for meal images
- Image optimization and remote patterns configured in `next.config.ts`

### Code Style & Standards

**Biome Configuration:**
- 2-space indentation, single quotes, semicolons required
- Line width: 100 characters
- Auto-organize imports and format on save

**TypeScript:**
- Strict configuration with `noEmit` for type checking
- Build errors ignored (set `ignoreBuildErrors: true`)
- Comprehensive type definitions in `src/types/`

### Environment Configuration

**Feature Flags:**
- Sharing feature controlled via `NEXT_PUBLIC_ENABLE_SHARING_FEATURE`
- Managed in `src/lib/config.ts`

**Firebase Config:**
- All Firebase settings via environment variables
- Validation in both client (`firebase.ts`) and server (`firebase-admin.ts`)

**Secrets Management:**
- Firebase Admin SDK credentials via Google Secret Manager
- Gemini API key stored as secret
- Configured in `apphosting.yaml`

### Error Handling & Monitoring

**Sentry Integration:**
- Automatic error tracking and performance monitoring
- Custom error boundaries in `src/components/shared/sentry-error-boundary/`
- Source maps uploaded in production builds

**Development Notes:**
- Use `npm run typecheck` before committing changes
- Format code with `npm run biome:format`
- AI development requires Genkit CLI: `npm run genkit:dev`
- Camera features require HTTPS in production or `localhost` in development
- Container development available via `claude/` directory with Docker configuration

### Deployment

**Firebase App Hosting:**
- Configured via `apphosting.yaml`
- Auto-scaling: 2-10 instances, 1GB memory, 2 CPU
- Environment variables and secrets managed through Firebase console