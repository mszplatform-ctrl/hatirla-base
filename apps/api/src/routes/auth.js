/**
 * Auth Routes
 * POST /api/auth/register — create account, return JWT
 * POST /api/auth/login    — verify credentials, return JWT
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const userRepository = require('../../data/user.repository');
const { AppError } = require('../gateway/error');

const SALT_ROUNDS = 10;
const JWT_EXPIRY = '7d';

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');
  return jwt.sign({ sub: userId }, secret, { expiresIn: JWT_EXPIRY });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      throw new AppError('VALIDATION_ERROR');
    }
    if (!password || typeof password !== 'string' || password.length < 8) {
      throw new AppError('VALIDATION_ERROR');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await userRepository.getUserByEmail(normalizedEmail);
    if (existing) {
      throw new AppError('CONFLICT');
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userRepository.createUser({
      id: randomUUID(),
      email: normalizedEmail,
      passwordHash,
      name: name || null,
    });

    const token = signToken(user.id);
    res.status(201).json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('[Auth] Register error:', error.message);
    throw error;
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('VALIDATION_ERROR');
    }

    const user = await userRepository.getUserByEmail(
      email.toLowerCase().trim()
    );

    // Use same error for unknown email and wrong password — avoid leaking existence
    if (!user || !user.passwordHash) {
      throw new AppError('AUTH_REQUIRED');
    }

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) {
      throw new AppError('AUTH_REQUIRED');
    }

    const token = signToken(user.id);
    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error('[Auth] Login error:', error.message);
    throw error;
  }
});

module.exports = router;
