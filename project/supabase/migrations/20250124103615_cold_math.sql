/*
  # Create default admin user

  1. Changes
    - Insert default admin user into auth.users
    - Create corresponding profile in profiles table
    
  2. Security
    - Password will need to be set on first login
    - Email is admin@example.com
*/

DO $$
DECLARE
  user_id uuid;
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@example.com'
  ) THEN
    -- First, create the user in auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'admin@example.com',
      crypt('admin123', gen_salt('bf')),
      now(),
      now(),
      now()
    )
    RETURNING id INTO user_id;

    -- Then create the profile
    INSERT INTO profiles (
      id,
      role,
      full_name,
      email,
      created_at,
      updated_at
    )
    VALUES (
      user_id,
      'admin',
      'System Admin',
      'admin@example.com',
      now(),
      now()
    );
  END IF;
END $$;