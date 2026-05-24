import { useState } from 'react';
import { UserManagement } from './UserManagement';
import { TranslationManagement } from './TranslationManagement';
import { useTranslation } from '../../hooks/useTranslation';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'translations'>('users');
  const { t } = useTranslation();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('admin_dashboard')}</h1>

      <div className="mb-8 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`${
              activeTab === 'users'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('manage_users')}
          </button>
          <button
            onClick={() => setActiveTab('translations')}
            className={`${
              activeTab === 'translations'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('manage_translations')}
          </button>
        </nav>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'users' ? <UserManagement /> : <TranslationManagement />}
      </div>
    </div>
  );
};
