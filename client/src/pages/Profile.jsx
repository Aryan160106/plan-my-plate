import { useState } from 'react';
import api, { errMsg } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const DIET_OPTIONS = [
  { value: 'vegetarian', label: '🌱 Vegetarian' },
  { value: 'non-vegetarian', label: '🍗 Non-Vegetarian' },
  { value: 'both', label: '🍽️ Both' },
];

const ACTIVITY_OPTIONS = [
  { value: 'sedentary', label: 'Sedentary (little exercise)' },
  { value: 'light', label: 'Light (1–3 days/week)' },
  { value: 'moderate', label: 'Moderate (3–5 days/week)' },
  { value: 'active', label: 'Active (6–7 days/week)' },
  { value: 'very-active', label: 'Very active (2× per day)' },
];

const GOAL_OPTIONS = [
  { value: 'lose', label: '🔥 Lose weight' },
  { value: 'maintain', label: '⚖️ Maintain' },
  { value: 'gain', label: '💪 Gain muscle' },
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({
    name: user?.name || '',
    dietPreference: user?.dietPreference || 'both',
    age: user?.age || '',
    gender: user?.gender || '',
    heightCm: user?.heightCm || '',
    weightKg: user?.weightKg || '',
    activityLevel: user?.activityLevel || '',
    goal: user?.goal || '',
    dailyCalorieGoal: user?.dailyCalorieGoal || 2000,
    dailyProteinGoal: user?.dailyProteinGoal || 60,
  });
  const [busy, setBusy] = useState(false);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...form,
        age: form.age ? Number(form.age) : null,
        heightCm: form.heightCm ? Number(form.heightCm) : null,
        weightKg: form.weightKg ? Number(form.weightKg) : null,
        dailyCalorieGoal: Number(form.dailyCalorieGoal) || 2000,
        dailyProteinGoal: Number(form.dailyProteinGoal) || 60,
      };
      const res = await api.put('/users/profile', payload);
      updateUser(res.data.user);
      toast.success('Profile saved! ✨');
    } catch (err) {
      toast.error(errMsg(err, 'Could not save profile'));
    } finally {
      setBusy(false);
    }
  };

  const suggest = async () => {
    try {
      const res = await api.post('/users/suggest-goals', {
        age: Number(form.age),
        gender: form.gender,
        heightCm: Number(form.heightCm),
        weightKg: Number(form.weightKg),
        activityLevel: form.activityLevel,
        goal: form.goal,
      });
      setForm((f) => ({
        ...f,
        dailyCalorieGoal: res.data.dailyCalorieGoal,
        dailyProteinGoal: res.data.dailyProteinGoal,
      }));
      toast.info(`Suggested: ${res.data.dailyCalorieGoal} kcal · ${res.data.dailyProteinGoal}g protein 🎯`);
    } catch (err) {
      toast.error(errMsg(err, 'Fill age, gender, height, weight and activity first'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-cool-gradient rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-extrabold sm:text-3xl">My Profile 👤</h1>
        <p className="mt-1 text-white/85">Manage your details, food preferences and nutrition goals.</p>
      </div>

      <form onSubmit={save} className="grid gap-6 lg:grid-cols-2">
        {/* Account & preferences */}
        <div className="card p-6">
          <h2 className="font-bold text-slate-800">Account & preferences</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="label">Name</label>
              <input className="input" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="label">Email</label>
              <input className="input bg-slate-50" value={user?.email || ''} disabled />
            </div>
            <div>
              <label className="label">Food preference</label>
              <div className="grid grid-cols-3 gap-2">
                {DIET_OPTIONS.map((o) => (
                  <button
                    type="button"
                    key={o.value}
                    onClick={() => setForm((f) => ({ ...f, dietPreference: o.value }))}
                    className={`rounded-xl border-2 px-2 py-2.5 text-xs font-bold transition ${
                      form.dietPreference === o.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Body stats */}
        <div className="card p-6">
          <h2 className="font-bold text-slate-800">Body stats</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Age</label>
              <input type="number" min="1" max="120" className="input" value={form.age} onChange={set('age')} placeholder="26" />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={set('gender')}>
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="label">Height (cm)</label>
              <input type="number" min="50" max="250" className="input" value={form.heightCm} onChange={set('heightCm')} placeholder="175" />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input type="number" min="10" max="300" className="input" value={form.weightKg} onChange={set('weightKg')} placeholder="70" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Activity level</label>
              <select className="input" value={form.activityLevel} onChange={set('activityLevel')}>
                <option value="">Select…</option>
                {ACTIVITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Goal</label>
              <div className="grid grid-cols-3 gap-2">
                {GOAL_OPTIONS.map((o) => (
                  <button
                    type="button"
                    key={o.value}
                    onClick={() => setForm((f) => ({ ...f, goal: o.value }))}
                    className={`rounded-xl border-2 px-2 py-2.5 text-xs font-bold transition ${
                      form.goal === o.value
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 text-slate-500 hover:border-slate-300'
                    }`}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Daily goals */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-bold text-slate-800">Daily nutrition goals</h2>
            <button type="button" onClick={suggest} className="btn-secondary !py-2 text-sm">
              🎯 Auto-calculate for me
            </button>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">Calorie goal (kcal/day)</label>
              <input type="number" min="800" max="6000" step="10" className="input" value={form.dailyCalorieGoal} onChange={set('dailyCalorieGoal')} />
            </div>
            <div>
              <label className="label">Protein goal (g/day)</label>
              <input type="number" min="20" max="300" className="input" value={form.dailyProteinGoal} onChange={set('dailyProteinGoal')} />
            </div>
          </div>
          <button type="submit" disabled={busy} className="btn-primary mt-6">
            {busy ? 'Saving…' : '💾 Save profile'}
          </button>
        </div>
      </form>
    </div>
  );
}
