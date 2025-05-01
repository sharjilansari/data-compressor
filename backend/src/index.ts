import dotenv from 'dotenv';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { connect } from 'mongoose';
import { createLogger, format as _format, transports as _transports } from 'winston';
import fileUpload from 'express-fileupload';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { join } from 'path';

dotenv.config();

// Initialize Firebase Admin
try {
  const serviceAccountString = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!serviceAccountString) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set');
  }

  // Parse the service account string, handling both JSON string and base64 encoded formats
  let serviceAccount;
  try {
    // First try parsing as regular JSON
    serviceAccount = JSON.parse(serviceAccountString);
  } catch (e) {
    // If that fails, try parsing as base64
    try {
      const decoded = Buffer.from(serviceAccountString, 'base64').toString();
      serviceAccount = JSON.parse(decoded);
    } catch (e2) {
      throw new Error('Failed to parse FIREBASE_SERVICE_ACCOUNT as JSON or base64');
    }
  }

  // Initialize Firebase Admin SDK
  initializeApp({
    credential: cert(serviceAccount)
  });

  // Get Auth instance (we'll use this for middleware)
  getAuth();
} catch (error) {
  console.error('Firebase initialization error:', error);
  process.exit(1); // Exit if Firebase fails to initialize
}

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Configure Winston logger
const logger = createLogger({
  level: 'info',
  format: _format.combine(
    _format.timestamp(),
    _format.json()
  ),
  transports: [
    new _transports.File({ filename: 'error.log', level: 'error' }),
    new _transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new _transports.Console({
    format: _format.simple()
  }));
}

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400, // 24 hours
  preflightContinue: false,
  optionsSuccessStatus: 204
};

// Middleware
app.use(cors(corsOptions));
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
  limits: { 
    fileSize: 100 * 1024 * 1024, // 100MB max file size
    files: 1
  },
  abortOnLimit: true,
  createParentPath: true,
  useTempFiles: true,
  tempFileDir: '/tmp/',
  safeFileNames: true,
  preserveExtension: true
}));
// Serve the files from the 'uploads' directory
app.use('/uploads', express.static(join(process.cwd(), 'uploads')));


// Database connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/compression_db';
connect(MONGODB_URI)
  .then(() => {
    logger.info('Connected to MongoDB');
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    logger.error('MongoDB connection error:', err);
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Import routes
import compressionRoutes from './routes/compression';
import analyticsRoutes from './routes/analytics';

// Mount routes
app.use('/api/compression', compressionRoutes);
app.use('/api', analyticsRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

export default app; 