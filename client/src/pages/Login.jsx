import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader.jsx';
import { apiRequest, setToken } from '../api.js';
import { IMAGES } from '../images.js';

export default function Login() {
  const navigate = useNavigate();
  useEffect(() => {
    document.body.className = 'auth-page';
    return () => { document.body.className = ''; };
  }, []);
  const [form, setForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('Отправляем данные...');
    setOk(false);
    try {
      const result = await apiRequest('/api/login', {
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
      <AuthHeader links={[{ to: '/register', label: 'Регистрация' }]} />
      <main className="section auth-section">
        <div className="container auth-grid">
          <div className="auth-grid__visual">
            <img src={IMAGES.auth} alt="Тренировка в IMPULSE" />
            <div>
              <p className="eyebrow">Личный кабинет</p>
              <h1>Вход клиента</h1>
              <p>Введите email и пароль, чтобы открыть личный кабинет и посмотреть свои заявки на программы клуба.</p>
            </div>
          </div>
          <form className="form auth-form" onSubmit={onSubmit}>
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={onChange} required />
            <input name="password" type="password" placeholder="Пароль" value={form.password} onChange={onChange} required />
            <button className="btn btn--primary" type="submit">Войти</button>
            <Link className="auth-link" to="/register">Нет аккаунта? Зарегистрироваться</Link>
            {message && <p className="form-message" style={{ color: ok ? '#118a32' : '#8fbf22' }}>{message}</p>}
          </form>
        </div>
      </main>
    </>
  );
}
