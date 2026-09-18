import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/TranslationContext';
import { getEmployee, updateEmployee, createContract, generateAnnualStatement } from '../../api/assistant';
import type { Employee, Contract } from '../../types/assistant';

export const EmployeeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [employee, setEmployee] = useState<Employee | null>(null);

  const [contractData, setContractData] = useState({
    hourly_wage: '',
    start_date: '',
    probation_period_months: '3',
    target_hours_per_week: ''
  });

  useEffect(() => {
    if (id) fetchEmployee(id);
  }, [id]);

  const fetchEmployee = async (empId: string) => {
    try {
      const data = await getEmployee(empId);
      setEmployee(data);
    } catch (error) {
      console.error('Failed to fetch employee', error);
    }
  };

  const handleContractSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await createContract({
        employee: id,
        hourly_wage: parseFloat(contractData.hourly_wage),
        start_date: contractData.start_date,
        probation_period_months: parseInt(contractData.probation_period_months, 10),
        target_hours_per_week: contractData.target_hours_per_week ? parseFloat(contractData.target_hours_per_week) : undefined
      });
      fetchEmployee(id); // reload
    } catch (error) {
      console.error('Failed to create contract', error);
    }
  };

  const handleDismiss = async () => {
    if (!id || !employee) return;
    if (window.confirm(t('confirm_dismiss') || 'Are you sure you want to dismiss this employee?')) {
      try {
        await updateEmployee(id, { status: 'INACTIVE' });
        fetchEmployee(id);
      } catch (error) {
        console.error('Failed to dismiss', error);
      }
    }
  };

  const handleAnnualStatement = async () => {
    if (!id) return;
    try {
      const result = await generateAnnualStatement(id, new Date().getFullYear());
      alert(t('statement_generated') || 'Statement generated successfully');
    } catch (error) {
      console.error('Failed to generate statement', error);
    }
  };

  if (!employee) return <div>{t('loading') || 'Loading...'}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
        <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
          <div>
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {employee.first_name} {employee.last_name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {employee.type} - <span className={employee.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}>{employee.status}</span>
            </p>
          </div>
          <div>
            {employee.status === 'ACTIVE' && (
              <button
                onClick={handleDismiss}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 mr-2"
              >
                {t('dismiss') || 'Dismiss (Entlassung)'}
              </button>
            )}
            <button
              onClick={handleAnnualStatement}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              {t('annual_statement') || 'Lohnausweis'}
            </button>
          </div>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">{t('ahv_number') || 'AHV'}</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{employee.ahv_number}</dd>
            </div>
          </dl>
        </div>
      </div>

      {!employee.contract ? (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{t('create_contract') || 'Create Contract (Hourly Only)'}</h3>
            <form onSubmit={handleContractSubmit} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('hourly_wage') || 'Hourly Wage'}</label>
                <input
                  type="number"
                  step="0.05"
                  required
                  value={contractData.hourly_wage}
                  onChange={e => setContractData({...contractData, hourly_wage: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('start_date') || 'Start Date'}</label>
                <input
                  type="date"
                  required
                  value={contractData.start_date}
                  onChange={e => setContractData({...contractData, start_date: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                />
              </div>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
              >
                {t('save_contract') || 'Save Contract'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">{t('contract_details') || 'Contract Details'}</h3>
            <div className="mt-5">
              <p><strong>{t('hourly_wage') || 'Hourly Wage'}:</strong> {employee.contract.hourly_wage} CHF</p>
              <p><strong>{t('start_date') || 'Start Date'}:</strong> {employee.contract.start_date}</p>
            </div>
            <div className="mt-4">
              <button
                onClick={() => navigate(`/assistants/${id}/hours`)}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
              >
                {t('log_hours') || 'Log Working Hours'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
