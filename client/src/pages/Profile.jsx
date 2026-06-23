import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthHeader from '../components/AuthHeader.jsx';
import { apiRequest, setToken } from '../api.js';
import { IMAGES } from '../images.js';

const STATUS_LABELS = {
  new: 'Новая',
  called: 'Созвонились',
  confirmed: 'Подтверждена',
  closed: 'Закрыта',
  processed: 'Обработана'
};

export default function Profile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [leads, setLeads] = useState([]);
  const [form, setForm] = useState({ fullname: '', phone: '' });
  const [info, setInfo] = useState('Загружаем данные профиля...');
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState(false);

  const load = async () => {
    try {
      const { user: me } = await apiRequest('/api/me');
      if (!me) {
        navigate('/login');
        return;
      }
      setUser(me);
      setForm({ fullname: me.fullname, phone: me.phone });
      setInfo(`${me.fullname} | ${me.email} | ${me.phone}`);
      const apps = await apiRequest('/api/my-applications');
      setLeads(apps);
    } catch (error) {
      setInfo(error.message);
      if (error.message.includes('авториза')) navigate('/login');
    }
  };

  useEffect(() => {
    document.body.className = 'admin-page';
    load();
    return () => { document.body.className = ''; };
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('Сохраняем профиль...');
    try {
      const result = await apiRequest('/api/profile', {
        method: 'PATCH',
        body: JSON.stringify(form)
      });
      setMessage(result.message);
      setOk(true);
      await load();
    } catch (error) {
      setMessage(error.message);
      setOk(false);
    }
  };

  const logout = async () => {
    await apiRequest('/api/logout', { method: 'POST' });
    setToken(null);
    navigate('/login');
  };

  return (
    <>
      <AuthHeader links={[{ to: '/login', label: 'Вход' }]} />
      <main className="section profile-section">
        <div className="container">
          <div className="page-banner">
            <img src={IMAGES.profile} alt="Личный кабинет IMPULSE" />
          </div>
          <div className="section-head">
            <p className="eyebrow">Кабинет клиента</p>
            <h1>Мои заявки</h1>
            <p>{info}</p>
          </div>
          <form className="form admin-login" onSubmit={onSubmit}>
            <input name="fullname" placeholder="ФИО" value={form.fullname} onChange={(e) => setForm({ ...form, fullname: e.target.value })} required />
            <input name="phone" placeholder="+7 (___) ___-__-__" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
            <button className="btn btn--primary" type="submit">Сохранить профиль</button>
            {message && <p className="form-message" style={{ color: ok ? '#118a32' : '#8fbf22' }}>{message}</p>}
          </form>
          <div className="admin-toolbar">
            <a className="btn btn--primary" href="/#lead">Записаться на программу</a>
            <button className="btn btn--ghost" type="button" onClick={logout}>Выйти</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Дата</th><th>Программа</th><th>Телефон</th><th>Email</th><th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 ? (
                  <tr><td colSpan={6}>У вас пока нет заявок. Запишитесь на программу на главной странице.</td></tr>
                ) : leads.map((lead) => (
                  <tr key={lead.id}>
                    <td data-label="ID">{lead.id}</td>
                    <td data-label="Дата">{lead.created_at}</td>
                    <td data-label="Программа">{lead.request_type}</td>
                    <td data-label="Телефон">{lead.phone}</td>
                    <td data-label="Email">{lead.email || '-'}</td>
                    <td data-label="Статус">{STATUS_LABELS[lead.status] || lead.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </>
  );
}
