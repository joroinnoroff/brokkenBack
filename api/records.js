// api/records.js
import { pool } from "../db.js";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*"); // or your frontend URL
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    try {
      const result = await pool.query("SELECT * FROM records ORDER BY release_date DESC");
      return res.status(200).json(result.rows);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "DB fetch error" });
    }
  }

  if (req.method === "POST") {
    const { name, image, release_date, price, description } = req.body;

    if (!name || !price) return res.status(400).json({ error: "Name and price required" });

    try {
      const result = await pool.query(
        `INSERT INTO records (name, image, release_date, price, description)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [name, image, release_date, price, description]
      );
      return res.status(201).json(result.rows[0]);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "DB insert error" });
    }
  }


  // DELETE a record
  if (req.method === "DELETE") {
    const { id } = req.query; 
    if (!id) return res.status(400).json({ error: "Record ID required" });
  
    try {
      await pool.query("DELETE FROM records WHERE id = $1", [id]);
      return res.status(200).json({ message: "Record deleted successfully" });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "DB delete error" });
    }
  }
  
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");

  res.status(405).end(`Method ${req.method} Not Allowed`);
}
