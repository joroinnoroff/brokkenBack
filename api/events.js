// api/events.js
import { pool } from "../db.js";

const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? "https://brokken-front-yt8g.vercel.app"
    : "*";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin); 
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    try {
      // If ID is provided, fetch only one event
      if (req.query.id) {
        const result = await pool.query("SELECT * FROM events WHERE id = $1", [
          req.query.id,
        ]);
        return res.status(200).json(result.rows[0] || null);
      }
  
     
      const result = await pool.query("SELECT * FROM events ORDER BY start_date DESC");
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "DB fetch error" });
    }
  }
  

  

  if (req.method === "POST") {
    const { name, image, start_date, end_date, location, description } = req.body;

    if (!name) return res.status(400).json({ error: "Name required" });

    try {
      const result = await pool.query(
        `INSERT INTO events (name, image, start_date, end_date, location, description)
         VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
        [name, image, start_date, end_date, location, description]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "DB insert error" });
    }
  }

  if (req.method === "PUT") {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: "Event ID required" });
  
    const fields = req.body;
    const keys = Object.keys(fields);
  
    if (keys.length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }
  
    // Dynamisk SQL for kun endrede felter
    const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(", ");
    const values = Object.values(fields);
  
    try {
      const result = await pool.query(
        `UPDATE events SET ${setClause} WHERE id = $${keys.length + 1} RETURNING *`,
        [...values, id]
      );
  
      return res.status(200).json(result.rows[0]);
    } catch (err) {
      console.error("Error updating event:", err);
      return res.status(500).json({ error: "DB update error" });
    }
  }
  
  

  if (req.method === "DELETE") {
    const { id } = req.query; 
    if (!id) return res.status(400).json({ error: "event ID required" });

    try {
      await pool.query("DELETE FROM events WHERE id = $1", [id]);
      return res.status(200).json({ message: "event deleted successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "DB delete error" });
    }
  }

  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
