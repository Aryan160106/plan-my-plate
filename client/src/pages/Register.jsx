import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { errMsg } from '../lib/api.js';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setBusy(true);
    try {
      const user = await register(form.name, form.email, form.password);
      toast.success(`Account created — welcome, ${user.name}! 🎉`);
      navigate('/profile');
    } catch (err) {
      toast.error(errMsg(err, 'Registration failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Right branding panel (mirrored) */}
      <div className="bg-cool-gradient relative hidden flex-1 flex-col justify-between p-12 text-white lg:flex">
        <Link to="/" className="flex items-center gap-2 text-xl font-extrabold">
          <span className="text-3xl">🥗</span> Plan My <span className="text-amber-300">Plate</span>
        </Link>
        <div>
          <h1 className="text-5xl font-extrabold leading-tight">
            Start your <span className="text-amber-300">healthy journey</span> today
          </h1>
          <p className="mt-5 max-w-md text-lg text-white/90">
            Create a free account to plan meals, track calories & protein, and build better eating
            habits — one plate at a time.
          </p>
          <div className="mt-8 space-y-3 text-white/90">
            <p className="flex items-center gap-3"><span className="text-2xl">✅</span> Personalized meal plans</p>
            <p className="flex items-center gap-3"><span className="text-2xl">✅</span> Live nutrition tracking</p>
            <p className="flex items-center gap-3"><span className="text-2xl">✅</span> Vegetarian & non-veg options</p>
          </div>
        </div>
        <p className="text-sm text-white/70">Free forever · No credit card needed</p>
      </div>

      {/* Left form panel */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-[520px] lg:flex-none">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 text-center lg:hidden">
            <span className="text-4xl">🥗</span>
            <h2 className="text-brand-gradient mt-2 text-2xl font-extrabold">Plan My Plate</h2>
          </div>

          <h2 className="text-3xl font-extrabold text-slate-800">Create account ✨</h2>
          <p className="mt-1 text-sm text-slate-500">Join Plan My Plate in under a minute</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="label" htmlFor="name">Full name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                placeholder="Aarav Sharma"
                className="input"
                value={form.name}
                onChange={onChange}
              />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="input"
                value={form.email}
                onChange={onChange}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Min 6 characters"
                  className="input"
                  value={form.password}
                  onChange={onChange}
                />
              </div>
              <div>
                <label className="label" htmlFor="confirm">Confirm password</label>
                <input
                  id="confirm"
                  name="confirm"
                  type="password"
                  required
                  placeholder="Repeat password"
                  className="input"
                  value={form.confirm}
                  onChange={onChange}
                />
              </div>
            </div>

            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? 'Creating account…' : 'Create account 🎉'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-emerald-600 hover:underline">
              Login
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
