const express = require('express');
const { all, get, run } = require('../db');
const { authRequired, adminRequired, optionalUser } = require('../middleware/auth');

const router = express.Router();

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isPhone(value) {
  return /^[+\d\s()\-]{7,20}$/.test(value);
}

function mapApplication(row) {
  return {
    id: row.id,
    user_id: row.user_id,
    full_name: row.fullname,
    fullname: row.fullname,
    phone: row.phone,
    email: row.email,
    membership_title: row.request_type,
    request_type: row.request_type,
    comment: row.comment,
    status: row.status,
    created_at: row.created_at
  };
}

async function createApplication(req, res) {
  const fullname = req.body.fullname || req.body.full_name || req.user?.fullname;
  const phone = req.body.phone || req.user?.phone;
  const email = req.body.email || req.user?.email || '';
  const requestType = req.body.request_type || req.body.membership_title || req.body.program;
  const comment = req.body.comment || req.body.message || '';

  if (!fullname || !phone || !requestType) {
    return res.status(400).json({ message: 'Укажите имя, телефон и программу' });
  }
  if (!isPhone(phone) || (email && !isEmail(email))) {
    return res.status(400).json({ message: 'Проверьте контактные данные' });
  }

  const duplicate = await get(
    `SELECT id FROM leads
     WHERE phone = ? AND created_at >= DATE_SUB(NOW(), INTERVAL 1 DAY)`,
    [phone]
  );
  if (duplicate) {
    return res.status(409).json({ message: 'Заявка с этим телефоном уже была отправлена сегодня' });
  }

  const userId = req.user ? req.user.id : null;
  const profileEmail = req.user ? req.user.email : email;
  const profilePhone = req.user ? req.user.phone : phone;
  const profileName = req.user ? req.user.fullname : fullname;

  await run(
    `INSERT INTO leads (user_id, fullname, phone, email, request_type, comment)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, profileName, profilePhone, profileEmail, requestType, comment]
  );

  res.json({ message: 'Заявка отправлена. Администратор свяжется с вами.' });
}

router.get('/coaches', async (req, res) => {
  res.json(await all('SELECT * FROM coaches ORDER BY id'));
});

router.get('/trainers', async (req, res) => {
  const coaches = await all('SELECT * FROM coaches ORDER BY id');
  res.json(coaches.map((coach) => ({
    id: coach.id,
    name: coach.name,
    specialization: coach.role,
    experience_years: coach.experience,
    description: coach.description
  })));
});

router.get('/programs', async (req, res) => {
  res.json(await all('SELECT * FROM programs ORDER BY id'));
});

router.get('/memberships', async (req, res) => {
  const programs = await all('SELECT * FROM programs ORDER BY id');
  res.json(programs.map((program) => ({
    id: program.id,
    title: program.title,
    price: program.price,
    duration_days: program.category,
    description: program.description,
    features: program.category
  })));
});

router.get('/schedule', async (req, res) => {
  const { group } = req.query;
  let sql = 'SELECT * FROM schedule';
  const params = [];

  if (group) {
    sql += ' WHERE group_type = ?';
    params.push(group);
  }

  sql += ' ORDER BY id';
  res.json(await all(sql, params));
});

router.get('/my-leads', authRequired, async (req, res) => {
  const leads = await all(
    `SELECT * FROM leads
     WHERE user_id = ? OR email = ? OR phone = ?
     ORDER BY created_at DESC`,
    [req.user.id, req.user.email, req.user.phone]
  );
  res.json(leads.map(mapApplication));
});

router.get('/my-applications', authRequired, async (req, res) => {
  const leads = await all(
    `SELECT * FROM leads
     WHERE user_id = ? OR email = ? OR phone = ?
     ORDER BY created_at DESC`,
    [req.user.id, req.user.email, req.user.phone]
  );
  res.json(leads.map(mapApplication));
});

router.post('/leads', optionalUser, createApplication);
router.post('/applications', optionalUser, createApplication);

router.get('/admin/leads', adminRequired, async (req, res) => {
  const leads = await all('SELECT * FROM leads ORDER BY created_at DESC');
  res.json(leads);
});

router.get('/admin/applications', adminRequired, async (req, res) => {
  const leads = await all('SELECT * FROM leads ORDER BY created_at DESC');
  res.json(leads.map(mapApplication));
});

router.patch('/admin/leads/:id', adminRequired, async (req, res) => {
  const allowed = ['new', 'called', 'confirmed', 'closed', 'processed'];
  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ message: 'Недопустимый статус' });
  }
  await run('UPDATE leads SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
  res.json({ message: 'Статус обновлен' });
});

router.patch('/admin/applications/:id', adminRequired, async (req, res) => {
  const allowed = ['new', 'called', 'confirmed', 'closed', 'processed'];
  if (!allowed.includes(req.body.status)) {
    return res.status(400).json({ message: 'Недопустимый статус' });
  }
  await run('UPDATE leads SET status = ? WHERE id = ?', [req.body.status, req.params.id]);
  res.json({ message: 'Статус обновлен' });
});

router.delete('/admin/leads/:id', adminRequired, async (req, res) => {
  await run('DELETE FROM leads WHERE id = ?', [req.params.id]);
  res.json({ message: 'Заявка удалена' });
});

router.delete('/admin/applications/:id', adminRequired, async (req, res) => {
  await run('DELETE FROM leads WHERE id = ?', [req.params.id]);
  res.json({ message: 'Заявка удалена' });
});

module.exports = router;
