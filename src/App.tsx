import { useEffect, useState } from 'react';
import { Shield, MapPin, Wifi, WifiOff, Home as HomeIcon, Users, Settings } from 'lucide-react';
import { processAction, ActionType, AppContext, DecisionResponse } from './lib/decisionEngine';
import { cn } from './lib/utils';
import { useAuth } from './hooks/useAuth';
import { useContacts } from './hooks/useContacts';
import { useGeolocation } from './hooks/useGeolocation';
import { ScreenState } from './types';
import ActiveEventScreen from './components/screens/ActiveEventScreen';
import AuthScreen from './components/screens/AuthScreen';
import ContactScreen from './components/screens/ContactScreen';
import EventEndedScreen from './components/screens/EventEndedScreen';
import HelpNearbyScreen from './components/screens/HelpNearbyScreen';
import HomeScreen from './components/screens/HomeScreen';
import SettingsScreen from './components/screens/SettingsScreen';
import ShareLocationScreen from './components/screens/ShareLocationScreen';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<ScreenState>('HOME');
  const [decision, setDecision] = useState<DecisionResponse | null>(null);
  const [context, setContext] = useState<AppContext>({
    internet_disponivel: true,
    gps_disponivel: true,
    contatos_configurados: false,
  });

  const { user, loading, logout } = useAuth();
  const { contacts, addContact, addContacts, toggleEmergencyContact } = useContacts();
  const { userPosition, stations, locationStatus, gpsAvailable, refreshLocation } = useGeolocation();

  useEffect(() => {
    setContext(prev => ({
      ...prev,
      gps_disponivel: gpsAvailable,
      contatos_configurados: contacts.length > 0,
    }));
  }, [contacts.length, gpsAvailable]);

  const handleAction = (action: ActionType) => {
    const response = processAction(action, context);
    setDecision(response);

    const screenMap: Record<ActionType, ScreenState | null> = {
      modo_silencioso: 'ACTIVE',
      risco_desconforto: 'ACTIVE',
      risco_perseguicao: 'ACTIVE',
      risco_ameaca: 'ACTIVE',
      risco_emergencia: 'ACTIVE',
      enviar_localizacao: 'SHARE_LOC',
      buscar_ajuda_proxima: 'HELP_NEARBY',
      abrir_whatsapp: null,
      abrir_mapa: null,
      encerrar_evento: 'ENDED',
    };

    const nextScreen = screenMap[action];
    if (nextScreen) {
      setCurrentScreen(nextScreen);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
        <div className="text-center text-sm text-slate-500">Carregando sessão...</div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onSuccess={() => undefined} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col max-w-md mx-auto shadow-xl overflow-hidden relative">
      <header className="flex items-center justify-between px-6 py-4 bg-slate-50 z-10">
        <div className="flex items-center gap-2 text-violet-700 font-semibold text-lg">
          <Shield className="w-6 h-6 fill-violet-700" />
          Serene Sentinel
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1 bg-slate-200 px-2 py-1 rounded-full">
            <MapPin className="w-3 h-3" />
            GPS
          </div>
          <div className="flex items-center gap-1 bg-slate-200 px-2 py-1 rounded-full">
            {context.internet_disponivel ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {context.internet_disponivel ? 'ON' : 'OFF'}
          </div>
          <button
            type="button"
            onClick={logout}
            className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-semibold text-slate-600 hover:bg-slate-200"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24">
        {currentScreen === 'HOME' && (
          <HomeScreen
            userName={user?.email ?? undefined}
            onAction={handleAction}
            contacts={contacts}
            onOpenContacts={() => setCurrentScreen('CONTACTS')}
          />
        )}

        {currentScreen === 'ACTIVE' && <ActiveEventScreen onAction={handleAction} decision={decision} contacts={contacts} />}

        {currentScreen === 'SHARE_LOC' && <ShareLocationScreen onAction={handleAction} contacts={contacts} />}

        {currentScreen === 'HELP_NEARBY' && (
          <HelpNearbyScreen
            stations={stations}
            locationStatus={locationStatus}
            userPosition={userPosition}
            onRefresh={refreshLocation}
          />
        )}

        {currentScreen === 'CONTACTS' && (
          <ContactScreen
            contacts={contacts}
            onSaveContact={contact => {
              addContact(contact);
              setCurrentScreen('HOME');
            }}
            onImportContacts={imported => {
              addContacts(imported);
              setCurrentScreen('HOME');
            }}
            onToggleEmergency={toggleEmergencyContact}
            onBack={() => setCurrentScreen('HOME')}
          />
        )}

        {currentScreen === 'SETTINGS' && <SettingsScreen onBack={() => setCurrentScreen('HOME')} />}

        {currentScreen === 'ENDED' && <EventEndedScreen contacts={contacts} />}
      </main>

      <nav className="absolute bottom-0 w-full bg-white border-t border-slate-100 px-6 py-3 flex justify-between items-center z-20">
        <button
          onClick={() => setCurrentScreen('HOME')}
          className={cn('flex flex-col items-center gap-1', currentScreen === 'HOME' ? 'text-violet-700' : 'text-slate-400')}
        >
          <div className={cn('p-2 rounded-xl', currentScreen === 'HOME' && 'bg-violet-50')}>
            <HomeIcon className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-semibold tracking-wider uppercase">Home</span>
        </button>

        <button
          onClick={() => setCurrentScreen('CONTACTS')}
          className={cn('flex flex-col items-center gap-1', currentScreen === 'CONTACTS' ? 'text-violet-700' : 'text-slate-400')}
        >
          <div className={cn('p-2 rounded-xl', currentScreen === 'CONTACTS' && 'bg-violet-50')}>
            <Users className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-semibold tracking-wider uppercase">Contacts</span>
        </button>

        <button
          onClick={() => setCurrentScreen('SETTINGS')}
          className={cn('flex flex-col items-center gap-1', currentScreen === 'SETTINGS' ? 'text-violet-700' : 'text-slate-400')}
        >
          <div className={cn('p-2 rounded-xl', currentScreen === 'SETTINGS' && 'bg-violet-50')}>
            <Settings className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-semibold tracking-wider uppercase">Settings</span>
        </button>
      </nav>
    </div>
  );
}
