import React, { useState, useEffect } from 'react';
import { settlementApi } from '../../api/settlement';
import api from '../../api/axios';
import type { CostApproval, Institution, Insurance, CostApprovalCreateData } from '../../types/settlement';
import { useTranslation } from '../../hooks/useTranslation';

interface Dependent {
  id: number;
  first_name: string;
  last_name: string;
}

export const CostApprovals = () => {
  const { t } = useTranslation();
  const [approvals, setApprovals] = useState<CostApproval[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State for new Cost Approval
  const [showForm, setShowForm] = useState(false);
  const [dependentId, setDependentId] = useState<number | ''>('');
  const [orderingId, setOrderingId] = useState<number | ''>('');
  const [executingId, setExecutingId] = useState<number | ''>('');
  const [insuranceId, setInsuranceId] = useState<number | ''>('');
  const [nextReminder, setNextReminder] = useState('');
  const [approvedAmount, setApprovedAmount] = useState('');
  const [settledAmount, setSettledAmount] = useState('0');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simple Create States for Institutions/Insurances
  const [newInstName, setNewInstName] = useState('');
  const [newInsName, setNewInsName] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [approvalsData, instData, insData, depData] = await Promise.all([
        settlementApi.getCostApprovals(),
        settlementApi.getInstitutions(),
        settlementApi.getInsurances(),
        api.get('/dependents/').then(res => res.data)
      ]);
      setApprovals(approvalsData);
      setInstitutions(instData);
      setInsurances(insData);
      setDependents(depData);
    } catch (err) {
      console.error(err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dependentId || !orderingId || !executingId || !insuranceId) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      const data: CostApprovalCreateData = {
        dependent_id: Number(dependentId),
        ordering_institution_id: Number(orderingId),
        executing_institution_id: Number(executingId),
        insurance_id: Number(insuranceId),
        next_reminder: nextReminder || null,
        approved_amount: approvedAmount,
        settled_amount: settledAmount,
      };
      await settlementApi.createCostApproval(data);
      setShowForm(false);
      fetchData(); // Reload list
    } catch (err) {
      console.error(err);
      alert('Failed to create cost approval');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddInst = async () => {
    if (!newInstName) return;
    try {
      await settlementApi.createInstitution(newInstName);
      setNewInstName('');
      const instData = await settlementApi.getInstitutions();
      setInstitutions(instData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddIns = async () => {
    if (!newInsName) return;
    try {
      await settlementApi.createInsurance(newInsName);
      setNewInsName('');
      const insData = await settlementApi.getInsurances();
      setInsurances(insData);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddStatus = async (approvalId: number) => {
    const status = prompt("Enter status (eingereicht, genehmigt, abgelehnt, in_revision, vor_gericht, abgerechnet):");
    const date = prompt("Enter date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    if (status && date) {
      try {
        await settlementApi.addStatus(approvalId, status, date);
        fetchData();
      } catch (err) {
        console.error(err);
        alert('Failed to add status');
      }
    }
  };

  const handleAddLog = async (approvalId: number) => {
    const text = prompt("Enter log text:");
    if (text) {
      try {
        await settlementApi.addLog(approvalId, text);
        fetchData();
      } catch (err) {
        console.error(err);
        alert('Failed to add log');
      }
    }
  };

  if (loading) return <div className="text-center mt-8">{t('loading_data') || 'Loading...'}</div>;

  // Next reminder sort: closest future date first. Nulls at the bottom.
  const sortedApprovals = [...approvals].sort((a, b) => {
    if (!a.next_reminder) return 1;
    if (!b.next_reminder) return -1;
    return new Date(a.next_reminder).getTime() - new Date(b.next_reminder).getTime();
  });

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('cost_approvals_title') || 'Kostengutsprachen (Cost Approvals)'}</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-indigo-600 text-white px-4 py-2 rounded shadow hover:bg-indigo-700"
          >
            {showForm ? t('cancel') || 'Cancel' : t('create_new_cost_approval') || 'New Approval'}
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-4">{error}</div>}

        {showForm && (
          <div className="bg-white p-6 rounded shadow mb-6 border">
            <h2 className="text-xl mb-4 font-semibold">{t('create_new_cost_approval') || 'Create New Cost Approval'}</h2>

            <div className="mb-4 grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium mb-1">{t('add_missing_institution') || 'Add missing Institution'}</label>
                  <div className="flex">
                    <input type="text" value={newInstName} onChange={e => setNewInstName(e.target.value)} className="border p-2 rounded-l w-full" placeholder={t('name_placeholder') || 'Name...'} />
                    <button type="button" onClick={handleAddInst} className="bg-green-600 text-white px-4 rounded-r">{t('add') || 'Add'}</button>
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">{t('add_missing_insurance') || 'Add missing Insurance'}</label>
                  <div className="flex">
                    <input type="text" value={newInsName} onChange={e => setNewInsName(e.target.value)} className="border p-2 rounded-l w-full" placeholder={t('name_placeholder') || 'Name...'} />
                    <button type="button" onClick={handleAddIns} className="bg-green-600 text-white px-4 rounded-r">{t('add') || 'Add'}</button>
                  </div>
               </div>
            </div>

            <form onSubmit={handleCreateApproval} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">{t('dependent') || 'Dependent'}</label>
                <select className="mt-1 w-full border p-2 rounded" value={dependentId} onChange={e => setDependentId(Number(e.target.value))} required>
                  <option value="">{t('select_dependent') || 'Select Dependent'}</option>
                  {dependents.map(d => <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">{t('ordering_institution') || 'Ordering Institution (Verfügt)'}</label>
                  <select className="mt-1 w-full border p-2 rounded" value={orderingId} onChange={e => setOrderingId(Number(e.target.value))} required>
                    <option value="">{t('select_institution') || 'Select Institution'}</option>
                    {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">{t('executing_institution') || 'Executing Institution (Führt aus)'}</label>
                  <select className="mt-1 w-full border p-2 rounded" value={executingId} onChange={e => setExecutingId(Number(e.target.value))} required>
                    <option value="">{t('select_institution') || 'Select Institution'}</option>
                    {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium">{t('insurance_label') || 'Insurance (Zahlt)'}</label>
                <select className="mt-1 w-full border p-2 rounded" value={insuranceId} onChange={e => setInsuranceId(Number(e.target.value))} required>
                  <option value="">{t('select_insurance') || 'Select Insurance'}</option>
                  {insurances.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium">{t('approved_amount') || 'Approved Amount'}</label>
                  <input type="number" step="0.01" className="mt-1 w-full border p-2 rounded" value={approvedAmount} onChange={e => setApprovedAmount(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium">{t('settled_amount') || 'Settled Amount'}</label>
                  <input type="number" step="0.01" className="mt-1 w-full border p-2 rounded" value={settledAmount} onChange={e => setSettledAmount(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium">{t('next_reminder') || 'Next Reminder'}</label>
                  <input type="date" className="mt-1 w-full border p-2 rounded" value={nextReminder} onChange={e => setNextReminder(e.target.value)} />
                </div>
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full bg-indigo-600 text-white p-2 rounded hover:bg-indigo-700 disabled:opacity-50">
                {isSubmitting ? t('loading_data') : t('save') || 'Save'}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {sortedApprovals.map(approval => (
            <div key={approval.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50 border-b">
                <div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Approval for Dependent ID: {approval.dependent_id}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {approval.insurance.name}
                  </p>
                </div>
                {approval.next_reminder && (
                  <div className="text-sm font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full">
                    Reminder: {approval.next_reminder}
                  </div>
                )}
              </div>
              <div className="px-4 py-5 sm:p-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm"><span className="font-semibold">{t('verfuegt') || 'Verfügt:'}</span> {approval.ordering_institution.name}</p>
                  <p className="text-sm"><span className="font-semibold">{t('fuehrt_aus') || 'Führt aus:'}</span> {approval.executing_institution.name}</p>
                </div>
                <div>
                  <p className="text-sm"><span className="font-semibold">{t('gesprochen') || 'Gesprochen:'}</span> {approval.approved_amount} CHF</p>
                  <p className="text-sm"><span className="font-semibold">{t('abgerechnet') || 'Abgerechnet:'}</span> {approval.settled_amount} CHF</p>
                  <p className="text-sm"><span className="font-semibold">{t('offen') || 'Offen:'}</span> {approval.open_amount} CHF</p>
                </div>
              </div>

              <div className="px-4 py-3 bg-gray-50 border-t flex gap-4">
                <button onClick={() => handleAddStatus(approval.id)} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200">{t('add_status') || '+ Status'}</button>
                <button onClick={() => handleAddLog(approval.id)} className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200">{t('add_log') || '+ Log'}</button>
              </div>

              {(approval.statuses.length > 0 || approval.logs.length > 0) && (
                <div className="px-4 py-4 border-t grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-gray-700">{t('status_history') || 'Status History'}</h4>
                    <ul className="text-sm space-y-1">
                      {approval.statuses.map(s => (
                        <li key={s.id} className="text-gray-600 border-l-2 border-blue-500 pl-2">
                          <span className="font-medium">{s.date}:</span> {s.status_display}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-2 text-gray-700">{t('logs') || 'Logs'}</h4>
                    <ul className="text-sm space-y-1">
                      {approval.logs.map(l => (
                        <li key={l.id} className="text-gray-600 border-l-2 border-green-500 pl-2">
                          <span className="font-medium">{new Date(l.date).toLocaleDateString()}:</span> {l.text}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

            </div>
          ))}
          {sortedApprovals.length === 0 && !loading && (
            <div className="text-center text-gray-500">{t('no_cost_approvals_found') || 'No cost approvals found.'}</div>
          )}
        </div>
      </div>
    </div>
  );
};
