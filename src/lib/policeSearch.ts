import { GeoPosition, PoliceStation } from '../types';

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

  const maxRetries = 3;
  let lastError: Error;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔍 Tentativa ${attempt}/${maxRetries} - Consultando API Overpass: ${position.lat.toFixed(4)}, ${position.lng.toFixed(4)} (raio: ${radius}m)`);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain',
          'User-Agent': 'SereneSentinel/1.0'
        },
        body: query,
        signal: controller.signal,
      });

  return data.elements
    .map((element: any) => {
      const lat = element.lat ?? element.center?.lat;
      const lng = element.lon ?? element.center?.lon;

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
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
