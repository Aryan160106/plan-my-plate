import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { planTotals, todayStr, dateOffsetStr, prettyDate, fmt, SLOT_META, SLOT_ORDER } from '../utils/nutrition.js';

function MacroBar({ label, value, goal, color }) {
  const pct = goal ? Math.min((value / goal) * 100, 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>{label}</span>
        <span>
          {fmt(value)} / {fmt(goal)}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function MyPlan() {
  const toast = useToast();
  const [date, setDate] = useState(todayStr());
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (d) => {
      setLoading(true);
      try {
        const res = await api.get('/plans', { params: { date: d } });
        setPlan(res.data.plan);
      } catch (err) {
        toast.error(errMsg(err, 'Could not load plan'));
      } finally {
        setLoading(false);
      }
    },
    [toast]
  );

  useEffect(() => {
    load(date);
  }, [load, date]);

  const changeDate = (offset) => setDate(dateOffsetStr(offset));

  const removeEntry = async (entryId) => {
    try {
      const res = await api.delete(`/plans/entries/${entryId}`, { params: { date } });
      setPlan(res.data.plan);
      toast.info('Meal removed from plan');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const toggleConsumed = async (entryId) => {
    try {
      const res = await api.patch(`/plans/entries/${entryId}/toggle`, { date });
      setPlan(res.data.plan);
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const totals = planTotals(plan);
  const dates = [-3, -2, -1, 0, 1, 2, 3].map((i) => dateOffsetStr(i));
  const isToday = date === todayStr();

  return (
    <div className="space-y-6">
      {/* Header with date navigation */}
      <div className="bg-sunset-gradient rounded-2xl p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold sm:text-3xl">
              {isToday ? "Today's Plan 📅" : `Plan for ${prettyDate(date)}`}
            </h1>
            <p className="mt-1 text-white/85">Tap the circle to mark a meal as eaten ✓</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => changeDate(-1)} className="rounded-xl bg-white/20 px-4 py-2.5 font-bold transition hover:bg-white/30">
              ←
            </button>
            {!isToday && (
              <button onClick={() => setDate(todayStr())} className="rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-rose-500 shadow transition hover:bg-rose-50">
                Today
              </button>
            )}
            <button onClick={() => changeDate(1)} className="rounded-xl bg-white/20 px-4 py-2.5 font-bold transition hover:bg-white/30">
              →
            </button>
          </div>
        </div>

        {/* Quick date pills */}
        <div className="mt-4 flex flex-wrap gap-2">
          {dates.map((d) => (
            <button
              key={d}
              onClick={() => setDate(d)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                d === date ? 'bg-white text-rose-500 shadow' : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              {d === todayStr() ? 'Today' : prettyDate(d).replace(',', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Progress toward goals */}
      <div className="card grid gap-5 p-6 sm:grid-cols-3">
        <MacroBar label="🔥 Calories" value={totals.calories} goal={2000} color="bg-amber-400" />
        <MacroBar label="🥩 Protein" value={totals.protein} goal={80} color="bg-rose-400" />
        <MacroBar label="🍞 Carbs" value={totals.carbs} goal={250} color="bg-sky-400" />
      </div>

      {/* Plan by slots */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {SLOT_ORDER.map((slot) => {
            const entries = plan?.entries?.filter((e) => e.slot === slot) || [];
            const slotCals = entries.reduce((sum, e) => sum + e.meal?.calories * (e.servings || 1), 0);
            return (
              <div key={slot} className="card p-5">
                <div className="flex items-center justify-between">
                  <span className={`badge ${SLOT_META[slot].color} text-sm`}>
                    {SLOT_META[slot].emoji} {slot}
                  </span>
                  <span className="text-xs font-bold text-slate-400">{fmt(slotCals)} kcal</span>
                </div>

                {entries.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-slate-400">Nothing planned</p>
                    <Link to="/meals" className="mt-2 inline-block text-sm font-bold text-emerald-600 hover:underline">
                      + Add a {slot.toLowerCase()}
                    </Link>
                  </div>
                ) : (
                  <div className="mt-3 space-y-2">
                    {entries.map((e) => (
                      <div
                        key={e._id}
                        className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3"
                      >
                        <button
                          onClick={() => toggleConsumed(e._id)}
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition ${
                            e.consumed
                              ? 'border-emerald-500 bg-emerald-500 text-white'
                              : 'border-slate-300 bg-white hover:border-emerald-400'
                          }`}
                          title={e.consumed ? 'Mark as not eaten' : 'Mark as eaten'}
                        >
                          {e.consumed && '✓'}
                        </button>
                        <span className="text-2xl">{e.meal?.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className={`truncate text-sm font-bold ${e.consumed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                            {e.meal?.name}
                          </p>
                          <p className="text-xs text-slate-400">
                            {e.servings || 1}× serving · {fmt(e.meal?.calories * (e.servings || 1))} kcal ·{' '}
                            {fmt(e.meal?.protein * (e.servings || 1))}g protein
                          </p>
                        </div>
                        <button
                          onClick={() => removeEntry(e._id)}
                          className="rounded-lg p-1.5 text-slate-300 transition hover:bg-rose-50 hover:text-rose-500"
                          title="Remove from plan"
                        >
                          🗑️
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Totals summary */}
      <div className="card flex flex-wrap items-center justify-around gap-6 p-6 text-center">
        <div>
          <p className="text-2xl font-extrabold text-amber-500">{fmt(totals.calories)}</p>
          <p className="text-xs font-semibold uppercase text-slate-400">Total kcal</p>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-rose-500">{fmt(totals.protein)}g</p>
          <p className="text-xs font-semibold uppercase text-slate-400">Protein</p>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-sky-500">{fmt(totals.carbs)}g</p>
          <p className="text-xs font-semibold uppercase text-slate-400">Carbs</p>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-emerald-500">{fmt(totals.fats)}g</p>
          <p className="text-xs font-semibold uppercase text-slate-400">Fats</p>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-violet-500">{fmt(totals.fiber)}g</p>
          <p className="text-xs font-semibold uppercase text-slate-400">Fiber</p>
        </div>
        <div>
          <p className="text-2xl font-extrabold text-slate-700">{fmt(totals.consumed)}</p>
          <p className="text-xs font-semibold uppercase text-slate-400">Eaten so far</p>
        </div>
      </div>
    </div>
  );
}
