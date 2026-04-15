import { useState } from 'react';
import { AlertCircle, CheckCircle2, Lock, Mail } from 'lucide-react';
import { loginWithEmail, registerWithEmail, loginWithGoogle } from '../../services/authService';

type AuthScreenProps = {
  onSuccess: () => void;
};

export default function AuthScreen({ onSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetError = () => setError('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetError();

    if (!email.trim() || !password.trim()) {
      setError('Informe e-mail e senha para continuar.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email.trim(), password);
      } else {
        await registerWithEmail(email.trim(), password);
      }
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Falha ao autenticar. Verifique suas credenciais.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    resetError();
    setIsSubmitting(true);

    try {
      await loginWithGoogle();
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Falha ao autenticar com Google.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-violet-100 rounded-3xl flex items-center justify-center text-violet-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Acesse sua conta</h1>
            <p className="text-sm text-slate-500">Use seu e-mail para entrar ou criar uma conta segura.</p>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`rounded-full px-4 py-2 text-sm font-semibold ${mode === 'register' ? 'bg-violet-700 text-white' : 'bg-slate-100 text-slate-600'}`}
          >
            Cadastrar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">E-mail</span>
            <div className="mt-2 flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Mail className="w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={event => setEmail(event.target.value)}
                placeholder="seu@email.com"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Senha</span>
            <div className="mt-2 flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <Lock className="w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={event => setPassword(event.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </label>

          {error && (
            <div className="rounded-3xl bg-red-50 border border-red-200 p-4 text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-3xl bg-violet-700 px-5 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-700/20 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {mode === 'login' ? 'Entrar' : 'Criar conta'}
          </button>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isSubmitting}
            className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold uppercase tracking-widest text-slate-700 shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            Continuar com Google
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Seus dados são protegidos pelo Firebase Authentication.
        </p>
      </div>
    </div>
  );
}
