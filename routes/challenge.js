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
    const result = await db.query("SELECT * FROM challenge");
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur SELECT all users:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET all challenges except those who are finished
router.get("/:id", async (req, res) => {
  const { id: challenge_id } = req.params;

  if (!challenge_id) {
    return res.status(400).json({ error: "challenge_id requis" });
  }

  try {
    const result = await db.query(
      "SELECT * FROM challenge WHERE challenge_id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur SELECT user by ID:", err.message);
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
    console.error("Erreur INSERT user:", err.message);
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
