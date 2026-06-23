const jwt = require('jsonwebtoken');
const { get } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'impulse-fitness-jwt-secret-2026';

function getToken(req) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    return header.slice(7);
  }
  return req.cookies.token || null;
}

function signToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

async function authRequired(req, res, next) {
  const token = getToken(req);
  if (!token) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await get(
      'SELECT id, fullname, phone, email, role FROM users WHERE id = ?',
      [payload.id]
    );
    if (!user) {
      return res.status(401).json({ message: 'Пользователь не найден' });
    }
    req.user = user;
    return next();
  } catch {
    return res.status(401).json({ message: 'Недействительный токен' });
  }
}

async function adminRequired(req, res, next) {
  return authRequired(req, res, () => {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ message: 'Доступ разрешен только администратору' });
    }
    return next();
  });
}

async function optionalUser(req, res, next) {
  const token = getToken(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = await get(
      'SELECT id, fullname, phone, email, role FROM users WHERE id = ?',
      [payload.id]
    );
  } catch {
    req.user = null;
  }
  return next();
}

module.exports = {
  signToken,
  authRequired,
  adminRequired,
  optionalUser,
  getToken
};
