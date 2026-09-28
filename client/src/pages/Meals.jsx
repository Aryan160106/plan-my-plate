import { useEffect, useState, useCallback } from 'react';
import api, { errMsg } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { todayStr, fmt } from '../utils/nutrition.js';
import MealCard from '../components/MealCard.jsx';
import AddToPlanModal from '../components/AddToPlanModal.jsx';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];
const DIETS = ['All', 'Vegetarian', 'Non-Vegetarian'];
const SORTS = [
  { value: 'name', label: 'A → Z' },
  { value: 'calories-asc', label: 'Calories ↑' },
  { value: 'calories-desc', label: 'Calories ↓' },
  { value: 'protein-desc', label: 'Protein ↓' },
];

export default function Meals() {
  const toast = useToast();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: 'All', dietType: 'All', sort: 'name' });
  const [selected, setSelected] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/meals', { params: filters });
      setMeals(res.data.meals);
    } catch (err) {
      toast.error(errMsg(err, 'Could not load meals'));
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const set = (key) => (e) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="bg-cool-gradient rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Browse Meals 🍽️</h1>
        <p className="mt-1 text-white/85">
          {meals.length} healthy options — filter by category or diet, then add them to your plan.
        </p>
      </div>

      {/* Filters */}
      <div className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <input
          type="search"
          placeholder="🔍 Search meals…"
          className="input"
          value={filters.search}
          onChange={set('search')}
        />
        <select className="input" value={filters.category} onChange={set('category')}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c === 'All' ? '🍽️ All categories' : c}</option>
          ))}
        </select>
        <select className="input" value={filters.dietType} onChange={set('dietType')}>
          {DIETS.map((d) => (
            <option key={d} value={d}>{d === 'All' ? '🥗 All diets' : d}</option>
          ))}
        </select>
        <select className="input" value={filters.sort} onChange={set('sort')}>
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>↕️ {s.label}</option>
          ))}
        </select>
      </div>

      {/* Meals grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
        </div>
      ) : meals.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-5xl">🔍</p>
          <p className="mt-3 font-bold text-slate-600">No meals match your filters</p>
          <p className="mt-1 text-sm text-slate-400">Try clearing the search or changing the diet filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {meals.map((meal) => (
            <MealCard key={meal._id} meal={meal} onAdd={() => setSelected(meal)} />
          ))}
        </div>
      )}

      {selected && (
        <AddToPlanModal
          meal={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
