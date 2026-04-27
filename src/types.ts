export type ScreenState = 'HOME' | 'ACTIVE' | 'SHARE_LOC' | 'HELP_NEARBY' | 'CONTACTS' | 'SETTINGS' | 'ENDED' | 'RECORDINGS';

export type Contact = {
  id: string;
  name: string;
  phone: string;
  relation?: string;
  emergency?: boolean;
  photo?: string;
};

export type PoliceStation = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  openNow?: boolean;
};

export type GeoPosition = {
  lat: number;
  lng: number;
};

export type StoredRecording = {
  id: string;
  timestamp: number;
  date: string;
  time: string;
  duration: number;
  latitude?: number;
  longitude?: number;
  location?: string;
  dataUrl: string;
};
