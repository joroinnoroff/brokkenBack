import { pool } from "../db.js";

const allowedOrigin =
  process.env.NODE_ENV === "production"
    ? "https://brokken-front-yt8g.vercel.app"
    : "*";

export default async function handler(req, res) {
  // Helper: set CORS headers
  const setCors = () => {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", "true"); // if needed
  };

  setCors();

  // Preflight
  if (req.method === "OPTIONS") {
    return res.status(204).end(); // Must respond with headers
  }

  try {
    if (req.method === "GET") {
      if (req.query.id) {
        const result = await pool.query("SELECT * FROM records WHERE id = $1", [req.query.id]);
        return res.status(200).json(result.rows[0] || null);
      }
      const result = await pool.query("SELECT * FROM records ORDER BY release_date DESC");
      return res.status(200).json(result.rows);
    }

    if (req.method === "POST") {
      const { name, image, release_date, price, description } = req.body;
      if (!name || price == null) return res.status(400).json({ error: "Name and price required" });

      const result = await pool.query(
        `INSERT INTO records (name, image, release_date, price, description)
         VALUES ($1,$2,$3,$4,$5) RETURNING *`,
        [name, image || "", release_date || null, price, description || ""]
      );
      return res.status(201).json(result.rows[0]);
    }

    if (req.method === "PUT") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Record ID required" });

      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) return res.status(400).json({ error: "Invalid ID" });

      const { name, image, release_date, price, description } = req.body;
      if (!name || price == null) return res.status(400).json({ error: "Name and price required" });

      const result = await pool.query(
        `UPDATE records
         SET name=$1, image=$2, release_date=$3, price=$4, description=$5
         WHERE id=$6 RETURNING *`,
        [name, image || "", release_date || null, price, description || "", numericId]
      );

      return res.status(200).json(result.rows[0]);
    }

    if (req.method === "DELETE") {
      const { id } = req.query;
      if (!id) return res.status(400).json({ error: "Record ID required" });

      await pool.query("DELETE FROM records WHERE id=$1", [id]);
      return res.status(200).json({ message: "Record deleted successfully" });
    }

    res.status(405).end(`Method ${req.method} Not Allowed`);
  } catch (err) {
    // Always include CORS headers in errors too
    setCors();
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
}
