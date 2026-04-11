import React, { useState, useEffect } from 'react';
import { 
  Shield, MapPin, Wifi, WifiOff, EyeOff, Asterisk, AlertCircle, 
  Send, Search, Plus, Phone, X, CheckCircle2, Navigation, 
  FileText, Share2, Map as MapIcon, Clock, Settings, Users, Home as HomeIcon,
  Mic
} from 'lucide-react';
import { processAction, ActionType, AppContext, DecisionResponse } from './lib/decisionEngine';
import { cn } from './lib/utils';

type ScreenState = 'HOME' | 'ACTIVE' | 'SHARE_LOC' | 'HELP_NEARBY' | 'ENDED';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('HOME');
  const [decision, setDecision] = useState<DecisionResponse | null>(null);
  
  const [context, setContext] = useState<AppContext>({
    internet_disponivel: true,
    gps_disponivel: true,
    contatos_configurados: true,
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
        {currentScreen === 'HOME' && <HomeScreen onAction={handleAction} />}
        {currentScreen === 'ACTIVE' && <ActiveEventScreen onAction={handleAction} decision={decision} />}
        {currentScreen === 'SHARE_LOC' && <ShareLocationScreen onAction={handleAction} />}
        {currentScreen === 'HELP_NEARBY' && <HelpNearbyScreen onAction={handleAction} />}
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
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <div className="p-2 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-semibold tracking-wider uppercase">Contacts</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <div className="p-2 rounded-xl">
            <Settings className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-semibold tracking-wider uppercase">Settings</span>
        </button>
      </nav>
    </div>
  );
}

function HomeScreen({ onAction }: { onAction: (a: ActionType) => void }) {
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
          <button className="text-violet-700 text-sm font-semibold">Ver todos</button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 -mx-6 px-6 snap-x">
          <ContactAvatar name="ANA" image="https://i.pravatar.cc/150?u=ana" active />
          <ContactAvatar name="CARLOS" image="https://i.pravatar.cc/150?u=carlos" />
          <ContactAvatar name="JULIA" image="https://i.pravatar.cc/150?u=julia" />
          <button className="flex flex-col items-center gap-2 snap-start shrink-0">
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

function ShareLocationScreen({ onAction }: { onAction: (a: ActionType) => void }) {
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
          <h3 className="text-xl font-bold">Select Contact</h3>
          <button className="text-violet-700 text-sm font-semibold">Manage All</button>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="bg-violet-100 border border-violet-200 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/150?u=ana" alt="Ana" className="w-12 h-12 rounded-full" />
              <div>
                <p className="font-bold text-slate-900">Ana Paula (Mãe)</p>
                <p className="text-xs text-violet-700">+55 11 98765-4321</p>
              </div>
            </div>
            <div className="w-6 h-6 bg-violet-700 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>

          <div className="bg-white border border-slate-100 p-4 rounded-2xl flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <img src="https://i.pravatar.cc/150?u=carlos" alt="Ricardo" className="w-12 h-12 rounded-full" />
              <div>
                <p className="font-bold text-slate-900">Ricardo Silva</p>
                <p className="text-xs text-slate-500">+55 11 91234-5678</p>
              </div>
            </div>
            <div className="w-6 h-6 border-2 border-slate-300 rounded-full"></div>
          </div>
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

function HelpNearbyScreen({ onAction }: { onAction: (a: ActionType) => void }) {
  const openMapsLink = (query: string) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank');
  };

  return (
    <div className="px-6 py-4 flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-200 h-64 rounded-3xl relative overflow-hidden flex items-center justify-center -mx-2 shadow-inner">
        <iframe 
          width="100%" 
          height="100%" 
          style={{ border: 0 }} 
          loading="lazy" 
          allowFullScreen 
          referrerPolicy="no-referrer-when-downgrade" 
          src="https://maps.google.com/maps?q=delegacia+de+policia&t=&z=13&ie=UTF8&iwloc=&output=embed">
        </iframe>
        <button 
          onClick={() => openMapsLink('delegacia de policia')}
          className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-violet-700 z-10 hover:bg-slate-50"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold">Ajuda Próxima</h2>
          <p className="text-slate-500 text-sm mt-1">Postos de segurança ativos num raio de 5km</p>
        </div>
        <div className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shrink-0">
          Live Status
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-violet-100 rounded-2xl flex items-center justify-center text-violet-700 shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Delegacias</h3>
                <p className="text-slate-500 text-sm">1.2 km de distância</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-violet-50 text-violet-700 px-2 py-1 rounded-full text-xs font-semibold">
              <div className="w-1.5 h-1.5 bg-violet-600 rounded-full"></div>
              Aberto
            </div>
          </div>
          
          <p className="text-slate-700 font-medium mb-1">27º Distrito Policial - Campo Belo</p>
          <p className="text-slate-400 text-xs font-bold tracking-wider uppercase mb-4">Rua Dr. Jesuíno Maciel, 125</p>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => openMapsLink('27º Distrito Policial - Campo Belo')}
              className="bg-slate-100 text-slate-900 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              <MapIcon className="w-4 h-4" />
              Abrir no<br/>Google Maps
            </button>
            <button 
              onClick={() => openMapsLink('27º Distrito Policial - Campo Belo')}
              className="bg-violet-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold shadow-md shadow-violet-700/20 active:scale-[0.98] transition-transform"
            >
              <Navigation className="w-4 h-4" />
              Traçar rota
            </button>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-4">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-fuchsia-100 rounded-2xl flex items-center justify-center text-fuchsia-700 shrink-0">
                <Asterisk className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg leading-tight">Polícia</h3>
                <p className="text-slate-500 text-sm">800 m de distância</p>
              </div>
            </div>
            <div className="flex items-center gap-1 bg-fuchsia-50 text-fuchsia-700 px-2 py-1 rounded-full text-xs font-semibold">
              <div className="w-1.5 h-1.5 bg-fuchsia-600 rounded-full"></div>
              Ativo
            </div>
          </div>
          
          <p className="text-slate-700 font-medium mb-1">Base Comunitária PM - Praça Pereira</p>
          <p className="text-slate-400 text-xs font-bold tracking-wider uppercase mb-4">Av. Santo Amaro, 4200</p>
          
          <div className="grid grid-cols-2 gap-3">
            <button 
              onClick={() => openMapsLink('Base Comunitária PM - Praça Pereira')}
              className="bg-slate-100 text-slate-900 rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold active:scale-[0.98] transition-transform"
            >
              <MapIcon className="w-4 h-4" />
              Abrir no<br/>Google Maps
            </button>
            <button 
              onClick={() => openMapsLink('Base Comunitária PM - Praça Pereira')}
              className="bg-violet-700 text-white rounded-xl py-3 flex items-center justify-center gap-2 text-sm font-semibold shadow-md shadow-violet-700/20 active:scale-[0.98] transition-transform"
            >
              <Navigation className="w-4 h-4" />
              Traçar rota
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-800 text-white p-6 rounded-3xl relative overflow-hidden mt-2">
        <Shield className="absolute -right-4 -bottom-4 w-32 h-32 text-white/5" />
        <h3 className="font-bold text-lg mb-2 relative z-10">Protocolo de Segurança</h3>
        <p className="text-slate-300 text-sm leading-relaxed relative z-10">
          Mantenha o GPS ativado. Se sentir perigo iminente, pressione o botão SOS no menu principal.
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
