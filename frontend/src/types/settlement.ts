export interface Institution {
  id: number;
  name: string;
}

export interface Insurance {
  id: number;
  name: string;
}

export interface CostApprovalStatus {
  id: number;
  status: string;
  status_display?: string;
  date: string;
}

export interface CostApprovalLog {
  id: number;
  date: string;
  text: string;
}

export interface SettlementCost {
  id: number;
  cost_approval: number;
  invoice_number: string | null;
  invoice_date: string;
  amount: string;
  paid_by_parents: boolean;
  reimbursed_amount: string;
  status: string;
  document_id: number | null;
  comment: string | null;
}

export interface CostApproval {
  id: number;
  dependent_id: number;
  ordering_institution: Institution;
  executing_institution: Institution;
  insurance: Insurance;

  valid_from: string | null;
  valid_to: string | null;
  case_number: string | null;
  coverage_type: string;
  document_id: number | null;

  next_reminder: string | null;
  approved_amount: string; // or number, backend sends string for decimals
  settled_amount: string;
  open_amount: string;
  is_overspent: boolean;
  days_until_expiration: number | null;

  statuses: CostApprovalStatus[];
  logs: CostApprovalLog[];
  costs: SettlementCost[];
}

export interface CostApprovalCreateData {
  dependent_id: number;
  ordering_institution_id: number;
  executing_institution_id: number;
  insurance_id: number;

  valid_from?: string | null;
  valid_to?: string | null;
  case_number?: string | null;
  coverage_type?: string;
  document_id?: number | null;

  next_reminder?: string | null;
  approved_amount: string | number;
  settled_amount?: string | number;
}

export interface SettlementCostCreateData {
  cost_approval: number;
  invoice_number?: string | null;
  invoice_date: string;
  amount: string | number;
  paid_by_parents?: boolean;
  reimbursed_amount?: string | number;
  status?: string;
  document_id?: number | null;
  comment?: string | null;
}
