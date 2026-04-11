import React, { useState, useEffect } from 'react';
import { 
  Shield, MapPin, Wifi, WifiOff, EyeOff, Asterisk, AlertCircle, 
  Send, Search, Plus, Phone, X, CheckCircle2, Navigation, 
  FileText, Share2, Map as MapIcon, Clock, Settings, Users, Home as HomeIcon,
  Mic
} from 'lucide-react';
import { processAction, ActionType, AppContext, DecisionResponse } from './lib/decisionEngine';
import { cn } from './lib/utils';

type ScreenState = 'HOME' | 'ACTIVE' | 'SHARE_LOC' | 'HELP_NEARBY' | 'CONTACTS' | 'SETTINGS' | 'ENDED';

type Contact = {
  id: string;
  name: string;
  phone: string;
  relation?: string;
};

type PoliceStation = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  openNow: boolean;
};

const POLICE_STATIONS: PoliceStation[] = [
  {
    id: 'dp-campo-belo',
    name: '27ª Delegacia de Polícia - Campo Belo',
    address: 'Rua Dr. Jesuíno Maciel, 125, Campo Belo, SP',
    lat: -23.6230,
    lng: -46.6625,
    openNow: true,
  },
  {
    id: 'base-pereira',
    name: 'Base Comunitária PM - Praça Pereira',
    address: 'Av. Santo Amaro, 4200, Vila Olímpia, SP',
    lat: -23.6348,
    lng: -46.6854,
    openNow: true,
  },
  {
    id: 'dp-pinheiros',
    name: '10ª Delegacia de Polícia - Pinheiros',
    address: 'Rua Henrique Schaumann, 470, Pinheiros, SP',
    lat: -23.5695,
    lng: -46.6989,
    openNow: true,
  },
  {
    id: 'delegacia-se',
    name: '3ª Delegacia de Polícia - Sé',
    address: 'Praça Antônio Prado, s/n, Sé, SP',
    lat: -23.5488,
    lng: -46.6333,
    openNow: true,
  },
];

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (value: number) => (value * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function formatDistance(distanceKm: number) {
  return distanceKm < 1
    ? `${Math.round(distanceKm * 1000)} m`
    : `${distanceKm.toFixed(1)} km`;
}

const DEFAULT_LOCATION = { lat: -23.5505, lng: -46.6333 };

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('HOME');
  const [decision, setDecision] = useState<DecisionResponse | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [stations, setStations] = useState<(PoliceStation & { distanceKm: number })[]>([]);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [locationStatus, setLocationStatus] = useState('Buscando localização...');

  const [context, setContext] = useState<AppContext>({
    internet_disponivel: true,
    gps_disponivel: true,
    contatos_configurados: false,
  });

  const handleAction = (action: ActionType) => {
    const response = processAction(action, context);
    setDecision(response);
    
    // Navigate based on action
    if (action === 'risco_desconforto' || action === 'risco_perseguicao' || action === 'risco_ameaca' || action === 'risco_emergencia' || action === 'modo_silencioso') {
      setCurrentScreen('ACTIVE');
    } else if (action === 'enviar_localizacao') {
      setCurrentScreen('SHARE_LOC');
    } else if (action === 'buscar_ajuda_proxima') {
      setCurrentScreen('HELP_NEARBY');
    } else if (action === 'encerrar_evento') {
      setCurrentScreen('ENDED');
    }
  };

  useEffect(() => {
    const savedContacts = localStorage.getItem('serene_contacts');
    if (savedContacts) {
      try {
        setContacts(JSON.parse(savedContacts));
      } catch {
        setContacts([]);
      }
    }

    if (!navigator.geolocation) {
      setLocationStatus('GPS não disponível no navegador.');
      setContext(prev => ({ ...prev, gps_disponivel: false }));
      setStations(
        POLICE_STATIONS.map(station => ({
          ...station,
          distanceKm: haversineDistance(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, station.lat, station.lng),
        }))
      );
    } else {
      navigator.geolocation.getCurrentPosition(
        position => {
          const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
          setUserPosition(coords);
          setLocationStatus('Localização atual encontrada.');
          setContext(prev => ({ ...prev, gps_disponivel: true }));
          setStations(
            POLICE_STATIONS.map(station => ({
              ...station,
              distanceKm: haversineDistance(coords.lat, coords.lng, station.lat, station.lng),
            }))
              .sort((a, b) => a.distanceKm - b.distanceKm)
          );
        },
        () => {
          setLocationStatus('Permissão de GPS negada. Mostrando localizações padrão.');
          setContext(prev => ({ ...prev, gps_disponivel: false }));
          setStations(
            POLICE_STATIONS.map(station => ({
              ...station,
              distanceKm: haversineDistance(DEFAULT_LOCATION.lat, DEFAULT_LOCATION.lng, station.lat, station.lng),
            }))
              .sort((a, b) => a.distanceKm - b.distanceKm)
          );
        },
        { timeout: 8000 }
      );
    }
  }, []);

  useEffect(() => {
    setContext(prev => ({ ...prev, contatos_configurados: contacts.length > 0 }));
    localStorage.setItem('serene_contacts', JSON.stringify(contacts));
  }, [contacts]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col max-w-md mx-auto shadow-xl overflow-hidden relative">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-slate-50 z-10">
        <div className="flex items-center gap-2 text-violet-700 font-semibold text-lg">
          <Shield className="w-6 h-6 fill-violet-700" />
          Serene Sentinel
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1 bg-slate-200 px-2 py-1 rounded-full">
            <MapPin className="w-3 h-3" /> GPS
          </div>
          <div className="flex items-center gap-1 bg-slate-200 px-2 py-1 rounded-full">
            {context.internet_disponivel ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {context.internet_disponivel ? 'ON' : 'OFF'}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24">
        {currentScreen === 'HOME' && (
          <HomeScreen
            onAction={handleAction}
            contacts={contacts}
            onOpenContacts={() => setCurrentScreen('CONTACTS')}
          />
        )}
        {currentScreen === 'ACTIVE' && <ActiveEventScreen onAction={handleAction} decision={decision} />}
        {currentScreen === 'SHARE_LOC' && <ShareLocationScreen onAction={handleAction} contacts={contacts} />}
        {currentScreen === 'HELP_NEARBY' && (
          <HelpNearbyScreen
            stations={stations}
            locationStatus={locationStatus}
            onRefresh={() => {
              if (!navigator.geolocation) {
                setLocationStatus('GPS não disponível no navegador.');
                return;
              }
              navigator.geolocation.getCurrentPosition(
                position => {
                  const coords = { lat: position.coords.latitude, lng: position.coords.longitude };
                  setUserPosition(coords);
                  setLocationStatus('Localização atualizada.');
                  setStations(
                    POLICE_STATIONS.map(station => ({
                      ...station,
                      distanceKm: haversineDistance(coords.lat, coords.lng, station.lat, station.lng),
                    }))
                      .sort((a, b) => a.distanceKm - b.distanceKm)
                  );
                },
                () => {
                  setLocationStatus('Falha ao atualizar GPS. Mantendo lista atual.');
                },
                { timeout: 8000 }
              );
            }}
          />
        )}
        {currentScreen === 'CONTACTS' && (
          <ContactScreen
            contacts={contacts}
            onSaveContact={contact => {
              setContacts(prev => [contact, ...prev]);
              setCurrentScreen('HOME');
            }}
            onBack={() => setCurrentScreen('HOME')}
          />
        )}
        {currentScreen === 'SETTINGS' && <SettingsScreen onBack={() => setCurrentScreen('HOME')} />}
        {currentScreen === 'ENDED' && <EventEndedScreen onAction={handleAction} />}
      </main>

      {/* Bottom Navigation */}
      <nav className="absolute bottom-0 w-full bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-20">
        <button 
          onClick={() => setCurrentScreen('HOME')}
          className={cn("flex flex-col items-center gap-1", currentScreen === 'HOME' ? "text-violet-700" : "text-slate-400")}
        >
          <div className={cn("p-2 rounded-xl", currentScreen === 'HOME' && "bg-violet-50")}>
            <HomeIcon className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-semibold tracking-wider uppercase">Home</span>
        </button>
        <button 
          onClick={() => setCurrentScreen('CONTACTS')}
          className={cn("flex flex-col items-center gap-1", currentScreen === 'CONTACTS' ? "text-violet-700" : "text-slate-400")}
        >
          <div className={cn("p-2 rounded-xl", currentScreen === 'CONTACTS' && "bg-violet-50")}>
            <Users className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-semibold tracking-wider uppercase">Contacts</span>
        </button>
        <button 
          onClick={() => setCurrentScreen('SETTINGS')}
          className={cn("flex flex-col items-center gap-1", currentScreen === 'SETTINGS' ? "text-violet-700" : "text-slate-400")}
        >
          <div className={cn("p-2 rounded-xl", currentScreen === 'SETTINGS' && "bg-violet-50")}>
            <Settings className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-semibold tracking-wider uppercase">Settings</span>
        </button>
      </nav>
    </div>
  );
}

function HomeScreen({ onAction, contacts, onOpenContacts }: { onAction: (a: ActionType) => void; contacts: Contact[]; onOpenContacts: () => void }) {
  return (
    <div className="px-6 py-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Olá, Maria</h1>
          <p className="text-slate-600 mt-1">Seu refúgio está ativo e<br/>monitorado.</p>
        </div>
        <button 
          onClick={() => onAction('modo_silencioso')}
          className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-full text-xs font-bold tracking-wide"
        >
          <EyeOff className="w-4 h-4" />
          MODO<br/>SILENCIOSO
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
            <span className="font-semibold leading-tight">Enviar localização<br/>para contato</span>
          </button>
          <button 
            onClick={() => onAction('buscar_ajuda_proxima')}
            className="bg-white p-5 rounded-3xl flex flex-col gap-4 shadow-sm active:scale-[0.98] transition-transform text-left"
          >
            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600">
              <Search className="w-5 h-5" />
            </div>
            <span className="font-semibold leading-tight">Buscar ajuda<br/>próxima</span>
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

function RiskButton({ title, description, level, onClick }: { title: string, description: string, level: number, onClick: () => void }) {
  let bgClass = "bg-white border-violet-100 text-violet-900";
  if (level === 2) bgClass = "bg-violet-50 border-violet-200 text-violet-900";
  if (level === 3) bgClass = "bg-violet-100 border-violet-300 text-violet-900";
  if (level === 4) bgClass = "bg-violet-700 border-violet-700 text-white shadow-lg shadow-violet-700/30";

  return (
    <button 
      onClick={onClick}
      className={cn("w-full text-left p-5 rounded-2xl border active:scale-[0.98] transition-transform flex flex-col gap-1", bgClass)}
    >
      <span className="font-bold text-lg">{title}</span>
      <span className={cn("text-sm", level === 4 ? "text-violet-200" : (level === 3 ? "text-violet-700" : "text-slate-500"))}>{description}</span>
    </button>
  );
}

function ContactAvatar({ name, image, active }: { name: string, image: string, active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 snap-start shrink-0">
      <div className={cn("w-16 h-16 rounded-full p-1", active ? "bg-gradient-to-tr from-violet-500 to-fuchsia-500" : "bg-transparent")}>
        <img src={image} alt={name} className="w-full h-full rounded-full object-cover border-2 border-white" />
      </div>
      <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase">{name}</span>
    </div>
  );
}

function ContactScreen({ contacts, onSaveContact, onBack }: { contacts: Contact[]; onSaveContact: (contact: Contact) => void; onBack: () => void }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relation, setRelation] = useState('');
  const [error, setError] = useState('');

  const handleSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Preencha nome e telefone para salvar o contato.');
      return;
    }

    const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}`;

    onSaveContact({
      id,
      name: name.trim(),
      phone: phone.replace(/\D/g, ''),
      relation: relation.trim() || 'Contato',
    });

    setName('');
    setPhone('');
    setRelation('');
    setError('');
  };

  return (
    <div className="px-6 py-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Contatos de Confiança</h2>
          <p className="text-slate-500 text-sm mt-1">Cadastre pessoas que receberão sua localização em caso de emergência.</p>
        </div>
        <button onClick={onBack} className="text-violet-700 text-sm font-semibold">Voltar</button>
      </div>

      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
        <h3 className="font-bold text-lg mb-4">Contatos salvos</h3>
        {contacts.length === 0 ? (
          <p className="text-slate-500 text-sm">Ainda não há contatos cadastrados.</p>
        ) : (
          <div className="space-y-3">
            {contacts.map(contact => (
              <div key={contact.id} className="rounded-3xl border border-slate-100 p-4 bg-slate-50">
                <p className="font-semibold text-slate-900">{contact.name} {contact.relation ? `(${contact.relation})` : ''}</p>
                <p className="text-sm text-slate-600">{contact.phone}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100 space-y-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Nome</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
            placeholder="Nome do contato"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Telefone</label>
          <input
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
            placeholder="(11) 9 9999-9999"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">Relação</label>
          <input
            value={relation}
            onChange={e => setRelation(e.target.value)}
            className="w-full rounded-3xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300"
            placeholder="Mãe, Amiga, Parceira"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          className="w-full bg-violet-700 text-white rounded-3xl py-4 text-sm font-bold uppercase tracking-widest shadow-md shadow-violet-700/20"
        >
          Salvar contato
        </button>
      </form>
    </div>
  );
}

function SettingsScreen({ onBack }: { onBack: () => void }) {
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
    </div>
  );
}

function ActiveEventScreen({ onAction, decision }: { onAction: (a: ActionType) => void, decision: DecisionResponse | null }) {
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
          <span className="text-slate-400 font-mono text-[10px]">40.7128° N, 74.0060° W</span>
        </div>
      )}

      <div className="bg-slate-200 h-48 rounded-3xl relative overflow-hidden flex items-end p-4">
        <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
        <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2">
          <div className="w-2 h-2 bg-violet-500 rounded-full" />
          Monitoramento em tempo real
        </div>
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
          onClick={() => {
            onAction('abrir_whatsapp');
            const phone = "5511987654321";
            const message = "Preciso de ajuda! Acompanhe minha localização em tempo real: https://maps.google.com/?q=-23.5505,-46.6333";
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
          }}
          className="bg-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform"
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
        <span className="text-xl font-bold uppercase tracking-wide px-4">Chamada de<br/>Emergência</span>
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

function ShareLocationScreen({ onAction, contacts }: { onAction: (a: ActionType) => void; contacts: Contact[] }) {
  const primaryContact = contacts.length ? contacts[0] : null;

  return (
    <div className="px-6 py-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Your Current Location</h2>
        <div className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
          Active GPS
        </div>
      </div>

      <div className="bg-slate-200 h-48 rounded-3xl relative overflow-hidden flex items-center justify-center">
        <MapPin className="w-16 h-16 text-violet-500 drop-shadow-lg" />
        <button className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-violet-700">
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      <div>
        <h3 className="text-xl font-bold mb-4">Message Details</h3>
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-3">Pre-defined Message</p>
          <div className="bg-slate-100 p-4 rounded-2xl text-slate-700 text-sm leading-relaxed">
            Estou compartilhando minha localização em tempo real via Serene Sentinel para sua segurança. Acompanhe meu trajeto.
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
                <img src={`https://i.pravatar.cc/150?u=${encodeURIComponent(primaryContact.name)}`} alt={primaryContact.name} className="w-12 h-12 rounded-full" />
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
        onClick={() => {
          const phone = "5511987654321";
          const message = "Estou compartilhando minha localização em tempo real via Serene Sentinel para sua segurança. Acompanhe meu trajeto: https://maps.google.com/?q=-23.5505,-46.6333";
          window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
        }}
        className="bg-violet-700 text-white rounded-2xl p-4 flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-violet-700/20 active:scale-[0.98] transition-transform mt-2"
      >
        <Share2 className="w-5 h-5" />
        Compartilhar localização via WhatsApp
      </button>
    </div>
  );
}

function HelpNearbyScreen({ stations, locationStatus, onRefresh }: { stations: (PoliceStation & { distanceKm: number })[]; locationStatus: string; onRefresh: () => void }) {
  const openMapsLink = (query: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="px-6 py-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Ajuda Próxima</h2>
          <p className="text-slate-500 text-sm mt-1">Postos de segurança reais perto de você</p>
        </div>
        <button
          onClick={onRefresh}
          className="bg-violet-700 text-white rounded-2xl px-4 py-2 text-xs font-semibold uppercase tracking-widest shadow-md shadow-violet-700/20"
        >
          Atualizar
        </button>
      </div>

      <div className="text-slate-500 text-sm">{locationStatus}</div>

      <div className="flex flex-col gap-4">
        {stations.length === 0 ? (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 text-slate-500 text-center">
            Carregando delegacias próximas...
          </div>
        ) : (
          stations.slice(0, 3).map(station => (
            <div key={station.id} className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-start mb-4 gap-3">
                <div className="flex gap-3">
                  <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-700 shrink-0">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg leading-tight">{station.name}</h3>
                    <p className="text-slate-500 text-sm">{formatDistance(station.distanceKm)}</p>
                  </div>
                </div>
                <div className={cn("flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold", station.openNow ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-500')}>
                  <div className={cn('w-1.5 h-1.5 rounded-full', station.openNow ? 'bg-violet-600' : 'bg-slate-400')} />
                  {station.openNow ? 'Aberto' : 'Fechado'}
                </div>
              </div>
              <p className="text-slate-700 font-medium mb-1">{station.address}</p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => openMapsLink(`${station.name} ${station.address}`)}
                  className="bg-slate-100 text-slate-900 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold active:scale-[0.98] transition-transform"
                >
                  <MapIcon className="w-4 h-4" />
                  Abrir no Maps
                </button>
                <button
                  onClick={() => openMapsLink(`${station.name} ${station.address}`)}
                  className="bg-violet-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold shadow-md shadow-violet-700/20 active:scale-[0.98] transition-transform"
                >
                  <Navigation className="w-4 h-4" />
                  Traçar rota
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="bg-slate-800 text-white p-6 rounded-3xl relative overflow-hidden mt-2">
        <Shield className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
        <h3 className="font-bold text-lg mb-2 relative z-10">Protocolo de Segurança</h3>
        <p className="text-slate-300 text-sm leading-relaxed relative z-10">
          Mantenha o GPS ativado. Se sentir perigo iminente, vá direto para a delegacia mais próxima.
        </p>
      </div>
    </div>
  );
}

function EventEndedScreen({ onAction }: { onAction: (a: ActionType) => void }) {
  return (
    <div className="px-6 py-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="h-40 rounded-3xl overflow-hidden -mx-2 relative">
        <img src="https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=800" alt="Calm nature" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50/80 to-transparent"></div>
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
          {/* Abstract map representation */}
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] mix-blend-overlay"></div>
          <MapPin className="w-8 h-8 text-red-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow-md" />
          <div className="w-3 h-3 bg-violet-600 rounded-full absolute top-1/3 left-1/3 shadow-sm border-2 border-white"></div>
          <div className="w-3 h-3 bg-red-500 rounded-full absolute bottom-1/3 left-1/4 shadow-sm border-2 border-white"></div>
        </div>
      </div>

      <div className="flex flex-col gap-3 mt-2">
        <button className="bg-violet-700 text-white rounded-2xl p-4 flex items-center justify-center gap-3 font-bold text-lg shadow-lg shadow-violet-700/20 active:scale-[0.98] transition-transform">
          <FileText className="w-5 h-5" />
          Salvar relatório
        </button>
        <button 
          onClick={() => {
            const phone = "5511987654321";
            const message = "Cheguei em segurança. O evento foi encerrado no Serene Sentinel.";
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
          }}
          className="bg-slate-200 text-slate-900 rounded-2xl p-4 flex items-center justify-center gap-3 font-bold text-lg active:scale-[0.98] transition-transform"
        >
          <Share2 className="w-5 h-5" />
          Compartilhar com contato
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
