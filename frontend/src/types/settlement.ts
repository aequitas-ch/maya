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

export interface CostApproval {
  id: number;
  dependent_id: number;
  ordering_institution: Institution;
  executing_institution: Institution;
  insurance: Insurance;
  next_reminder: string | null;
  approved_amount: string; // or number, backend sends string for decimals
  settled_amount: string;
  open_amount: string;
  statuses: CostApprovalStatus[];
  logs: CostApprovalLog[];
}

export interface CostApprovalCreateData {
  dependent_id: number;
  ordering_institution_id: number;
  executing_institution_id: number;
  insurance_id: number;
  next_reminder?: string | null;
  approved_amount: string | number;
  settled_amount: string | number;
}
