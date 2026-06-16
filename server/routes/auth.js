const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../db');
const { sendVerificationEmail } = require('../email');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const verifyToken = crypto.randomBytes(32).toString('hex');

    let user;
    try {
      const result = await pool.query(
        `INSERT INTO users (name, email, password_hash, verify_token, last_login)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, name, email, status`,
        [name.trim(), email.trim().toLowerCase(), passwordHash, verifyToken]
      );
      user = result.rows[0];
    } catch (err) {
      if (err.code === '23505') {
        return res.status(409).json({ message: 'This email is already registered.' });
      }
      throw err;
    }

    sendVerificationEmail(user.email, verifyToken).catch(err =>
      console.error('Verification email failed to send:', err.message)
    );

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, status: user.status },
      message: 'Registration successful! A verification link has been sent to your email.',
      verifyToken,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.trim().toLowerCase()]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ message: 'Your account has been blocked.' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, status: user.status },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error during login.' });
  }
});

router.get('/verify/:token', async (req, res) => {
  try {
    const { token } = req.params;

    const { rows } = await pool.query(
      `UPDATE users
       SET status = CASE WHEN status = 'unverified' THEN 'active' ELSE status END,
           verify_token = NULL
       WHERE verify_token = $1
       RETURNING id, status`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).send('<h2>Invalid or already used verification link.</h2>');
    }

    const clientUrl = process.env.CLIENT_URL || '';
    res.redirect(`${clientUrl}/login?verified=1`);
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).send('<h2>Server error. Please try again.</h2>');
  }
});

module.exports = router;
