import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../context/TranslationContext';
import { getEmployee, createWorkingHours, generatePayslip } from '../../api/assistant';
import type { Employee } from '../../types/assistant';

export const WorkingHoursForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [employee, setEmployee] = useState<Employee | null>(null);

  const [formData, setFormData] = useState({
    year: new Date().getFullYear().toString(),
    month: (new Date().getMonth() + 1).toString(),
    basic_hours: '0',
    overtime_hours: '0',
    sick_hours: '0',
    holiday_hours: '0',
    expenses: '0'
  });

  useEffect(() => {
    if (id) {
      getEmployee(id).then(setEmployee).catch(console.error);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee || !employee.contract) return;

    try {
      const wh = await createWorkingHours({
        contract: employee.contract.id,
        year: parseInt(formData.year, 10),
        month: parseInt(formData.month, 10),
        basic_hours: parseFloat(formData.basic_hours),
        overtime_hours: parseFloat(formData.overtime_hours),
        sick_hours: parseFloat(formData.sick_hours),
        holiday_hours: parseFloat(formData.holiday_hours),
        expenses: parseFloat(formData.expenses)
      });

      // Auto generate payslip
      await generatePayslip(wh.id);

      alert(t('payslip_generated') || 'Hours logged and Payslip generated');
      navigate(`/assistants/${id}`);
    } catch (error) {
      console.error('Failed to log hours', error);
      alert('Error saving hours. Ensure you have not already logged hours for this month.');
    }
  };

  if (!employee) return <div>{t('loading') || 'Loading...'}</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {t('log_hours') || 'Log Working Hours'} - {employee.first_name} {employee.last_name}
          </h3>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('year') || 'Year'}</label>
                <input
                  type="number"
                  required
                  value={formData.year}
                  onChange={e => setFormData({...formData, year: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('month') || 'Month'}</label>
                <input
                  type="number"
                  min="1" max="12"
                  required
                  value={formData.month}
                  onChange={e => setFormData({...formData, month: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('basic_hours') || 'Basic Hours'}</label>
              <input
                type="number" step="0.25" required
                value={formData.basic_hours}
                onChange={e => setFormData({...formData, basic_hours: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('overtime') || 'Overtime'}</label>
                <input
                  type="number" step="0.25"
                  value={formData.overtime_hours}
                  onChange={e => setFormData({...formData, overtime_hours: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('sick') || 'Sick'}</label>
                <input
                  type="number" step="0.25"
                  value={formData.sick_hours}
                  onChange={e => setFormData({...formData, sick_hours: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('holiday') || 'Holiday'}</label>
                <input
                  type="number" step="0.25"
                  value={formData.holiday_hours}
                  onChange={e => setFormData({...formData, holiday_hours: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('expenses') || 'Expenses (Spesen) CHF'}</label>
              <input
                type="number" step="0.05"
                value={formData.expenses}
                onChange={e => setFormData({...formData, expenses: e.target.value})}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate(`/assistants/${id}`)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 mr-3"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                type="submit"
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
              >
                {t('save_and_generate') || 'Save & Generate Payslip'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
