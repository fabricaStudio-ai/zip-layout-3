import { CheckCircle2, MapPin, Navigation, Share2, Shield } from 'lucide-react';
import { ActionType } from '../../lib/decisionEngine';
import { Contact, GeoPosition } from '../../types';
import { buildEmbedMapUrl, buildMapLocationLink, formatLocationDisplay } from '../../lib/utils';

type ShareLocationScreenProps = {
  onAction: (action: ActionType) => void;
  contacts: Contact[];
  userPosition?: GeoPosition | null;
};

export default function ShareLocationScreen({ onAction, contacts, userPosition }: ShareLocationScreenProps) {
  const primaryContact = contacts.find(contact => contact.emergency) ?? (contacts.length ? contacts[0] : null);

  const openWhatsApp = () => {
    if (!primaryContact || !userPosition) return;
    const phone = primaryContact.phone.replace(/\D/g, '');
    const locationLink = buildMapLocationLink(userPosition);
    const message = `Estou em risco. Compartilhando minha localização em tempo real pelo Serene Sentinel —  Caso perceba qualquer interrupção ou situação incomum, por favor tente entrar em contato comigo ou acione ajuda.  
 ${formatLocationDisplay(userPosition)}. Acompanhe meu trajeto pelo mapa: ${locationLink}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="px-6 py-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Current Location</h2>
        <div className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
          Active GPS
        </div>
      </div>

      <div className="relative bg-slate-200 h-64 rounded-3xl overflow-hidden shadow-sm">
        {userPosition ? (
          <iframe
            title="Mapa de localização"
            src={buildEmbedMapUrl(userPosition)}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500 text-sm px-4 text-center">
            Ative o GPS para visualizar sua localização atual no mapa.
          </div>
        )}
        <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded-full text-sm font-semibold text-slate-900 shadow-sm">
          {userPosition ? 'Localização atual' : 'Ative o GPS para exibir sua localização.'}
        </div>
        <button
          onClick={() => userPosition && window.open(buildMapLocationLink(userPosition), '_blank')}
          disabled={!userPosition}
          className={`absolute bottom-4 right-4 w-12 h-12 rounded-2xl shadow-lg flex items-center justify-center ${userPosition ? 'bg-white text-violet-700 hover:bg-slate-50' : 'bg-slate-300 text-slate-500 cursor-not-allowed'}`}
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Detalhes da localização</h3>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3">Mensagem padrão</p>
          <div className="bg-slate-100 p-4 rounded-2xl text-slate-700 text-sm leading-relaxed mb-4">
            Estou em risco. Compartilhando minha localização em tempo real pelo Serene Sentinel —  Caso perceba qualquer interrupção ou situação incomum, por favor tente entrar em contato comigo ou acione ajuda.  
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-slate-700 text-sm">
            <p className="font-semibold mb-2">Coordenadas atuais</p>
            <p className="text-slate-500">{formatLocationDisplay(userPosition ?? undefined)}</p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-xl font-bold">Contato principal</h3>
          <button onClick={() => onAction('enviar_localizacao')} className="text-violet-700 text-sm font-semibold">Enviar agora</button>
        </div>
        <div className="flex flex-col gap-3">
          {primaryContact ? (
            <div className="bg-violet-100 border border-violet-200 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={primaryContact.photo || `https://i.pravatar.cc/150?u=${encodeURIComponent(primaryContact.name)}`} alt={primaryContact.name} className="w-12 h-12 rounded-full object-cover" />
                <div>
                  <p className="font-bold text-slate-900">{primaryContact.name}{primaryContact.relation ? ` (${primaryContact.relation})` : ''}</p>
                  <p className="text-xs text-violet-700">{primaryContact.phone}</p>
                </div>
              </div>
              <div className="w-6 h-6 bg-violet-700 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-100 p-4 rounded-2xl text-slate-500">
              Nenhum contato configurado. Cadastre pelo menu de contatos para compartilhar sua localização rapidamente.
            </div>
          )}
        </div>
      </div>

      <div className="bg-violet-50 text-violet-800 p-4 rounded-2xl flex gap-3 text-sm mt-2">
        <Shield className="w-5 h-5 shrink-0" />
        <p>Sua localização será criptografada antes do envio.</p>
      </div>

      <button
        onClick={openWhatsApp}
        className={`rounded-2xl p-4 flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-violet-700/20 active:scale-[0.98] transition-transform mt-2 ${
          primaryContact && userPosition ? 'bg-violet-700 text-white' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
        disabled={!primaryContact || !userPosition}
      >
        <Share2 className="w-5 h-5" />
        {primaryContact ? 'Compartilhar localização via WhatsApp' : 'Cadastre um contato primeiro'}
      </button>
    </div>
  );
}
