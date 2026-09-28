import { useEffect, useState, useCallback } from 'react';
import api, { errMsg } from '../lib/api.js';
import { useToast } from '../context/ToastContext.jsx';

const TYPES = ['Query', 'Complaint', 'Feedback'];
const TYPE_STYLE = {
  Query: 'bg-sky-100 text-sky-700',
  Complaint: 'bg-rose-100 text-rose-700',
  Feedback: 'bg-emerald-100 text-emerald-700',
};
const STATUS_STYLE = {
  Open: 'bg-amber-100 text-amber-700',
  'In Progress': 'bg-sky-100 text-sky-700',
  Resolved: 'bg-emerald-100 text-emerald-700',
};

export default function Support() {
  const toast = useToast();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ type: 'Query', subject: '', message: '' });
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await api.get('/support/my');
      setTickets(res.data.tickets);
    } catch (err) {
      toast.error(errMsg(err, 'Could not load tickets'));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/support', form);
      toast.success('Ticket submitted! Our team will reply soon. 💬');
      setForm({ type: 'Query', subject: '', message: '' });
      load();
    } catch (err) {
      toast.error(errMsg(err, 'Could not submit ticket'));
    } finally {
      setBusy(false);
    }
  };

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="space-y-6">
      <div className="bg-brand-gradient rounded-2xl p-6 text-white shadow-lg">
        <h1 className="text-2xl font-extrabold sm:text-3xl">Customer Support 💬</h1>
        <p className="mt-1 text-white/85">Questions, complaints or feedback — we are here to help!</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* New ticket form */}
        <form onSubmit={submit} className="card space-y-4 p-6 lg:col-span-2">
          <h2 className="font-bold text-slate-800">New request</h2>
          <div>
            <label className="label">Type</label>
            <div className="grid grid-cols-3 gap-2">
              {TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  onClick={() => setForm((f) => ({ ...f, type: t }))}
                  className={`rounded-xl border-2 px-2 py-2.5 text-xs font-bold transition ${
                    form.type === t ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Subject</label>
            <input className="input" value={form.subject} onChange={set('subject')} required maxLength={120} placeholder="Short summary" />
          </div>
          <div>
            <label className="label">Message</label>
            <textarea className="input min-h-32" value={form.message} onChange={set('message')} required maxLength={2000} placeholder="Tell us more…" />
          </div>
          <button type="submit" disabled={busy} className="btn-primary w-full">
            {busy ? 'Sending…' : '📨 Submit'}
          </button>
        </form>

        {/* Ticket history */}
        <div className="card p-6 lg:col-span-3">
          <h2 className="font-bold text-slate-800">Your tickets</h2>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent" />
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-4xl">📭</p>
              <p className="mt-2 text-sm text-slate-400">No tickets yet — reach out anytime!</p>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {tickets.map((t) => (
                <div key={t._id} className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`badge ${TYPE_STYLE[t.type]}`}>{t.type}</span>
                    <span className={`badge ${STATUS_STYLE[t.status]}`}>{t.status}</span>
                    <span className="ml-auto text-xs text-slate-400">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-2 font-bold text-slate-700">{t.subject}</p>
                  <p className="mt-1 text-sm text-slate-500">{t.message}</p>
                  {t.adminReply && (
                    <div className="mt-3 rounded-lg border-l-4 border-emerald-400 bg-emerald-50 px-3 py-2 text-sm">
                      <span className="font-bold text-emerald-700">🛡️ Admin:</span>{' '}
                      <span className="text-slate-600">{t.adminReply}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
