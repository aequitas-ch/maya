import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../context/TranslationContext';
import { getEmployees } from '../../api/assistant';
import type { Employee } from '../../types/assistant';

export const EmployeeList = () => {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const data = await getEmployees();
        setEmployees(data);
      } catch (error) {
        console.error('Failed to fetch employees', error);
      }
    };
    fetchEmployees();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">{t('employees') || 'Employees'}</h1>
        <Link
          to="/assistants/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
        >
          {t('add_employee') || 'Add Employee'}
        </Link>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {employees.map((employee) => (
            <li key={employee.id}>
              <Link to={`/assistants/${employee.id}`} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-teal-600 truncate">
                      {employee.first_name} {employee.last_name}
                    </p>
                    <div className="ml-2 flex-shrink-0 flex">
                      <p className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${employee.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {employee.status}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 sm:flex sm:justify-between">
                    <div className="sm:flex">
                      <p className="flex items-center text-sm text-gray-500">
                        {employee.type}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </li>
          ))}
          {employees.length === 0 && (
            <li className="px-4 py-8 text-center text-gray-500">
              {t('no_employees') || 'No employees found.'}
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
