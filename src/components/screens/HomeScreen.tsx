import { EyeOff, MapPin, Search, Plus } from 'lucide-react';
import { ActionType } from '../../lib/decisionEngine';
import { Contact } from '../../types';
import ContactAvatar from '../ui/ContactAvatar';
import RiskButton from '../ui/RiskButton';

type HomeScreenProps = {
  onAction: (action: ActionType) => void;
  contacts: Contact[];
  onOpenContacts: () => void;
};

export default function HomeScreen({ onAction, contacts, onOpenContacts }: HomeScreenProps) {
  return (
    <div className="px-6 py-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Olá, Maria</h1>
          <p className="text-slate-600 mt-1">Seu refúgio está ativo e<br />monitorado.</p>
        </div>
        <button
          onClick={() => onAction('modo_silencioso')}
          className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-full text-xs font-bold tracking-wide"
        >
          <EyeOff className="w-4 h-4" />
          MODO<br />SILENCIOSO
        </button>
      </div>

      <div className="flex flex-col gap-3">
        <RiskButton
          title="Desconforto / Assédio"
          description="Alguém está insistindo ou sendo invasivo."
          level={1}
          onClick={() => onAction('risco_desconforto')}
        />
        <RiskButton
          title="Perseguição"
          description="Acho que alguém está me seguindo."
          level={2}
          onClick={() => onAction('risco_perseguicao')}
        />
        <RiskButton
          title="Ameaça / Encurralamento"
          description="Fui tocada sem consentimento ou bloqueada."
          level={3}
          onClick={() => onAction('risco_ameaca')}
        />
        <RiskButton
          title="Emergência"
          description="Agressão ou perigo extremo imediato"
          level={4}
          onClick={() => onAction('risco_emergencia')}
        />
      </div>

      <div>
        <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase mb-4 mt-2">Acesso Rápido</h3>
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={() => onAction('enviar_localizacao')}
            className="bg-white p-5 rounded-3xl flex flex-col gap-4 shadow-sm active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-700">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="font-semibold leading-tight">Enviar localização<br />para contato</span>
          </button>
          <button
            onClick={() => onAction('buscar_ajuda_proxima')}
            className="bg-white p-5 rounded-3xl flex flex-col gap-4 shadow-sm active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
              <Search className="w-5 h-5" />
            </div>
            <span className="font-semibold leading-tight">Buscar ajuda<br />próxima</span>
          </button>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xs font-bold text-slate-400 tracking-widest uppercase">Contatos de Confiança</h3>
          <button onClick={onOpenContacts} className="text-violet-700 text-sm font-semibold">Gerenciar</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 snap-x">
          {contacts.length > 0 ? (
            contacts.slice(0, 4).map((contact, index) => (
              <div key={contact.id}>
                <ContactAvatar
                  name={contact.name}
                  image={`https://i.pravatar.cc/150?u=${encodeURIComponent(contact.name)}`}
                  active={index === 0}
                />
              </div>
            ))
          ) : (
            <div className="flex items-center justify-center w-full p-6 rounded-3xl bg-white shadow-sm border border-slate-100 text-slate-500">
              Nenhum contato salvo ainda.
            </div>
          )}

          <button
            onClick={onOpenContacts}
            className="flex flex-col items-center gap-2 snap-start shrink-0"
          >
            <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400">
              <Plus className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase">NOVO</span>
          </button>
        </div>
      </div>
    </div>
  );
}
