import express from 'express';
import { apiRouter } from '../server/api.js';

const app = express();

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Handle routes both with /api prefix and without (for Vercel rewrites)
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
