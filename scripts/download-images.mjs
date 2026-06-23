#!/usr/bin/env node

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'client', 'public', 'images');
const IMAGES_JS = path.join(ROOT, 'client', 'src', 'images.js');

const proxy = (id, w) => {
  const src = `images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=85`;
  return `https://wsrv.nl/?url=${encodeURIComponent(src)}&w=${w}&output=jpg`;
};

const FILES = [
  ['photo-1534438327276-14e5300c3a48', 2200, 'hero-1'],
  ['photo-1571902943202-507ec2618e8f', 2200, 'hero-2'],
  ['photo-1576678927484-cc907957088c', 2200, 'hero-3'],
  ['photo-1581009146145-b5ef050c2e1e', 2200, 'hero-4'],
  ['photo-1571902943202-507ec2618e8f', 1500, 'club-1'],
  ['photo-1518611012118-696072aa579a', 1500, 'club-2'],
  ['photo-1549719386-74dfcbf7dbed', 1500, 'club-3'],
  ['photo-1599058917765-a780eda07a3e', 1500, 'club-4'],
  ['photo-1571902943202-507ec2618e8f', 800, 'program-1'],
  ['photo-1534438327276-14e5300c3a48', 800, 'program-2'],
  ['photo-1549719386-74dfcbf7dbed', 800, 'program-3'],
  ['photo-1599058917765-a780eda07a3e', 800, 'program-4'],
  ['photo-1506126613408-eca07ce68773', 800, 'program-5'],
  ['photo-1571019613914-85f342c6a11e', 800, 'coach-1'],
  ['photo-1567013127542-490d757e51fc', 800, 'coach-2'],
  ['photo-1594381898411-846e7d193883', 800, 'coach-3'],
  ['photo-1518310383802-640c2de311b2', 800, 'coach-4'],
  ['photo-1534438327276-14e5300c3a48', 800, 'zone-1'],
  ['photo-1623874514711-0f321325f318', 800, 'zone-2'],
  ['photo-1518611012118-696072aa579a', 800, 'zone-3'],
  ['photo-1571019613454-1cb2f99b2d8b', 800, 'zone-4'],
  ['photo-1494790108377-be9c29b29330', 800, 'review-1'],
  ['photo-1560250097-0b93528c311a', 800, 'review-2'],
  ['photo-1438761681033-6461ffad8d80', 800, 'review-3'],
  ['photo-1534438327276-14e5300c3a48', 1200, 'promo-main'],
  ['photo-1599058917765-a780eda07a3e', 1200, 'promo-kids'],
  ['photo-1571902943202-507ec2618e8f', 1200, 'about'],
  ['photo-1540497077202-7c8a3999166f', 1200, 'schedule'],
  ['photo-1571019613914-85f342c6a11e', 1200, 'lead'],
  ['photo-1524758631624-e2822e304c36', 1200, 'map'],
  ['photo-1517963879433-6ad2b056d712', 1600, 'auth'],
  ['photo-1576678927484-cc907957088c', 1400, 'admin'],
  ['photo-1506126613408-eca07ce68773', 1200, 'profile'],
];

async function download(id, w, name) {
  const url = proxy(id, w);
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'image/*' },
    redirect: 'follow',
    signal: AbortSignal.timeout(90000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 8000) throw new Error('file too small');
  await writeFile(path.join(OUT, `${name}.jpg`), buf);
  console.log(`ok ${name}.jpg (${Math.round(buf.length / 1024)} KB)`);
}

const LOCAL_IMAGES_JS = `const p = (name) => \`/images/\${name}.jpg\`;

export const IMAGES = {
  hero: [p('hero-1'), p('hero-2'), p('hero-3'), p('hero-4')],
  clubSlides: [
    { img: p('club-1'), n: '01', title: 'Просторный тренажерный зал', text: 'Зона силовых и функциональных тренировок для новичков и опытных клиентов.' },
    { img: p('club-2'), n: '02', title: 'Групповые программы', text: 'Сайкл, растяжка, функциональный тренинг и занятия под разные цели.' },
    { img: p('club-3'), n: '03', title: 'Единоборства', text: 'Бокс и ММА для взрослых и подростков в оборудованной спортивной зоне.' },
    { img: p('club-4'), n: '04', title: 'Детские секции', text: 'ОФП, гимнастика, танцы и единоборства для детей от 3 лет.' }
  ],
  programs: [p('program-1'), p('program-2'), p('program-3'), p('program-4'), p('program-5')],
  coaches: [p('coach-1'), p('coach-2'), p('coach-3'), p('coach-4')],
  promoMain: p('promo-main'),
  promoKids: p('promo-kids'),
  about: p('about'),
  schedule: p('schedule'),
  lead: p('lead'),
  map: p('map'),
  auth: p('auth'),
  admin: p('admin'),
  profile: p('profile'),
  zones: [
    { img: p('zone-1'), title: 'Силовая зона', text: 'Свободные веса, тренажёры и зона для базовых упражнений.' },
    { img: p('zone-2'), title: 'Кардио-зона', text: 'Беговые дорожки, велотренажёры и эллипсы с видом на зал.' },
    { img: p('zone-3'), title: 'Групповой зал', text: 'Сайкл, функционал и растяжка в просторной студии.' },
    { img: p('zone-4'), title: 'Функционал', text: 'Кроссфит-рама, канаты, медболы и зона для HIIT.' }
  ],
  community: [
    { img: p('review-1'), name: 'Анна К.', text: 'За месяц привела форму в порядок — тренеры внимательные, зал всегда чистый.' },
    { img: p('review-2'), name: 'Максим Р.', text: 'Удобное расписание и быстрая запись через сайт. Рекомендую IMPULSE.' },
    { img: p('review-3'), name: 'Елена В.', text: 'Хожу на групповые с дочерью — детская секция на высоте.' }
  ]
};
`;

async function main() {
  await mkdir(OUT, { recursive: true });
  let ok = 0;
  for (const [id, w, name] of FILES) {
    try {
      await download(id, w, name);
      ok += 1;
    } catch (e) {
      console.error(`fail ${name}:`, e.message);
    }
  }
  console.log(`\nСкачано: ${ok}/${FILES.length}`);
  if (ok >= FILES.length * 0.8) {
    await writeFile(IMAGES_JS, LOCAL_IMAGES_JS, 'utf8');
    console.log('images.js переключён на локальные файлы');
  } else if (ok === 0) {
    console.log('CDN в images.js остаётся — открой сайт с интернетом');
    process.exit(1);
  }
}

main();
