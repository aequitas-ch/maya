import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';
import { useTranslation } from '../hooks/useTranslation';
import { LoginSchema, type LoginFormData } from '../utils/schemas';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: '',
      password: ''
    }
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post('/token/', data);
      await login(response.data.access, response.data.refresh);
      navigate('/');
    } catch (err) {
      toast.error('Invalid username or password');
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('login_title') || 'Sign in to your account'}
          </h1>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-xl shadow-sm space-y-4 p-4 bg-white">
            <div>
              <input
                type="text"
                {...register("username")}
                aria-label={t('username') || 'Username'}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder={t('username') || 'Username'}
              />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
            </div>
            <div>
              <input
                type="password"
                {...register("password")}
                aria-label={t('password') || 'Password'}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder={t('password') || 'Password'}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-500"
            >
              {isSubmitting ? t('loading_data') || 'Loading...' : t('login') || 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
