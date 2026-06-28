import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

export const app = express();

const corsOptions = {
  origin: env.corsOrigin,  // doit être 'http://localhost:8080' en dev
  credentials: true,       // ajoute Access-Control-Allow-Credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);