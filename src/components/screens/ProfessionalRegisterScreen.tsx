import { useState } from 'react';
import { AlertCircle, CheckCircle2, Lock, Mail, User } from 'lucide-react';
import { registerWithEmail } from '../../services/authService';

type ProfessionalRegisterScreenProps = {
  onSuccess: () => void;
  onBack: () => void;
};

export default function ProfessionalRegisterScreen({ onSuccess, onBack }: ProfessionalRegisterScreenProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetError = () => setError('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetError();

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Informe nome, e-mail e senha para continuar.');
      return;
    }

    setIsSubmitting(true);

    try {
      await registerWithEmail(email.trim(), password, name.trim());
      onSuccess();
    } catch (err: any) {
      setError(err?.message || 'Falha ao criar a conta. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-violet-100 rounded-3xl flex items-center justify-center text-violet-700">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Cadastro</h1>
            <p className="text-sm text-slate-500">Complete seus dados e acesse o app pelo seu nome.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-slate-700">Nome completo</span>
            <div className="mt-2 flex items-center gap-3 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3">
              <User className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={event => setName(event.target.value)}
                placeholder="Seu nome completo"
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-700">E-mail profissional</span>
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
            Criar conta
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          Já possui conta?
          <button
            type="button"
            onClick={onBack}
            className="ml-2 font-semibold text-violet-700 hover:text-violet-800"
          >
            Entrar agora
          </button>
        </div>
      </div>
    </div>
  );
}
