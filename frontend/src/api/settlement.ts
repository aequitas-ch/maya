import api from './axios';
import type { Institution, Insurance, CostApproval, CostApprovalCreateData } from '../types/settlement';

import { extractData } from '../utils/pagination';

export const settlementApi = {
  getInstitutions: async (): Promise<Institution[]> => {
    const response = await api.get('/settlement/institutions/');
    return extractData(response.data);
  },

  createInstitution: async (name: string): Promise<Institution> => {
    const response = await api.post('/settlement/institutions/', { name });
    return response.data;
  },

  getInsurances: async (): Promise<Insurance[]> => {
    const response = await api.get('/settlement/insurances/');
    return extractData(response.data);
  },

  createInsurance: async (name: string): Promise<Insurance> => {
    const response = await api.post('/settlement/insurances/', { name });
    return response.data;
  },

  getCostApprovals: async (): Promise<CostApproval[]> => {
    const response = await api.get('/settlement/cost-approvals/');
    return extractData(response.data);
  },

  createCostApproval: async (data: CostApprovalCreateData): Promise<CostApproval> => {
    const response = await api.post('/settlement/cost-approvals/', data);
    return response.data;
  },

  addStatus: async (costApprovalId: number, status: string, date: string): Promise<CostApproval> => {
    const response = await api.post(`/settlement/cost-approvals/${costApprovalId}/add_status/`, {
      status,
      date,
    });
    return response.data;
  },

  addLog: async (costApprovalId: number, text: string): Promise<CostApproval> => {
    const response = await api.post(`/settlement/cost-approvals/${costApprovalId}/add_log/`, {
      text,
    });
    return response.data;
  },
};
