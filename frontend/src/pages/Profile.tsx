import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { useTranslation } from '../hooks/useTranslation';
import { ProfileSchema, type ProfileFormData, ChangePasswordSchema, type ChangePasswordFormData } from '../utils/schemas';

export const Profile = () => {
  const { user, updateUserProfile } = useAuth();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProfileFormData>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      email: '',
      first_name: '',
      last_name: '',
      display_name: '',
      module_health_enabled: false,
      module_schedule_enabled: false,
      module_settlement_enabled: false,
      module_documents_enabled: false,
      module_assistants_enabled: false
    }
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmitForm,
    reset: resetPassword,
    formState: { errors: passwordErrors, isSubmitting: isPasswordSubmitting }
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      old_password: '',
      new_password: '',
      confirm_password: ''
    }
  });

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (user) {
      reset({
        email: user.email || '',
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        display_name: user.display_name || '',
        module_health_enabled: user.module_health_enabled || false,
        module_schedule_enabled: user.module_schedule_enabled || false,
        module_settlement_enabled: user.module_settlement_enabled || false,
        module_documents_enabled: user.module_documents_enabled || false,
        module_assistants_enabled: user.module_assistants_enabled || false
      });
      if (user.profile_picture) {
        setPreviewUrl(user.profile_picture);
      }
      setInitialLoading(false);
    }
  }, [user, reset]);

  if (initialLoading) {
    return (
      <main className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
        <div className="bg-white shadow px-4 py-5 sm:rounded-2xl sm:p-6 animate-pulse">
          <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-4 w-full bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
        <div className="bg-white shadow px-4 py-5 sm:rounded-2xl sm:p-6 animate-pulse">
          <div className="h-6 w-24 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
             <div className="h-24 w-24 bg-gray-200 rounded-full"></div>
             <div className="h-10 w-full bg-gray-200 rounded"></div>
             <div className="h-10 w-full bg-gray-200 rounded"></div>
          </div>
        </div>
      </main>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    const submitData = new FormData();
    submitData.append('email', data.email);
    submitData.append('first_name', data.first_name);
    submitData.append('last_name', data.last_name);
    submitData.append('display_name', data.display_name || '');
    submitData.append('module_health_enabled', String(!!data.module_health_enabled));
    submitData.append('module_schedule_enabled', String(!!data.module_schedule_enabled));
    submitData.append('module_settlement_enabled', String(!!data.module_settlement_enabled));
    submitData.append('module_documents_enabled', String(!!data.module_documents_enabled));
    submitData.append('module_assistants_enabled', String(!!data.module_assistants_enabled));
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
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile. Please try again.');
    }
  };

  const onPasswordSubmit = async (data: ChangePasswordFormData) => {
    try {
      await api.post('/users/change-password/', {
        old_password: data.old_password,
        new_password: data.new_password
      });
      toast.success('Password updated successfully!');
      resetPassword();
    } catch (err: any) {
      if (err.response?.data?.old_password) {
         toast.error(err.response.data.old_password[0]);
      } else {
         toast.error('Failed to update password. Please try again.');
      }
    }
  };

  return (
    <main className="max-w-2xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t('profile_page_title') || 'Profile Settings'}</h1>
      <div className="bg-white shadow px-4 py-5 sm:rounded-2xl sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">{t('modules_title') || 'Active Modules'}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('modules_description') || 'Enable or disable different platform modules for your account.'}
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div className="flex items-center">
                  <input
                    id="module_health_enabled"
                    {...register("module_health_enabled")}
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="module_health_enabled" className="ml-2 block text-sm text-gray-900">
                    {t('module_health') || 'Health'}
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="module_schedule_enabled"
                    {...register("module_schedule_enabled")}
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="module_schedule_enabled" className="ml-2 block text-sm text-gray-900">
                    {t('module_schedule') || 'Schedule'}
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="module_settlement_enabled"
                    {...register("module_settlement_enabled")}
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="module_settlement_enabled" className="ml-2 block text-sm text-gray-900">
                    {t('module_settlement') || 'Cost Approvals'}
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="module_documents_enabled"
                    {...register("module_documents_enabled")}
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="module_documents_enabled" className="ml-2 block text-sm text-gray-900">
                    {t('module_documents') || 'Documents'}
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="module_assistants_enabled"
                    {...register("module_assistants_enabled")}
                    type="checkbox"
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                  />
                  <label htmlFor="module_assistants_enabled" className="ml-2 block text-sm text-gray-900">
                    {t('module_assistants') || 'Assistants'}
                  </label>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-teal-700 border border-transparent rounded-xl shadow-md py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
                >
                  {isSubmitting ? t('loading_data') || 'Loading...' : t('save') || 'Save'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-2xl sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">{t('profile_title') || 'Profile'}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('update_personal_info') || 'Update your personal information and how others see you on the platform.'}
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
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
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
                    />
                  </div>
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">{t('first_name') || 'First name'}</label>
                  <input
                    type="text"
                    id="first_name"
                    {...register("first_name")}
                    className="mt-1 focus:ring-teal-500 focus:border-teal-500 block w-full shadow-md sm:text-sm border-gray-300 rounded-xl p-2 border"
                  />
                  {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">{t('last_name') || 'Last name'}</label>
                  <input
                    type="text"
                    id="last_name"
                    {...register("last_name")}
                    className="mt-1 focus:ring-teal-500 focus:border-teal-500 block w-full shadow-md sm:text-sm border-gray-300 rounded-xl p-2 border"
                  />
                  {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>}
                </div>

                <div className="col-span-6">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">{t('email_address') || 'Email address'}</label>
                  <input
                    type="email"
                    id="email"
                    {...register("email")}
                    className="mt-1 focus:ring-teal-500 focus:border-teal-500 block w-full shadow-md sm:text-sm border-gray-300 rounded-xl p-2 border"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>

                <div className="col-span-6">
                  <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">{t('display_name') || 'Display name'}</label>
                  <input
                    type="text"
                    id="display_name"
                    {...register("display_name")}
                    className="mt-1 focus:ring-teal-500 focus:border-teal-500 block w-full shadow-md sm:text-sm border-gray-300 rounded-xl p-2 border"
                  />
                  {errors.display_name && <p className="mt-1 text-sm text-red-600">{errors.display_name.message}</p>}
                  <p className="mt-2 text-sm text-gray-500">
                    {t('display_name_desc') || 'This is the name that will be displayed to other users.'}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-teal-700 border border-transparent rounded-xl shadow-md py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
                >
                  {isSubmitting ? t('loading_data') || 'Loading...' : t('save') || 'Save'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-2xl sm:p-6">
        <form onSubmit={handlePasswordSubmitForm(onPasswordSubmit)}>
          <div className="md:grid md:grid-cols-3 md:gap-6">
            <div className="md:col-span-1">
              <h3 className="text-lg font-medium leading-6 text-gray-900">{t('change_password') || 'Change Password'}</h3>
              <p className="mt-1 text-sm text-gray-500">
                {t('update_account_password') || 'Update your account password.'}
              </p>
            </div>
            <div className="mt-5 md:mt-0 md:col-span-2">
              <div className="grid grid-cols-6 gap-6">
                <div className="col-span-6">
                  <label htmlFor="old_password" className="block text-sm font-medium text-gray-700">{t('current_password') || 'Current Password'}</label>
                  <input
                    type="password"
                    id="old_password"
                    {...registerPassword("old_password")}
                    className="mt-1 focus:ring-teal-500 focus:border-teal-500 block w-full shadow-md sm:text-sm border-gray-300 rounded-xl p-2 border"
                  />
                  {passwordErrors.old_password && <p className="mt-1 text-sm text-red-600">{passwordErrors.old_password.message}</p>}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="new_password" className="block text-sm font-medium text-gray-700">{t('new_password') || 'New Password'}</label>
                  <input
                    type="password"
                    id="new_password"
                    {...registerPassword("new_password")}
                    className="mt-1 focus:ring-teal-500 focus:border-teal-500 block w-full shadow-md sm:text-sm border-gray-300 rounded-xl p-2 border"
                  />
                  {passwordErrors.new_password && <p className="mt-1 text-sm text-red-600">{passwordErrors.new_password.message}</p>}
                </div>

                <div className="col-span-6 sm:col-span-3">
                  <label htmlFor="confirm_password" className="block text-sm font-medium text-gray-700">{t('confirm_new_password') || 'Confirm New Password'}</label>
                  <input
                    type="password"
                    id="confirm_password"
                    {...registerPassword("confirm_password")}
                    className="mt-1 focus:ring-teal-500 focus:border-teal-500 block w-full shadow-md sm:text-sm border-gray-300 rounded-xl p-2 border"
                  />
                  {passwordErrors.confirm_password && <p className="mt-1 text-sm text-red-600">{passwordErrors.confirm_password.message}</p>}
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={isPasswordSubmitting}
                  className="bg-teal-700 border border-transparent rounded-xl shadow-md py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-400"
                >
                  {isPasswordSubmitting ? t('loading_data') || 'Loading...' : t('save') || 'Save'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};
