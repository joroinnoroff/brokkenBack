import express from "express";
import { pool } from "../db.js";

const app = express();
app.use(express.json());

// CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "https://brokken-front-yt8g.vercel.app");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Get all events
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY start_date DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB fetch error" });
  }
});

// Create new event
app.post("/", async (req, res) => {
  const { name, start_date, end_date, location, image, description } = req.body;

  if (!name || !start_date) return res.status(400).json({ error: "Name and start_date required" });

  try {
    const result = await pool.query(
      `INSERT INTO events (name, start_date, end_date, location, image, description)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, start_date, end_date, location, image, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB insert error" });
  }
});

export default app;
