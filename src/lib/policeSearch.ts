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
out center meta ${limit};`;

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

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.elements || !Array.isArray(data.elements)) {
        throw new Error('Resposta inválida da API');
      }

      console.log(`📊 API Overpass retornou ${data.elements.length} elementos`);

      const stations = data.elements
        .map((element: any) => {
          const lat = element.type === 'node' ? element.lat : element.center?.lat;
          const lng = element.type === 'node' ? element.lon : element.center?.lon;

          if (!lat || !lng) {
            console.warn('Elemento sem coordenadas:', element);
            return null;
          }

          // Construir endereço mais completo
          const addressParts = [];
          if (element.tags?.['addr:street']) addressParts.push(element.tags['addr:street']);
          if (element.tags?.['addr:housenumber']) addressParts.push(element.tags['addr:housenumber']);
          if (element.tags?.['addr:city']) addressParts.push(element.tags['addr:city']);
          if (element.tags?.['addr:state']) addressParts.push(element.tags['addr:state']);

          let address = addressParts.join(', ');
          if (!address && element.tags?.name) {
            address = element.tags.name;
          }
          if (!address) {
            address = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
          }

          return {
            id: `${element.type}-${element.id}`,
            name: element.tags?.name || element.tags?.['name:pt'] || 'Delegacia de Polícia',
            address,
            lat,
            lng,
            openNow: element.tags?.opening_hours ? true : false, // Simplificado, poderia ser mais complexo
          } as PoliceStation;
        })
        .filter(Boolean)
        .slice(0, limit);

      console.log(`✅ Processadas ${stations.length} delegacias válidas`);
      return stations;
    } catch (error) {
      lastError = error as Error;
      console.error(`❌ Tentativa ${attempt} falhou:`, error);

      if (attempt < maxRetries) {
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5s
        console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error('❌ Todas as tentativas falharam');
  throw lastError;
}
