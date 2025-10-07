import express from 'express'
import { pool } from '../../db.js'

const router = express.Router();


//get all records 

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM records ORDER BY date DESC");
    res.json(result.rows);
  } catch (error) {
    console.log(error, "Error fetching records");
    res.status(500).json({error: "Db error"});
  }
})


//Create new record
router.post("/", async (req, res) => {
  const { name, image, release_date, price, description } = req.body;

  if (!name || !price) {
    return res.status(400).json({ error: "Name and price is required."})
  }

  try {
    const result = await pool.query(
      `INSERT INTO records (name, image, release_date, price, description)
      VALUES ($1, $2, $3, $4, $5) RETURNING *;
      `,
      [name, image, release_date, price, description]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("DB insert error details:", error.message);
  res.status(500).json({ error: "db insert error" });
  }
});

export default router;