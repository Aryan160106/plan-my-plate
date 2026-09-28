import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { planTotals, todayStr, prettyDate, fmt, SLOT_META, SLOT_ORDER, dateOffsetStr } from '../utils/nutrition.js';

function CalorieRing({ consumed, goal }) {
  const pct = goal ? Math.min(consumed / goal, 1.35) : 0;
  const deg = Math.round(pct * 360);
  const over = pct > 1;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`relative h-44 w-44 rounded-full ${
          over ? 'bg-rose-500' : 'bg-brand-gradient'
        }`}
        style={
          over
            ? undefined
            : { backgroundImage: `conic-gradient(#f59e0b ${deg}deg, #e2e8f0 ${deg}deg)` }
        }
      >
        <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white shadow-inner">
          <span className="text-3xl font-extrabold text-slate-800">{fmt(consumed)}</span>
          <span className="text-xs font-medium text-slate-400">of {fmt(goal)} kcal</span>
          <span className={`mt-1 text-xs font-bold ${over ? 'text-rose-500' : 'text-emerald-500'}`}>
            {over ? 'Over goal! 🔥' : `${Math.round(pct * 100)}% 🎯`}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm font-semibold text-slate-500">Calories consumed today</p>
    </div>
  );
}

function StatCard({ emoji, label, value, unit, accent }) {
  return (
    <div className={`card p-5 ${accent || ''}`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{emoji}</span>
        <span className="text-2xl font-extrabold text-slate-800">
          {value}
          <span className="ml-1 text-xs font-semibold text-slate-400">{unit}</span>
        </span>
      </div>
      <p className="mt-2 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useToast();
  const [plan, setPlan] = useState(null);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [planRes, sumRes] = await Promise.all([
        api.get('/plans', { params: { date: todayStr() } }),
        api.get('/plans/summary', { params: { days: 7 } }),
      ]);
      setPlan(planRes.data.plan);
      setSummary(sumRes.data.summary);
    } catch (err) {
      toast.error(errMsg(err, 'Could not load dashboard'));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleConsumed = async (entryId) => {
    try {
      const res = await api.patch(`/plans/entries/${entryId}/toggle`, { date: todayStr() });
      setPlan(res.data.plan);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const totals = planTotals(plan);
  const maxCal = Math.max(...summary.map((s) => s.calories), user?.dailyCalorieGoal || 1, 1);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="bg-brand-gradient flex flex-wrap items-center justify-between gap-4 rounded-2xl p-6 text-white shadow-lg">
        <div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">Hi {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="mt-1 text-white/85">
            Here is your nutrition overview for {prettyDate(todayStr())}
          </p>
        </div>
        <Link
          to="/plan"
          className="rounded-xl bg-white px-5 py-2.5 font-bold text-emerald-600 shadow transition hover:bg-emerald-50"
        >
          📅 Plan today's meals
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard emoji="🔥" label="Calories planned" value={fmt(totals.calories)} unit="kcal" />
        <StatCard emoji="🥩" label="Protein planned" value={fmt(totals.protein)} unit="g" accent="bg-rose-50/50" />
        <StatCard emoji="🍞" label="Carbs planned" value={fmt(totals.carbs)} unit="g" accent="bg-amber-50/50" />
        <StatCard emoji="🥑" label="Fats planned" value={fmt(totals.fats)} unit="g" accent="bg-emerald-50/50" />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Calorie ring */}
        <div className="card flex items-center justify-center p-6 lg:col-span-2">
          <CalorieRing consumed={totals.consumed} goal={user?.dailyCalorieGoal || 2000} />
        </div>

        {/* Weekly chart */}
        <div className="card p-6 lg:col-span-3">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-800">📈 Last 7 days</h2>
            <span className="badge bg-slate-100 text-slate-600">
              Goal: {fmt(user?.dailyCalorieGoal)} kcal/day
            </span>
          </div>
          <div className="mt-6 flex h-48 items-end gap-2 sm:gap-3">
            {summary.map((d) => {
              const h = Math.round((d.calories / maxCal) * 100);
              const over = d.calories > (user?.dailyCalorieGoal || Infinity);
              return (
                <div key={d.date} className="group flex flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-[10px] font-bold text-slate-400 opacity-0 transition group-hover:opacity-100">
                    {fmt(d.calories)}
                  </span>
                  <div
                    className={`w-full rounded-t-lg transition-all group-hover:opacity-80 ${
                      over ? 'bg-rose-400' : d.calories > 0 ? 'bg-emerald-400' : 'bg-slate-200'
                    }`}
                    style={{ height: `${Math.max(h, 3)}%` }}
                    title={`${prettyDate(d.date)}: ${fmt(d.calories)} kcal`}
                  />
                  <span className="text-[10px] font-semibold text-slate-400">
                    {prettyDate(d.date).split(',')[0]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Today's meals */}
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-slate-800">🍽️ Today's meals</h2>
          <Link to="/plan" className="text-sm font-bold text-emerald-600 hover:underline">
            View full plan →
          </Link>
        </div>

        {plan?.entries?.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-4xl">🪹</p>
            <p className="mt-3 font-semibold text-slate-600">No meals planned yet today</p>
            <Link to="/meals" className="btn-primary mt-4">Browse meals</Link>
          </div>
        ) : (
          <div className="mt-4 space-y-2">
            {SLOT_ORDER.map((slot) => {
              const entries = plan.entries.filter((e) => e.slot === slot);
              if (entries.length === 0) return null;
              return (
                <div key={slot}>
                  <span className={`badge ${SLOT_META[slot].color}`}>
                    {SLOT_META[slot].emoji} {slot}
                  </span>
                  <div className="mt-1.5 space-y-1.5">
                    {entries.map((e) => (
                      <div
                        key={e._id}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-2.5"
                      >
                        <button
                          onClick={() => toggleConsumed(e._id)}
                          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs transition ${
                            e.consumed
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-slate-300 bg-white hover:border-emerald-400'
                          }`}
                          title={e.consumed ? 'Mark as not eaten' : 'Mark as eaten'}
                        >
                          {e.consumed && '✓'}
                        </button>
                        <span className="text-xl">{e.meal?.emoji}</span>
                        <span className={`flex-1 text-sm font-semibold ${e.consumed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                          {e.meal?.name}
                        </span>
                        <span className="text-xs font-bold text-slate-500">
                          {fmt(e.meal?.calories * (e.servings || 1))} kcal · {fmt(e.meal?.protein * (e.servings || 1))}g protein
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
