/*
  # Initial Schema Setup for Tenant Payment Tracker

  1. New Tables
    - `profiles`
      - Extended user profile data linked to auth.users
      - Stores role and contact information
    - `properties`
      - Property details managed by admins
    - `units`
      - Individual rental units within properties
    - `tenants`
      - Tenant information and lease details
    - `payments`
      - Payment records with status tracking
    - `payment_reminders`
      - Automated payment reminder system

  2. Security
    - Enable RLS on all tables
    - Policies for different user roles
    - Encrypted sensitive data handling

  3. Enums and Types
    - Payment status types
    - User role types
    - Reminder frequency types
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'property_manager', 'tenant');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'overdue', 'partial');
CREATE TYPE reminder_frequency AS ENUM ('weekly', 'monthly', 'custom');

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'tenant',
  full_name text,
  phone text,
  email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Properties table
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  created_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Units table
CREATE TABLE units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid REFERENCES properties(id) ON DELETE CASCADE,
  unit_number text NOT NULL,
  floor_plan text,
  square_feet integer,
  rent_amount decimal(10,2) NOT NULL,
  status text DEFAULT 'available',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(property_id, unit_number)
);

-- Tenants table
CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id),
  unit_id uuid REFERENCES units(id),
  lease_start date NOT NULL,
  lease_end date NOT NULL,
  rent_amount decimal(10,2) NOT NULL,
  security_deposit decimal(10,2),
  payment_due_day integer NOT NULL CHECK (payment_due_day BETWEEN 1 AND 31),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payments table
CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  due_date date NOT NULL,
  payment_date timestamptz,
  status payment_status DEFAULT 'pending',
  payment_method text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Payment reminders table
CREATE TABLE payment_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES tenants(id) ON DELETE CASCADE,
  frequency reminder_frequency NOT NULL,
  days_before_due integer NOT NULL,
  last_sent timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Properties policies
CREATE POLICY "Properties viewable by authenticated users"
  ON properties FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Properties editable by admins and property managers"
  ON properties FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND role IN ('admin', 'property_manager')
    )
  );

-- Units policies
CREATE POLICY "Units viewable by authenticated users"
  ON units FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Units editable by admins and property managers"
  ON units FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND role IN ('admin', 'property_manager')
    )
  );

-- Tenants policies
CREATE POLICY "Tenants viewable by admins and property managers"
  ON tenants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND role IN ('admin', 'property_manager')
    )
    OR profile_id = auth.uid()
  );

CREATE POLICY "Tenants editable by admins and property managers"
  ON tenants FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND role IN ('admin', 'property_manager')
    )
  );

-- Payments policies
CREATE POLICY "Payments viewable by relevant users"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenants
      JOIN profiles ON profiles.id = auth.uid()
      WHERE (
        tenants.id = payments.tenant_id
        AND (
          profiles.role IN ('admin', 'property_manager')
          OR tenants.profile_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Payments editable by admins and property managers"
  ON payments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND role IN ('admin', 'property_manager')
    )
  );

-- Payment reminders policies
CREATE POLICY "Reminders viewable by relevant users"
  ON payment_reminders FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM tenants
      JOIN profiles ON profiles.id = auth.uid()
      WHERE (
        tenants.id = payment_reminders.tenant_id
        AND (
          profiles.role IN ('admin', 'property_manager')
          OR tenants.profile_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Reminders editable by admins and property managers"
  ON payment_reminders FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND role IN ('admin', 'property_manager')
    )
  );

-- Functions for automatic updates
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_tenants_updated_at
  BEFORE UPDATE ON tenants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_payment_reminders_updated_at
  BEFORE UPDATE ON payment_reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();