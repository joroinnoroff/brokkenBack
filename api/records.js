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

// Get all records
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM records ORDER BY release_date DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB fetch error" });
  }
});

// Create new record
app.post("/", async (req, res) => {
  const { name, image, release_date, price, description } = req.body;

  if (!name || !price) return res.status(400).json({ error: "Name and price required" });

  try {
    const result = await pool.query(
      `INSERT INTO records (name, image, release_date, price, description)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [name, image, release_date, price, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "DB insert error" });
  }
});

export default app;
