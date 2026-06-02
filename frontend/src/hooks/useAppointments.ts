import { useState, useCallback } from 'react';
import api from '../api/axios';
import type { Appointment, AppointmentCreate } from '../types/schedule';

export const useAppointments = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getAppointments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<Appointment[]>('/schedule/appointments/');
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch appointments');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const getUpcomingAppointments = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get<Appointment[]>('/schedule/appointments/upcoming/');
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to fetch upcoming appointments');
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const createAppointment = async (appointment: AppointmentCreate) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.post<Appointment | Appointment[]>('/schedule/appointments/', appointment);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to create appointment');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const updateAppointment = async (id: number, data: Partial<Appointment>) => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.patch<Appointment>(`/schedule/appointments/${id}/`, data);
            return response.data;
        } catch (err: any) {
            setError(err.message || 'Failed to update appointment');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const deleteAppointment = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await api.delete(`/schedule/appointments/${id}/`);
            return true;
        } catch (err: any) {
            setError(err.message || 'Failed to delete appointment');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        getAppointments,
        getUpcomingAppointments,
        createAppointment,
        updateAppointment,
        deleteAppointment
    };
};
