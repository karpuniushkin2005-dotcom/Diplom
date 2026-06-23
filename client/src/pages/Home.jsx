import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { apiRequest } from '../api.js';
import { IMAGES } from '../images.js';

export default function Home() {
  const location = useLocation();
  const [programs, setPrograms] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [filter, setFilter] = useState('');
  const [heroIdx, setHeroIdx] = useState(0);
  const [slideIdx, setSlideIdx] = useState(0);
  const [lead, setLead] = useState({ fullname: '', phone: '', email: '', request_type: '', comment: '' });
  const [leadMsg, setLeadMsg] = useState('');
  const [leadOk, setLeadOk] = useState(false);
  const [agree, setAgree] = useState(false);

  useEffect(() => {
    document.body.className = '';
    Promise.all([
      apiRequest('/api/programs'),
      apiRequest('/api/coaches'),
      apiRequest('/api/schedule')
    ]).then(([p, c, s]) => {
      setPrograms(p);
      setCoaches(c);
      setSchedule(s);
    }).catch(console.error);

    apiRequest('/api/me').then(({ user }) => {
      if (user) setLead((l) => ({ ...l, fullname: user.fullname, phone: user.phone, email: user.email }));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!location.hash) return;
    const el = document.querySelector(location.hash);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  useEffect(() => {
    const t = setInterval(() => setHeroIdx((i) => (i + 1) % IMAGES.hero.length), 4500);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlideIdx((i) => (i + 1) % IMAGES.clubSlides.length), 5500);
    return () => clearInterval(t);
  }, []);

  const filtered = filter ? schedule.filter((r) => r.group_type === filter) : schedule;

  const submitLead = async (e) => {
    e.preventDefault();
    if (!agree) return;
    setLeadMsg('Отправляем заявку...');
    try {
      const result = await apiRequest('/api/applications', {
        method: 'POST',
        body: JSON.stringify(lead)
      });
      setLeadMsg(result.message);
      setLeadOk(true);
      setLead({ fullname: lead.fullname, phone: lead.phone, email: lead.email, request_type: '', comment: '' });
      setAgree(false);
    } catch (error) {
      setLeadMsg(error.message);
      setLeadOk(false);
    }
  };

  return (
    <>
      <Header />
      <main id="top">
        <section className="hero">
          <div className="hero-bg-slider" aria-hidden="true">
            {IMAGES.hero.map((url, i) => (
              <div key={url} className={`hero-bg-slide${i === heroIdx ? ' is-active' : ''}`} style={{ backgroundImage: `url('${url}')` }} />
            ))}
          </div>
          <div className="container hero__grid">
            <div>
              <p className="eyebrow">Фитнес-клуб рядом с метро</p>
              <h1>Тренировки, которые становятся образом жизни</h1>
              <p className="hero__text">Современный фитнес-клуб для силовых тренировок, групповых программ, единоборств и персонального сопровождения.</p>
              <div className="hero__actions">
                <a className="btn btn--primary" href="#lead">Хочу первую тренировку</a>
                <a className="btn btn--ghost" href="#schedule">Смотреть расписание</a>
              </div>
            </div>
            <div className="hero-card">
              <span>Акция до конца месяца</span>
              <strong className="promo-title">
                <span className="promo-title__start">Старт за </span>
                <span className="promo-title__zero">0</span>
                <span className="promo-title__end"> рублей</span>
              </strong>
              <p>Оставьте заявку и получите вводный инструктаж, гостевой визит и консультацию тренера.</p>
            </div>
          </div>
        </section>

        <section className="stats">
          <div className="container stats__grid">
            <div><b>2000 м²</b><span>площадь клуба</span></div>
            <div><b>15+</b><span>групповых направлений</span></div>
            <div><b>5 мин</b><span>от метро</span></div>
            <div><b>24/7</b><span>онлайн-заявки</span></div>
          </div>
        </section>

        <section className="section promo-section" id="promos">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Спецпредложения</p>
              <h2>Выбери свой старт</h2>
            </div>
            <div className="promo-grid">
              <article className="promo-card promo-card--main">
                <img src={IMAGES.promoMain} alt="Тренажерный зал" />
                <div><span>01</span><h3>Абонемент от 13 900 ₽</h3><p>Тренажерный зал, групповые программы, вводная тренировка и поддержка администратора.</p><a className="btn btn--primary" href="#lead">Узнать стоимость</a></div>
              </article>
              <article className="promo-card">
                <img src={IMAGES.promoKids} alt="Детская секция" />
                <div><span>02</span><h3>Первое занятие бесплатно</h3><p>Единоборства, ОФП, гимнастика и танцы для детей и взрослых.</p><a className="btn btn--ghost" href="#lead">Записаться</a></div>
              </article>
            </div>
          </div>
        </section>

        <section className="section kids" id="kids">
          <div className="container two-cols two-cols--image">
            <div>
              <p className="eyebrow">Детские секции</p>
              <h2>Спорт с раннего возраста</h2>
              <p>ОФП, гимнастика, танцы и единоборства для детей от 3 лет. Безопасная среда, опытные тренеры и удобное расписание для родителей.</p>
              <div className="tag-cloud">
                <span>ОФП</span><span>Гимнастика</span><span>Танцы</span><span>Бокс</span><span>ММА</span>
              </div>
              <a className="btn btn--primary" href="#lead" style={{ marginTop: 20 }}>Записать ребёнка</a>
            </div>
            <div className="section-image">
              <img src={IMAGES.promoKids} alt="Детская секция IMPULSE" />
            </div>
          </div>
        </section>

        <section className="section gallery-section" id="gallery">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Атмосфера клуба</p>
              <h2>Залы, тренировки и команда</h2>
            </div>
            <div className="club-slider" id="clubSlider">
              {IMAGES.clubSlides.map((s, i) => (
                <div key={s.n} className={`club-slide${i === slideIdx ? ' is-active' : ''}`}>
                  <img src={s.img} alt={s.title} />
                  <div className="club-slide__caption"><span>{s.n}</span><h3>{s.title}</h3><p>{s.text}</p></div>
                </div>
              ))}
              <button className="slider-btn slider-btn--prev" type="button" aria-label="Предыдущий" onClick={() => setSlideIdx((i) => (i - 1 + IMAGES.clubSlides.length) % IMAGES.clubSlides.length)}>‹</button>
              <button className="slider-btn slider-btn--next" type="button" aria-label="Следующий" onClick={() => setSlideIdx((i) => (i + 1) % IMAGES.clubSlides.length)}>›</button>
            </div>
          </div>
        </section>

        <section className="section zones-section" id="zones">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Зоны клуба</p>
              <h2>Пространство под любую цель</h2>
            </div>
            <div className="zones-grid">
              {IMAGES.zones.map((z) => (
                <article key={z.title}>
                  <img src={z.img} alt={z.title} />
                  <h3>{z.title}</h3>
                  <p>{z.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="about">
          <div className="container two-cols two-cols--image">
            <div>
              <p className="eyebrow">О клубе</p>
              <h2>Пространство для силы, здоровья и движения</h2>
              <p>IMPULSE Fitness объединяет тренажерный зал, функциональный тренинг, единоборства, групповые программы и детские секции. Сайт показывает цифровую витрину клуба: клиент видит услуги, расписание и отправляет заявку, а администратор работает с ней в защищенной панели.</p>
            </div>
            <div className="section-image">
              <img src={IMAGES.about} alt="Интерьер фитнес-клуба IMPULSE" />
            </div>
          </div>
        </section>

        <section className="section dark" id="cards">
          <div className="container">
            <div className="section-head"><p className="eyebrow">Выберите формат</p><h2>Абонементы и направления</h2></div>
            <div className="cards">
              {programs.map((p, i) => (
                <article key={p.id} className="card">
                  <img className="card__image" src={IMAGES.programs[i % IMAGES.programs.length]} alt={p.title} />
                  <p className="card__meta">{p.category}</p>
                  <h3>{p.title}</h3>
                  <p>{p.description}</p>
                  <strong>{p.price}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section dark" id="team">
          <div className="container">
            <div className="section-head"><p className="eyebrow">Наша команда</p><h2>Тренеры и инструкторы</h2></div>
            <div className="cards">
              {coaches.map((c, i) => (
                <article key={c.id} className="card">
                  <img className="card__image" src={IMAGES.coaches[i % IMAGES.coaches.length]} alt={c.name} />
                  <p className="card__meta">{c.role}</p>
                  <h3>{c.name}</h3>
                  <p>{c.description}</p>
                  <strong>Опыт: {c.experience}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section schedule-section" id="schedule">
          <div className="container schedule-layout">
            <div className="schedule-layout__visual">
              <img src={IMAGES.schedule} alt="Групповая тренировка" />
            </div>
            <div className="schedule-layout__content">
              <div className="section-head"><p className="eyebrow">Расписание</p><h2>Ближайшие занятия</h2></div>
              <div className="admin-toolbar">
                <label htmlFor="scheduleFilter">Фильтр по группе:</label>
                <select id="scheduleFilter" value={filter} onChange={(e) => setFilter(e.target.value)}>
                  <option value="">Все группы</option>
                  <option value="Взрослые">Взрослые</option>
                  <option value="Дети">Дети</option>
                  <option value="Новички">Новички</option>
                </select>
              </div>
              <div className="table-wrap">
                <table>
                  <thead><tr><th>День</th><th>Время</th><th>Тренировка</th><th>Тренер</th><th>Группа</th></tr></thead>
                  <tbody>
                    {filtered.map((row) => (
                      <tr key={row.id}>
                        <td data-label="День">{row.day}</td>
                        <td data-label="Время">{row.time}</td>
                        <td data-label="Тренировка">{row.program}</td>
                        <td data-label="Тренер">{row.coach}</td>
                        <td data-label="Группа">{row.group_type}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="section jobs" id="jobs">
          <div className="container two-cols">
            <div>
              <p className="eyebrow">Вакансии</p>
              <h2>Присоединяйтесь к команде IMPULSE</h2>
              <p>Ищем тренеров групповых программ, инструкторов тренажёрного зала и администраторов ресепшн. Гибкий график, обучение и работа в современном клубе.</p>
            </div>
            <div>
              <p><b>Открытые позиции:</b></p>
              <ul style={{ lineHeight: 1.8, marginTop: 12 }}>
                <li>Тренер групповых программ</li>
                <li>Инструктор тренажёрного зала</li>
                <li>Администратор клуба</li>
              </ul>
              <a className="btn btn--primary" href="#lead" style={{ marginTop: 20 }}>Откликнуться на вакансию</a>
            </div>
          </div>
        </section>

        <section className="section community-section" id="reviews">
          <div className="container">
            <div className="section-head">
              <p className="eyebrow">Отзывы</p>
              <h2>Нам доверяют клиенты</h2>
            </div>
            <div className="community-grid">
              {IMAGES.community.map((item) => (
                <article key={item.name}>
                  <img src={item.img} alt={item.name} />
                  <p>{item.text}</p>
                  <strong>{item.name}</strong>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section lead" id="lead">
          <div className="container lead__grid lead__grid--image">
            <div className="lead__visual">
              <img src={IMAGES.lead} alt="Персональная тренировка" />
            </div>
            <div>
              <p className="eyebrow">Заявка</p>
              <h2>Заберите персональное предложение</h2>
              <p>Форма позволяет выбрать программу. Данные отправляются на сервер Node.js и сохраняются в базе данных.</p>
              <form className="form" onSubmit={submitLead}>
                <input placeholder="Ваше имя" value={lead.fullname} onChange={(e) => setLead({ ...lead, fullname: e.target.value })} required />
                <input placeholder="+7 (___) ___-__-__" value={lead.phone} onChange={(e) => setLead({ ...lead, phone: e.target.value })} required />
                <input placeholder="Email" value={lead.email} onChange={(e) => setLead({ ...lead, email: e.target.value })} />
                <select value={lead.request_type} onChange={(e) => setLead({ ...lead, request_type: e.target.value })} required>
                  <option value="">Выберите программу или услугу</option>
                  {programs.map((p) => <option key={p.id} value={p.title}>{p.title} — {p.price}</option>)}
                  <option value="Отклик на вакансию">Отклик на вакансию</option>
                </select>
                <textarea placeholder="Комментарий" value={lead.comment} onChange={(e) => setLead({ ...lead, comment: e.target.value })} />
                <label className="checkbox"><input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required /> Согласен на обработку персональных данных</label>
                <button className="btn btn--primary" type="submit">Отправить заявку</button>
                {leadMsg && <p className="form-message" style={{ color: leadOk ? '#118a32' : '#8fbf22' }}>{leadMsg}</p>}
              </form>
            </div>
          </div>
        </section>

        <section className="section contacts" id="contacts">
          <div className="container contacts__grid">
            <div>
              <p className="eyebrow">Контакты</p>
              <h2>Москва, ул. Спортивная, 7к6</h2>
              <p>Пн-Пт 6:30-24:00, Сб-Вс 8:30-22:00</p>
              <p><b>Телефон:</b> 8 (495) 120-33-61</p>
            </div>
            <div className="map">
              <img src={IMAGES.map} alt="Фитнес-клуб IMPULSE" />
              <span>Схема проезда / 3D-тур</span>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
