# IMPULSE Fitness — дипломный сайт

Сайт фитнес-клуба: React + Node.js + MySQL.

## Локальный запуск

```bash
docker compose up -d
npm install
cd client && npm install && cd ..
npm run dev
```

- Сайт: http://localhost:5173
- API: http://localhost:3000
- Админ: `admin@fitness.local` / `admin123`

## Деплой на Railway

### 1. Репозиторий

Код уже на GitHub: https://github.com/karpuniushkin2005-dotcom/Diplom

### 2. Новый проект в Railway

1. Открой [railway.app](https://railway.app) → **New Project**
2. **Deploy from GitHub repo** → выбери `Diplom`
3. Railway соберёт проект по `Dockerfile`

### 3. База MySQL

1. В проекте: **+ New** → **Database** → **MySQL**
2. Открой сервис сайта → **Variables** → **Add Reference**
3. Подключи переменные из MySQL:
   - `MYSQLHOST` → `MYSQLHOST`
   - `MYSQLPORT` → `MYSQLPORT`
   - `MYSQLUSER` → `MYSQLUSER`
   - `MYSQLPASSWORD` → `MYSQLPASSWORD`
   - `MYSQLDATABASE` → `MYSQLDATABASE`

### 4. Переменные сайта

В сервисе приложения добавь:

| Переменная | Значение |
|---|---|
| `NODE_ENV` | `production` |
| `JWT_SECRET` | любая длинная случайная строка |

`PORT` Railway задаёт сам.

### 5. Домен

Сервис сайта → **Settings** → **Networking** → **Generate Domain**

После деплоя сайт откроется по ссылке вида `https://diplom-production-xxxx.up.railway.app`

### 6. Проверка

- Главная страница загружается
- `/api/programs` отдаёт JSON
- `/admin` — вход `admin@fitness.local` / `admin123`

## Команды

```bash
npm run dev      # разработка
npm run build    # сборка React
npm start        # production-сервер
npm test         # проверка API
```
