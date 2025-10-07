import express from "express";
import { pool } from "../db.js";

const router = express.Router();

// Create event
router.post("/", async (req, res) => {
  try {
    const { name, startDate, endDate, location, image, description } = req.body;
    const result = await pool.query(
      `INSERT INTO events (name, start_date, end_date, location, image, description)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, startDate, endDate, location, image, description]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create event" });
  }
});

// Get all events
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM events ORDER BY start_date DESC");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch events" });
  }
});

export default router;
