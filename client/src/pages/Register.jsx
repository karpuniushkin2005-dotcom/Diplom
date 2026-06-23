import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader.jsx';
import { apiRequest, setToken } from '../api.js';
import { IMAGES } from '../images.js';

export default function Register() {
  const navigate = useNavigate();
  useEffect(() => {
    document.body.className = 'auth-page';
    return () => { document.body.className = ''; };
  }, []);
  const [form, setForm] = useState({ fullname: '', phone: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('Отправляем данные...');
    setOk(false);
    try {
      const result = await apiRequest('/api/register', {
        method: 'POST',
        body: JSON.stringify(form)
      });
      setToken(result.token);
      setMessage(result.message);
      setOk(true);
      setTimeout(() => navigate(result.role === 'admin' ? '/admin' : '/profile'), 600);
    } catch (error) {
      setMessage(error.message);
      setOk(false);
    }
  };

  return (
    <>
      <AuthHeader links={[{ to: '/login', label: 'Вход' }]} />
      <main className="section auth-section">
        <div className="container auth-grid">
          <div className="auth-grid__visual">
            <img src={IMAGES.profile} alt="Групповая тренировка" />
            <div>
              <p className="eyebrow">Новый клиент</p>
              <h1>Регистрация</h1>
              <p>Создайте аккаунт клиента. После регистрации можно войти в личный кабинет и отслеживать свои заявки.</p>
            </div>
          </div>
          <form className="form auth-form" onSubmit={onSubmit}>
            <input name="fullname" placeholder="ФИО" value={form.fullname} onChange={onChange} required />
            <input name="phone" placeholder="+7 (___) ___-__-__" value={form.phone} onChange={onChange} required />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
            <input name="password" type="password" placeholder="Пароль" minLength={6} value={form.password} onChange={onChange} required />
            <button className="btn btn--primary" type="submit">Зарегистрироваться</button>
            <Link className="auth-link" to="/login">Уже есть аккаунт? Войти</Link>
            {message && <p className="form-message" style={{ color: ok ? '#118a32' : '#8fbf22' }}>{message}</p>}
          </form>
        </div>
      </main>
    </>
  );
}
