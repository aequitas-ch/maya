import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { settlementApi } from '../../api/settlement';
import api from '../../api/axios';
import { extractData } from '../../utils/pagination';
import type { CostApproval, Institution, Insurance, SettlementCostCreateData } from '../../types/settlement';
import type { Dependent } from '../../types/index';

export const CostApprovals: React.FC = () => {
  const { t } = useTranslation();
  const [approvals, setApprovals] = useState<CostApproval[]>([]);
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [insurances, setInsurances] = useState<Insurance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states (Approval)
  const [dependentId, setDependentId] = useState<number | ''>('');
  const [orderingId, setOrderingId] = useState<number | ''>('');
  const [executingId, setExecutingId] = useState<number | ''>('');
  const [insuranceId, setInsuranceId] = useState<number | ''>('');
  const [approvedAmount, setApprovedAmount] = useState<string>('');
  const [settledAmount, setSettledAmount] = useState<string>('0');
  const [nextReminder, setNextReminder] = useState<string>('');

  const [validFrom, setValidFrom] = useState<string>('');
  const [validTo, setValidTo] = useState<string>('');
  const [caseNumber, setCaseNumber] = useState<string>('');
  const [coverageType, setCoverageType] = useState<string>('IV_GGV');

  // Quick add states
  const [newInstName, setNewInstName] = useState('');
  const [newInsName, setNewInsName] = useState('');

  // Accordion State
  const [expandedApprovalId, setExpandedApprovalId] = useState<number | null>(null);

  // Form states (Cost)
  const [showCostForm, setShowCostForm] = useState<number | null>(null);
  const [costInvoiceNumber, setCostInvoiceNumber] = useState('');
  const [costInvoiceDate, setCostInvoiceDate] = useState('');
  const [costAmount, setCostAmount] = useState('');
  const [costStatus, setCostStatus] = useState('offen');
  const [costPaidByParents, setCostPaidByParents] = useState(false);
  const [isSubmittingCost, setIsSubmittingCost] = useState(false);

  // Filter states
  const [filterActiveOnly, setFilterActiveOnly] = useState(false);
  const [filterPendingReimbursement, setFilterPendingReimbursement] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [appRes, depRes, instRes, insRes] = await Promise.all([
        settlementApi.getCostApprovals(),
        api.get('/core/dependents/').then(r => extractData(r.data) as Dependent[]),
        settlementApi.getInstitutions(),
        settlementApi.getInsurances(),
      ]);
      setApprovals(appRes);
      setDependents(depRes);
      setInstitutions(instRes);
      setInsurances(insRes);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(t('error_loading_data') || 'Error loading data');
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateApproval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dependentId || !orderingId || !executingId || !insuranceId || !approvedAmount) {
      setError(t('fill_all_required_fields') || 'Please fill all required fields.');
      return;
    }

    setIsSubmitting(true);
    try {
      await settlementApi.createCostApproval({
        dependent_id: Number(dependentId),
        ordering_institution_id: Number(orderingId),
        executing_institution_id: Number(executingId),
        insurance_id: Number(insuranceId),
        approved_amount: approvedAmount,
        settled_amount: settledAmount,
        next_reminder: nextReminder || null,
        valid_from: validFrom || null,
        valid_to: validTo || null,
        case_number: caseNumber || null,
        coverage_type: coverageType,
        // document_id can be added later once file upload logic is in place
      });
      setShowForm(false);

      // Reset form
      setDependentId('');
      setOrderingId('');
      setExecutingId('');
      setInsuranceId('');
      setApprovedAmount('');
      setSettledAmount('0');
      setNextReminder('');
      setValidFrom('');
      setValidTo('');
      setCaseNumber('');
      setCoverageType('IV_GGV');

      await fetchData();
    } catch (err) {
      console.error(err);
      setError(t('error_saving') || 'Error saving approval');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateCost = async (e: React.FormEvent, approvalId: number) => {
    e.preventDefault();
    if (!costInvoiceDate || !costAmount) {
      alert(t('fill_all_required_fields') || 'Please fill all required fields.');
      return;
    }

    setIsSubmittingCost(true);
    try {
      const data: SettlementCostCreateData = {
        cost_approval: approvalId,
        invoice_number: costInvoiceNumber || null,
        invoice_date: costInvoiceDate,
        amount: costAmount,
        status: costStatus,
        paid_by_parents: costPaidByParents,
        // document_id can be added here as well
      };

      await settlementApi.createSettlementCost(data);

      setShowCostForm(null);
      setCostInvoiceNumber('');
      setCostInvoiceDate('');
      setCostAmount('');
      setCostStatus('offen');
      setCostPaidByParents(false);

      await fetchData();
    } catch (err) {
      console.error(err);
      alert(t('error_saving') || 'Error saving cost');
    } finally {
      setIsSubmittingCost(false);
    }
  };

  const handleAddInst = async () => {
    if (!newInstName.trim()) return;
    try {
      await settlementApi.createInstitution(newInstName);
      setNewInstName('');
      const res = await settlementApi.getInstitutions();
      setInstitutions(res);
    } catch (e) {
      console.error(e);
      alert(t('error_saving') || 'Error');
    }
  };

  const handleAddIns = async () => {
    if (!newInsName.trim()) return;
    try {
      await settlementApi.createInsurance(newInsName);
      setNewInsName('');
      const res = await settlementApi.getInsurances();
      setInsurances(res);
    } catch (e) {
      console.error(e);
      alert(t('error_saving') || 'Error');
    }
  };

  const handleAddStatus = async (id: number) => {
    const status = prompt("Status (zz.B. eingereicht, genehmigt, abgelehnt):");
    if (!status) return;
    const date = prompt("Datum (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
    if (!date) return;
    try {
      await settlementApi.addStatus(id, status, date);
      await fetchData();
    } catch (e) {
      console.error(e);
      alert('Error');
    }
  };

  const handleAddLog = async (id: number) => {
    const text = prompt("Log-Eintrag:");
    if (!text) return;
    try {
      await settlementApi.addLog(id, text);
      await fetchData();
    } catch (e) {
      console.error(e);
      alert('Error');
    }
  };

  const handleMarkVerguetet = async (costId: number) => {
    try {
      await settlementApi.updateSettlementCost(costId, { status: 'verguetet' });
      await fetchData();
    } catch (e) {
      console.error(e);
      alert('Error marking as verguetet');
    }
  };

  const toggleAccordion = (id: number) => {
    setExpandedApprovalId(expandedApprovalId === id ? null : id);
    if (showCostForm === id) setShowCostForm(null); // hide form if accordion toggled
  };

  const filteredApprovals = approvals.filter(approval => {
      let include = true;

      if (filterActiveOnly) {
          const now = new Date();
          const validTo = approval.valid_to ? new Date(approval.valid_to) : null;
          if (validTo && validTo < now) {
              include = false;
          }
      }

      if (filterPendingReimbursement) {
          const hasPending = approval.costs?.some(c => c.paid_by_parents && c.status !== 'verguetet');
          if (!hasPending) {
              include = false;
          }
      }

      return include;
  });

  const sortedApprovals = [...filteredApprovals].sort((a, b) => {
    if (!a.next_reminder) return 1;
    if (!b.next_reminder) return -1;
    return new Date(a.next_reminder).getTime() - new Date(b.next_reminder).getTime();
  });

  const getProgressColor = (percentage: number) => {
    if (percentage > 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const renderBudgetAmpel = (approval: CostApproval) => {
    const approved = Number.parseFloat(approval.approved_amount) || 0;
    const settled = Number.parseFloat(approval.settled_amount) || 0;

    if (approved === 0) return null;

    const percentage = (settled / approved) * 100;
    const colorClass = getProgressColor(percentage);
    const width = Math.min(percentage, 100);

    return (
      <div className="mt-4">
        <div className="flex justify-between text-sm mb-1">
          <span>{t('budget_usage') || 'Budget Usage'}: {settled.toFixed(2)} / {approved.toFixed(2)} CHF</span>
          <span className="font-semibold">{percentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div className={`h-2.5 rounded-full ${colorClass}`} style={{ width: `${width}%` }}></div>
        </div>
        {percentage > 100 && (
          <div className="mt-1 text-xs text-red-600 font-bold">
            {t('budget_exceeded_by') || 'Budget exceeded by'} {Math.abs(Number.parseFloat(approval.open_amount)).toFixed(2)} CHF
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t('cost_approvals_title') || 'Kostengutsprachen (Cost Approvals)'}</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-teal-600 text-white px-4 py-2 rounded-xl shadow hover:bg-teal-700"
          >
            {showForm ? t('cancel') || 'Cancel' : t('create_new_cost_approval') || 'New Approval'}
          </button>
        </div>

        {error && <div className="bg-red-100 text-red-700 p-4 rounded-xl mb-4">{error}</div>}

        <div className="flex space-x-4 mb-6 bg-white p-4 rounded-xl shadow text-sm">
            <div className="flex items-center">
                <input type="checkbox" id="filter_active" className="h-4 w-4 text-teal-600 border-gray-300 rounded" checked={filterActiveOnly} onChange={e => setFilterActiveOnly(e.target.checked)} />
                <label htmlFor="filter_active" className="ml-2 block text-gray-700 font-medium">Nur aktive Gutsprachen</label>
            </div>
            <div className="flex items-center">
                <input type="checkbox" id="filter_pending" className="h-4 w-4 text-teal-600 border-gray-300 rounded" checked={filterPendingReimbursement} onChange={e => setFilterPendingReimbursement(e.target.checked)} />
                <label htmlFor="filter_pending" className="ml-2 block text-gray-700 font-medium">Ausstehende Rückerstattungen (vorfinanziert)</label>
            </div>
        </div>

        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow mb-6 border">
            <h2 className="text-xl mb-4 font-semibold">{t('create_new_cost_approval') || 'Create New Cost Approval'}</h2>

            <div className="mb-4 grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium mb-1">{t('add_missing_institution') || 'Add missing Institution'}</label>
                  <div className="flex">
                    <input type="text" value={newInstName} onChange={e => setNewInstName(e.target.value)} className="border p-2 rounded-l-xl w-full" placeholder={t('name_placeholder') || 'Name...'} />
                    <button type="button" onClick={handleAddInst} className="bg-green-600 text-white px-4 rounded-r-xl">{t('add') || 'Add'}</button>
                  </div>
               </div>
               <div>
                  <label className="block text-sm font-medium mb-1">{t('add_missing_insurance') || 'Add missing Insurance'}</label>
                  <div className="flex">
                    <input type="text" value={newInsName} onChange={e => setNewInsName(e.target.value)} className="border p-2 rounded-l-xl w-full" placeholder={t('name_placeholder') || 'Name...'} />
                    <button type="button" onClick={handleAddIns} className="bg-green-600 text-white px-4 rounded-r-xl">{t('add') || 'Add'}</button>
                  </div>
               </div>
            </div>

            <form onSubmit={handleCreateApproval} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">{t('dependent') || 'Dependent'}</label>
                <select className="mt-1 w-full border p-2 rounded-xl" value={dependentId} onChange={e => setDependentId(Number(e.target.value))} required>
                  <option value="">{t('select_dependent') || 'Select Dependent'}</option>
                  {dependents.map(d => <option key={d.id} value={d.id}>{d.first_name} {d.last_name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">{t('ordering_institution') || 'Ordering Institution (Verfügt)'}</label>
                  <select className="mt-1 w-full border p-2 rounded-xl" value={orderingId} onChange={e => setOrderingId(Number(e.target.value))} required>
                    <option value="">{t('select_institution') || 'Select Institution'}</option>
                    {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">{t('executing_institution') || 'Executing Institution (Führt aus)'}</label>
                  <select className="mt-1 w-full border p-2 rounded-xl" value={executingId} onChange={e => setExecutingId(Number(e.target.value))} required>
                    <option value="">{t('select_institution') || 'Select Institution'}</option>
                    {institutions.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium">{t('insurance_label') || 'Insurance (Zahlt)'}</label>
                  <select className="mt-1 w-full border p-2 rounded-xl" value={insuranceId} onChange={e => setInsuranceId(Number(e.target.value))} required>
                    <option value="">{t('select_insurance') || 'Select Insurance'}</option>
                    {insurances.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">{t('coverage_type') || 'Coverage Type'}</label>
                  <select className="mt-1 w-full border p-2 rounded-xl" value={coverageType} onChange={e => setCoverageType(e.target.value)} required>
                    <option value="IV_GGV">IV Geburtsgebrechen</option>
                    <option value="IV_HILFSMITTEL">IV Hilfsmittel</option>
                    <option value="IV_ASSISTENZ">IV Assistenzbeitrag</option>
                    <option value="KVG_GRUND">Krankenkasse KVG</option>
                    <option value="VVG_ZUSATZ">Krankenkasse VVG</option>
                    <option value="STIFTUNG">Stiftung</option>
                    <option value="SELBSTZAHLER">Selbstzahler</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium">{t('case_number') || 'Case Number / Aktenzeichen'}</label>
                      <input type="text" className="mt-1 w-full border p-2 rounded-xl" value={caseNumber} onChange={e => setCaseNumber(e.target.value)} />
                  </div>
                  <div>
                      <label className="block text-sm font-medium">{t('document') || 'Verfügung (PDF/Image)'}</label>
                      <input type="file" className="mt-1 w-full border p-2 rounded-xl bg-gray-50" disabled title="Upload will be implemented later" />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <label className="block text-sm font-medium">{t('valid_from') || 'Valid From'}</label>
                      <input type="date" className="mt-1 w-full border p-2 rounded-xl" value={validFrom} onChange={e => setValidFrom(e.target.value)} />
                  </div>
                  <div>
                      <label className="block text-sm font-medium">{t('valid_to') || 'Valid To'}</label>
                      <input type="date" className="mt-1 w-full border p-2 rounded-xl" value={validTo} onChange={e => setValidTo(e.target.value)} />
                  </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium">{t('approved_amount') || 'Approved Amount'}</label>
                  <input type="number" step="0.01" className="mt-1 w-full border p-2 rounded-xl" value={approvedAmount} onChange={e => setApprovedAmount(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium">{t('settled_amount') || 'Settled Amount'}</label>
                  <input type="number" step="0.01" className="mt-1 w-full border p-2 rounded-xl" value={settledAmount} onChange={e => setSettledAmount(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm font-medium">{t('next_reminder') || 'Next Reminder'}</label>
                  <input type="date" className="mt-1 w-full border p-2 rounded-xl" value={nextReminder} onChange={e => setNextReminder(e.target.value)} />
                </div>
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full bg-teal-600 text-white p-2 rounded-xl hover:bg-teal-700 disabled:opacity-50">
                {isSubmitting ? t('loading_data') || 'Loading...' : t('save') || 'Save'}
              </button>
            </form>
          </div>
        )}

        <div className="space-y-6">
          {sortedApprovals.map(approval => {
            const dependent = dependents.find(d => d.id === approval.dependent_id);
            const depName = dependent ? `${dependent.first_name} ${dependent.last_name}` : `ID: ${approval.dependent_id}`;
            const isExpanded = expandedApprovalId === approval.id;

            return (
            <div key={approval.id} className="bg-white shadow overflow-hidden sm:rounded-2xl border border-gray-200">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-start bg-gray-50 border-b cursor-pointer" onClick={() => toggleAccordion(approval.id)}>
                <div>
                  <h3 className="text-lg leading-6 font-semibold text-gray-900 flex items-center gap-2">
                    {approval.insurance.name} - {approval.coverage_type}
                    <span className="text-sm text-gray-500">
                      {isExpanded ? '▲' : '▼'}
                    </span>
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    {depName} {approval.case_number ? `| Aktenzeichen: ${approval.case_number}` : ''}
                  </p>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  {approval.days_until_expiration !== null && (
                    <div className={`text-xs font-bold px-3 py-1 rounded-full text-white ${approval.days_until_expiration < 0 ? 'bg-red-600' : approval.days_until_expiration < 30 ? 'bg-yellow-500' : 'bg-green-600'}`}>
                       {approval.days_until_expiration < 0 ? t('expired') || 'Abgelaufen' : `${t('expires_in') || 'Expires in'} ${approval.days_until_expiration} ${t('days') || 'days'}`}
                    </div>
                  )}
                  {approval.next_reminder && (
                    <div className="text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full border border-red-200">
                      Reminder: {approval.next_reminder}
                    </div>
                  )}
                </div>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm"><span className="font-semibold">{t('verfuegt') || 'Verfügt:'}</span> {approval.ordering_institution.name}</p>
                    <p className="text-sm"><span className="font-semibold">{t('fuehrt_aus') || 'Führt aus:'}</span> {approval.executing_institution.name}</p>
                    {approval.valid_from && <p className="text-sm"><span className="font-semibold">{t('valid_from') || 'Valid From:'}</span> {approval.valid_from}</p>}
                    {approval.valid_to && <p className="text-sm"><span className="font-semibold">{t('valid_to') || 'Valid To:'}</span> {approval.valid_to}</p>}
                  </div>
                  <div>
                    <p className="text-sm"><span className="font-semibold">{t('gesprochen') || 'Gesprochen:'}</span> {approval.approved_amount} CHF</p>
                    <p className="text-sm"><span className="font-semibold">{t('abgerechnet') || 'Abgerechnet:'}</span> {approval.settled_amount} CHF</p>
                    <p className="text-sm"><span className="font-semibold">{t('offen') || 'Offen:'}</span> <span className={approval.is_overspent ? 'text-red-600 font-bold' : ''}>{approval.open_amount} CHF</span></p>
                  </div>
                </div>

                {renderBudgetAmpel(approval)}
              </div>

              {isExpanded && (
                <div className="px-4 py-4 bg-gray-50 border-t">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-md text-gray-800">{t('invoices') || 'Rechnungen (Invoices)'}</h4>
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowCostForm(showCostForm === approval.id ? null : approval.id); }}
                      className="bg-blue-600 text-white px-3 py-1 rounded-xl text-sm hover:bg-blue-700"
                    >
                       {showCostForm === approval.id ? t('cancel') || 'Abbrechen' : t('add_invoice') || '+ Rechnung erfassen'}
                    </button>
                  </div>

                  {showCostForm === approval.id && (
                    <div className="bg-white p-4 rounded-xl border border-gray-200 mb-4">
                      <form onSubmit={(e) => handleCreateCost(e, approval.id)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium">{t('invoice_date') || 'Rechnungsdatum'}</label>
                            <input type="date" className="mt-1 w-full border p-2 rounded-xl" value={costInvoiceDate} onChange={e => setCostInvoiceDate(e.target.value)} required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium">{t('invoice_no') || 'Rechnungs-Nr'}</label>
                            <input type="text" className="mt-1 w-full border p-2 rounded-xl" value={costInvoiceNumber} onChange={e => setCostInvoiceNumber(e.target.value)} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium">{t('amount') || 'Betrag (CHF)'}</label>
                            <input type="number" step="0.01" className="mt-1 w-full border p-2 rounded-xl" value={costAmount} onChange={e => setCostAmount(e.target.value)} required />
                          </div>
                          <div>
                            <label className="block text-sm font-medium">{t('status') || 'Status'}</label>
                            <select className="mt-1 w-full border p-2 rounded-xl" value={costStatus} onChange={e => setCostStatus(e.target.value)} required>
                              <option value="offen">Offen</option>
                              <option value="eingereicht">Eingereicht bei Kostenträger</option>
                              <option value="verguetet">Vergütet</option>
                              <option value="abgelehnt">Abgelehnt</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 items-center">
                          <div className="flex items-center mt-6">
                            <input type="checkbox" id={`paid_by_parents_${approval.id}`} className="h-4 w-4 text-teal-600 border-gray-300 rounded" checked={costPaidByParents} onChange={e => setCostPaidByParents(e.target.checked)} />
                            <label htmlFor={`paid_by_parents_${approval.id}`} className="ml-2 block text-sm text-gray-900">{t('paid_by_parents') || 'Privat vorfinanziert'}</label>
                          </div>
                          <div>
                            <label className="block text-sm font-medium">{t('receipt_document') || 'Beleg (PDF/Foto)'}</label>
                            <input type="file" className="mt-1 w-full border p-2 rounded-xl bg-gray-50 text-sm" disabled title="Upload will be implemented later" />
                          </div>
                        </div>

                        <button disabled={isSubmittingCost} type="submit" className="bg-teal-600 text-white px-4 py-2 rounded-xl text-sm hover:bg-teal-700 disabled:opacity-50">
                          {isSubmittingCost ? t('loading_data') || 'Speichern...' : t('save') || 'Speichern'}
                        </button>
                      </form>
                    </div>
                  )}

                  {approval.costs && approval.costs.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-100">
                          <tr>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('date') || 'Datum'}</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('invoice_no') || 'Rechnungs-Nr'}</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('amount') || 'Betrag (CHF)'}</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('status') || 'Status'}</th>
                            <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('pre_financed') || 'Vorfinanziert'}</th>
                            <th scope="col" className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('actions') || 'Aktionen'}</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {approval.costs.map((cost) => (
                            <tr key={cost.id}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{cost.invoice_date}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{cost.invoice_number || '-'}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-medium">{cost.amount}</td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  cost.status === 'verguetet' ? 'bg-green-100 text-green-800' :
                                  cost.status === 'abgelehnt' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {cost.status}
                                </span>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {cost.paid_by_parents ? (
                                  <span className="text-yellow-600 font-semibold">{t('yes') || 'Ja'}</span>
                                ) : (
                                  <span>{t('no') || 'Nein'}</span>
                                )}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                {cost.status !== 'verguetet' && (
                                  <button onClick={(e) => { e.stopPropagation(); handleMarkVerguetet(cost.id); }} className="text-teal-600 hover:text-teal-900 mr-3">
                                    {t('mark_paid') || 'Als vergütet markieren'}
                                  </button>
                                )}
                                {cost.document_id && (
                                  <button onClick={(e) => { e.stopPropagation(); alert('Document download will be implemented here'); }} className="text-blue-600 hover:text-blue-900">
                                    📎 Beleg
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">{t('no_invoices') || 'Keine Rechnungen vorhanden.'}</p>
                  )}
                </div>
              )}

              <div className="px-4 py-3 bg-gray-50 border-t flex gap-4">
                <button onClick={() => handleAddStatus(approval.id)} className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-xl hover:bg-blue-200">{t('add_status') || '+ Status'}</button>
                <button onClick={() => handleAddLog(approval.id)} className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-xl hover:bg-green-200">{t('add_log') || '+ Log'}</button>
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
          )})}
          {sortedApprovals.length === 0 && !loading && (
            <div className="text-center text-gray-500">{t('no_cost_approvals_found') || 'No cost approvals found.'}</div>
          )}
        </div>
      </div>
    </div>
  );
};
