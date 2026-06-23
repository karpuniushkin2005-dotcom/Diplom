#!/usr/bin/env node

const API = process.env.API_URL || 'http://localhost:3000';

let passed = 0;
let failed = 0;

function ok(name) {
  passed += 1;
  console.log(`  ✓ ${name}`);
}

function fail(name, detail) {
  failed += 1;
  console.log(`  ✗ ${name}: ${detail}`);
}

async function json(method, path, body, token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

async function main() {
  console.log(`\nТестирование IMPULSE API → ${API}\n`);

  const programs = await json('GET', '/api/programs');
  if (programs.status === 200 && Array.isArray(programs.data) && programs.data.length > 0) ok('GET /api/programs');
  else fail('GET /api/programs', `status ${programs.status}`);

  const coaches = await json('GET', '/api/coaches');
  if (coaches.status === 200 && coaches.data.length > 0) ok('GET /api/coaches');
  else fail('GET /api/coaches', `status ${coaches.status}`);

  const schedule = await json('GET', '/api/schedule');
  if (schedule.status === 200 && schedule.data.length > 0) ok('GET /api/schedule');
  else fail('GET /api/schedule', `status ${schedule.status}`);

  const scheduleFilter = await json('GET', '/api/schedule?group=Дети');
  if (scheduleFilter.status === 200 && scheduleFilter.data.every((r) => r.group_type === 'Дети')) {
    ok('GET /api/schedule?group=Дети');
  } else fail('GET /api/schedule?group=Дети', 'filter');

  const phone = `+79${Date.now().toString().slice(-9)}`;
  const app = await json('POST', '/api/applications', {
    fullname: 'Тест Клиент',
    phone,
    email: `test${Date.now()}@mail.ru`,
    request_type: programs.data[0]?.title || 'Безлимитная карта',
    comment: 'API test',
  });
  if (app.status === 200 && app.data.message) ok('POST /api/applications (гость)');
  else fail('POST /api/applications', app.data.message || app.status);

  const email = `user${Date.now()}@test.ru`;
  const reg = await json('POST', '/api/register', {
    fullname: 'Игорь Тестов',
    phone: `+79${(Date.now() + 1).toString().slice(-9)}`,
    email,
    password: 'test123',
  });
  let clientToken = reg.data.token;
  if (reg.status === 200 && clientToken) ok('POST /api/register');
  else fail('POST /api/register', reg.data.message || reg.status);

  const login = await json('POST', '/api/login', { email, password: 'test123' });
  if (login.status === 200 && login.data.token) {
    clientToken = login.data.token;
    ok('POST /api/login (клиент)');
  } else fail('POST /api/login', login.data.message);

  const me = await json('GET', '/api/me', null, clientToken);
  if (me.status === 200 && me.data.user?.email === email) ok('GET /api/me');
  else fail('GET /api/me', me.data.message);

  const phone2 = `+79${(Date.now() + 2).toString().slice(-9)}`;
  const patch = await json('PATCH', '/api/profile', { fullname: 'Игорь Обновлён', phone: phone2 }, clientToken);
  if (patch.status === 200) ok('PATCH /api/profile');
  else fail('PATCH /api/profile', patch.data.message);

  const app2 = await json('POST', '/api/applications', {
    request_type: programs.data[0]?.title,
    comment: 'from client',
  }, clientToken);
  if (app2.status === 200) ok('POST /api/applications (клиент)');
  else fail('POST /api/applications клиент', app2.data.message);

  const myApps = await json('GET', '/api/my-applications', null, clientToken);
  if (myApps.status === 200 && myApps.data.length > 0) ok('GET /api/my-applications');
  else fail('GET /api/my-applications', 'empty');

  const adminLogin = await json('POST', '/api/login', {
    email: 'admin@fitness.local',
    password: 'admin123',
  });
  const adminToken = adminLogin.data.token;
  if (adminLogin.status === 200 && adminLogin.data.role === 'admin') ok('POST /api/login (админ)');
  else fail('POST /api/login админ', adminLogin.data.message);

  const adminApps = await json('GET', '/api/admin/applications', null, adminToken);
  if (adminApps.status === 200 && adminApps.data.length > 0) ok('GET /api/admin/applications');
  else fail('GET /api/admin/applications', 'empty');

  const leadId = adminApps.data[0]?.id;
  if (leadId) {
    const patchLead = await json('PATCH', `/api/admin/applications/${leadId}`, { status: 'called' }, adminToken);
    if (patchLead.status === 200) ok('PATCH /api/admin/applications/:id');
    else fail('PATCH admin status', patchLead.data.message);
  }

  const forbidden = await json('GET', '/api/admin/applications', null, clientToken);
  if (forbidden.status === 403) ok('Защита админки (403 для клиента)');
  else fail('Защита админки', `status ${forbidden.status}`);

  const logout = await json('POST', '/api/logout', null, clientToken);
  if (logout.status === 200) ok('POST /api/logout');
  else fail('POST /api/logout', logout.status);

  const home = await fetch(`${API}/`);
  if (home.status === 200) ok('GET / (SPA index)');
  else fail('GET /', home.status);

  const img = await fetch(`${API}/images/hero-1.jpg`);
  if (img.status === 200) ok('GET /images/hero-1.jpg');
  else fail('GET /images/hero-1.jpg', img.status);

  console.log(`\nИтого: ${passed} OK, ${failed} FAIL\n`);
  process.exit(failed ? 1 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
