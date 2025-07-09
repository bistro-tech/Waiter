const express = require("express");
const router = express.Router();
const db = require("../models/connection");

// 🔍 Middleware pour afficher les requêtes (debug)
router.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// GET all users
router.get("/", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error("Erreur SELECT all users:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET user by discord_id
router.get("/:id", async (req, res) => {
  const { id: discord_id } = req.params;

  if (!discord_id) {
    return res.status(400).json({ error: "discord_id requis" });
  }

  try {
    const result = await db.query("SELECT * FROM users WHERE discord_id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur SELECT user by ID:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST new user
router.post("/CreateUser", async (req, res) => {
  const { discord_id } = req.body;

  if (!discord_id) {
    return res.status(400).json({ error: "discord_id requis dans le body" });
  }

  try {
    const result = await db.query(
      "INSERT INTO users (discord_id) VALUES ($1) RETURNING *",
      [discord_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Erreur INSERT user:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT update last_annoy
router.put("/LastAnnoy/:id", async (req, res) => {
  const { id: discord_id } = req.params;
  const { last_annoy } = req.body;

  if (!last_annoy) {
    return res.status(400).json({ error: "last_annoy requis dans le body" });
  }
  try {
    const result = await db.query(
      "UPDATE users SET last_annoy = $1 WHERE discord_id = $2 RETURNING *",
      [last_annoy, discord_id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur UPDATE user:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PUT update last_annoyed
router.put("/LastAnnoyed/:id", async (req, res) => {
  const { id: discord_id } = req.params;
  const { last_annoyed } = req.body;

  if (!discord_id) {
    return res.status(400).json({ error: "discord_id requis" });
  }

  if (!last_annoyed) {
    return res.status(400).json({ error: "last_annoy requis" });
  }
  try {
    const result = await db.query(
      "UPDATE users SET last_annoyed = $1 WHERE discord_id = $2 RETURNING *",
      [last_annoyed, discord_id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Erreur UPDATE user:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE user
router.delete("/delete/:id", async (req, res) => {
  const { id: discord_id } = req.params;

  if (!discord_id) {
    return res.status(400).json({ error: "discord_id requis" });
  }

  try {
    const result = await db.query(
      "DELETE FROM users WHERE discord_id = $1 RETURNING *",
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    res.json({ message: "Utilisateur supprimé", user: result.rows[0] });
  } catch (err) {
    console.error("Erreur DELETE user:", err.message);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;
