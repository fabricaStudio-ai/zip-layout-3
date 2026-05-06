import { useCallback, useEffect, useState } from 'react';
import { GeoPosition } from '../types';

export function useGeolocation() {
  const [userPosition, setUserPosition] = useState<GeoPosition | null>(null);
  const [locationStatus, setLocationStatus] = useState('Buscando localização...');
  const [gpsAvailable, setGpsAvailable] = useState(true);

  const loadDefaultStations = useCallback(() => {
    setGpsAvailable(false);
    setLocationStatus('GPS não disponível ou permissão negada. Ative o GPS para ver sua localização atual.');
    setUserPosition(null);
  }, []);

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
      },
      () => {
        loadDefaultStations();
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, [loadDefaultStations]);

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
      },
      () => {
        loadDefaultStations();
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [loadDefaultStations]);

  return {
    userPosition,
    locationStatus,
    gpsAvailable,
    refreshLocation,
  };
}
