import { CheckCircle2, Mic, MapPin, Send, Shield, Phone, X } from 'lucide-react';
import { ActionType, DecisionResponse } from '../../lib/decisionEngine';
import { Contact, GeoPosition } from '../../types';
import { DEFAULT_LOCATION } from '../../constants/policeStations';
import { buildMapLocationLink, formatLocationDisplay } from '../../lib/utils';

type ActiveEventScreenProps = {
  onAction: (action: ActionType) => void;
  decision: DecisionResponse | null;
  contacts: Contact[];
  userPosition?: GeoPosition | null;
  gpsAvailable?: boolean;
};

export default function ActiveEventScreen({ onAction, decision, contacts, userPosition }: ActiveEventScreenProps) {
  const primaryContact = contacts.find(contact => contact.emergency) ?? (contacts.length ? contacts[0] : null);

  const mapLocation = userPosition || DEFAULT_LOCATION;
  const isFallbackLocation = !userPosition;

  const openWhatsApp = () => {
    if (!primaryContact) return;
    onAction('abrir_whatsapp');
    const phone = primaryContact.phone.replace(/\D/g, '');
    const locationLink = buildMapLocationLink(mapLocation);
    const coordsText = userPosition ? `Lat: ${userPosition.lat.toFixed(6)}, Lng: ${userPosition.lng.toFixed(6)}` : 'Localização ainda não capturada.';
    const message = `Preciso de ajuda! Estou aqui: ${coordsText}. Confira no mapa: ${locationLink}`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const mapUrl = `https://maps.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}&z=16&output=embed`;
  const locationWarning = userPosition ? 'Monitoramento em tempo real' : 'GPS inativo. Exibindo localização padrão.';

  return (
    <div className="px-6 py-4 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {decision?.modo_silencioso && (
        <div className="bg-violet-100 text-violet-800 px-4 py-2 rounded-full text-xs font-bold tracking-wide flex items-center gap-2 self-start mb-2">
          <div className="w-2 h-2 bg-violet-600 rounded-full animate-pulse" />
          STEALTH MODE ACTIVE
        </div>
      )}

      {decision?.iniciar_gravacao && (
        <div className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-full flex items-center justify-center text-violet-700">
              <Mic className="w-5 h-5" />
            </div>
            <span className="font-semibold">Gravando áudio</span>
          </div>
          <span className="text-slate-500 font-mono text-sm">04:12</span>
        </div>
      )}

      {decision?.salvar_localizacao && (
        <div className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-700">
              <MapPin className="w-5 h-5" />
            </div>
            <span className="font-semibold">Localização ativa</span>
          </div>
          <span className="text-slate-400 font-mono text-[10px]">
            {formatLocationDisplay(userPosition ?? undefined)}
          </span>
        </div>
      )}

      <div className="relative bg-slate-200 h-64 rounded-3xl overflow-hidden shadow-sm">
        <iframe
          title="Mapa de monitoramento"
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
        />
        <div className="absolute bottom-4 left-4 bg-white/90 px-3 py-2 rounded-full text-sm font-semibold text-slate-900 shadow-sm">
          {locationWarning}
        </div>
        <button
          onClick={() => window.open(buildMapLocationLink(mapLocation), '_blank')}
          className="absolute bottom-4 right-4 bg-violet-700 text-white rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-wider shadow-lg shadow-violet-700/20"
        >
          Abrir no Maps
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-2">
        <button
          onClick={() => onAction('enviar_localizacao')}
          className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
        >
          <MapPin className="w-6 h-6 text-violet-700" />
          <span className="font-semibold text-sm">Enviar localização</span>
        </button>
        <button
          onClick={openWhatsApp}
          className={`rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform py-4 px-4 ${
            primaryContact ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
          disabled={!primaryContact}
        >
          <div className="relative">
            <Send className="w-6 h-6 text-green-600" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-violet-600 rounded-full border-2 border-white flex items-center justify-center">
              <CheckCircle2 className="w-2 h-2 text-white" />
            </div>
          </div>
          <span className="font-semibold text-sm">Abrir WhatsApp</span>
        </button>
      </div>

      <button
        onClick={() => onAction('buscar_ajuda_proxima')}
        className="bg-white p-4 rounded-2xl flex items-center justify-center gap-3 shadow-sm active:scale-[0.98] transition-transform"
      >
        <Shield className="w-5 h-5 text-slate-700" />
        <span className="font-semibold">Buscar delegacia próxima</span>
      </button>

      <button
        onClick={() => window.location.href = 'tel:190'}
        className="bg-violet-700 text-white rounded-[2.5rem] p-6 flex items-center justify-between shadow-lg shadow-violet-700/20 active:scale-[0.98] transition-transform mt-4"
      >
        <span className="text-xl font-bold uppercase tracking-wide px-4">Chamada de<br />Emergência</span>
        <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shrink-0">
          <Phone className="w-8 h-8" />
        </div>
      </button>

      <button
        onClick={() => onAction('encerrar_evento')}
        className="mt-6 flex items-center justify-center gap-2 text-slate-500 text-xs font-bold tracking-widest uppercase"
      >
        <X className="w-4 h-4" />
        Encerrar Evento
      </button>
    </div>
  );
}
