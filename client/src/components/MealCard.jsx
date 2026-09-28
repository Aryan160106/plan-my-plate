import { fmt } from '../utils/nutrition.js';

export default function MealCard({ meal, onAdd }) {
  return (
    <div className="card flex flex-col p-5 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <span className="text-4xl">{meal.emoji || '🍽️'}</span>
        <div className="flex flex-col items-end gap-1">
          <span
            className={`badge ${
              meal.dietType === 'Vegetarian' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
            }`}
          >
            {meal.dietType === 'Vegetarian' ? '🌱 Veg' : '🍗 Non-veg'}
          </span>
          <span className="badge bg-slate-100 text-slate-600">{meal.category}</span>
        </div>
      </div>

      <h3 className="mt-3 font-bold text-slate-800">{meal.name}</h3>
      {meal.description && <p className="mt-1 line-clamp-2 text-sm text-slate-500">{meal.description}</p>}

      <div className="mt-4 grid grid-cols-4 gap-2 rounded-xl bg-slate-50 p-3 text-center">
        <div>
          <p className="text-sm font-extrabold text-amber-500">{fmt(meal.calories)}</p>
          <p className="text-[10px] font-semibold uppercase text-slate-400">kcal</p>
        </div>
        <div>
          <p className="text-sm font-extrabold text-rose-500">{fmt(meal.protein)}g</p>
          <p className="text-[10px] font-semibold uppercase text-slate-400">protein</p>
        </div>
        <div>
          <p className="text-sm font-extrabold text-sky-500">{fmt(meal.carbs)}g</p>
          <p className="text-[10px] font-semibold uppercase text-slate-400">carbs</p>
        </div>
        <div>
          <p className="text-sm font-extrabold text-emerald-500">{fmt(meal.fats)}g</p>
          <p className="text-[10px] font-semibold uppercase text-slate-400">fats</p>
        </div>
      </div>

      <button onClick={onAdd} className="btn-primary mt-4 w-full">
        ➕ Add to plan
      </button>
    </div>
  );
}
