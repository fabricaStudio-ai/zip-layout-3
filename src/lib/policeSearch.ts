import { GeoPosition, PoliceStation } from '../types';
import { POLICE_STATIONS } from '../constants/policeStations';
import { buildStationsWithDistance } from './geoUtils';

export async function fetchNearbyPoliceStations(
  position: GeoPosition,
  limit = 10,
): Promise<PoliceStation[]> {
  const stations = buildStationsWithDistance(position, POLICE_STATIONS)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit)
    .map(({ distanceKm, ...station }) => station);

  return new Promise(resolve => setTimeout(() => resolve(stations), 0));
}
