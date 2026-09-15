export type EmploymentType = 'IV_ASSISTANCE' | 'DOMESTIC' | 'BABYSITTER';
export type EmployeeStatus = 'ACTIVE' | 'INACTIVE';

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  ahv_number: string;
  address: string;
  city: string;
  zip_code: string;
  type: EmploymentType;
  status: EmployeeStatus;
  contract?: Contract;
  created_at?: string;
  updated_at?: string;
}

export interface Contract {
  id: string;
  employee: string;
  hourly_wage: number;
  target_hours_per_week?: number;
  probation_period_months: number;
  start_date: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkingHours {
  id: string;
  contract: string;
  year: number;
  month: number;
  basic_hours: number;
  overtime_hours: number;
  sick_hours: number;
  holiday_hours: number;
  expenses: number;
  payslip?: Payslip;
  created_at?: string;
  updated_at?: string;
}

export interface Payslip {
  id: string;
  working_hours: string;
  gross_pay: number;
  ahv_iv_eo_deduction: number;
  alv_deduction: number;
  bvg_deduction: number;
  source_tax_deduction: number;
  net_pay: number;
  employer_costs: number;
  pdf_document?: string;
  created_at?: string;
}

export interface MonthlyCost {
  month: number;
  total_cost: number;
}

export interface TypeBreakdown {
  type: EmploymentType;
  cost: number;
}

export interface AssistantDashboardData {
  monthly_costs: MonthlyCost[];
  type_breakdown: TypeBreakdown[];
}
