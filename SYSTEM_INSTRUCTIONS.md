# System Instructions for SnapMeal Development

This document provides comprehensive guidance for building new features and investigating bugs in the SnapMeal Progressive Web Application.

## Project Overview

SnapMeal is a Next.js 15 PWA for meal logging with AI-powered nutritional analysis, built with Firebase backend services and Google Gemini AI integration.

**Core Technologies:**
- Next.js 15 with App Router and Turbopack
- Firebase (Auth, Firestore, Storage, App Hosting)
- Google Genkit for AI workflows with Gemini vision model
- TanStack React Query for server state management
- Shadcn/ui component library with Radix UI primitives
- Biome for linting and formatting
- Sentry for error monitoring

## Development Workflow

### 1. Project Setup & Navigation

**Always start by understanding the current working directory:**
```bash
# Check current location
pwd
# Navigate to project root if needed
cd /home/developer/workspace
```

**Key project structure:**
- `src/app/` - Next.js App Router pages
- `src/components/` - Reusable UI components
- `src/actions/` - Next.js server actions
- `src/hooks/` - Custom React hooks (queries/mutations)
- `src/types/` - TypeScript type definitions
- `src/ai/` - Genkit AI workflows
- `docs/` - Project documentation

### 2. Task Planning with Taskmaster AI

**For complex features or bug investigations, always use TodoWrite to plan:**

```typescript
// Example task breakdown
TodoWrite([
  {id: "investigate-issue", content: "Analyze error logs and identify root cause", status: "pending", priority: "high"},
  {id: "implement-fix", content: "Implement solution with proper error handling", status: "pending", priority: "high"},
  {id: "test-solution", content: "Test fix and run type checking", status: "pending", priority: "medium"},
  {id: "update-docs", content: "Update documentation if needed", status: "pending", priority: "low"}
])
```

**Always mark tasks as in_progress when starting and completed when finished.**

### 3. Code Investigation Strategies

#### For New Features:
1. **Read existing similar components** to understand patterns
2. **Check the type definitions** in `src/types/`
3. **Review server actions** in `src/actions/` for backend patterns
4. **Examine mutation hooks** in `src/hooks/mutations/` for state management
5. **Study component structure** in `src/components/`

#### For Bug Investigation:
1. **Reproduce the error** in development environment
2. **Check console logs** and network requests
3. **Review related files** mentioned in error stack traces
4. **Examine recent changes** that might have introduced the issue
5. **Test with different user states** (authenticated/unauthenticated)

### 4. Development Patterns

#### Server Actions Pattern:
```typescript
// src/actions/example-action.ts
'use server';

import { withSentryServerAction } from '@/lib/sentry-server-action';

async function exampleActionImplementation(data: ExampleData): Promise<Result> {
  // Validation
  if (!data.userId) throw new Error('User ID is required');
  
  // Implementation
  return processData(data);
}

export const exampleAction = withSentryServerAction('exampleAction', exampleActionImplementation);
```

#### React Query Mutation Pattern:
```typescript
// src/hooks/mutations/use-example-mutation.ts
'use client';

import { exampleAction } from '@/actions/example-action';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useExampleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ExampleData) => {
      return exampleAction(data);
    },
    onSuccess: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['example-data'] });
    },
    onError: (error) => {
      console.error('Example action failed:', error);
    },
  });
}
```

#### React Query Query Pattern:
```typescript
// src/hooks/queries/use-fetch-example-data.ts
'use client';

import { fetchExampleData } from '@/actions/fetch-example-data';
import type { ExampleData } from '@/types';
import { useQuery } from '@tanstack/react-query';

/**
 * Custom hook that fetches example data for a user
 * @param userId - The user ID to fetch data for
 * @param enabled - Whether the query should be enabled
 */
export function useFetchExampleData(userId: string | undefined, enabled = true) {
  return useQuery<ExampleData[]>({
    queryKey: ['example-data', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User ID is required');
      return fetchExampleData(userId);
    },
    enabled: !!userId && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes (formerly cacheTime)
  });
}
```

#### React Query Infinite Query Pattern:
```typescript
// src/hooks/queries/use-fetch-paginated-data.ts
'use client';

import { fetchPaginatedData } from '@/actions/fetch-paginated-data';
import type { DataPage } from '@/types';
import { useInfiniteQuery } from '@tanstack/react-query';

interface DataPage {
  data: ExampleData[];
  lastDocId: string | null;
  lastCursor: string | null;
  hasMore: boolean;
}

export function useFetchPaginatedData(userId: string | undefined, limit = 10) {
  return useInfiniteQuery<DataPage>({
    queryKey: ['paginated-data', userId],
    queryFn: async ({ pageParam }) => {
      if (!userId) throw new Error('User ID is required');
      return fetchPaginatedData(userId, limit, pageParam);
    },
    initialPageParam: { docId: null, date: null },
    getNextPageParam: (lastPage) => {
      // Return undefined to disable further fetching
      if (!lastPage.hasMore || !lastPage.lastDocId || !lastPage.lastCursor) {
        return undefined;
      }
      return {
        docId: lastPage.lastDocId,
        date: lastPage.lastCursor,
      };
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
```

#### Component Pattern with Error Handling:
```typescript
'use client';

import { useExampleMutation } from '@/hooks/mutations';
import { useToast } from '@/hooks/use-toast';

export function ExampleComponent() {
  const { toast } = useToast();
  const exampleMutation = useExampleMutation();

  const handleAction = async () => {
    try {
      await exampleMutation.mutateAsync(data);
      toast({
        title: 'Success',
        description: 'Action completed successfully.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Action failed. Please try again.',
      });
    }
  };

  return (
    <Button 
      onClick={handleAction}
      disabled={exampleMutation.isPending}
    >
      {exampleMutation.isPending ? 'Processing...' : 'Submit'}
    </Button>
  );
}
```

### 5. React Context Patterns

#### Context Creation Pattern:
```typescript
// src/context/example-context.tsx
'use client';

import { createContext, useContext, useCallback, useMemo, type ReactNode } from 'react';
import { useAuth } from './auth-context';
import { useExampleQuery, useExampleMutation } from '@/hooks';

interface ExampleContextType {
  data: ExampleData[];
  loading: boolean;
  addItem: (item: ExampleItem) => void;
  updateItem: (id: string, updates: Partial<ExampleItem>) => void;
  deleteItem: (id: string) => void;
  getItemById: (id: string) => ExampleItem | undefined;
}

const ExampleContext = createContext<ExampleContextType | undefined>(undefined);

export function ExampleProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  // React Query hooks for data management
  const { data, isLoading } = useExampleQuery(user?.uid);
  const { mutateAsync: addItemAsync } = useExampleMutation();
  
  // Context methods
  const addItem = useCallback(async (item: ExampleItem) => {
    if (!user?.uid) return;
    await addItemAsync({ ...item, userId: user.uid });
  }, [user?.uid, addItemAsync]);
  
  const getItemById = useCallback((id: string) => {
    return data?.find(item => item.id === id);
  }, [data]);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    data: data || [],
    loading: isLoading,
    addItem,
    updateItem,
    deleteItem,
    getItemById,
  }), [data, isLoading, addItem, updateItem, deleteItem, getItemById]);
  
  return (
    <ExampleContext.Provider value={contextValue}>
      {children}
    </ExampleContext.Provider>
  );
}

// Custom hook to use the context
export function useExample() {
  const context = useContext(ExampleContext);
  if (context === undefined) {
    throw new Error('useExample must be used within an ExampleProvider');
  }
  return context;
}
```

#### Context Usage in Components:
```typescript
// In a component
import { useExample } from '@/context/example-context';

function ExampleComponent() {
  const { data, loading, addItem, getItemById } = useExample();
  
  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      {data.map(item => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  );
}
```

#### Context Provider Setup:
```typescript
// In app layout or root component
import { ExampleProvider } from '@/context/example-context';
import { AuthProvider } from '@/context/auth-context';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ExampleProvider>
        {children}
      </ExampleProvider>
    </AuthProvider>
  );
}
```

### 6. Context7 Integration

#### When to Use Context7:
- When you need **real-time information** or latest updates
- When you require **external knowledge** beyond the project scope
- When investigating **new technologies** or **best practices**
- When you need **research assistance** for complex problems

#### Context7 Usage Pattern:
```typescript
// Example: Using Context7 for research
// When you encounter an unfamiliar error or need latest information:
// 1. Identify what information you need
// 2. Use Context7 to get current, comprehensive information
// 3. Apply the information to solve the problem

// Context7 can help with:
// - Latest documentation for libraries
// - Current best practices
// - Error resolution strategies
// - Technology comparisons
// - Implementation guidance
```

#### Integration with Development Workflow:
1. **Problem Identification**: Determine if you need external knowledge
2. **Context7 Query**: Use Context7 to gather relevant, up-to-date information
3. **Apply Knowledge**: Implement solutions based on Context7 insights
4. **Document Findings**: Update system instructions or project docs with new learnings

### 7. Common Issue Investigation

#### Firebase Storage Permission Errors:
```bash
# Check Firebase configuration
ls -la | grep firebase
# Look for firestore.rules, storage.rules
# Check Firebase console for security rules
# Verify authentication state
```

#### Type Errors:
```bash
# Always run type checking
npm run typecheck
# Check import paths and type definitions
# Review src/types/ for required interfaces
```

#### Build/Runtime Errors:
```bash
# Check development server
npm run dev
# Review console for errors
# Check network tab for failed requests
# Verify environment variables
```

### 6. Code Quality Standards

#### Before Committing:
```bash
# Type checking
npm run typecheck

# Code formatting
npm run biome:format

# Linting
npm run biome:check

# Build verification
npm run build
```

#### File Organization:
- **Components**: Use existing patterns in `src/components/`
- **Types**: Define in `src/types/` and export from `index.ts`
- **Hooks**: Separate queries and mutations, export from `index.ts`
- **Actions**: Follow Sentry wrapper pattern
- **Styling**: Use Shadcn/ui components and Tailwind classes

### 7. Testing & Validation

#### Manual Testing Checklist:
- [ ] Feature works in development environment
- [ ] Error states display properly
- [ ] Loading states are handled
- [ ] Toast notifications appear
- [ ] Type checking passes
- [ ] No console errors
- [ ] Mobile responsive (PWA)
- [ ] Authentication states handled

#### Automated Checks:
```bash
# Run these before considering work complete
npm run typecheck    # TypeScript validation
npm run biome:check  # Linting and formatting
npm run build        # Production build test
```

### 8. Documentation Requirements

#### For New Features:
1. **Create PRD** using Task Master workflow (see PRD section below)
2. **Update CLAUDE.md** if architecture changes
3. **Create/update component documentation**
4. **Add type definitions with JSDoc comments**
5. **Update README.md** if setup process changes

#### For Bug Fixes:
1. **Document root cause** in commit message
2. **Update error handling** if needed
3. **Add preventive measures** to avoid recurrence

### 8. Task Master PRD Workflow

#### PRD Creation Process:
1. **Start with Template**: Use `.taskmaster/templates/prd_template.txt`
2. **Focus on Single Feature**: Don't try to document entire application
3. **Provide Context**: Include extensive background for better AI results
4. **Iterate with AI**: Use Task Master for refinement and task generation

#### PRD Best Practices:
- **Clear Objective**: Define specific, measurable goals
- **System Context**: Describe existing architecture and constraints
- **User-Focused**: Start with user problems and value
- **Testable Requirements**: Write requirements that can be validated
- **Technical Reasoning**: Explain why you chose specific approaches

#### PRD File Organization:
```
.taskmaster/
├── docs/                 # Store all PRDs here
│   ├── feature_name.txt  # Use descriptive, clear filenames
│   └── bug_fix_name.txt  # For significant bug investigations
├── templates/
│   └── prd_template.txt  # Standard PRD template
└── tasks.json           # Generated by task-master parse-prd
```

#### Task Master Integration:
```bash
# Create PRD from template
cp .taskmaster/templates/prd_template.txt .taskmaster/docs/new_feature.txt

# Edit PRD with specific details
# Use Context7 for research if needed

# Parse PRD to generate tasks
task-master parse-prd .taskmaster/docs/new_feature.txt

# Review generated tasks.json
# Iterate and refine PRD as needed
```

#### PRD Workflow with Taskmaster AI:
1. **Planning Phase**: Use TodoWrite to break down PRD creation
2. **Research Phase**: Use Context7 for external information gathering  
3. **Documentation Phase**: Fill out PRD template systematically
4. **Task Generation**: Use `task-master parse-prd` for implementation planning
5. **Implementation Phase**: Use generated tasks as development roadmap

### 9. Firebase-Specific Guidance

#### Common Firebase Issues:
- **Storage permissions**: Check Firebase Console → Storage → Rules
- **Auth issues**: Verify user authentication state
- **Firestore permissions**: Check security rules
- **Environment variables**: Verify all Firebase config is set

#### Firebase Security Rules Pattern:
```javascript
// Firestore example
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}

// Storage example
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 10. Error Resolution Process

#### Step-by-Step Debug Process:
1. **Reproduce** the error consistently
2. **Identify** the error type (client/server/network/permissions)
3. **Locate** the relevant code files
4. **Check** recent changes that might have caused it
5. **Test** potential solutions in isolation
6. **Implement** fix with proper error handling
7. **Verify** fix works across different scenarios
8. **Update** documentation if needed

#### Common Error Categories:
- **Type Errors**: Check imports, interfaces, and type definitions
- **Runtime Errors**: Check authentication, data validation, API calls
- **Permission Errors**: Check Firebase security rules and user auth
- **Build Errors**: Check dependencies, environment variables, config files

### 11. Best Practices Summary

#### Code:
- Follow existing project patterns and conventions
- Use TypeScript strictly with proper type definitions
- Implement comprehensive error handling
- Provide user feedback for all actions
- Use React Query for server state management

#### Process:
- Plan complex work with TodoWrite
- Update task status as work progresses
- Run quality checks before completion
- Test thoroughly in development
- Document significant changes

#### Debugging:
- Start with understanding the current state
- Use systematic investigation approach
- Check logs, network requests, and console output
- Test fixes incrementally
- Verify solutions work for different user states

---

## Quick Reference Commands

```bash
# Development
npm run dev              # Start development server
npm run typecheck        # TypeScript validation
npm run biome:format     # Format code
npm run biome:check      # Lint and format check
npm run build           # Production build

# AI Development
npm run genkit:dev       # Start Genkit AI development server
npm run genkit:watch     # Watch mode for AI development

# Navigation
cd /home/developer/workspace  # Project root
ls src/                      # Check source structure

# Context7 - Use when you need external knowledge or latest information
# Available as MCP tool - helps with research, latest docs, best practices

# Task Master PRD
task-master parse-prd .taskmaster/docs/[feature_name].txt  # Generate tasks from PRD
# Review generated tasks.json and iterate PRD as needed
```

## Context & Pattern Quick Reference

```typescript
// React Query Patterns
useQuery()           // For fetching data
useMutation()        // For data mutations
useInfiniteQuery()   // For paginated data

// Context Pattern
createContext() + useContext() + Provider
// Always memoize context values and callbacks

// SnapMeal Contexts Available
useAuth()           // Authentication state
useMealLog()        // Meal logging operations
useSharedLog()      // Shared meal logs

// Server Actions Pattern
withSentryServerAction(name, implementation)
```

This system instruction should be referenced at the beginning of any development session to ensure consistent, high-quality work on the SnapMeal project.