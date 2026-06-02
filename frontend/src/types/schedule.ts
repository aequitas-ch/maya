import type { Institution } from './settlement';

export interface Appointment {
    id: number;
    dependent: number;
    dependent_name?: string;
    institutions: number[];
    institutions_details?: Institution[];
    title: string;
    start_date: string; // YYYY-MM-DD
    start_time: string; // HH:MM:SS
    end_time: string; // HH:MM:SS
    attended: boolean | null;
    comment: string;
    series_id: string | null;
    recurrence_pattern?: string; // Optional for creation
}

export type AppointmentCreate = Omit<Appointment, 'id' | 'dependent_name' | 'institutions_details' | 'series_id'>;
