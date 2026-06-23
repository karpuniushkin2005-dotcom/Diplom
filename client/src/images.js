const p = (name) => `/images/${name}.jpg`;

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
