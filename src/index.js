import express from 'express';
import { createServer } from '@vercel/node';
import cors from 'cors';
import { pool } from '../db.js'; // adjust path if needed
import recordsRouter from './records.js';
import eventsRouter from './events.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/records', recordsRouter);
app.use('/api/events', eventsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Brokken Back API is running!' });
});

// Wrap for Vercel serverless
export default createServer(app);
