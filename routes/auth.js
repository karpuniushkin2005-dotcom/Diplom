const express = require('express');
const bcrypt = require('bcryptjs');
const { get, run } = require('../db');
const { signToken, authRequired } = require('../middleware/auth');

const router = express.Router();

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value) {
  return /^[+\d\s()\-]{7,20}$/.test(value);
}

function sendAuthSuccess(res, user, message) {
  const token = signToken(user);
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
  res.json({
    message,
    token,
    role: user.role,
    user: {
      id: user.id,
      fullname: user.fullname,
      phone: user.phone,
      email: user.email,
      role: user.role
    }
  });
}

router.post('/register', async (req, res) => {
  const { fullname, phone, email, password } = req.body;
  if (!fullname || !phone || !email || !password) {
    return res.status(400).json({ message: 'Заполните все поля регистрации' });
  }
  if (!isPhone(phone) || !isEmail(email)) {
    return res.status(400).json({ message: 'Проверьте телефон и email' });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: 'Пароль должен быть не короче 6 символов' });
  }

  const exists = await get('SELECT id FROM users WHERE email = ?', [email]);
  if (exists) {
    return res.status(409).json({ message: 'Пользователь с таким email уже зарегистрирован' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await run(
    'INSERT INTO users (fullname, phone, email, password_hash) VALUES (?, ?, ?, ?)',
    [fullname, phone, email, passwordHash]
  );

  const user = await get(
    'SELECT id, fullname, phone, email, role FROM users WHERE id = ?',
    [result.id]
  );
  sendAuthSuccess(res, user, 'Регистрация выполнена');
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }

    sendAuthSuccess(
      res,
      {
        id: user.id,
        fullname: user.fullname,
        phone: user.phone,
        email: user.email,
        role: user.role
      },
      'Вход выполнен'
    );
  } catch (error) {
    console.error('login:', error.message);
    res.status(503).json({ message: 'База данных недоступна. Подождите и попробуйте снова.' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('token', { secure: process.env.NODE_ENV === 'production', sameSite: 'lax' });
  res.clearCookie('userId');
  res.json({ message: 'Вы вышли из аккаунта' });
});

router.get('/me', authRequired, (req, res) => {
  res.json({ user: req.user });
});

router.patch('/profile', authRequired, async (req, res) => {
  const { fullname, phone } = req.body;
  if (!fullname || !phone) {
    return res.status(400).json({ message: 'Укажите имя и телефон' });
  }
  if (!isPhone(phone)) {
    return res.status(400).json({ message: 'Проверьте телефон' });
  }

  await run('UPDATE users SET fullname = ?, phone = ? WHERE id = ?', [fullname, phone, req.user.id]);
  const user = await get(
    'SELECT id, fullname, phone, email, role FROM users WHERE id = ?',
    [req.user.id]
  );
  res.json({ message: 'Профиль обновлен', user });
});

module.exports = router;
