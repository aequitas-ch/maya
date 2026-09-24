import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useTranslation } from '../../hooks/useTranslation';
import { extractData } from '../../utils/pagination';

interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [passwordUser, setPasswordUser] = useState<AdminUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const { t } = useTranslation();

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users/');
      setUsers(extractData(response.data));
    } catch (err) {
      setError(t('error_fetching_users') || 'Error fetching users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleStaffStatus = async (user: AdminUser) => {
    try {
      await api.patch(`/admin/users/${user.id}/`, { is_staff: !user.is_staff });
      fetchUsers();
    } catch (err) {
      setError(t('error_updating_user') || 'Error updating user');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser || !newPassword) return;

    try {
      await api.post(`/admin/users/${passwordUser.id}/set_password/`, { new_password: newPassword });
      setSuccessMessage(t('password_updated_successfully') || 'Password updated successfully');
      setPasswordUser(null);
      setNewPassword('');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError(t('error_updating_password') || 'Error updating password');
    }
  };

  if (loading) return <div>{t('loading_data') || 'Loading...'}</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">{t('users') || 'Users'}</h2>
      {successMessage && <div className="mb-4 text-green-600 bg-green-50 p-2 rounded">{successMessage}</div>}
      {passwordUser && (
        <div className="mb-4 p-4 border rounded shadow-sm bg-white">
          <h3 className="text-lg font-medium mb-2">{t('change_password_for') || 'Change password for'} {passwordUser.username}</h3>
          <form onSubmit={handleChangePassword} className="flex flex-col gap-2 max-w-sm">
            <input
              type="password"
              placeholder={t('new_password') || 'New Password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="border p-2 rounded"
              required
            />
            <div className="flex gap-2">
              <button type="submit" className="bg-teal-600 text-white px-4 py-2 rounded hover:bg-teal-700">
                {t('save') || 'Save'}
              </button>
              <button type="button" onClick={() => setPasswordUser(null)} className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400">
                {t('cancel') || 'Cancel'}
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('username') || 'Username'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('email') || 'Email'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('name') || 'Name'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('is_admin') || 'Is Admin'}</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions') || 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{user.first_name} {user.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.is_staff ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {user.is_staff ? t('yes') || 'Yes' : t('no') || 'No'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => toggleStaffStatus(user)} className="text-teal-600 hover:text-teal-900 mr-4">
                    {user.is_staff ? t('remove_admin') || 'Remove Admin' : t('make_admin') || 'Make Admin'}
                  </button>
                  <button onClick={() => setPasswordUser(user)} className="text-teal-600 hover:text-teal-900">
                    {t('change_password') || 'Change Password'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
