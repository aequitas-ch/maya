import { useAuth } from '../hooks/useAuth';
import { useTranslation } from '../hooks/useTranslation';

export const Dashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t('dashboard_title') || 'Dashboard'}</h1>
          <p className="text-lg text-gray-600">
            {t('welcome')} {user?.display_name || user?.first_name || user?.username}!
          </p>
          <p className="text-md text-gray-500 mt-2">
            {t('empty_dashboard') || 'This is your dashboard. It is currently empty.'}
          </p>
        </div>
      </div>
    </div>
  );
};
