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
  darkMode: boolean;
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
  deleteProperty: (id: string) => Promise<void>;
  updateProperty: (id: string, property: Partial<Property>) => Promise<void>;
  deleteUnit: (id: string) => Promise<void>;
  updateUnit: (id: string, unit: Partial<Unit>) => Promise<void>;
  logout: () => Promise<void>;
  toggleDarkMode: () => void;
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
  darkMode: typeof window !== 'undefined' ? localStorage.getItem('darkMode') === 'true' : false,

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
      window.location.href = '/#/login'; // Redirect to login page with hash routing
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
  toggleDarkMode: () => {
    const newDarkMode = !get().darkMode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(newDarkMode));
    }
    set({ darkMode: newDarkMode });
  },

  fetchTenants: async () => {
    try {
      set({ loading: true });
      // Add a cache-busting parameter to ensure fresh data
      const { data, error } = await supabase
        .from('tenants')
        .select(`
          *,
          unit:units (
            id,
            unit_number
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100); // Increase limit to ensure all tenants are fetched

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
      
      // Update the local state immediately to remove the deleted tenant
      const currentTenants = get().tenants;
      set({ tenants: currentTenants.filter(t => t.id !== id) });
      
      // Then refresh data from the server
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
      
      // Process payment statuses based on current date
      const processedPayments = data?.map(payment => {
        // If payment has a payment date, it's paid
        if (payment.payment_date) {
          return { ...payment, status: 'paid' };
        }
        
        // Compare due date with current date to determine if overdue
        const dueDate = new Date(payment.due_date);
        const currentDate = new Date();
        
        // If due date has passed, mark as overdue
        if (dueDate < currentDate) {
          return { ...payment, status: 'overdue' };
        }
        
        // Otherwise, it's pending
        return { ...payment, status: 'pending' };
      }) || [];
      
      console.log('Fetched payments with updated statuses:', processedPayments);
      set({ payments: processedPayments });
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

  deleteProperty: async (id: string) => {
    try {
      set({ loading: true });
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      const { properties } = get();
      set({ properties: properties.filter(p => p.id !== id) });
    } catch (error) {
      console.error('Error deleting property:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateProperty: async (id: string, property: Partial<Property>) => {
    try {
      set({ loading: true });
      const { error } = await supabase
        .from('properties')
        .update(property)
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh properties to get updated data
      await get().fetchProperties();
    } catch (error) {
      console.error('Error updating property:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  deleteUnit: async (id: string) => {
    try {
      set({ loading: true });
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      const { units } = get();
      set({ units: units.filter(u => u.id !== id) });
      
      // Refresh properties to update units nested data
      await get().fetchProperties();
    } catch (error) {
      console.error('Error deleting unit:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },

  updateUnit: async (id: string, unit: Partial<Unit>) => {
    try {
      set({ loading: true });
      const { error } = await supabase
        .from('units')
        .update(unit)
        .eq('id', id);
      
      if (error) throw error;
      
      // Refresh units and properties to get updated data
      await get().fetchUnits();
      await get().fetchProperties();
    } catch (error) {
      console.error('Error updating unit:', error);
      set({ error: (error as Error).message });
    } finally {
      set({ loading: false });
    }
  },
}));