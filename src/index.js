import express from 'express';
import { createServer } from '@vercel/node';
import cors from 'cors';
import { pool } from '../db.js';
import recordsRouter from './records.js';
import eventsRouter from './events.js';

const app = express();

// ✅ CORS config
const allowedOrigins = [
  "http://localhost:3000",
  "https://brokken-front-yt8g.vercel.app"
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
}));

// Handle OPTIONS preflight for serverless
app.options("*", cors());

app.use(express.json());

app.use('/api/records', recordsRouter);
app.use('/api/events', eventsRouter);

app.get('/', (req, res) => {
  res.json({ message: 'Brokken Back API is running!' });
});

export default createServer(app);
