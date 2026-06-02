import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { useTranslation } from '../hooks/useTranslation';

export const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    display_name: ''
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        display_name: user.display_name || ''
      });
      if (user.profile_picture) {
        setPreviewUrl(user.profile_picture);
      }
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const submitData = new FormData();
    submitData.append('email', formData.email);
    submitData.append('first_name', formData.first_name);
    submitData.append('last_name', formData.last_name);
    submitData.append('display_name', formData.display_name);
    if (profilePicture) {
      submitData.append('profile_picture', profilePicture);
    }

    try {
      const response = await api.put('/users/profile/', submitData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      updateUserProfile(response.data);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update profile. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (passwordData.new_password !== passwordData.confirm_password) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordLoading(true);

    try {
      await api.post('/users/change-password/', {
        old_password: passwordData.old_password,
        new_password: passwordData.new_password
      });
      setPasswordMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err: any) {
      if (err.response?.data?.old_password) {
         setPasswordMessage({ type: 'error', text: err.response.data.old_password[0] });
      } else {
         setPasswordMessage({ type: 'error', text: 'Failed to update password. Please try again.' });
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{t('profile_title') || 'Profile'}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('update_personal_info') || 'Update your personal information and how others see you on the platform.'}
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handleSubmit}>
              {message.text && (
                <div className={`mb-4 p-4 rounded-md ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {message.text}
                </div>
              )}
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label className="block text-sm font-medium text-gray-700">{t('profile_picture') || 'Profile Picture'}</label>
                  <div className="mt-1 flex items-center space-x-5">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Profile preview"
                        className="h-24 w-24 rounded-full object-cover border border-gray-300"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center border border-gray-300 text-gray-500">
                        <svg className="h-12 w-12" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      name="profile_picture"
                      id="profile_picture"
                      onChange={handleFileChange}
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                  </div>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">{t('first_name') || 'First name'}</label>
                  <input
                    type="text"
                    name="first_name"
                    id="first_name"
                    required
                    value={formData.first_name}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">{t('last_name') || 'Last name'}</label>
                  <input
                    type="text"
                    name="last_name"
                    id="last_name"
                    required
                    value={formData.last_name}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('email_address') || 'Email address'}</label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>

                <div className="col-span-6">
                  <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">{t('display_name') || 'Display name'}</label>
                  <input
                    type="text"
                    name="display_name"
                    id="display_name"
                    value={formData.display_name}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    {t('display_name_desc') || 'This is the name that will be displayed to other users.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {loading ? t('loading_data') : t('save') || 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">{t('change_password') || 'Change Password'}</h3>
            <p className="mt-1 text-sm text-gray-500">
              {t('update_account_password') || 'Update your account password.'}
            </p>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <form onSubmit={handlePasswordSubmit}>
              {passwordMessage.text && (
                <div className={`mb-4 p-4 rounded-md ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {passwordMessage.text}
                </div>
              )}
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="old_password" className="block text-sm font-medium text-gray-700">{t('current_password') || 'Current Password'}</label>
                  <input
                    type="password"
                    name="old_password"
                    id="old_password"
                    required
                    value={passwordData.old_password}
                    onChange={handlePasswordChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">{t('new_password') || 'New Password'}</label>
                  <input
                    type="password"
                    name="new_password"
                    id="new_password"
                    required
                    value={passwordData.new_password}
                    onChange={handlePasswordChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">{t('confirm_new_password') || 'Confirm New Password'}</label>
                  <input
                    type="password"
                    name="confirm_password"
                    id="confirm_password"
                    required
                    value={passwordData.confirm_password}
                    onChange={handlePasswordChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {passwordLoading ? t('loading_data') : t('save') || 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
