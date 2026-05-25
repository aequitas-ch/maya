import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useEncryption } from '../context/EncryptionContext';
import { encryptData, decryptData } from '../utils/crypto';

interface Dependent {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  postal_code: string;
  main_diagnosis: string;
  ahv_number: string;
  is_encrypted: boolean;
}

export const Dependents = () => {
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { encryptionKey, hasKey } = useEncryption();

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [mainDiagnosis, setMainDiagnosis] = useState('');
  const [ahvNumber, setAhvNumber] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(false);

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchDependents();
  }, [hasKey]);

  const fetchDependents = async () => {
    try {
      const response = await api.get('/dependents/');
      let loadedDependents = response.data as Dependent[];

      // Decrypt if necessary
      if (hasKey && encryptionKey) {
          loadedDependents = await Promise.all(loadedDependents.map(async (dep) => {
              if (dep.is_encrypted) {
                  return {
                      ...dep,
                      first_name: await decryptData(dep.first_name, encryptionKey),
                      last_name: await decryptData(dep.last_name, encryptionKey),
                      ahv_number: await decryptData(dep.ahv_number, encryptionKey),
                  };
              }
              return dep;
          }));
      } else {
          // If no key, show placeholders for encrypted fields
          loadedDependents = loadedDependents.map(dep => {
             if (dep.is_encrypted) {
                 return {
                     ...dep,
                     first_name: "*** (Encrypted)",
                     last_name: "*** (Encrypted)",
                     ahv_number: "*** (Encrypted)",
                 };
             }
             return dep;
          });
      }

      setDependents(loadedDependents);
      setError('');
    } catch (err: any) {
      setError('Failed to load dependents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateAhv = (ahv: string) => {
    if (isEncrypted) return true; // Can't validate format if it's going to be encrypted
    const regex = /^756\.\d{4}\.\d{4}\.\d{2}$/;
    return regex.test(ahv);
  };

  const handleEditClick = (dependent: Dependent) => {
    setEditingId(dependent.id);
    setFirstName(dependent.first_name);
    setLastName(dependent.last_name);
    setAddress(dependent.address);
    setCity(dependent.city);
    setPostalCode(dependent.postal_code);
    setMainDiagnosis(dependent.main_diagnosis);
    setAhvNumber(dependent.ahv_number);
    setIsEncrypted(dependent.is_encrypted || false);
    setFormError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFirstName('');
    setLastName('');
    setAddress('');
    setCity('');
    setPostalCode('');
    setMainDiagnosis('');
    setAhvNumber('');
    setIsEncrypted(false);
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!validateAhv(ahvNumber)) {
      setFormError('AHV number must be in the format 756.xxxx.xxxx.xx');
      return;
    }

    setIsSubmitting(true);

    try {
      let finalFirstName = firstName;
      let finalLastName = lastName;
      let finalAhvNumber = ahvNumber;

      if (isEncrypted) {
        if (!hasKey || !encryptionKey) {
            setFormError("You must unlock your session by generating or uploading your encryption key to encrypt data.");
            setIsSubmitting(false);
            return;
        }
        finalFirstName = await encryptData(firstName, encryptionKey);
        finalLastName = await encryptData(lastName, encryptionKey);
        finalAhvNumber = await encryptData(ahvNumber, encryptionKey);
      }

      const payload = {
        first_name: finalFirstName,
        last_name: finalLastName,
        address,
        city,
        postal_code: postalCode,
        main_diagnosis: mainDiagnosis,
        ahv_number: finalAhvNumber,
        is_encrypted: isEncrypted
      };

      if (editingId) {
        await api.put(`/dependents/${editingId}/`, payload);
      } else {
        await api.post('/dependents/', payload);
      }

      // Reset form
      handleCancelEdit();

      // Refresh list
      fetchDependents();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || `Failed to ${editingId ? 'update' : 'add'} dependent`);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dependents</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {editingId ? 'Edit Dependent' : 'Add New Dependent'}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {editingId ? 'Update the details of the dependent person.' : 'Enter the details of the dependent person.'}
            </p>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            {formError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">Postal Code (PLZ)</label>
                  <input
                    type="text"
                    id="postalCode"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700">City (Wohnort)</label>
                  <input
                    type="text"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="mainDiagnosis" className="block text-sm font-medium text-gray-700">Main Diagnosis (Hauptdiagnose)</label>
                <input
                  type="text"
                  id="mainDiagnosis"
                  value={mainDiagnosis}
                  onChange={(e) => setMainDiagnosis(e.target.value)}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="ahvNumber" className="block text-sm font-medium text-gray-700">AHV Number</label>
                <input
                  type="text"
                  id="ahvNumber"
                  value={ahvNumber}
                  onChange={(e) => setAhvNumber(e.target.value)}
                  placeholder="756.xxxx.xxxx.xx"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-xs text-gray-500">Format: 756.xxxx.xxxx.xx</p>
              </div>

              <div className="flex items-center">
                <input
                  id="isEncrypted"
                  type="checkbox"
                  checked={isEncrypted}
                  onChange={(e) => setIsEncrypted(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isEncrypted" className="ml-2 block text-sm text-gray-900">
                  Encrypt sensitive data (First Name, Last Name, AHV Number) before saving.
                </label>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400"
                >
                  {isSubmitting ? 'Saving...' : (editingId ? 'Update Dependent' : 'Add Dependent')}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={isSubmitting}
                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-200"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Your Dependents</h3>
          </div>
          <div className="border-t border-gray-200">
            {dependents.length === 0 ? (
              <div className="px-4 py-5 sm:px-6 text-gray-500 text-sm">
                No dependents found. Add one above.
              </div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {dependents.map((dependent) => (
                  <li key={dependent.id} className="px-4 py-4 sm:px-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-indigo-600 truncate">
                          {dependent.first_name} {dependent.last_name}
                        </div>
                      </div>
                      <div className="ml-2 flex-shrink-0 flex items-center gap-4">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {dependent.ahv_number}
                        </span>
                        <button
                          onClick={() => handleEditClick(dependent)}
                          className="text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex text-sm text-gray-500">
                        <p className="flex items-center">
                          {dependent.address}, {dependent.postal_code} {dependent.city}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <p>
                          Diagnosis: {dependent.main_diagnosis}
                        </p>
                      </div>
                      <div className="mt-2 flex items-center text-sm sm:mt-0">
                        <Link
                          to={`/dependents/${dependent.id}/health`}
                          className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Health Data
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
