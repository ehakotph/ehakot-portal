export interface Sample { id: number };

export type UserRole = 'superadmin' | 'admin' | 'driver' | 'user' | 'guest';

export interface User {
  id: number;
  name?: string;
  role: UserRole;
  password?: string;
  birthdate?: Date | null | string;
  email: string;
  contact_number: string | null;
  location: Location | null;
  location_city: string | null;
  location_barangay: string | null;
  city_id: number | null;
  created_at: Date | string;
  updated_at: Date | string;
  deleted_at?: Date | string | null;

  //association
  city?: Cities
}

export interface Location {
  lat: number;
  lng: number;
}

export interface Cities {
  id: number;
  name: string;

  created_at: Date | string;
  updated_at: Date | string;
  deleted_at?: Date | string | null;
}

export interface Barangays {
  id: number;
  name: string;
  city_id: number;

  created_at: Date | string;
  updated_at: Date | string;
  deleted_at?: Date | string | null;

  //association
  city?: Cities;
}

export interface Trucks {
  id: number;
  city_id: number;
  plate_number: string;

  created_at: Date | string;
  updated_at: Date | string;
  deleted_at?: Date | string | null;

  //association
  city: Cities;
}

export interface Collections {
  id: number;
  driver_id: number;
  city_id: number;
  truck_id: number;
  barangays: string[];
  status: 'PENDING' | 'ONGOING' | 'COMPLETED'
  date: Date;
  date_of_week: number;
  from: string | undefined;
  to: string | undefined;

  created_at: Date | string;
  updated_at: Date | string;
  deleted_at?: Date | string | null;

  //association
  city?: Cities;
  driver?: User;
  truck?: Trucks;
  collection_histories?: CollectionHistories[];
}

export interface CollectionHistories {
  id: number;
  description: string;
  collection_id: number;
  location: Location;

  created_at: Date | string;
  updated_at: Date | string;
  deleted_at?: Date | string | null;
}

export interface GarbageReports {
  id: number;
  location: Location;
  location_city: string;
  location_barangay: string;
  status: 'ACTIVE' | 'ASSUMPTION_COLLECTED' | 'COLLECTED';
  confirmation_date: Date;
  user_id: number;
  collection_id: number;

  created_at: Date | string;
  updated_at: Date | string;
  deleted_at?: Date | string | null;
}

export interface Notifications {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  read_at: Date | string | null;
  readAt?: Date | string | null;
  type?: string;

  created_at: Date | string;
  updated_at: Date | string;
  deleted_at?: Date | string | null;
}

export interface GeoJSON {
  city: string;
  barangay: string;
  report_count: number;
}

export interface HeatmapReport {
  city: string;
  barangays: {
    name: string;
    report_count: number;
  }[]
}

export interface LoginResponse {
  token: string
  user: Partial<User>
}
