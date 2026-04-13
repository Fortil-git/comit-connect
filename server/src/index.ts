import 'dotenv/config';
import path from 'path';
import express from 'express';
import cors from 'cors';
import session from 'express-session';
import 'express-async-errors';
import { routes } from './routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:8080';
const SESSION_SECRET = process.env.SESSION_SECRET || 'comit-connect-secret-poc';
const DIST_DIR = path.join(__dirname, '../../dist');

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Middleware
const allowedOrigins = [
  FRONTEND_URL,
  'https://precious-kitten-46fbff.netlify.app',
].filter(Boolean);
app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true,
}));
app.options('*', cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : true,
  credentials: true,
}));
app.use(express.json({ limit: '50mb' }));

// Session
app.use(session({
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24h
  },
}));

// Routes API
app.use('/api', routes);

// Static frontend
app.use(express.static(DIST_DIR));
app.get('/*', (_req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Gestion des erreurs
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
  console.log(`API disponible sur http://localhost:${PORT}/api`);
});
