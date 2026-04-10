// ============================================
// app.js - Express Application Setup
// ============================================
// This file configures the Express app with:
//   - CORS (so React frontend can talk to us)
//   - Body parsing (JSON + large payloads)
//   - API routes
//   - Error handling
// ============================================

import express from 'express';
import cors from 'cors';

// Import all routes (bundled in one index file)
import router from './routes/index.js';

// Import the global error handler
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';

// ---- Create the Express App ----
const app = express();

// ============================================
// MIDDLEWARE (runs on every request, in order)
// ============================================

// CORS -> Cross Origin Resource Sharing
// CORS is security feature in browser which blocks the response from different origin. (origin -> protocol, domain, and port)
// So, in our case frontend and backend are running on two different ports means they are in two different origin. So, browser blocks the response from backend.
// To enable that we need to use CORS middleware for our application, which includes CORS headers in all our responses. Browsers check these CORS headers in responses and allows the responses.

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));

// 2. Body Parser: Convert incoming JSON requests to JavaScript objects
//    10mb limit to handle large resume text and interview data
app.use(express.json({ limit: '10mb' })); //express.json() is a builtin middleware to parse the requests from JSON strings into JSON objects
//middlewares order matters

// ============================================
// ROUTES
// ============================================

// /api/auth      → authentication routes
// /api/interview → interview routes (start, answer, feedback)
// /api/resume    → resume upload and parsing routes
// /api/history   → interview history routes
app.use('/api', router);

// ============================================
// ERROR HANDLING (must be AFTER routes)
// ============================================

// Handle 404 - Route not found
app.use(notFoundHandler);

// Handle all other errors (500, validation errors, etc.)
app.use(errorHandler);

// Export the app (used in server.js)
export default app;
