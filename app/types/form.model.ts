import type { Location, UserRole } from "./auth.model"

export type CollectionsForm = {
    id: number | undefined
    status: 'PENDING' | 'ONGOING' | 'COMPLETED'
    city_id: number | undefined
    driver_id: number | undefined
    truck_id: number | undefined
    date: string | Date | undefined
    barangays: string[]
    date_of_week: number | undefined
    from: string | undefined;
    to: string | undefined;
}

export type BulkCollectionsForm = {
    id: number | undefined
    status: 'PENDING' | 'ONGOING' | 'COMPLETED'
    city_id: number | undefined
    driver_id: number | undefined
    truck_id: number | undefined
    barangays: string[]
    dates: (string | Date | undefined)[]
    from: string | undefined;
    to: string | undefined;
}

export type ProfileForm = {
    id: number | undefined;
    name?: string;
    role: UserRole;
    password?: string;
    birthdate?: Date | null | string;
    email: string;
    contact_number?: string;
}


export type CityForm = {
    id: number | undefined
    name: string
}

export type BarangayForm = {
    id: number | undefined
    name: string
    city_id: number | undefined;
}

export type TruckForm = {
    id: number | undefined
    plate_number: string
    city_id: number | undefined
}

export interface BaseResponse<T> {
  data: T;
  total: number;
}

export interface PartialResponse<T> {
  data: T;
}