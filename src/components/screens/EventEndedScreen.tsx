import { Clock, FileText, MapPin, Map as MapIcon, Share2 } from 'lucide-react';
import { Contact } from '../../types';
import { cn } from '../../lib/utils';

type EventEndedScreenProps = {
  contacts: Contact[];
};

export default function EventEndedScreen({ contacts }: EventEndedScreenProps) {
  const primaryContact = contacts.length ? contacts[0] : null;

  const shareStatus = () => {
    if (!primaryContact) return;
    const phone = primaryContact.phone.replace(/\D/g, '');
    const message = `Cheguei em segurança. O evento foi encerrado no Serene Sentinel.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="px-6 py-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="h-40 rounded-3xl overflow-hidden -mx-2 relative">
        <img src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=800" alt="Calm nature" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 to-transparent" />
      </div>

      <div className="text-center -mt-8 relative z-10">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Você está segura?</h2>
        <p className="text-violet-700 font-medium">O evento foi encerrado com sucesso.</p>
      </div>

      <div className="flex flex-col gap-3">
        <div className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Horário do Evento</p>
            <p className="font-bold text-slate-900 text-lg">22:14 — 22:45</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl flex items-center gap-4 shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-700 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">Localização Final</p>
            <p className="font-bold text-slate-900 text-lg">Rua das Amendoeiras, 402</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">Mapa do Percurso</h3>
          <button className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-semibold">Expandir</button>
        </div>
        <div className="h-32 bg-teal-50 rounded-2xl relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay" />
          <MapPin className="w-8 h-8 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-md" />
          <div className="w-3 h-3 bg-violet-600 rounded-full absolute top-1/3 left-1/3 shadow-sm border-2 border-white" />
          <div className="w-3 h-3 bg-red-500 rounded-full absolute bottom-1/3 left-1/4 shadow-sm border-2 border-white" />
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <button className="bg-violet-700 text-white rounded-2xl p-4 flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-violet-700/20 active:scale-[0.98] transition-transform">
          <FileText className="w-5 h-5" />
          Salvar relatório
        </button>
        <button
          onClick={shareStatus}
          className={cn(
            'rounded-2xl p-4 flex items-center justify-center gap-3 font-bold text-lg active:scale-[0.98] transition-transform',
            primaryContact ? 'bg-slate-200 text-slate-900' : 'bg-slate-100 text-slate-400 cursor-not-allowed',
          )}
          disabled={!primaryContact}
        >
          <Share2 className="w-5 h-5" />
          {primaryContact ? 'Compartilhar com contato' : 'Cadastre um contato primeiro'}
        </button>
        <button className="bg-white border border-slate-200 text-slate-700 rounded-2xl p-4 flex items-center justify-center gap-3 font-bold text-lg active:scale-[0.98] transition-transform">
          <MapIcon className="w-5 h-5" />
          Abrir localização no mapa
        </button>
      </div>

      <p className="text-center text-slate-500 text-xs italic px-4 mt-4">
        "A sua segurança é a nossa prioridade. Todos os dados deste evento foram criptografados e armazenados localmente."
      </p>
    </div>
  );
}
