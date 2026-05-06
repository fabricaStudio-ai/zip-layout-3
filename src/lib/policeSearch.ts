import { GeoPosition, PoliceStation } from '../types';

export async function fetchNearbyPoliceStations(
  position: GeoPosition,
  limit = 5,
  radius = 10000,
): Promise<PoliceStation[]> {
  const query = `[out:json][timeout:25];
(
  node["amenity"="police"](around:${radius},${position.lat},${position.lng});
  way["amenity"="police"](around:${radius},${position.lat},${position.lng});
  relation["amenity"="police"](around:${radius},${position.lat},${position.lng});
);
out center;`;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: query,
  });

  if (!response.ok) {
    throw new Error('Falha ao buscar delegacias próximas.');
  }

  const data = await response.json();

  return data.elements
    .map((element: any) => {
      const lat = element.lat ?? element.center?.lat;
      const lng = element.lon ?? element.center?.lon;

      if (!lat || !lng) {
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
        address: addressParts.length > 0 ? addressParts.join(', ') : element.tags?.name || 'Endereço não disponível',
        lat,
        lng,
        openNow: false,
      } as PoliceStation;
    })
    .filter(Boolean)
    .slice(0, limit);
}
