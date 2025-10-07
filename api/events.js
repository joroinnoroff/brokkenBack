// api/events.js
import { pool } from "../db.js";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "https://brokken-front-yt8g.vercel.app"); // your frontend URL
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // GET all events
  if (req.method === "GET") {
    try {
      const result = await pool.query("SELECT * FROM events ORDER BY start_date DESC");
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error("Error fetching events:", err);
      return res.status(500).json({ error: "DB fetch error" });
    }
  }

  // POST a new event
  if (req.method === "POST") {
    const { name, start_date, end_date, location, image, description } = req.body;

    if (!name || !start_date) {
      return res.status(400).json({ error: "Name and start_date are required" });
    }

    try {
      const result = await pool.query(
        `INSERT INTO events (name, start_date, end_date, location, image, description)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [name, start_date, end_date, location, image, description]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error("Error inserting event:", err);
      return res.status(500).json({ error: "DB insert error" });
