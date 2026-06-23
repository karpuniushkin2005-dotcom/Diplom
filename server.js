require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const { initDatabase } = require('./db');
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;
const clientDist = path.join(__dirname, 'client', 'dist');

let dbReady = false;

app.set('trust proxy', 1);
app.get('/api/health', (req, res) => {
  res.json({ ok: true, db: dbReady });
});
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(clientDist));

app.use('/api', authRoutes);
app.use('/api', apiRoutes);

app.use('/api', (req, res) => {
  res.status(404).json({ message: 'Маршрут API не найден' });
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDist, 'index.html'), (err) => {
    if (err) next(err);
  });
});

async function connectDatabase() {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      await initDatabase();
      dbReady = true;
      console.log('База данных готова');
      return;
    } catch (error) {
      console.log(`Ожидание MySQL... ${attempt}/30: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
  console.error('MySQL недоступен. Проверьте MYSQLHOST, MYSQLUSER, MYSQLPASSWORD, MYSQLDATABASE в Railway Variables.');
}

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  connectDatabase();
});
