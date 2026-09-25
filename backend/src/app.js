import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/env.js';
import apiRoutes from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

// Helper to parse comma-delimited or single origin URLs
const parseOrigins = (raw) => {
  if (!raw) return [];
  return raw
    .split(',')
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
};

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  ...parseOrigins(config.frontendUrl),
  ...parseOrigins(config.corsOrigin),
];

// Enable CORS with restricted origin matching
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g., server-to-server, curl, health probes)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/+$/, '');
    const isAllowed =
      allowedOrigins.includes(normalizedOrigin) ||
      (config.nodeEnv !== 'production' && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin));

    if (isAllowed) {
      return callback(null, true);
    }
    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
}));

// Request logging in dev
if (config.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root welcome
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Trip-Agent API (Trip Agent)',
    docs: '/api/health',
    status: 'online',
  });
});

// API Routes
app.use('/api', apiRoutes);

// Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
