import { Json } from './types/base';
import { CRMTable } from './types/crm';
import { ProjectsTable } from './types/projects';
import { FinanceTable } from './types/finance';
import { PricingTable } from './types/pricing';
import { OfficeTable } from './types/office';
import { AuthTable } from './types/auth';

export type { Json };

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: CRMTable & ProjectsTable & FinanceTable & PricingTable & OfficeTable & AuthTable
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}