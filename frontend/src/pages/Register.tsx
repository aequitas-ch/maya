import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { generateKey, exportKey } from '../utils/crypto';
import { useEncryption } from '../context/EncryptionContext';
import { useTranslation } from '../hooks/useTranslation';
import { RegisterSchema, type RegisterFormData } from '../utils/schemas';

export const Register = () => {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      password: '',
      display_name: ''
    }
  });

  const [keyGenerated, setKeyGenerated] = useState(false);

  const { setEncryptionKey } = useEncryption();

  const navigate = useNavigate();

  const handleGenerateKey = async () => {
    try {
      const key = await generateKey();
      setEncryptionKey(key);
      const base64Key = await exportKey(key);

      // Trigger download
      const element = document.createElement("a");
      const file = new Blob([base64Key], {type: 'text/plain'});
      element.href = URL.createObjectURL(file);
      element.download = "aequitas-encryption-key.txt";
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
      document.body.removeChild(element);

      setKeyGenerated(true);
      toast.success('Encryption key generated and downloaded!');
    } catch (err) {
      toast.error('Failed to generate encryption key.');
    }
  };

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await api.post('/users/register/', data);
      toast.success('Registration successful!');
      navigate('/login');
    } catch (err: any) {
      if (err.response?.data) {
        const firstError = Object.values(err.response.data)[0];
        if (Array.isArray(firstError)) {
          toast.error(firstError[0] as string);
        } else {
          toast.error('Failed to register. Please check your inputs.');
        }
      } else {
        toast.error('Failed to register. Please try again.');
      }
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('create_account') || 'Create an account'}
          </h1>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-xl shadow-md space-y-4 p-4 bg-white">
            <div>
              <input
                {...register("username")}
                aria-label={t('username_placeholder') || 'Username'}
                type="text"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder={t('username_placeholder') || 'Username'}
              />
              {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username.message}</p>}
            </div>
            <div>
              <input
                {...register("email")}
                aria-label={t('email_address') || 'Email address'}
                type="email"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder={t('email_address') || 'Email address'}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <input
                {...register("first_name")}
                aria-label={t('first_name') || 'First Name'}
                type="text"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder={t('first_name') || 'First Name'}
              />
              {errors.first_name && <p className="mt-1 text-sm text-red-600">{errors.first_name.message}</p>}
            </div>
            <div>
              <input
                {...register("last_name")}
                aria-label={t('last_name') || 'Last Name'}
                type="text"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder={t('last_name') || 'Last Name'}
              />
              {errors.last_name && <p className="mt-1 text-sm text-red-600">{errors.last_name.message}</p>}
            </div>
            <div>
              <input
                {...register("display_name")}
                aria-label={t('display_name_placeholder') || 'Display Name (Optional)'}
                type="text"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder={t('display_name_placeholder') || 'Display Name (Optional)'}
              />
              {errors.display_name && <p className="mt-1 text-sm text-red-600">{errors.display_name.message}</p>}
            </div>
            <div>
              <input
                {...register("password")}
                aria-label={t('password_placeholder') || 'Password'}
                type="password"
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-teal-500 focus:border-teal-500 focus:z-10 sm:text-sm"
                placeholder={t('password_placeholder') || 'Password'}
              />
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>
          </div>

          <div className="bg-white p-4 rounded border shadow-sm text-sm text-gray-700">
            <h2 className="font-bold mb-2">Privacy by Design</h2>
            <p className="mb-4">
              To keep your most sensitive data secure, Aequitas uses end-to-end encryption. Generate an encryption key now.
              <strong> You must save this key file securely. If you lose it, your encrypted data cannot be recovered.</strong>
            </p>
            <button
              type="button"
              onClick={handleGenerateKey}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {keyGenerated ? 'Key Generated & Downloaded ✓' : 'Generate & Download Encryption Key'}
            </button>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-teal-700 hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:bg-teal-500"
            >
              {isSubmitting ? t('loading_data') || 'Loading...' : t('register') || 'Register'}
            </button>
          </div>
          <div className="text-sm text-center">
            <Link to="/login" className="font-medium text-teal-700 hover:text-teal-600">
              {t('already_have_account') || 'Already have an account? Sign in'}
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
};
