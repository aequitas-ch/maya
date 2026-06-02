import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useTranslation } from '../../hooks/useTranslation';
import { useAppointments } from '../../hooks/useAppointments';
import type { Appointment } from '../../types/schedule';
import type { Dependent } from '../../types';
import type { Institution } from '../../types/settlement';
import api from '../../api/axios';

const localizer = momentLocalizer(moment);

export const Schedule = () => {
  const { t } = useTranslation();
  const { getAppointments, createAppointment, updateAppointment } = useAppointments();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    dependent: '',
    institutions: [] as number[],
    start_date: '',
    start_time: '',
    end_time: '',
    attended: null as boolean | null,
    comment: '',
    recurrence_pattern: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const appts = await getAppointments();
      setAppointments(appts);

      const [depRes, instRes] = await Promise.all([
        api.get<Dependent[]>('/core/dependents/'),
        api.get<Institution[]>('/settlement/institutions/')
      ]);
      setDependents(depRes.data);
      setInstitutions(instRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setEditingAppointment(null);
    setFormData({
      title: '',
      dependent: dependents.length > 0 ? dependents[0].id.toString() : '',
      institutions: [],
      start_date: moment(start).format('YYYY-MM-DD'),
      start_time: moment(start).format('HH:mm'),
      end_time: moment(end).format('HH:mm'),
      attended: null,
      comment: '',
      recurrence_pattern: ''
    });
    setShowModal(true);
  };

  const handleSelectEvent = (event: any) => {
    const appt = event.resource as Appointment;
    setEditingAppointment(appt);
    setFormData({
      title: appt.title,
      dependent: appt.dependent.toString(),
      institutions: appt.institutions,
      start_date: appt.start_date,
      start_time: appt.start_time.substring(0,5),
      end_time: appt.end_time.substring(0,5),
      attended: appt.attended,
      comment: appt.comment,
      recurrence_pattern: ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, {
          title: formData.title,
          dependent: parseInt(formData.dependent, 10),
          institutions: formData.institutions,
          start_date: formData.start_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          attended: formData.attended,
          comment: formData.comment
        });
      } else {
        await createAppointment({
          title: formData.title,
          dependent: parseInt(formData.dependent, 10),
          institutions: formData.institutions,
          start_date: formData.start_date,
          start_time: formData.start_time,
          end_time: formData.end_time,
          attended: null,
          comment: '',
          recurrence_pattern: formData.recurrence_pattern
        });
      }
      setShowModal(false);
      fetchData(); // Refresh calendar
    } catch (error) {
      console.error("Error saving appointment", error);
    }
  };

  const calendarEvents = appointments.map(appt => {
    const startDate = new Date(`${appt.start_date}T${appt.start_time}`);
    const endDate = new Date(`${appt.start_date}T${appt.end_time}`);
    return {
      title: `${appt.title} (${appt.dependent_name})`,
      start: startDate,
      end: endDate,
      resource: appt
    };
  });

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('schedule_title') || 'Schedule'}</h1>

        <div className="bg-white p-4 shadow rounded-lg" style={{ height: '70vh' }}>
          <Calendar
            localizer={localizer}
            events={calendarEvents}
            startAccessor="start"
            endAccessor="end"
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            defaultView="week"
            views={['month', 'week', 'day']}
          />
        </div>
      </div>

      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true" onClick={() => setShowModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {editingAppointment ? (t('edit_appointment') || 'Edit') : (t('create_appointment') || 'Create')}
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('appointment_title') || 'Title'}</label>
                      <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('select_dependent') || 'Dependent'}</label>
                      <select required value={formData.dependent} onChange={e => setFormData({...formData, dependent: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                        <option value="">--</option>
                        {dependents.map(d => (
                          <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('select_institution') || 'Institution'}</label>
                      <select multiple value={formData.institutions.map(String)} onChange={e => {
                        const values = Array.from(e.target.selectedOptions, option => parseInt(option.value, 10));
                        setFormData({...formData, institutions: values});
                      }} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3">
                        {institutions.map(i => (
                          <option key={i.id} value={i.id}>{i.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">{t('start_date') || 'Date'}</label>
                        <input type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">{t('start_time') || 'Time'}</label>
                        <input type="time" required value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                      </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('end_time') || 'End Time'}</label>
                        <input type="time" required value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                    </div>

                    {!editingAppointment && (
                       <div>
                       <label className="block text-sm font-medium text-gray-700">{t('recurrence_pattern') || 'RRULE'}</label>
                       <input type="text" placeholder="e.g. FREQ=WEEKLY;COUNT=10" value={formData.recurrence_pattern} onChange={e => setFormData({...formData, recurrence_pattern: e.target.value})} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                     </div>
                    )}

                    {editingAppointment && moment(formData.start_date).isBefore(moment(), 'day') && (
                      <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Past Appointment Details</label>
                        <div className="flex items-center mb-4">
                          <input type="checkbox" id="attended" checked={formData.attended === true} onChange={e => setFormData({...formData, attended: e.target.checked})} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" />
                          <label htmlFor="attended" className="ml-2 block text-sm text-gray-900">{t('attended') || 'Attended'}</label>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">{t('comment') || 'Comment'}</label>
                          <textarea value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} rows={3} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button type="submit" className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm">
                    {t('save_appointment') || 'Save'}
                  </button>
                  <button type="button" onClick={() => setShowModal(false)} className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm">
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
