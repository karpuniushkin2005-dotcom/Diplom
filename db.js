const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

function getDbConfig() {
  const url = process.env.MYSQL_URL || process.env.DATABASE_URL;
  if (url) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: Number(parsed.port || 3306),
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ''),
    };
  }

  return {
    host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
    port: Number(process.env.MYSQLPORT || process.env.DB_PORT || 3306),
    user: process.env.MYSQLUSER || process.env.DB_USER || 'impulse',
    password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || 'impulse123',
    database: process.env.MYSQLDATABASE || process.env.DB_NAME || 'impulse_fitness',
  };
}

function shouldUseMysqlSsl(host) {
  if (!host) return false;
  if (['localhost', '127.0.0.1', 'mysql'].includes(host)) return false;
  if (host.endsWith('.railway.internal')) return false;
  return true;
}

const dbConfig = getDbConfig();
const useMysqlSsl = shouldUseMysqlSsl(dbConfig.host);

console.log(`MySQL: ${dbConfig.host}:${dbConfig.port}/${dbConfig.database} (ssl: ${useMysqlSsl})`);

const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  connectTimeout: 15000,
  ssl: useMysqlSsl ? { rejectUnauthorized: false } : undefined,
});

async function run(sql, params = []) {
  const [result] = await pool.execute(sql, params);
  return { id: result.insertId, changes: result.affectedRows };
}

async function all(sql, params = []) {
  const [rows] = await pool.execute(sql, params);
  return rows;
}

async function get(sql, params = []) {
  const rows = await all(sql, params);
  return rows[0];
}

async function initDatabase() {
  await run(`CREATE TABLE IF NOT EXISTS coaches (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    experience VARCHAR(100) NOT NULL,
    description TEXT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await run(`CREATE TABLE IF NOT EXISTS programs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    price VARCHAR(100) NOT NULL,
    description TEXT NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await run(`CREATE TABLE IF NOT EXISTS schedule (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day VARCHAR(50) NOT NULL,
    time VARCHAR(20) NOT NULL,
    program VARCHAR(255) NOT NULL,
    coach VARCHAR(255) NOT NULL,
    group_type VARCHAR(100) NOT NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await run(`CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'client',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  await run(`CREATE TABLE IF NOT EXISTS leads (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    fullname VARCHAR(255) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    email VARCHAR(255),
    request_type VARCHAR(255) NOT NULL,
    comment TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'new',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_leads_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

  const coachCount = await get('SELECT COUNT(*) AS count FROM coaches');
  if (Number(coachCount.count) === 0) {
    const coaches = [
      ['Андрей Приходько', 'Координатор тренажерного зала', '12 лет', 'Составляет программы силовой подготовки и сопровождает новичков на старте.'],
      ['Владислав Архипов', 'Тренер тренажерного зала', '8 лет', 'Специализируется на функциональном тренинге, снижении веса и наборе мышечной массы.'],
      ['Наталья Осипова', 'Инструктор групповых программ', '10 лет', 'Проводит аэройогу, растяжку и оздоровительные групповые занятия.'],
      ['Роберт Авоиан', 'Тренер единоборств', '9 лет', 'Ведет бокс и смешанные единоборства для взрослых и подростков.']
    ];
    for (const coach of coaches) {
      await run('INSERT INTO coaches (name, role, experience, description) VALUES (?, ?, ?, ?)', coach);
    }
  }

  const programCount = await get('SELECT COUNT(*) AS count FROM programs');
  if (Number(programCount.count) === 0) {
    const programs = [
      ['Безлимитная карта', 'Абонементы', 'от 3 900 ₽/мес', 'Посещение клуба, групповые программы, сауна и вводный инструктаж.'],
      ['Персональные тренировки', 'Тренажерный зал', 'от 2 500 ₽', 'Индивидуальные занятия с тренером, программа питания и контроль техники.'],
      ['Единоборства', 'Студии', 'первое занятие бесплатно', 'Бокс, ММА, самбо и кикбоксинг для детей и взрослых.'],
      ['Zaruba Kids', 'Детские секции', 'от 700 ₽', 'Танцы, гимнастика, ОФП, йога и единоборства для детей от 3 лет.'],
      ['Аэройога и растяжка', 'Групповые программы', 'по расписанию', 'Мягкие занятия для гибкости, восстановления и снятия напряжения.']
    ];
    for (const program of programs) {
      await run('INSERT INTO programs (title, category, price, description) VALUES (?, ?, ?, ?)', program);
    }
  }

  const scheduleCount = await get('SELECT COUNT(*) AS count FROM schedule');
  if (Number(scheduleCount.count) === 0) {
    const rows = [
      ['Понедельник', '09:00', 'Функциональный тренинг', 'Владислав Архипов', 'Взрослые'],
      ['Понедельник', '18:30', 'Бокс', 'Роберт Авоиан', 'Взрослые'],
      ['Вторник', '17:00', 'Zaruba Kids ОФП', 'Наталья Осипова', 'Дети'],
      ['Среда', '20:00', 'Аэройога', 'Наталья Осипова', 'Взрослые'],
      ['Четверг', '19:00', 'ММА', 'Роберт Авоиан', 'Взрослые'],
      ['Суббота', '11:00', 'Стартовая тренировка', 'Андрей Приходько', 'Новички']
    ];
    for (const row of rows) {
      await run('INSERT INTO schedule (day, time, program, coach, group_type) VALUES (?, ?, ?, ?, ?)', row);
    }
  }

  const admin = await get('SELECT id FROM users WHERE email = ?', ['admin@fitness.local']);
  if (!admin) {
    const passwordHash = await bcrypt.hash('admin123', 10);
    await run(
      'INSERT INTO users (fullname, phone, email, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      ['Администратор сайта', '+7 (999) 000-00-00', 'admin@fitness.local', passwordHash, 'admin']
    );
  }
}

module.exports = { pool, run, all, get, initDatabase };
