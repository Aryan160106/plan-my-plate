import { Link } from 'react-router-dom';

const features = [
  { emoji: '🔐', title: 'Secure Accounts', text: 'Sign up or log in to keep your meal history and progress safe.' },
  { emoji: '🥗', title: 'Healthy Meals', text: 'Browse vegetarian & non-vegetarian meals with full nutrition facts.' },
  { emoji: '📅', title: 'Daily Plans', text: 'Build breakfast, lunch, dinner and snack plans for every day.' },
  { emoji: '📊', title: 'Track Nutrition', text: 'Monitor calories, protein, carbs and fats on a live dashboard.' },
  { emoji: '🎯', title: 'Personal Goals', text: 'Set calorie & protein targets tailored to your body and activity.' },
  { emoji: '💬', title: 'Support', text: 'Questions or feedback? Reach the team right from the app.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <div className="bg-brand-gradient text-white">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <span className="flex items-center gap-2 text-lg font-extrabold">
            <span className="text-2xl">🥗</span> Plan My <span className="text-amber-300">Plate</span>
          </span>
          <div className="flex gap-3">
            <Link to="/login" className="rounded-lg px-4 py-2 text-sm font-semibold hover:bg-white/10">
              Login
            </Link>
            <Link
              to="/register"
              className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-emerald-600 shadow hover:bg-emerald-50"
            >
              Sign Up Free
            </Link>
          </div>
        </nav>

        <div className="mx-auto max-w-6xl px-4 py-20 text-center sm:py-28">
          <p className="mb-4 inline-block rounded-full bg-white/20 px-4 py-1.5 text-sm font-semibold backdrop-blur">
            🍽️ MERN Stack · Meal Planning Made Simple
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight sm:text-6xl">
            Eat smarter with your{' '}
            <span className="text-amber-300">personal meal planner</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90">
            Plan My Plate helps you choose healthy meals, track calories & protein, and build a
            nutrition plan you will actually stick to.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="rounded-xl bg-amber-400 px-8 py-3.5 text-lg font-bold text-slate-900 shadow-xl transition hover:bg-amber-300"
            >
              Get Started →
            </Link>
            <Link
              to="/login"
              className="rounded-xl border-2 border-white/60 px-8 py-3.5 text-lg font-bold text-white transition hover:bg-white/10"
            >
              I have an account
            </Link>
          </div>
        </div>
      </div>

      {/* Features */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        <h2 className="text-center text-3xl font-extrabold text-slate-800">
          Everything you need to <span className="text-brand-gradient">eat healthy</span>
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="card p-6 transition hover:-translate-y-1 hover:shadow-lg">
              <div className="mb-3 text-4xl">{f.emoji}</div>
              <h3 className="text-lg font-bold text-slate-800">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sunset-gradient py-16 text-center text-white">
        <h2 className="text-3xl font-extrabold">Ready to plan your plate? 🚀</h2>
        <p className="mt-3 text-white/90">Create a free account and build your first meal plan in minutes.</p>
        <Link
          to="/register"
          className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 text-lg font-bold text-rose-500 shadow-xl transition hover:bg-rose-50"
        >
          Sign Up Free
        </Link>
      </section>

      <footer className="bg-slate-900 py-8 text-center text-sm text-slate-400">
        Plan My Plate — built with the MERN stack · MongoDB · Express · React · Node.js
      </footer>
    </div>
  );
}
