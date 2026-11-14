import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { usePrep } from '../context/PrepContext';

export default function AuthModal({ isOpen, onClose }) {
  const { user, loginWithEmail, loginWithGoogle, logout } = usePrep();

  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    loginWithEmail(email, name);
    onClose();
  };

  const handleGoogle = () => {
    loginWithGoogle();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="sleek-card max-w-md w-full overflow-hidden p-6 space-y-5 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-1.5 rounded-full text-zinc-400 hover:text-white hover:bg-[#262a34] transition"
        >
          <X className="w-4 h-4" />
        </button>

        {user ? (
          /* Profile view if already logged in */
          <div className="text-center py-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#55e357]/20 border-2 border-[#55e357] text-[#55e357] font-black text-2xl flex items-center justify-center mx-auto shadow-glow-lime">
              {user.avatar || 'A'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">{user.name}</h3>
              <p className="text-xs text-zinc-400">{user.email}</p>
              <div className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 rounded-full bg-[#14161c] border border-white/5 text-[11px] text-[#55e357] font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Target NEET 2027 • 700+</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 rounded-full bg-[#262a34] text-xs font-bold text-white hover:bg-[#323744] transition"
              >
                Close
              </button>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="flex-1 py-2.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold hover:bg-rose-500/20 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          /* Auth Form: Email & Gmail Login */
          <div className="space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-[#55e357] animate-pulse" />
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#55e357]">
                  Account Access
                </span>
              </div>
              <h3 className="text-xl font-black text-white">
                {mode === 'login' ? 'Sign In to NEET Command' : 'Create Your Aspirant Account'}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Sync your study heatmap, checklist, timer stats, and mock test scores.
              </p>
            </div>

            {/* Google One-Click Login Button */}
            <button
              onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-full bg-[#14161c] border border-white/10 hover:border-white/20 hover:bg-[#1a1e27] text-white text-xs font-bold transition shadow-sleek"
            >
              {/* Google colored SVG */}
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google / Gmail</span>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 text-zinc-500 text-[11px]">
              <div className="flex-1 h-[1px] bg-white/5" />
              <span>or with email</span>
              <div className="flex-1 h-[1px] bg-white/5" />
            </div>

            {/* Email Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#14161c] border border-white/5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#55e357]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="aspirant@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#14161c] border border-white/5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#55e357]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-zinc-400 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#14161c] border border-white/5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#55e357]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-full bg-[#55e357] text-black font-bold text-xs uppercase tracking-wider hover:bg-[#42ca44] transition shadow-glow-lime flex items-center justify-center gap-2 mt-2"
              >
                <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Switch Mode */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-xs text-zinc-400 hover:text-white transition"
              >
                {mode === 'login'
                  ? "Don't have an account? Sign up"
                  : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
