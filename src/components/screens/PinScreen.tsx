import { useState } from 'react';
import { Lock } from 'lucide-react';

type PinScreenProps = {
  onSuccess: () => void;
  onCancel: () => void;
  expectedPin?: string;
};

export default function PinScreen({ onSuccess, onCancel, expectedPin }: PinScreenProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handleDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const handleSubmit = () => {
    if (expectedPin && pin === expectedPin) {
      onSuccess();
    } else if (!expectedPin) {
      // If no PIN set, any 4-digit code works
      onSuccess();
    } else {
      setError('PIN incorreto');
      setPin('');
    }
  };

  const handleCancel = () => {
    setPin('');
    setError('');
    onCancel();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-xl p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-violet-100 rounded-3xl flex items-center justify-center text-violet-700">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Digite o PIN</h1>
            <p className="text-sm text-slate-500">Para acessar o app protegido</p>
          </div>
        </div>

        <div className="text-center mb-6">
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full ${
                  i < pin.length ? 'bg-violet-700' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          {error && (
            <p className="text-red-600 text-sm">{error}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleNumberClick(num.toString())}
              className="aspect-square bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-2xl text-xl font-semibold text-slate-900 transition-colors"
            >
              {num}
            </button>
          ))}
          <button
            onClick={handleCancel}
            className="bg-red-100 hover:bg-red-200 active:bg-red-300 rounded-2xl text-sm font-semibold text-red-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => handleNumberClick('0')}
            className="aspect-square bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-2xl text-xl font-semibold text-slate-900 transition-colors"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-2xl text-sm font-semibold text-slate-700 transition-colors"
          >
            ⌫
          </button>
        </div>

        <button
          onClick={handleSubmit}
          disabled={pin.length !== 4}
          className="w-full rounded-3xl bg-violet-700 px-5 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-700/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Confirmar
        </button>
      </div>
    </div>
  );
}