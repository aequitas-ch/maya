import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useEncryption } from '../context/EncryptionContext';
import { importKey } from '../utils/crypto';

export const Dashboard = () => {
  const { user } = useAuth();
  const { hasKey, setEncryptionKey } = useEncryption();
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

        <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex flex-col items-center justify-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Dashboard</h1>
          <p className="text-lg text-gray-600">
            Welcome back, {user?.display_name || user?.first_name || user?.username}!
          </p>
          <p className="text-md text-gray-500 mt-2">
            This is your dashboard. It is currently empty.
          </p>
        </div>
      </div>
    </div>
  );
};
