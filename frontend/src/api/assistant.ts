import api from './axios';
import type { Employee, Contract, WorkingHours, AssistantDashboardData } from '../types/assistant';

export const getEmployees = async (): Promise<Employee[]> => {
  const response = await api.get('/assistants/employees/');
  return response.data;
};

export const getEmployee = async (id: string): Promise<Employee> => {
  const response = await api.get(`/assistants/employees/${id}/`);
  return response.data;
};

export const createEmployee = async (data: Partial<Employee>): Promise<Employee> => {
  const response = await api.post('/assistants/employees/', data);
  return response.data;
};

export const updateEmployee = async (id: string, data: Partial<Employee>): Promise<Employee> => {
  const response = await api.put(`/assistants/employees/${id}/`, data);
  return response.data;
};

export const createContract = async (data: Partial<Contract>): Promise<Contract> => {
  const response = await api.post('/assistants/contracts/', data);
  return response.data;
};

export const updateContract = async (id: string, data: Partial<Contract>): Promise<Contract> => {
  const response = await api.put(`/assistants/contracts/${id}/`, data);
  return response.data;
};

export const getWorkingHours = async (): Promise<WorkingHours[]> => {
  const response = await api.get('/assistants/working-hours/');
  return response.data;
};

export const createWorkingHours = async (data: Partial<WorkingHours>): Promise<WorkingHours> => {
  const response = await api.post('/assistants/working-hours/', data);
  return response.data;
};

export const generatePayslip = async (workingHoursId: string): Promise<any> => {
  const response = await api.post(`/assistants/working-hours/${workingHoursId}/generate_payslip/`);
  return response.data;
};

export const generateAnnualStatement = async (employeeId: string, year: number): Promise<any> => {
  const response = await api.post(`/assistants/employees/${employeeId}/generate_annual_statement/`, { year });
  return response.data;
};

export const getDashboardData = async (year: number): Promise<AssistantDashboardData> => {
  const response = await api.get(`/assistants/dashboard/?year=${year}`);
  return response.data;
};

export const getIvReport = async (year: number, quarter: number): Promise<any> => {
  const response = await api.get(`/assistants/dashboard/iv_report/?year=${year}&quarter=${quarter}`);
  return response.data;
};
