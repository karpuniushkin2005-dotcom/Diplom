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

app.set('trust proxy', 1);
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

async function startServer() {
  for (let attempt = 1; attempt <= 30; attempt += 1) {
    try {
      await initDatabase();
      app.listen(PORT, () => {
        console.log(`Сервер запущен: http://localhost:${PORT}`);
        console.log('Фронтенд: React (client/dist)');
        console.log('База данных: MySQL');
        console.log('Админ: admin@fitness.local / admin123');
      });
      return;
    } catch (error) {
      if (attempt === 30) {
        console.error('Ошибка инициализации базы данных:', error.message);
        process.exit(1);
      }
      console.log(`Ожидание MySQL... попытка ${attempt}/30`);
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }
}

startServer();
