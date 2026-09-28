import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errMsg } from '../lib/api.js';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}! 🎉`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(errMsg(err, 'Login failed'));
    } finally {
      setBusy(false);
    }
  };

  const fillDemo = (email, password) => {
    setForm({ email, password });
    toast.info('Demo credentials filled — press Login!');
  };

  return (
    <div className="flex min-h-screen">
      {/* Left branding panel */}
      <div className="bg-brand-gradient relative hidden flex-1 flex-col justify-between p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold">
          <span className="text-3xl">🥗</span> Plan My <span className="text-amber-300">Plate</span>
        </Link>
        <div>
          <h1 className="text-5xl font-extrabold leading-tight">
            Welcome back to <span className="text-amber-300">healthier you!</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-white/90">
            Log in to track your meals, hit your calorie goals, and keep your nutrition streak alive.
          </p>
          <div className="mt-8 flex gap-6 text-4xl">🥣 ☀️ 🌙 🍪 📊</div>
        </div>
        <p className="text-sm text-white/70">MERN Stack · MongoDB · Express · React · Node</p>
      </div>

      {/* Right form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-[480px] lg:flex-none">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-8 text-center lg:hidden">
            <span className="text-4xl">🥗</span>
            <h2 className="text-brand-gradient mt-2 text-2xl font-extrabold">Plan My Plate</h2>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-800">Login 🔐</h2>
          <p className="mt-1 text-sm text-slate-500">Enter your credentials to continue</p>

          {params.get('expired') && (
            <div className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
              ⏳ Your session expired. Please log in again.
            </div>
          )}

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="input"
                value={form.email}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="input pr-12"
                  value={form.password}
                  onChange={onChange}
                />
                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-lg"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? 'Logging in…' : 'Login →'}
            </button>
          </form>

          {/* Demo account shortcuts */}
          <div className="mt-6 rounded-xl border border-dashed border-emerald-300 bg-emerald-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">Demo accounts</p>
            <div className="mt-2 space-y-1.5 text-sm">
              <button
                type="button"
                onClick={() => fillDemo('aarav@example.com', 'user123')}
                className="block w-full rounded-lg bg-white px-3 py-2 text-left text-slate-700 shadow-sm transition hover:bg-emerald-100"
              >
                👤 aarav@example.com / user123
              </button>
              <button
                type="button"
                onClick={() => fillDemo('admin@planmyplate.com', 'admin123')}
                className="block w-full rounded-lg bg-white px-3 py-2 text-left text-slate-700 shadow-sm transition hover:bg-emerald-100"
              >
                🛡️ admin@planmyplate.com / admin123
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            New here?{' '}
            <Link to="/register" className="font-bold text-emerald-600 hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-4 text-center text-xs text-slate-400">
            <Link to="/" className="hover:underline">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
