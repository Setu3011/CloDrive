const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db");

const router = express.Router();

const JWT_SECRET =
  process.env.JWT_SECRET || "dev_secret";

/* =========================
   SIGNUP
========================= */

router.post("/signup", async (req, res) => {
  try {
    console.log("Signup Request:", req.body);

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const existingUser = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already exists"
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const userResult = await db.query(
      `
      INSERT INTO users
      (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email
      `,
      [username, email, passwordHash]
    );

    const user = userResult.rows[0];

    await db.query(
      `
      INSERT INTO profiles
      (user_id, display_name)
      VALUES ($1, $2)
      `,
      [user.id, username]
    );

    console.log("User Created Successfully:", user);

    res.status(201).json({
      success: true,
      message: "Account created successfully",
      user
    });

  } catch (error) {
    console.error("SIGNUP ERROR:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

/* =========================
   LOGIN
========================= */

router.post("/login", async (req, res) => {
  try {
    console.log("Login Request:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required"
      });
    }

    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password"
      });
    }

    console.log("Login Successful:", user.email);

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

    
  } catch (error) {
    console.error("LOGIN ERROR:");
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
