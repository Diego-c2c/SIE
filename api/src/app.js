import express from 'express';
import cors from 'cors';
import routes from './routes/index.js'; // routes principales (sessions, auth, etc.)
import { env } from './config/env.js';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/errorHandler.js';
import activityTypesRoutes from './routes/activityTypesRoutes.js';

export const app = express();

/**
 * Configuration CORS
 *
 * - origin: domaine autorisé (ex: 'http://localhost:8080' en dev)
 * - credentials: permet l'envoi de cookies / headers d'auth (Access-Control-Allow-Credentials)
 */
const corsOptions = {
  origin: env.corsOrigin, // doit être 'http://localhost:8080' en dev
  credentials: true,
};

/**
 * Middlewares globaux
 *
 * L'ordre est important :
 * 1. CORS → pour toutes les routes.
 * 2. express.json() → parse le JSON pour req.body.
 */
app.use(cors(corsOptions));
app.use(express.json());

/**
 * Routes spécifiques "activity types"
 *
 * Montées sous /api/activity-types.
 * Exemple :
 *   GET /api/activity-types → liste des types d'activités
 */
app.use('/api/activity-types', activityTypesRoutes);

/**
 * Routes principales
 *
 * Fichier ./routes/index.js qui monte les autres sous /api (par ex. /api/sessions, /api/auth, etc.)
 */
app.use(routes);

/**
 * Gestion des 404
 *
 * Doit être déclarée après toutes les routes.
 */
app.use(notFoundHandler);

/**
 * Gestion globale des erreurs
 *
 * Doit être le dernier middleware.
 */
app.use(errorHandler);