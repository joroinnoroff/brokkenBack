import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db.js";
import eventsRouter from "./routes/events.js";
import recordsRouter from "./routes/records.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/events", eventsRouter);
app.use("/api/records", recordsRouter);

const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  try {
    await pool.connect();
    console.log(`✅ Server running on port ${PORT}`);
    console.log("✅ Connected to Neon PostgreSQL");
  } catch (err) {
    console.error("❌ Database connection failed", err);
  }
});
