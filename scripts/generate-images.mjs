#!/usr/bin/env node

import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'client', 'public', 'images');

const PALETTES = [
  [[7, 18, 7], [35, 90, 45]],
  [[12, 40, 18], [57, 140, 35]],
  [[20, 30, 15], [80, 120, 50]],
  [[10, 25, 10], [45, 100, 40]],
  [[15, 35, 20], [70, 110, 55]],
];

function hashName(name) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return h;
}

function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildSvg(w, h, c1, c2, label, sub, seed) {
  const angle = 0.2 + (seed % 100) / 100;
  const x2 = Math.round(Math.cos(angle) * 100);
  const y2 = Math.round(Math.sin(angle) * 100) + 100;
  const labelSize = w > 1000 ? 28 : 20;
  const subSize = w > 1000 ? 18 : 14;
  const lines = Array.from({ length: 6 }, (_, i) => {
    const y = Math.round(h * 0.15 * i);
    return `<line x1="0" y1="${y}" x2="${w}" y2="${y + 40}" stroke="rgba(124,255,0,0.12)" stroke-width="2"/>`;
  }).join('');

  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="${x2}%" y2="${y2}%">
      <stop offset="0%" stop-color="rgb(${c1.join(',')})"/>
      <stop offset="100%" stop-color="rgb(${c2.join(',')})"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)"/>
  ${lines}
  <circle cx="${Math.round(w * 0.75)}" cy="${Math.round(h * 0.3)}" r="${Math.min(w, h) / 3}" fill="rgba(124,255,0,0.18)"/>
  <circle cx="${Math.round(w * 0.2)}" cy="${Math.round(h * 0.7)}" r="${Math.min(w, h) / 4}" fill="rgba(57,140,35,0.16)"/>
  <rect x="24" y="${h - 120}" width="${w - 48}" height="88" rx="16" fill="#071207"/>
  ${label ? `<text x="40" y="${h - 72}" fill="#7CFF00" font-family="Arial,sans-serif" font-size="${labelSize}" font-weight="700">${escapeXml(label)}</text>` : ''}
  ${sub ? `<text x="40" y="${h - 42}" fill="#DCF5D2" font-family="Arial,sans-serif" font-size="${subSize}">${escapeXml(sub)}</text>` : ''}
</svg>`;
}

async function save(name, w, h, label = '', sub = '') {
  const i = hashName(name) % PALETTES.length;
  const [c1, c2] = PALETTES[i];
  const svg = buildSvg(w, h, c1, c2, label, sub, hashName(name));
  const outPath = path.join(OUT, `${name}.jpg`);
  await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(outPath);
  console.log(`  ${name}.jpg`);
}

async function main() {
  await mkdir(OUT, { recursive: true });
  console.log('Генерация изображений...');

  for (let i = 1; i <= 4; i += 1) {
    await save(`hero-${i}`, 1920, 1080, 'IMPULSE Fitness', 'Сила · Движение · Здоровье');
  }

  const slides = [
    ['club-1', 'Тренажёрный зал'],
    ['club-2', 'Групповые программы'],
    ['club-3', 'Единоборства'],
    ['club-4', 'Детские секции'],
  ];
  for (const [name, label] of slides) await save(name, 1500, 900, label, 'IMPULSE');

  for (let i = 1; i <= 5; i += 1) await save(`program-${i}`, 800, 600, `Программа ${i}`, '');
  for (let i = 1; i <= 4; i += 1) await save(`coach-${i}`, 800, 600, `Тренер ${i}`, '');

  const zones = [
    ['zone-1', 'Силовая зона'],
    ['zone-2', 'Кардио-зона'],
    ['zone-3', 'Групповой зал'],
    ['zone-4', 'Функционал'],
  ];
  for (const [name, label] of zones) await save(name, 800, 600, label, '');

  for (let i = 1; i <= 3; i += 1) await save(`review-${i}`, 800, 600, 'Отзыв клиента', 'IMPULSE');

  await save('promo-main', 1200, 800, 'Абонемент от 13 900 ₽', 'Тренажёрный зал');
  await save('promo-kids', 1200, 800, 'Детские секции', 'Первое занятие бесплатно');
  await save('about', 1200, 800, 'О клубе', '2000 м² пространства');
  await save('schedule', 1200, 800, 'Расписание', 'Групповые занятия');
  await save('lead', 1200, 800, 'Запись', 'Персональное предложение');
  await save('map', 1200, 800, 'Контакты', 'ул. Спортивная, 7к6');
  await save('auth', 1600, 1000, 'Вход', 'Личный кабинет');
  await save('admin', 1400, 900, 'Админ-панель', 'Управление заявками');
  await save('profile', 1200, 800, 'Профиль', 'Мои заявки');

  for (const [name, label] of [
    ['bg-hero', 'IMPULSE'],
    ['bg-auth', 'Авторизация'],
    ['bg-admin', 'Администрирование'],
    ['bg-schedule', 'Расписание'],
    ['bg-promo', 'Акции'],
    ['bg-lead', 'Заявка'],
  ]) {
    await save(name, 1800, 1200, label, '');
  }

  console.log(`Готово: ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
