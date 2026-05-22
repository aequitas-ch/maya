import React, { useState, useEffect } from 'react';
import api from '../api/axios';

interface Dependent {
  id: number;
  first_name: string;
  last_name: string;
  address: string;
  city: string;
  postal_code: string;
  main_diagnosis: string;
  ahv_number: string;
}

export const Dependents = () => {
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [mainDiagnosis, setMainDiagnosis] = useState('');
  const [ahvNumber, setAhvNumber] = useState('');

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchDependents();
  }, []);

  const fetchDependents = async () => {
    try {
      const response = await api.get('/dependents/');
      setDependents(response.data);
      setError('');
    } catch (err: any) {
      setError('Failed to load dependents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const validateAhv = (ahv: string) => {
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

    const payload = {
      first_name: firstName,
      last_name: lastName,
      address,
      city,
      postal_code: postalCode,
      main_diagnosis: mainDiagnosis,
      ahv_number: ahvNumber
    };

    try {
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
