import { useState, useEffect } from 'react';
import { Shield, ArrowLeft, Settings } from 'lucide-react';
import { PrivacySettings } from '../../hooks/usePrivacySettings';

type PrivacySettingsScreenProps = {
  onBack: () => void;
  settings: PrivacySettings;
  loading: boolean;
  updateSettings: (newSettings: Partial<PrivacySettings>) => Promise<void>;
};

export default function PrivacySettingsScreen({ onBack, settings, loading, updateSettings }: PrivacySettingsScreenProps) {
  const [localSettings, setLocalSettings] = useState<PrivacySettings>(settings);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    if (loading || saving) return;
    setSaveError('');
    setSaving(true);

    try {
      await updateSettings(localSettings);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      onBack();
    } catch (error: any) {
      setSaveError(error?.message || 'Falha ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = <K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K]
  ) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col max-w-md mx-auto shadow-xl overflow-hidden">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-50 z-10 border-b border-slate-100">
        <button
          onClick={onBack}
          className="p-2 -m-2 hover:bg-slate-100 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2 text-violet-700 font-semibold text-lg">
          <Shield className="w-6 h-6 fill-violet-700" />
          Privacidade
        </div>
        <div className="w-9" /> {/* Spacer */}
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Modo Invisível</h2>
            <p className="text-sm text-slate-600 mb-6">
              Configure como ativar o modo invisível e qual tela falsa usar.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Método de Ativação
              </label>
              <select
                value={localSettings.activationMethod}
                onChange={(e) => updateSetting('activationMethod', e.target.value as any)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="triple_tap">3 toques no canto superior direito</option>
                <option value="floating_button">Botão flutuante invisível</option>
                <option value="keyboard_shortcut">Atalho de teclado (Ctrl+Shift+H)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tela Falsa
              </label>
              <select
                value={localSettings.fakeScreenType}
                onChange={(e) => updateSetting('fakeScreenType', e.target.value as any)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
              >
                <option value="calculator">Calculadora</option>
                <option value="weather">Clima (em breve)</option>
                <option value="notes">Notas (em breve)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                PIN de 4 dígitos (opcional)
              </label>
              <input
                type="password"
                value={localSettings.pinCode || ''}
                onChange={(e) => updateSetting('pinCode', e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="Digite 4 números"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none"
                maxLength={4}
              />
              <p className="text-xs text-slate-500 mt-1">
                PIN necessário para sair do modo invisível
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-4">
            <div className="flex items-start gap-3">
              <Settings className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 mb-1">Como funciona</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Ative o modo invisível rapidamente</li>
                  <li>• Aparece uma calculadora funcional</li>
                  <li>• Toque 3 vezes no ícone da calculadora para sair</li>
                  <li>• Digite o PIN para voltar ao app</li>
                </ul>
              </div>
            </div>
          </div>

          {saveError && (
            <div className="rounded-3xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {saveError}
            </div>
          )}

          {saveSuccess && (
            <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700">
              Configurações salvas com sucesso.
            </div>
          )}
        </div>
      </main>

      <footer className="p-6 border-t border-slate-100">
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full rounded-3xl bg-violet-700 px-5 py-4 text-sm font-bold uppercase tracking-widest text-white shadow-lg shadow-violet-700/20 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Carregando...' : 'Salvar Configurações'}
        </button>
      </footer>
    </div>
  );
}