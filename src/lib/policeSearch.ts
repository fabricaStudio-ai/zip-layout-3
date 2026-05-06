import { GeoPosition, PoliceStation } from '../types';
import { POLICE_STATIONS } from '../constants/policeStations';
import { buildStationsWithDistance } from './geoUtils';

const OVERPASS_ENDPOINT = 'https://overpass-api.de/api/interpreter';
const CORS_PROXY = 'https://corsproxy.io/?';

export async function fetchNearbyPoliceStations(
  position: GeoPosition,
  limit = 10,
  radius = 15000,
): Promise<PoliceStation[]> {
  const query = `[out:json][timeout:30];
(
  node["amenity"="police"](around:${radius},${position.lat},${position.lng});
  way["amenity"="police"](around:${radius},${position.lat},${position.lng});
  relation["amenity"="police"](around:${radius},${position.lat},${position.lng});
);
out center;`;

  try {
    console.log(`🔍 Consultando API Overpass: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)} (raio: ${radius}m)`);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(`${CORS_PROXY}${encodeURIComponent(OVERPASS_ENDPOINT)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: query,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Erro na API Overpass: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    const stations = data.elements
      .map((element: any) => {
        const lat = element.lat ?? element.center?.lat;
        const lng = element.lon ?? element.center?.lon;

        if (lat == null || lng == null) {
          return null;
        }

        const addressParts = [
          element.tags?.['addr:street'],
          element.tags?.['addr:housenumber'],
          element.tags?.['addr:place'],
          element.tags?.['addr:suburb'],
          element.tags?.['addr:city'],
          element.tags?.['addr:state'],
        ].filter(Boolean);

        return {
          id: `${element.type}-${element.id}`,
          name: element.tags?.name || 'Delegacia de Polícia',
          address:
            addressParts.length > 0
              ? addressParts.join(', ')
              : element.tags?.name || 'Endereço não disponível',
          lat,
          lng,
          openNow: false,
        } as PoliceStation;
      })
      .filter(Boolean)
      .slice(0, limit);

    if (stations.length > 0) {
      return stations;
    }

    throw new Error('Nenhum resultado retornado pelo Overpass.');
  } catch (error) {
    console.warn('Overpass falhou ou não permite CORS. Usando dados locais como fallback.', error);
    return buildStationsWithDistance(position, POLICE_STATIONS)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit)
      .map(({ distanceKm, ...station }) => station);
  }
}
