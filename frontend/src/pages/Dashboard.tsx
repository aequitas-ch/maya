import { useEffect, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEncryption } from '../context/EncryptionContext';
import { useTranslation } from '../hooks/useTranslation';
import { useAppointments } from '../hooks/useAppointments';
import type { Appointment } from '../types/schedule';
import moment from 'moment';
import { importKey } from '../utils/crypto';

export const Dashboard = () => {
  const { user } = useAuth();
  const { hasKey, setEncryptionKey } = useEncryption();
  const { t } = useTranslation();
  const { getUpcomingAppointments } = useAppointments();

  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const fetchUpcoming = async () => {
      const appts = await getUpcomingAppointments();
      setUpcomingAppointments(appts);
    };
    fetchUpcoming();
  }, [getUpcomingAppointments]);
  const [keyError, setKeyError] = useState('');

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const key = await importKey(text.trim());
      setEncryptionKey(key);
      setKeyError('');
    } catch (err) {
      console.error(err);
      setKeyError('Invalid key file format.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        {!hasKey && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Your session is currently locked</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Upload your encryption key file to decrypt your sensitive data locally.</p>
                  {keyError && <p className="text-red-600 mt-1">{keyError}</p>}
                  <div className="mt-3">
                    <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                      Upload Key File
                      <input type="file" className="hidden" accept=".txt" onChange={handleFileUpload} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 p-6 bg-white shadow rounded-lg">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('dashboard_title') || 'Dashboard'}</h1>
          <p className="text-lg text-gray-600">
            {t('welcome')} {user?.display_name || user?.first_name || user?.username}!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Appointments Widget */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">{t('upcoming_appointments') || 'Upcoming Appointments'}</h2>

            {upcomingAppointments.length === 0 ? (
              <p className="text-gray-500 italic">{t('no_upcoming_appointments') || 'No upcoming appointments.'}</p>
            ) : (
              <ul className="divide-y divide-gray-200">
                {upcomingAppointments.map((appt) => (
                  <li key={appt.id} className="py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded bg-indigo-100 flex flex-col items-center justify-center text-indigo-700">
                          <span className="text-xs font-semibold">{moment(appt.start_date).format('MMM')}</span>
                          <span className="text-lg font-bold">{moment(appt.start_date).format('DD')}</span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {appt.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {appt.dependent_name} • {appt.start_time.substring(0,5)} - {appt.end_time.substring(0,5)}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Empty state for other widgets */}
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-64 flex flex-col items-center justify-center">
            <p className="text-md text-gray-500">
              {t('empty_dashboard') || 'This is your dashboard. More widgets can be added here.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
