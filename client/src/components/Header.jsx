import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getToken } from '../api.js';

export default function Header() {
  const [open, setOpen] = useState(false);
  const loggedIn = !!getToken();

  const close = () => setOpen(false);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className="header">
      <div className="container header__inner">
        <a className="logo" href="#top" onClick={close}>IMPULSE</a>
        <nav className={`nav${open ? ' nav--open' : ''}`} id="nav">
          <a href="#about" onClick={close}>О нас</a>
          <a href="#gallery" onClick={close}>Галерея</a>
          <a href="#promos" onClick={close}>Акции</a>
          <a href="#cards" onClick={close}>Абонементы</a>
          <a href="#zones" onClick={close}>Студии</a>
          <a href="#kids" onClick={close}>Дети</a>
          <a href="#team" onClick={close}>Команда</a>
          <a href="#jobs" onClick={close}>Вакансии</a>
          <a href="#contacts" onClick={close}>Контакты</a>
          {loggedIn ? (
            <Link to="/profile" onClick={close}>Кабинет</Link>
          ) : (
            <>
              <Link to="/login" onClick={close}>Вход</Link>
              <Link to="/register" onClick={close}>Регистрация</Link>
            </>
          )}
          <Link to="/admin" onClick={close}>Админ</Link>
        </nav>
        <button
          className="burger"
          type="button"
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? '✕' : '☰'}
        </button>
      </div>
    </header>
  );
}
