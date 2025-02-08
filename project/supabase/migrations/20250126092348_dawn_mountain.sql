/*
  # Simplified Properties RLS Policies

  1. Changes
    - Drop and recreate properties policies
    - Implement basic RLS policies for CRUD operations
    - Simplified policy structure

  2. Security
    - Maintain secure access control
    - Enable property management for authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Properties viewable by authenticated users" ON properties;
DROP POLICY IF EXISTS "Properties editable by admins and property managers" ON properties;
DROP POLICY IF EXISTS "properties_select_policy" ON properties;
DROP POLICY IF EXISTS "properties_insert_policy" ON properties;
DROP POLICY IF EXISTS "properties_update_policy" ON properties;
DROP POLICY IF EXISTS "properties_delete_policy" ON properties;

-- Create new simplified policies
CREATE POLICY "allow_select" ON properties FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "allow_insert" ON properties FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "allow_update" ON properties FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "allow_delete" ON properties FOR DELETE
    TO authenticated
    USING (created_by = auth.uid() OR 
           EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));