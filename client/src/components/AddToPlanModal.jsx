import { useState } from 'react';
import api from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { todayStr, dateOffsetStr, prettyDate, fmt, SLOT_META, SLOT_ORDER } from '../utils/nutrition.js';
import { errMsg } from '../lib/api.js';

export default function AddToPlanModal({ meal, onClose }) {
  const toast = useToast();
  const [date, setDate] = useState(todayStr());
  const [slot, setSlot] = useState(meal.category);
  const [servings, setServings] = useState(1);
  const [busy, setBusy] = useState(false);

  const n = Number(servings) || 1;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/plans/entries', { date, mealId: meal._id, slot, servings: n });
      toast.success(`${meal.emoji} ${meal.name} added to your ${slot.toLowerCase()}!`);
      onClose();
    } catch (err) {
      toast.error(errMsg(err, 'Could not add meal'));
    } finally {
      setBusy(false);
    }
  };

  const dates = [0, 1, 2, 3, 4, 5, 6].map((i) => dateOffsetStr(i));

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{meal.emoji || '🍽️'}</span>
            <div>
              <h3 className="text-lg font-extrabold text-slate-800">{meal.name}</h3>
              <p className="text-xs font-medium text-slate-400">{meal.servingLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-2xl leading-none text-slate-400 hover:text-slate-600">✕</button>
        </div>

        {/* Nutrition preview scaled by servings */}
        <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl bg-slate-50 p-3 text-center">
          <div>
            <p className="text-sm font-extrabold text-amber-500">{fmt(meal.calories * n)}</p>
            <p className="text-[10px] font-semibold uppercase text-slate-400">kcal</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-rose-500">{fmt(meal.protein * n)}g</p>
            <p className="text-[10px] font-semibold uppercase text-slate-400">protein</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-sky-500">{fmt(meal.carbs * n)}g</p>
            <p className="text-[10px] font-semibold uppercase text-slate-400">carbs</p>
          </div>
          <div>
            <p className="text-sm font-extrabold text-emerald-500">{fmt(meal.fats * n)}g</p>
            <p className="text-[10px] font-semibold uppercase text-slate-400">fats</p>
          </div>
        </div>

        <form onSubmit={submit} className="mt-4 space-y-4">
          <div>
            <label className="label">Day</label>
            <select className="input" value={date} onChange={(e) => setDate(e.target.value)}>
              {dates.map((d) => (
                <option key={d} value={d}>
                  {d === todayStr() ? `Today · ${prettyDate(d)}` : prettyDate(d)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Meal slot</label>
            <div className="grid grid-cols-4 gap-2">
              {SLOT_ORDER.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setSlot(s)}
                  className={`rounded-xl border-2 px-2 py-2 text-xs font-bold transition ${
                    slot === s
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {SLOT_META[s].emoji}
                  <br />
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Servings: {n}</label>
            <input
              type="range"
              min="1"
              max="5"
              value={n}
              onChange={(e) => setServings(e.target.value)}
              className="w-full accent-emerald-500"
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="btn-primary flex-1">
              {busy ? 'Adding…' : '➕ Add to plan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
