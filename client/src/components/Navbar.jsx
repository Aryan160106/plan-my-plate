import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

const links = [
  { to: '/dashboard', label: 'Dashboard', emoji: '📊' },
  { to: '/meals', label: 'Meals', emoji: '🍽️' },
  { to: '/plan', label: 'My Plan', emoji: '📅' },
  { to: '/profile', label: 'Profile', emoji: '👤' },
  { to: '/support', label: 'Support', emoji: '💬' },
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const visibleLinks = isAdmin ? [...links, { to: '/admin', label: 'Admin', emoji: '🛡️' }] : links;

  return (
    <header className="sticky top-0 z-50 bg-brand-gradient text-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <NavLink to="/dashboard" className="flex items-center gap-2 text-lg font-extrabold tracking-tight">
          <span className="text-2xl">🥗</span>
          <span>
            Plan My <span className="text-amber-300">Plate</span>
          </span>
        </NavLink>

        {/* Desktop links */}
        <nav className="hidden items-center gap-1 md:flex">
          {visibleLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  isActive ? 'bg-white/25 text-white shadow-sm' : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <span className="mr-1">{l.emoji}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <span className="max-w-[140px] truncate rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
            👋 {user?.name}
          </span>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-emerald-600 shadow transition hover:bg-emerald-50"
          >
            Logout
          </button>
        </div>

        {/* Mobile toggle */}
        <button
          className="rounded-lg p-2 text-2xl leading-none md:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="border-t border-white/20 bg-emerald-600 px-4 pb-4 pt-2 md:hidden">
          {visibleLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `block rounded-lg px-3 py-2.5 text-sm font-semibold ${
                  isActive ? 'bg-white/25' : 'hover:bg-white/10'
                }`
              }
            >
              <span className="mr-2">{l.emoji}</span>
              {l.label}
            </NavLink>
          ))}
          <div className="mt-2 flex items-center justify-between border-t border-white/20 pt-3">
            <span className="truncate text-sm font-medium">👋 {user?.name}</span>
            <button
              onClick={handleLogout}
              className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-emerald-600"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
