import { useCallback, useEffect, useState } from 'react';
import { DEFAULT_LOCATION, POLICE_STATIONS } from '../constants/policeStations';
import { GeoPosition, PoliceStation } from '../types';
import { buildStationsWithDistance } from '../lib/geoUtils';

export type StationWithDistance = PoliceStation & { distanceKm: number };

export function useGeolocation() {
  const [userPosition, setUserPosition] = useState<GeoPosition | null>(null);
  const [locationStatus, setLocationStatus] = useState('Buscando localização...');
  const [stations, setStations] = useState<StationWithDistance[]>([]);
  const [gpsAvailable, setGpsAvailable] = useState(true);

  const updateStationDistances = useCallback((position: GeoPosition) => {
    setStations(
      buildStationsWithDistance(position, POLICE_STATIONS).sort(
        (a, b) => a.distanceKm - b.distanceKm,
      ),
    );
  }, []);

  const loadDefaultStations = useCallback(() => {
    setGpsAvailable(false);
    setLocationStatus('GPS não disponível ou permissão negada. Mostrando localizações padrão.');
    setUserPosition(null);
    updateStationDistances(DEFAULT_LOCATION);
  }, [updateStationDistances]);

  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) {
      loadDefaultStations();
      return;
    }

    setLocationStatus('Buscando localização...');
    navigator.geolocation.getCurrentPosition(
      position => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setGpsAvailable(true);
        setUserPosition(coords);
        setLocationStatus('Localização atual encontrada.');
        updateStationDistances(coords);
      },
      () => {
        loadDefaultStations();
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, [loadDefaultStations, updateStationDistances]);

  useEffect(() => {
    if (!navigator.geolocation) {
      loadDefaultStations();
      return;
    }

    setLocationStatus('Monitorando localização...');
    const watchId = navigator.geolocation.watchPosition(
      position => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setGpsAvailable(true);
        setUserPosition(coords);
        setLocationStatus('Localização atual encontrada.');
        updateStationDistances(coords);
      },
      () => {
        loadDefaultStations();
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [loadDefaultStations, updateStationDistances]);

  return {
    userPosition,
    stations,
    locationStatus,
    gpsAvailable,
    refreshLocation,
  };
}
