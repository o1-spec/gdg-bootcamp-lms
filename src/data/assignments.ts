import { FullAssignment } from '@/types/lms';

export const mockFullAssignments: FullAssignment[] = [
  {
    id: 'build-a-rest-api',
    title: 'Build a REST API',
    trackId: 'backend-development',
    trackName: 'Backend Development',
    trackAccentColor: '#4285F4',
    moduleName: 'Building APIs',
    type: 'Project',
    status: 'in_progress',
    dueDate: 'September 30, 2026',
    dueTime: '11:59 PM',
    daysRemaining: 3,
    points: 100,
    shortDescription: 'Build a REST API for a simple task management system using Node.js and Express.',
    fullDescription:
      'In this project, you will build a production-grade REST API for a team task management application using Node.js, Express, and TypeScript. Your service will support CRUD operations on tasks and projects, adhere to strict REST constraints, validate payloads, and deliver standardized error responses.',
    objectives: [
      'Design predictable resource-based URIs following REST conventions',
      'Handle HTTP methods (GET, POST, PATCH, DELETE) with appropriate status codes',
      'Validate request bodies and route parameters using validation middleware',
      'Implement structured error handling and consistent JSON response envelopes',
      'Write clear developer documentation in a comprehensive README file',
    ],
    expectedOutcome:
      'A GitHub repository containing clean, documented Express code that can be cloned and run locally via `npm run dev`, with all CRUD endpoints tested and functioning.',
    requirements: [
      'Create CRUD endpoints for `/api/v1/tasks` and `/api/v1/projects`',
      'Validate incoming request payloads (reject invalid types with 400 Bad Request)',
      'Use proper HTTP status codes: 200 OK, 201 Created, 204 No Content, 400 Bad Request, 404 Not Found, 500 Internal Server Error',
      'Implement centralized error handling middleware',
      'Organize code cleanly into controllers, services, and routes folders',
      'Add a README.md documenting endpoint schemas and curl/Postman testing commands',
    ],
    submissionInstructions: [
      'Push your completed code to a public or private GitHub repository',
      'Ensure your repository includes a README.md with setup and curl instructions',
      'Provide a deployed URL if hosted on Render, Railway, or Vercel (optional)',
      'Include a short reflection on design trade-offs in the notes section',
    ],
    resources: [
      {
        title: 'Backend Microservices Starter Repository',
        type: 'github',
        url: 'https://github.com',
      },
      {
        title: 'REST API Design Lesson & Notes',
        type: 'notes',
        url: '/tracks/backend-development/lessons/rest-api-design',
      },
      {
        title: 'HTTP Status Codes Quick Reference Sheet',
        type: 'pdf',
        url: '#',
      },
    ],
    submission: {
      status: 'DRAFT',
      githubUrl: 'https://github.com/alex-dev/lasu-task-manager-api',
      liveUrl: 'https://lasu-task-manager.onrender.com',
      notes: 'Currently completing task filter query parameters and writing unit tests for error handler middleware.',
    },
  },
  {
    id: 'postgresql-database-exercise',
    title: 'PostgreSQL Database Exercise',
    trackId: 'backend-development',
    trackName: 'Backend Development',
    trackAccentColor: '#4285F4',
    moduleName: 'Databases',
    type: 'Exercise',
    status: 'not_started',
    dueDate: 'October 4, 2026',
    dueTime: '11:59 PM',
    daysRemaining: 7,
    points: 80,
    shortDescription: 'Design a normalized relational schema with foreign key constraints, indexes, and write optimal analytical SQL queries.',
    fullDescription:
      'Practice designing a normalized database schema in PostgreSQL for an e-commerce platform. You will write DDL scripts creating tables with foreign keys and cascade rules, add B-Tree indexes for frequent queries, and author 5 complex analytical queries using joins and window functions.',
    objectives: [
      'Normalize database schemas to Third Normal Form (3NF)',
      'Create performant foreign key relationships and index patterns',
      'Write aggregated and joined queries using `EXPLAIN ANALYZE`',
    ],
    expectedOutcome:
      'A `.sql` file with schema migrations and analytical queries, along with execution plan cost annotations.',
    requirements: [
      'Define schemas for users, products, orders, and order_items',
      'Add appropriate foreign key constraints with ON DELETE actions',
      'Create composite indexes on high-cardinality search columns',
      'Write 5 analytical reporting queries (e.g., top customers by spend, monthly sales trends)',
    ],
    submissionInstructions: [
      'Submit a GitHub link or gist containing your `schema.sql` and `queries.sql` files',
      'Include query performance results before and after indexing',
    ],
    resources: [
      {
        title: 'PostgreSQL Indexing & Optimization Cheat Sheet',
        type: 'cheatsheet',
        url: '#',
      },
      {
        title: 'Relational Database Modeling Guide',
        type: 'pdf',
        url: '#',
      },
    ],
    submission: {
      status: 'NOT_STARTED',
    },
  },
  {
    id: 'react-dashboard-challenge',
    title: 'React Dashboard Challenge',
    trackId: 'frontend-development',
    trackName: 'Frontend Development',
    trackAccentColor: '#34A853',
    moduleName: 'React Fundamentals',
    type: 'Project',
    status: 'submitted',
    dueDate: 'October 2, 2026',
    dueTime: '6:00 PM',
    daysRemaining: 5,
    points: 100,
    shortDescription: 'Build an interactive dashboard with custom hooks, state management, responsive cards, and dynamic filtering.',
    fullDescription:
      'Construct a high-performance interactive metrics dashboard in React with TypeScript. Use custom hooks for data fetching, build accessible reusable UI components, and implement responsive dark/light theme switching.',
    objectives: [
      'Master component composition and prop drilling avoidance',
      'Implement custom data fetching hooks with loading and error states',
      'Deliver fluid UI interactions and accessible keyboard navigation',
    ],
    expectedOutcome:
      'A deployed React application hosted on Vercel with clean code and a responsive layout.',
    requirements: [
      'Build at least 4 reusable widget cards (Stats, Charts, Activity feed, User list)',
      'Implement multi-criteria filtering and instant client-side search',
      'Handle loading, error, and empty data states gracefully',
      'Ensure 100% responsiveness across mobile, tablet, and desktop',
    ],
    submissionInstructions: [
      'Deploy your project to Vercel or Netlify',
      'Push your source code to a public GitHub repo with a live demo badge',
    ],
    resources: [
      {
        title: 'React Hooks & State Management Architecture Notes',
        type: 'pdf',
        url: '#',
      },
      {
        title: 'Tailwind CSS Layout & Component Patterns',
        type: 'article',
        url: '#',
      },
    ],
    submission: {
      status: 'SUBMITTED',
      githubUrl: 'https://github.com/alex-dev/gdg-react-dashboard',
      liveUrl: 'https://gdg-react-dashboard.vercel.app',
      submittedAt: 'September 27, 2026 at 4:32 PM',
      notes: 'Implemented custom useDebounce for the search bar and added keyboard accessibility focus rings.',
    },
  },
  {
    id: 'binary-search-practice-set',
    title: 'Binary Search Practice Set',
    trackId: 'dsa-interview-prep',
    trackName: 'DSA / Interview Preparation',
    trackAccentColor: '#EA4335',
    moduleName: 'Binary Search',
    type: 'Practice',
    status: 'reviewed',
    dueDate: 'September 28, 2026',
    dueTime: '11:59 PM',
    daysRemaining: 1,
    points: 100,
    shortDescription: 'Solve 6 classic binary search problems spanning monotonic predicate spaces and rotated arrays.',
    fullDescription:
      'Tackle 6 LeetCode/Codeforces style algorithmic challenges requiring binary search. Focus on identifying monotonic predicates, search space reduction, and boundary condition handling without integer overflow.',
    objectives: [
      'Master logarithmic search space reduction',
      'Identify implicit monotonic predicates in optimization problems',
      'Prove algorithmic invariants and edge case bounds',
    ],
    expectedOutcome:
      'Solutions written in Python, C++, or TypeScript with detailed time and space complexity annotations.',
    requirements: [
      'Solve: Binary Search, Search in Rotated Sorted Array, Find Peak Element, Koko Eating Bananas, Capacity to Ship Packages, Median of Two Sorted Arrays',
      'All solutions must achieve O(log N) time complexity',
      'Include time and space complexity analysis comments above each solution',
    ],
    submissionInstructions: [
      'Submit a GitHub repository or LeetCode profile link showing accepted submissions',
    ],
    resources: [
      {
        title: 'Binary Search & Solution Space Masterclass',
        type: 'video',
        url: '#',
      },
      {
        title: 'Blind 75 Algorithm Practice List',
        type: 'practice',
        url: 'https://leetcode.com',
      },
    ],
    submission: {
      status: 'REVIEWED',
      githubUrl: 'https://github.com/alex-dev/dsa-binary-search-solutions',
      liveUrl: 'https://leetcode.com/u/alex_lasu',
      submittedAt: 'September 26, 2026 at 8:15 PM',
      score: 94,
      maxScore: 100,
      mentorName: 'David Kalu (Algorithms Specialist)',
      mentorFeedback:
        'Outstanding work! Your predicate formulation for Koko Eating Bananas was concise and optimal. Be careful with middle point calculation `low + (high - low) // 2` to prevent overflow in statically typed languages.',
    },
  },
  {
    id: 'authentication-mini-project',
    title: 'Authentication Mini Project',
    trackId: 'backend-development',
    trackName: 'Backend Development',
    trackAccentColor: '#4285F4',
    moduleName: 'Authentication & Security',
    type: 'Project',
    status: 'not_started',
    dueDate: 'October 10, 2026',
    dueTime: '11:59 PM',
    daysRemaining: 13,
    points: 100,
    shortDescription: 'Implement secure password hashing with bcrypt, JWT authentication, and refresh token rotation.',
    fullDescription:
      'Build a robust authentication microservice supporting user registration, email verification flows, hashed credentials storage, JWT access tokens, and HTTP-only cookie-based refresh token rotation.',
    objectives: [
      'Understand password salting and hashing mechanics with Argon2/bcrypt',
      'Implement JWT token signing, verification, and expiration handling',
      'Protect routes with role-based access control (RBAC) middleware',
    ],
    expectedOutcome:
      'An authentication server with test coverage demonstrating secure login, token renewal, and protected route access.',
    requirements: [
      'Implement `/auth/register` with salted bcrypt password hashing',
      'Implement `/auth/login` issuing short-lived access JWTs and secure refresh cookies',
      'Implement `/auth/refresh` with token rotation and revocation',
      'Create role-based middleware (`verifyRole([Role.ADMIN])`)',
    ],
    submissionInstructions: [
      'Push your solution to GitHub with an environment example file (`.env.example`) and unit tests',
    ],
    resources: [
      {
        title: 'Node.js Security & Authentication Best Practices',
        type: 'document',
        url: '#',
      },
    ],
    submission: {
      status: 'NOT_STARTED',
    },
  },
  {
    id: 'design-system-component-kit',
    title: 'Design System Component Kit',
    trackId: 'ui-ux-design',
    trackName: 'UI/UX Design',
    trackAccentColor: '#FBBC04',
    moduleName: 'Design Systems',
    type: 'Project',
    status: 'in_progress',
    dueDate: 'October 6, 2026',
    dueTime: '8:00 PM',
    daysRemaining: 9,
    points: 100,
    shortDescription: 'Create a foundational Figma component library with auto-layout, design tokens, and accessibility specs.',
    fullDescription:
      'Develop an atomic design system component library in Figma for the GDG on Campus LASU digital ecosystem. Build auto-layout components, color/typography tokens, and document interactive states.',
    objectives: [
      'Establish consistent typography, spacing, and color token systems',
      'Build responsive components using Figma auto-layout and component properties',
      'Ensure WCAG AA contrast compliance across all interactive elements',
    ],
    expectedOutcome:
      'A published Figma community kit with complete documentation, component variants, and interactive states.',
    requirements: [
      'Set up color tokens for Primary, Neutral, Accent, and Feedback roles',
      'Build Button, Input, Modal, and Card components with hover/active/focus states',
      'Document accessibility guidelines and spacing scale',
    ],
    submissionInstructions: [
      'Share a view-access link to your Figma file with comment permissions enabled for mentors',
    ],
    resources: [
      {
        title: 'GDG LASU Design Systems Specification Guide',
        type: 'pdf',
        url: '#',
      },
      {
        title: 'GDG LASU Figma UI Starter Kit',
        type: 'figma',
        url: '#',
      },
    ],
    submission: {
      status: 'DRAFT',
      notes: 'Buttons and input fields completed with auto-layout variants. Currently finalizing modal dialogue components.',
    },
  },
];

export function getAssignmentById(id: string): FullAssignment | undefined {
  return mockFullAssignments.find((a) => a.id === id);
}
