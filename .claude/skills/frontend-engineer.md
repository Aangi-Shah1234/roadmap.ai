# Frontend Engineering Skill & Standards

## Purpose
Establishes modern frontend engineering practices for Next.js 15 App Router, React 19, Tailwind CSS, and interactive canvas visualizations.

## Core Rules & Patterns
1. **Component Separation**:
   - Keep Server Components as the default for data fetching and static rendering.
   - Use `"use client"` only at leaf components requiring React hooks (`useState`, `useEffect`, `useCallback`) or browser events.
2. **Interactive Canvas (React Flow)**:
   - Always memoize custom node types: `nodeTypes = useMemo(() => ({ ... }), [])`.
   - Use graph layout algorithms (Dagre / Elk) to arrange nodes systematically instead of hardcoding absolute pixel coordinates.
   - Handle smooth zoom, pan, and responsive resizing gracefully.
3. **State Management & Optimistic Updates**:
   - For learner interactions (marking topics done), trigger optimistic UI feedback before waiting for server roundtrip.
   - Keep forms accessible with clear validation errors and disabled loading states.
4. **Performance**:
   - Prevent layout shift with proper skeleton loaders.
   - Ensure dynamic imports for heavy components that are only needed conditionally.
