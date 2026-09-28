import { useEffect, useState, useCallback } from 'react';
import api, { errMsg } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { fmt } from '../utils/nutrition.js';

const TABS = [
  { key: 'overview', label: '📊 Overview' },
  { key: 'users', label: '👥 Users' },
  { key: 'meals', label: '🍽️ Meals' },
  { key: 'tickets', label: '🎫 Tickets' },
];

const EMPTY_MEAL = {
  name: '',
  emoji: '🥗',
  category: 'Breakfast',
  dietType: 'Vegetarian',
  description: '',
  calories: '',
  protein: '',
  carbs: '',
  fats: '',
  fiber: '',
  servingLabel: '1 serving',
};

const STATUS_STYLE = {
  Open: 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-sky-100 text-sky-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
};

export default function Admin() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [meals, setMeals] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [mealForm, setMealForm] = useState(EMPTY_MEAL);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [s, u, m, t] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/meals'),
        api.get('/admin/tickets'),
      ]);
      setStats(s.data);
      setUsers(u.data.users);
      setMeals(m.data.meals);
      setTickets(t.data.tickets);
    } catch (err) {
      toast.error(errMsg(err, 'Could not load admin data'));
    }
  }, [toast]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  /* ---------- meal form ---------- */
  const setM = (key) => (e) => setMealForm((f) => ({ ...f, [key]: e.target.value }));

  const startEdit = (meal) => {
    setEditingId(meal._id);
    setMealForm({
      name: meal.name,
      emoji: meal.emoji || '🥗',
      category: meal.category,
      dietType: meal.dietType,
      description: meal.description || '',
      calories: meal.calories,
      protein: meal.protein,
      carbs: meal.carbs,
      fats: meal.fats,
      fiber: meal.fiber,
      servingLabel: meal.servingLabel || '1 serving',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setMealForm(EMPTY_MEAL);
  };

  const saveMeal = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...mealForm,
        calories: Number(mealForm.calories),
        protein: Number(mealForm.protein) || 0,
        carbs: Number(mealForm.carbs) || 0,
        fats: Number(mealForm.fats) || 0,
        fiber: Number(mealForm.fiber) || 0,
      };
      if (editingId) {
        await api.put(`/admin/meals/${editingId}`, payload);
        toast.success('Meal updated ✏️');
      } else {
        await api.post('/admin/meals', payload);
        toast.success('Meal created 🎉');
      }
      cancelEdit();
      loadAll();
    } catch (err) {
      toast.error(errMsg(err, 'Could not save meal'));
    } finally {
      setBusy(false);
    }
  };

  const deleteMeal = async (meal) => {
    if (!window.confirm(`Delete "${meal.name}"?`)) return;
    try {
      await api.delete(`/admin/meals/${meal._id}`);
      toast.info('Meal deleted');
      loadAll();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const deleteUser = async (u) => {
    if (!window.confirm(`Delete user "${u.name}" and all their plans?`)) return;
    try {
      await api.delete(`/admin/users/${u._id}`);
      toast.info('User deleted');
      loadAll();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const updateTicket = async (ticket, patch) => {
    try {
      const res = await api.put(`/admin/tickets/${ticket._id}`, patch);
      setTickets((ts) => ts.map((t) => (t._id === ticket._id ? res.data.ticket : t)));
      toast.success('Ticket updated');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const statCards = stats
    ? [
        { emoji: '👥', label: 'Users', value: fmt(stats.users), bg: 'bg-sky-50' },
        { emoji: '🍽️', label: 'Meals', value: fmt(stats.meals), bg: 'bg-emerald-50' },
        { emoji: '📅', label: 'Meal plans', value: fmt(stats.plans), bg: 'bg-violet-50' },
        { emoji: '🎫', label: 'Open tickets', value: fmt(stats.openTickets), bg: 'bg-amber-50' },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Admin Console 🛡️</h1>
        <p className="mt-1 text-slate-400">Manage users, meals, nutrition data and support requests.</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              tab === t.key ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((c) => (
            <div key={c.label} className={`card p-6 ${c.bg}`}>
              <p className="text-3xl">{c.emoji}</p>
              <p className="mt-2 text-3xl font-extrabold text-slate-800">{c.value}</p>
              <p className="text-sm font-medium text-slate-500">{c.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="card overflow-x-auto p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                <th className="px-5 py-3">Name</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Role</th>
                <th className="px-5 py-3">Preference</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  <td className="px-5 py-3 font-bold text-slate-700">
                    {u.name} {u._id === me._id && <span className="badge bg-emerald-100 text-emerald-700">you</span>}
                  </td>
                  <td className="px-5 py-3 text-slate-500">{u.email}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${u.role === 'admin' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{u.dietPreference}</td>
                  <td className="px-5 py-3 text-slate-400">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-3 text-right">
                    {u._id !== me._id && (
                      <button onClick={() => deleteUser(u)} className="rounded-lg px-3 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50">
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Meals */}
      {tab === 'meals' && (
        <div className="grid gap-6 lg:grid-cols-5">
          <form onSubmit={saveMeal} className="card space-y-3 p-5 lg:col-span-2">
            <h2 className="font-bold text-slate-800">{editingId ? '✏️ Edit meal' : '➕ New meal'}</h2>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="label">Name</label>
                <input className="input" value={mealForm.name} onChange={setM('name')} required />
              </div>
              <div>
                <label className="label">Emoji</label>
                <input className="input text-center" value={mealForm.emoji} onChange={setM('emoji')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Category</label>
                <select className="input" value={mealForm.category} onChange={setM('category')}>
                  {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Diet type</label>
                <select className="input" value={mealForm.dietType} onChange={setM('dietType')}>
                  <option>Vegetarian</option>
                  <option>Non-Vegetarian</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Calories</label>
                <input type="number" min="0" className="input" value={mealForm.calories} onChange={setM('calories')} required />
              </div>
              <div>
                <label className="label">Protein g</label>
                <input type="number" min="0" className="input" value={mealForm.protein} onChange={setM('protein')} />
              </div>
              <div>
                <label className="label">Carbs g</label>
                <input type="number" min="0" className="input" value={mealForm.carbs} onChange={setM('carbs')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Fats g</label>
                <input type="number" min="0" className="input" value={mealForm.fats} onChange={setM('fats')} />
              </div>
              <div>
                <label className="label">Fiber g</label>
                <input type="number" min="0" className="input" value={mealForm.fiber} onChange={setM('fiber')} />
              </div>
            </div>
            <div>
              <label className="label">Serving label</label>
              <input className="input" value={mealForm.servingLabel} onChange={setM('servingLabel')} placeholder="1 bowl (250g)" />
            </div>
            <div className="flex gap-3 pt-1">
              {editingId && (
                <button type="button" onClick={cancelEdit} className="btn-secondary flex-1">
                  Cancel
                </button>
              )}
              <button type="submit" disabled={busy} className="btn-primary flex-1">
                {busy ? 'Saving…' : editingId ? '💾 Update' : '➕ Create'}
              </button>
            </div>
          </form>

          <div className="card overflow-x-auto p-0 lg:col-span-3">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs uppercase text-slate-400">
                  <th className="px-4 py-3">Meal</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Diet</th>
                  <th className="px-4 py-3">kcal</th>
                  <th className="px-4 py-3">Protein</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {meals.map((m) => (
                  <tr key={m._id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-slate-700">
                      {m.emoji} {m.name}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{m.category}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${m.dietType === 'Vegetarian' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                        {m.dietType === 'Vegetarian' ? '🌱' : '🍗'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-bold text-amber-500">{m.calories}</td>
                    <td className="px-4 py-3 text-rose-500">{m.protein}g</td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => startEdit(m)} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-sky-600 hover:bg-sky-50">
                        Edit
                      </button>
                      <button onClick={() => deleteMeal(m)} className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tickets */}
      {tab === 'tickets' && (
        <div className="space-y-3">
          {tickets.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-4xl">📭</p>
              <p className="mt-2 text-sm text-slate-400">No support tickets yet.</p>
            </div>
          ) : (
            tickets.map((t) => (
              <div key={t._id} className="card p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge bg-slate-100 text-slate-600">{t.type}</span>
                  <span className={`badge ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                  <span className="text-xs text-slate-400">
                    from <b>{t.user?.name}</b> ({t.user?.email}) · {new Date(t.createdAt).toLocaleString()}
                  </span>
                  <select
                    value={t.status}
                    onChange={(e) => updateTicket(t, { status: e.target.value })}
                    className="ml-auto rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold"
                  >
                    {Object.keys(STATUS_STYLE).map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <p className="mt-2 font-bold text-slate-700">{t.subject}</p>
                <p className="mt-1 text-sm text-slate-500">{t.message}</p>
                <form
                  className="mt-3 flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    const reply = e.target.elements.reply.value;
                    if (reply.trim()) {
                      updateTicket(t, { adminReply: reply, status: t.status === 'Open' ? 'In Progress' : t.status });
                      e.target.reset();
                    }
                  }}
                >
                  <input
                    name="reply"
                    defaultValue={t.adminReply}
                    placeholder="Write a reply…"
                    className="input !py-2 text-sm"
                  />
                  <button type="submit" className="btn-primary !px-4 !py-2 text-sm">
                    Reply
                  </button>
                </form>
                {t.adminReply && (
                  <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    🛡️ Current reply: {t.adminReply}
                  </p>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
