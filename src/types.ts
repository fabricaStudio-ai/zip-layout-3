export type ScreenState = 'HOME' | 'ACTIVE' | 'SHARE_LOC' | 'HELP_NEARBY' | 'CONTACTS' | 'SETTINGS' | 'ENDED';

export type Contact = {
  id: string;
  name: string;
  phone: string;
  relation?: string;
  emergency?: boolean;
};

export type PoliceStation = {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  openNow: boolean;
};

export type GeoPosition = {
  lat: number;
  lng: number;
};
