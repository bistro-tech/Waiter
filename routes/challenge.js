const express = require("express");
const router = express.Router();
const db = require("../models/connection");

// 🔍 Middleware pour afficher les requêtes (debug)
router.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// GET all challenges
router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT challenge_id, challenge_name, point_obtainable, difficulty, category FROM challenge;"
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur SELECT all challenge:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Get challenge response
router.get("/:challenge_id", async (req, res) => {
  const { challenge_id } = req.params;
  try {
    const result = await db.query(
      "SELECT answer FROM challenge WHERE challenge_id = $1;",
      [challenge_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur SELECT challenge:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// Get challenge content
router.get("/content/:challenge_id", async (req, res) => {
  const { challenge_id } = req.params;
  try {
    const result = await db.query(
      "SELECT contexte, input FROM challenge WHERE challenge_id = $1;",
      [challenge_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur SELECT challenge:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET all challenges except those who are finished
router.get("/available/:discord_id", async (req, res) => {
  const { discord_id } = req.params;

  try {
    const result = await db.query(
      `
      SELECT c.challenge_id, c.challenge_name, c.point_obtainable, c.difficulty, c.category
      FROM challenge c
      WHERE c.challenge_id NOT IN (
        SELECT challenge_id
        FROM user_challenge
        WHERE discord_id = $1 AND date_completed IS NOT NULL
      );
      `,
      [discord_id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Aucun challenge disponible" });

    res.json(result.rows);
  } catch (err) {
    console.error("Erreur SELECT challenges non complétés :", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST new Challenge
router.post("/CreateChallenge", async (req, res) => {
  const {
    challenge_name,
    contexte,
    point_obtainable,
    difficulty,
    category,
    answer,
  } = req.body;

  if (
    !challenge_name ||
    !contexte ||
    !point_obtainable ||
    !difficulty ||
    !category ||
    !answer
  ) {
    console.log(req.body);
    return res.status(400).json({ error: "Un des champs requis est manquant" });
  }

  try {
    const result = await db.query(
      "INSERT INTO challenge (challenge_name, contexte, point_obtainable, difficulty, category, answer) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [challenge_name, contexte, point_obtainable, difficulty, category, answer]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur INSERT challenge:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

router.post("/Completed", async (req, res) => {
  const { discord_id, challenge_id, date_completed } = req.body;

  if (!discord_id || !challenge_id || !date_completed) {
    return res.status(400).json({ error: "Champs requis manquants." });
  }

  try {
    const result = await db.query(
      "INSERT INTO user_challenge (discord_id, challenge_id, date_completed) VALUES ($1, $2, $3) RETURNING *",
      [discord_id, challenge_id, date_completed]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur INSERT challenge status", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE Challenge
router.delete("/delete/:id", async (req, res) => {
  const { id: challenge_id } = req.params;

  if (!challenge_id) {
    return res.status(400).json({ error: "challenge_id requis" });
  }

  try {
    const result = await db.query(
      "DELETE FROM challenge WHERE challenge_id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Challenge non trouvé" });
    res.json({ message: "Challenge supprimé", user: result.rows[0] });
  } catch (err) {
    console.error("Erreur DELETE Challenge:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
