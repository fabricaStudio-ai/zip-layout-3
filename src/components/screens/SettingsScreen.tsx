type SettingsScreenProps = {
  onBack: () => void;
  onOpenPrivacySettings?: () => void;
};

export default function SettingsScreen({ onBack, onOpenPrivacySettings }: SettingsScreenProps) {
  return (
    <div className="px-6 py-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Configurações</h2>
          <p className="text-slate-500 text-sm mt-1">Ajustes rápidos de segurança e conexão.</p>
        </div>
        <button onClick={onBack} className="text-violet-700 text-sm font-semibold">Voltar</button>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div>
          <h3 className="font-semibold text-slate-900">Conexão de dados</h3>
          <p className="text-sm text-slate-500">O app funciona melhor com internet ativa para enviar alertas e localização.</p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">GPS</h3>
          <p className="text-sm text-slate-500">Permita o acesso ao GPS para localizar delegacias mais próximas e enviar coordenadas exatas.</p>
        </div>
      </div>

      {onOpenPrivacySettings && (
        <button
          onClick={onOpenPrivacySettings}
          className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm text-left hover:bg-slate-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Privacidade e Segurança</h3>
              <p className="text-sm text-slate-500">Configure o modo invisível e proteções adicionais.</p>
            </div>
            <div className="text-violet-700">→</div>
          </div>
        </button>
      )}
    </div>
  );
}
