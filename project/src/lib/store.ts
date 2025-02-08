import { create } from 'zustand';
import { supabase } from './supabase';
import { Profile, Tenant, Payment, Property, Unit } from './types';

interface AppState {
  user: Profile | null;
  profile: Profile | null;
  tenants: Tenant[];
  payments: Payment[];
  properties: Property[];
  units: Unit[];
  loading: boolean;
  error: string | null;
  setUser: (user: Profile | null) => void;
  setProfile: (profile: Profile | null) => void;
  setTenants: (tenants: Tenant[]) => void;
  setPayments: (payments: Payment[]) => void;
  setProperties: (properties: Property[]) => void;
  setUnits: (units: Unit[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchTenants: () => Promise<void>;
  fetchPayments: () => Promise<void>;
  fetchProperties: () => Promise<void>;
  fetchUnits: () => Promise<void>;
  deleteTenant: (id: string) => Promise<void>;
  updateTenant: (id: string, tenant: Partial<Tenant>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  profile: null,
  tenants: [],
  payments: [],
  properties: [],
  units: [],
  loading: false,
  error: null,

  logout: async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ 
        user: null,
        profile: null,
        payments: [],
        tenants: [],
        properties: [],
        units: []
      }); // Clear all state
      window.location.href = '/login'; // Redirect to login page
    } catch (error) {
      console.error('Error logging out:', error);
      set({ error: (error as Error).message });
    }
  },

  setUser: (user) => set({ user }),
  setProfile: (profile) => set({ profile }),
  setTenants: (tenants) => set({ tenants }),
  setPayments: (payments) => set({ payments }),
  setProperties: (properties) => set({ properties }),
  setUnits: (units) => set({ units }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  fetchTenants: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          unit:units (
            id,
            unit_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched tenants:', data);
      set({ tenants: data || [] });
    } catch (error) {
      console.error('Error fetching tenants:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  deleteTenant: async (id: string) => {
    try {
      set({ loading: true });
      
      // Get the tenant's unit_id before deletion
      const { data: tenant } = await supabase
        .from('tenants')
        .select('unit_id')
        .eq('id', id)
        .single();

      // Delete the tenant
      const { error: deleteError } = await supabase
        .from('tenants')
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;

      // Update unit status to available
      if (tenant?.unit_id) {
        const { error: unitError } = await supabase
          .from('units')
          .update({ status: 'available' })
          .eq('id', tenant.unit_id);
        
        if (unitError) throw unitError;
      }
      
      // Refresh tenants and units list after deletion
      get().fetchTenants();
      get().fetchUnits();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateTenant: async (id: string, tenant: Partial<Tenant>) => {
    try {
      set({ loading: true });
      const { error } = await supabase
        .from('tenants')
        .update(tenant)
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh tenants list after update
      get().fetchTenants();
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchPayments: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('payments')
        .select(`
          *,
          tenant:tenants (
            id,
            tenant_name,
            unit:units (
              id,
              unit_number
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      console.log('Fetched payments:', data);
      set({ payments: data || [] });
    } catch (error) {
      console.error('Error fetching payments:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  deletePayment: async (id: string) => {
    try {
      set({ loading: true });
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Refresh payments list
      const { fetchPayments } = get();
      await fetchPayments();
    } catch (error) {
      console.error('Error deleting payment:', error);
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  fetchProperties: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          units (*)
        `);
      
      if (error) throw error;
      set({ properties: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  fetchUnits: async () => {
    try {
      set({ loading: true });
      const { data, error } = await supabase
        .from('units')
        .select('*, property:properties(*)');
      
      if (error) throw error;
      set({ units: data || [] });
    } catch (error) {
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));