import { FullLesson } from '@/types/lms';

export const mockLessons: Record<string, FullLesson> = {
  'rest-api-design': {
    id: 'les-302',
    slug: 'rest-api-design',
    title: 'REST API Design',
    trackId: 'backend-development',
    trackName: 'Backend Development',
    trackAccentColor: '#4285F4', // Google Blue
    moduleId: 'mod-3',
    moduleName: 'Building APIs',
    moduleOrder: 3,
    durationMinutes: 35,
    type: 'Lesson',
    status: 'current',
    description:
      'Learn how to structure clean, predictable, and scalable RESTful APIs using resource-oriented URLs, standardized HTTP methods, HTTP status codes, and uniform response envelopes.',
    learningObjectives: [
      'Explain core REST architectural constraints and statelessness',
      'Design intuitive, predictable resource-based URI hierarchies',
      'Select and apply appropriate HTTP verbs (GET, POST, PUT, PATCH, DELETE)',
      'Map domain business outcomes to standard HTTP status codes correctly',
      'Format consistent JSON success and error response envelopes for client consumers',
    ],
    video: {
      title: 'Architecting Scalable REST APIs in Express & NestJS',
      duration: '28:40',
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    },
    sections: [
      {
        title: '1. What is REST?',
        content:
          'Representational State Transfer (REST) is an architectural style designed for distributed hypermedia systems. Introduced by Roy Fielding in 2000, REST leverages the stateless, client-server semantics of the underlying HTTP protocol. In REST, state lives in resources, and clients interact with these resources by exchanging representations (typically formatted as JSON).',
        bulletPoints: [
          'Client-Server Separation: The user interface and data storage concerns are strictly decoupled.',
          'Stateless Communication: Each HTTP request from the client must contain all context required to understand and execute it; the server maintains no session state between calls.',
          'Cacheability: Responses must explicitly define whether they are cacheable to optimize latency and eliminate redundant queries.',
          'Uniform Interface: Standardized URI identifiers, manipulation through representations, and self-descriptive messages.',
        ],
        callout: {
          type: 'google',
          text: 'Google API Design Principle: APIs should be resource-oriented where individual data entities are addressed as nouns, and actions correspond to standard HTTP method semantics.',
        },
      },
      {
        title: '2. Resource-Based URL Design',
        content:
          'A key tenet of RESTful design is that URIs must identify nouns (resources), not actions or verbs. Actions are expressed via the HTTP method itself. Keep resource paths hierarchical, lowercase, hyphen-separated, and pluralized for collections.',
        codeSnippet: {
          language: 'http',
          code: `# Collection Endpoints
GET    /api/v1/users          # Fetch paginated list of users
POST   /api/v1/users          # Create a new user record

# Singleton / Member Endpoints
GET    /api/v1/users/:id      # Retrieve a specific user by ID
PATCH  /api/v1/users/:id      # Partially update a user's properties
PUT    /api/v1/users/:id      # Completely replace user representation
DELETE /api/v1/users/:id      # Remove the user record

# Sub-Resource Relationships
GET    /api/v1/users/:id/tracks  # Get tracks enrolled by this user
POST   /api/v1/users/:id/tracks  # Enroll the user in a new track`,
        },
      },
      {
        title: '3. HTTP Methods & Idempotency',
        content:
          'Understanding idempotency is critical for resilient distributed backend systems. An idempotent operation can be called multiple times without producing different side effects on the server.',
        table: {
          headers: ['Method', 'CRUD Operation', 'Idempotent?', 'Safe? (Read-Only)'],
          rows: [
            ['GET', 'Read', 'Yes', 'Yes'],
            ['POST', 'Create', 'No', 'No'],
            ['PUT', 'Replace / Update', 'Yes', 'No'],
            ['PATCH', 'Partial Update', 'No / Conditional', 'No'],
            ['DELETE', 'Delete', 'Yes', 'No'],
          ],
        },
      },
      {
        title: '4. HTTP Status Codes in Practice',
        content:
          'Always communicate the outcome of an operation through appropriate HTTP status codes. Never return HTTP 200 OK with an internal error code in the JSON payload.',
        bulletPoints: [
          '200 OK: Standard successful response for GET, PUT, or PATCH.',
          '201 Created: Resource was successfully created via POST. Should include a Location header or the created entity in the response body.',
          '204 No Content: Action succeeded (commonly DELETE) and no response body is sent.',
          '400 Bad Request: Malformed JSON, failed schema validation, or invalid query parameters.',
          '401 Unauthorized: Authentication is missing or invalid token provided.',
          '403 Forbidden: Authenticated user lacks permission / role to access the resource.',
          '404 Not Found: Requested resource URI does not exist.',
          '409 Conflict: Request could not be processed due to conflict (e.g. duplicate email address).',
          '500 Internal Server Error: Unhandled exception or unexpected database failure on the server.',
        ],
      },
      {
        title: '5. Request & Response Envelopes',
        content:
          'Adopt consistent JSON structure across all API responses. Group successful results under a data object, include pagination metadata where applicable, and maintain predictable error schemas.',
        codeSnippet: {
          language: 'json',
          code: `// Success Response Envelope: GET /api/v1/users/usr_9021
{
  "status": "success",
  "data": {
    "id": "usr_9021",
    "name": "Alex Rivera",
    "email": "alex.rivera@lasu.edu.ng",
    "cohort": "Bootcamp 3.0",
    "enrolledTracks": ["backend-development", "frontend-development"],
    "createdAt": "2026-09-15T08:30:00Z"
  }
}

// Error Response Envelope: POST /api/v1/users (400 Bad Request)
{
  "status": "error",
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "Payload validation failed for user creation",
    "details": [
      {
        "field": "email",
        "issue": "Email must be a valid @lasu.edu.ng address"
      },
      {
        "field": "password",
        "issue": "Password must contain at least 8 characters and one symbol"
      }
    ]
  },
  "timestamp": "2026-09-25T11:20:00Z",
  "path": "/api/v1/users"
}`,
        },
        callout: {
          type: 'tip',
          text: 'Pro Tip: Include an error code (like VALIDATION_FAILED) alongside the human-readable message. Frontends and mobile apps should branch logic on machine-readable error codes, not message strings.',
        },
      },
      {
        title: '6. Good vs Bad Endpoint Design',
        content:
          'Evaluate these common design patterns when reviewing team pull requests in GDG project squads:',
        table: {
          headers: ['Bad Antipattern ❌', 'Recommended REST Pattern ✅', 'Reason'],
          rows: [
            ['POST /getUser?id=12', 'GET /api/v1/users/12', 'GET is cacheable and conveys retrieval; avoid verbs in URI'],
            ['POST /createUser', 'POST /api/v1/users', 'The HTTP POST verb already signifies creation'],
            ['POST /deleteUser/12', 'DELETE /api/v1/users/12', 'Use DELETE method to express removal'],
            ['GET /api/v1/user', 'GET /api/v1/users', 'Pluralized collection nouns maintain consistency'],
            ['POST /updateUserStatus', 'PATCH /api/v1/users/12/status', 'Target specific resource and use PATCH'],
          ],
        },
      },
    ],
    resources: [
      {
        id: 'res-rest-1',
        title: 'REST API Design Slides',
        type: 'slides',
        url: '#',
        isRequired: true,
        fileSize: '4.8 MB',
        description: 'Official GDG LASU presentation covering architectural constraints, URI naming, and JSON envelopes.',
      },
      {
        id: 'res-rest-2',
        title: 'HTTP Status Code Cheat Sheet',
        type: 'pdf',
        url: '#',
        isRequired: true,
        fileSize: '1.2 MB',
        description: 'Printable reference for 2xx, 3xx, 4xx, and 5xx response codes and when to use each.',
      },
      {
        id: 'res-rest-3',
        title: 'Starter API Repository',
        type: 'github',
        url: 'https://github.com',
        isRequired: true,
        description: 'TypeScript & Express sandbox repository configured with router modules and validation.',
      },
      {
        id: 'res-rest-4',
        title: 'MDN HTTP Methods Documentation',
        type: 'article',
        url: 'https://developer.mozilla.org',
        isRequired: false,
        description: 'Comprehensive specifications on HTTP request methods, safety, and idempotency guarantees.',
      },
      {
        id: 'res-rest-5',
        title: 'API Design Practice Exercise',
        type: 'practice',
        url: '#',
        isRequired: false,
        description: 'Interactive challenge: Refactor 10 broken non-RESTful endpoints into compliant API schemas.',
      },
    ],
    prevLesson: {
      id: 'les-301',
      slug: 'express-fundamentals',
      title: 'Express Fundamentals',
    },
    nextLesson: {
      id: 'les-303',
      slug: 'middleware',
      title: 'Middleware',
    },
  },
  'express-fundamentals': {
    id: 'les-301',
    slug: 'express-fundamentals',
    title: 'Express Fundamentals',
    trackId: 'backend-development',
    trackName: 'Backend Development',
    trackAccentColor: '#4285F4',
    moduleId: 'mod-3',
    moduleName: 'Building APIs',
    moduleOrder: 3,
    durationMinutes: 45,
    type: 'Lesson',
    status: 'completed',
    description:
      'Master the basics of Express.js: creating servers, listening on ports, registering routes, handling query parameters, and structuring routing controllers.',
    learningObjectives: [
      'Initialize an Express application with TypeScript',
      'Understand req and res stream objects',
      'Handle URL route parameters and query strings',
      'Organize modular routes with express.Router()',
    ],
    video: {
      title: 'Setting up Express.js & TypeScript from Scratch',
      duration: '32:10',
      url: 'https://www.youtube.com',
    },
    sections: [
      {
        title: 'Express Routing & Request Lifecycle',
        content:
          'Express is a fast, unopinionated, minimalist web framework for Node.js. It wraps the native http.IncomingMessage and http.ServerResponse objects with helper methods like res.json() and req.params.',
      },
    ],
    resources: [],
    nextLesson: {
      id: 'les-302',
      slug: 'rest-api-design',
      title: 'REST API Design',
    },
  },
  middleware: {
    id: 'les-303',
    slug: 'middleware',
    title: 'Middleware',
    trackId: 'backend-development',
    trackName: 'Backend Development',
    trackAccentColor: '#4285F4',
    moduleId: 'mod-3',
    moduleName: 'Building APIs',
    moduleOrder: 3,
    durationMinutes: 40,
    type: 'Lesson',
    status: 'locked',
    description:
      'Learn how middleware functions intercept, transform, and guard HTTP requests in Express before handing off control to endpoint route handlers.',
    learningObjectives: [
      'Understand the signature of middleware: (req, res, next)',
      'Build request logger and execution time tracking middleware',
      'Implement authentication token verification guards',
      'Manage middleware execution order and next() propagation',
    ],
    sections: [
      {
        title: 'Middleware Pipeline Execution',
        content:
          'Middleware functions are functions that have access to the request object (req), the response object (res), and the next middleware function in the application’s request-response cycle.',
      },
    ],
    resources: [],
    prevLesson: {
      id: 'les-302',
      slug: 'rest-api-design',
      title: 'REST API Design',
    },
    nextLesson: {
      id: 'les-304',
      slug: 'validation',
      title: 'Validation',
    },
  },
  validation: {
    id: 'les-304',
    slug: 'validation',
    title: 'Validation',
    trackId: 'backend-development',
    trackName: 'Backend Development',
    trackAccentColor: '#4285F4',
    moduleId: 'mod-3',
    moduleName: 'Building APIs',
    moduleOrder: 3,
    durationMinutes: 35,
    type: 'Lesson',
    status: 'locked',
    description:
      'Secure endpoints by enforcing strict schema validation using Zod and class-validator on incoming request bodies, headers, and params.',
    learningObjectives: [
      'Parse and validate input schemas using Zod',
      'Sanitize payloads to prevent injection attacks',
      'Return actionable, granular validation error messages',
    ],
    sections: [],
    resources: [],
    prevLesson: {
      id: 'les-303',
      slug: 'middleware',
      title: 'Middleware',
    },
    nextLesson: {
      id: 'les-305',
      slug: 'error-handling',
      title: 'Error Handling',
    },
  },
};

// Fallback helper to resolve any requested lesson slug safely
export function getLessonBySlug(slug: string): FullLesson {
  return mockLessons[slug] || mockLessons['rest-api-design'];
}
