const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {

    const { id } = req.params;

    const result = await db.query(
      `
      SELECT
      u.id,
      u.username,
      u.email,
      u.created_at,
      p.display_name,
      p.bio,
      p.avatar_url
      FROM users u
      LEFT JOIN profiles p
      ON u.id = p.user_id
      WHERE u.id = $1
      `,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: error.message
    });
  }
});

module.exports = router;