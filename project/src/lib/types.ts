export interface Profile {
  id: string;
  role: 'admin' | 'property_manager' | 'tenant';
  full_name: string | null;
  phone: string | null;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  expected_rent?: number;
  units?: Unit[];
}

export interface Unit {
  id: string;
  property_id: string;
  unit_number: string;
  floor_plan: string | null;
  square_feet: number | null;
  rent_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
  property?: Property;
  tenant_id?: string | null;
}

export interface Tenant {
  id: string;
  profile_id?: string | null;
  unit_id: string;
  lease_start: string;
  lease_end: string;
  rent_amount: number;
  security_deposit: number | null;
  payment_due_day: number;
  tenant_name: string | null;
  tenant_email: string | null;
  tenant_phone: string | null;
  created_at: string;
  updated_at: string;
  profile?: Profile;
  unit?: Unit;
}

export interface Payment {
  id: string;
  tenant_id: string;
  amount: number;
  due_date: string;
  payment_date: string | null;
  status: 'pending' | 'paid' | 'overdue' | 'partial';
  payment_method: string | null;
  mpesa_code: string | null;  // Added field for Mpesa transaction code
  notes: string | null;
  created_at: string;
  updated_at: string;
  tenant?: Tenant;
}

export interface PaymentReminder {
  id: string;
  tenant_id: string;
  frequency: 'weekly' | 'monthly' | 'custom';
  days_before_due: number;
  last_sent: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}