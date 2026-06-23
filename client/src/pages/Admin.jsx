import { useEffect, useState } from 'react';
import AuthHeader from '../components/AuthHeader.jsx';
import { apiRequest, setToken } from '../api.js';
import { IMAGES } from '../images.js';

const STATUSES = ['new', 'called', 'confirmed', 'processed', 'closed'];
const STATUS_LABELS = {
  new: 'Новая',
  called: 'Созвонились',
  confirmed: 'Подтверждена',
  closed: 'Закрыта',
  processed: 'Обработана'
};

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [leads, setLeads] = useState([]);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [message, setMessage] = useState('');
  const [ok, setOk] = useState(false);

  const loadLeads = async () => {
    const data = await apiRequest('/api/admin/applications');
    setLeads(data);
  };

  const checkSession = async () => {
    try {
      const { user } = await apiRequest('/api/me');
      if (user?.role === 'admin') {
        setLoggedIn(true);
        setMessage(`Вы вошли как ${user.fullname}`);
        setOk(true);
        await loadLeads();
      }
    } catch {
      setLoggedIn(false);
    }
  };

  useEffect(() => {
    document.body.className = 'admin-page';
    checkSession();
    return () => { document.body.className = ''; };
  }, []);

  const onLogin = async (e) => {
    e.preventDefault();
    setMessage('Проверяем данные...');
    try {
      const result = await apiRequest('/api/login', {
        method: 'POST',
        body: JSON.stringify(loginForm)
      });
      if (result.role !== 'admin') throw new Error('Доступ разрешен только администратору');
      setToken(result.token);
      setLoggedIn(true);
      setMessage(result.message);
      setOk(true);
      await loadLeads();
    } catch (error) {
      setMessage(error.message);
      setOk(false);
    }
  };

  const logout = async () => {
    await apiRequest('/api/logout', { method: 'POST' });
    setToken(null);
    setLoggedIn(false);
    setLeads([]);
    setMessage('Вы вышли из аккаунта');
    setOk(false);
  };

  const changeStatus = async (id, status) => {
    try {
      await apiRequest(`/api/admin/applications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
      await loadLeads();
    } catch (error) {
      setMessage(error.message);
      setOk(false);
    }
  };

  const deleteLead = async (id) => {
    if (!window.confirm('Удалить заявку?')) return;
    try {
      await apiRequest(`/api/admin/applications/${id}`, { method: 'DELETE' });
      await loadLeads();
      setMessage('Заявка удалена');
      setOk(true);
    } catch (error) {
      setMessage(error.message);
      setOk(false);
    }
  };

  return (
    <>
      <AuthHeader />
      <main className="section admin-section">
        <div className="container">
          <div className="page-banner">
            <img src={IMAGES.admin} alt="Административная панель IMPULSE" />
          </div>
          <div className="section-head">
            <p className="eyebrow">Второе звено архитектуры</p>
            <h1>Административная панель</h1>
            <p>Управление заявками клиентов клуба</p>
          </div>

          {!loggedIn && (
            <form className="form admin-login" onSubmit={onLogin}>
              <input name="email" type="email" placeholder="Email администратора" value={loginForm.email}
                onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
              <input name="password" type="password" placeholder="Пароль" value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
              <button className="btn btn--primary" type="submit">Войти</button>
              {message && <p className="form-message" style={{ color: ok ? '#118a32' : '#ff6b6b' }}>{message}</p>}
            </form>
          )}

          {loggedIn && (
            <>
              <div className="admin-toolbar">
                <button className="btn btn--ghost" type="button" onClick={loadLeads}>Обновить заявки</button>
                <button className="btn btn--ghost" type="button" onClick={logout}>Выйти</button>
              </div>
              {message && <p className="form-message" style={{ color: ok ? '#118a32' : '#ff6b6b' }}>{message}</p>}
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th><th>Дата</th><th>ФИО</th><th>Телефон</th><th>Email</th><th>Тип</th><th>Статус</th><th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.length === 0 ? (
                      <tr><td colSpan={8}>Заявок пока нет. Они появятся после отправки формы на главной странице.</td></tr>
                    ) : leads.map((lead) => (
                      <tr key={lead.id}>
                        <td data-label="ID">{lead.id}</td>
                        <td data-label="Дата">{lead.created_at}</td>
                        <td data-label="ФИО">{lead.fullname}</td>
                        <td data-label="Телефон">{lead.phone}</td>
                        <td data-label="Email">{lead.email || '-'}</td>
                        <td data-label="Тип">{lead.request_type}</td>
                        <td data-label="Статус">
                          <select className="status" value={lead.status}
                            onChange={(e) => changeStatus(lead.id, e.target.value)}>
                            {STATUSES.map((s) => (
                              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                            ))}
                          </select>
                        </td>
                        <td data-label="Действия">
                          <button className="btn btn--ghost" type="button" onClick={() => changeStatus(lead.id, 'processed')}>Готово</button>
                          <button className="btn btn--ghost" type="button" onClick={() => deleteLead(lead.id)}>Удалить</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>
    </>
  );
}
