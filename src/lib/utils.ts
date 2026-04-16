import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { GeoPosition } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLocationDisplay(position?: GeoPosition) {
  if (!position) return 'Aguardando GPS...';
  return `${position.lat.toFixed(6)}°, ${position.lng.toFixed(6)}°`;
}

export function buildMapLocationLink(position?: GeoPosition) {
  if (!position) return 'https://www.google.com/maps';
  return `https://www.google.com/maps/search/?api=1&query=${position.lat},${position.lng}`;
}

export function buildEmbedMapUrl(position?: GeoPosition, query?: string, zoom = 16) {
  const base = 'https://maps.google.com/maps?output=embed';
  if (!position) {
    return base;
  }
  if (query) {
    return `${base}&q=${encodeURIComponent(query)}&ll=${position.lat},${position.lng}&z=${zoom}`;
  }
  return `${base}&q=${position.lat},${position.lng}&z=${zoom}`;
}

export function buildStaticMapImageUrl(position?: GeoPosition, width = 640, height = 300, zoom = 15) {
  if (!position) return '';
  return `https://staticmap.openstreetmap.de/staticmap.php?center=${position.lat},${position.lng}&zoom=${zoom}&size=${width}x${height}&markers=${position.lat},${position.lng},red-pushpin`;
}
