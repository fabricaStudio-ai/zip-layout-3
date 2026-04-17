import { useEffect, useState } from 'react';
import { Map as MapIcon, Navigation, Shield } from 'lucide-react';
import { PoliceStation } from '../../types';
import { buildStationsWithDistance, formatDistance } from '../../lib/geoUtils';
import { fetchNearbyPoliceStations } from '../../lib/policeSearch';

type StationWithDistance = PoliceStation & { distanceKm: number };

type HelpNearbyScreenProps = {
  locationStatus: string;
  userPosition: { lat: number; lng: number } | null;
  onRefresh: () => void;
};

export default function HelpNearbyScreen({ stations, locationStatus, userPosition, onRefresh }: HelpNearbyScreenProps) {
  const [nearbyStations, setNearbyStations] = useState<StationWithDistance[]>([]);
  const [stationsLoading, setStationsLoading] = useState(false);
  const [stationsError, setStationsError] = useState<string | null>(null);

  const mapUrl = userPosition
    ? `https://maps.google.com/maps?q=delegacia+de+policia&ll=${userPosition.lat},${userPosition.lng}&z=13&output=embed`
    : undefined;

  const centerText = userPosition
    ? `Centralizado em sua localização atual: ${userPosition.lat.toFixed(5)}, ${userPosition.lng.toFixed(5)}`
    : 'Ative o GPS para centralizar no seu local e buscar delegacias próximas.';

  useEffect(() => {
    if (!userPosition) {
      setNearbyStations([]);
      setStationsError(null);
      setStationsLoading(false);
      return;
    }

    setStationsLoading(true);
    setStationsError(null);

    fetchNearbyPoliceStations(userPosition, 5)
      .then(results => {
        const resultsWithDistance = buildStationsWithDistance(userPosition, results).sort(
          (a, b) => a.distanceKm - b.distanceKm,
        );

        setNearbyStations(resultsWithDistance);
      })
      .catch(() => {
        setStationsError('Não foi possível buscar delegacias próximas agora.');
        setNearbyStations([]);
      })
      .finally(() => {
        setStationsLoading(false);
      });
  }, [userPosition]);

  const nearby = nearbyStations.filter(station => station.distanceKm <= 7);
  const displayStations = userPosition
    ? nearby.length > 0
      ? nearby
      : nearbyStations.slice(0, 3)
    : [];
  const headerText = userPosition
    ? nearby.length > 0
      ? 'Delegacias dentro de 7 km'
      : 'Delegacias próximas à sua localização'
    : 'Ative o GPS para ver delegacias próximas à sua localização';

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
      <div className="text-slate-500 text-sm mb-2">{centerText}</div>

      <div className="bg-slate-200 h-64 rounded-3xl relative overflow-hidden flex items-center justify-center -mx-2 shadow-inner">
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0 }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={mapUrl}
        />
        {userPosition && (
          <button
            onClick={() => openMapsLink(`delegacia de policia near ${userPosition.lat},${userPosition.lng}`)}
            className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-2xl shadow-lg flex items-center justify-center text-violet-700 z-10 hover:bg-slate-50"
          >
            <Navigation className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {!userPosition ? (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 text-slate-500 text-center">
            Ative o GPS para ver delegacias próximas à sua localização atual.
          </div>
        ) : stationsLoading ? (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 text-slate-500 text-center">
            Buscando delegacias próximas...
          </div>
        ) : stationsError ? (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 text-red-600 text-center">
            {stationsError}
          </div>
        ) : displayStations.length === 0 ? (
          <div className="bg-white p-5 rounded-3xl border border-slate-100 text-slate-500 text-center">
            Nenhuma delegacia encontrada próxima à sua localização.
          </div>
        ) : (
          <>
            <div className="text-slate-500 text-sm mb-3">{headerText}</div>
            {displayStations.map(station => (
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
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${station.openNow ? 'bg-violet-50 text-violet-700' : 'bg-slate-100 text-slate-500'}`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${station.openNow ? 'bg-violet-600' : 'bg-slate-400'}`} />
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
            ))}
          </>
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
