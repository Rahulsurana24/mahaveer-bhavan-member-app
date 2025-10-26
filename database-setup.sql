-- =====================================================
-- Mahaveer Bhavan Database Setup & Automation Script
-- =====================================================
-- Run this script to set up your database with all necessary data
-- PostgreSQL URL: postgresql://postgres:s3GVV2zOmFjT2aH4@db.juvrytwhtivezeqrmtpq.supabase.co:5432/postgres

-- =====================================================
-- 1. ROLES SETUP
-- =====================================================

-- Insert role definitions if they don't exist
INSERT INTO user_roles (name, description, permissions)
VALUES
  ('super_admin', 'Super Administrator with full system access', '{"all": true, "member_management": true, "event_management": true, "financial_management": true, "gallery_moderation": true, "system_settings": true, "user_management": true}'),
  ('admin', 'Administrator with most permissions', '{"member_management": true, "event_management": true, "financial_management": true, "gallery_moderation": true, "system_settings": false, "user_management": false}'),
  ('view_only', 'View-only admin access', '{"member_management": false, "event_management": false, "financial_management": false, "gallery_moderation": false, "system_settings": false, "user_management": false}'),
  ('member', 'Regular community member', '{"member_management": false}')
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions;

-- =====================================================
-- 2. ADMIN USER SETUP
-- =====================================================

-- Create or update admin user profile for rahulsuranat@gmail.com
-- First, get the auth user ID
DO $$
DECLARE
  v_auth_id uuid;
  v_role_id uuid;
BEGIN
  -- Get auth user ID for rahulsuranat@gmail.com
  SELECT id INTO v_auth_id
  FROM auth.users
  WHERE email = 'rahulsuranat@gmail.com';

  -- Get super_admin role ID
  SELECT id INTO v_role_id
  FROM user_roles
  WHERE name = 'super_admin';

  -- If user exists in auth.users
  IF v_auth_id IS NOT NULL AND v_role_id IS NOT NULL THEN
    -- Insert or update user_profiles
    INSERT INTO user_profiles (
      auth_id,
      role_id,
      email,
      full_name,
      phone,
      is_active,
      email_verified,
      country
    )
    VALUES (
      v_auth_id,
      v_role_id,
      'rahulsuranat@gmail.com',
      'Rahul Suranat',
      '9999999999',
      true,
      true,
      'India'
    )
    ON CONFLICT (auth_id) DO UPDATE SET
      role_id = EXCLUDED.role_id,
      full_name = EXCLUDED.full_name,
      is_active = EXCLUDED.is_active,
      email_verified = EXCLUDED.email_verified;

    RAISE NOTICE 'Admin user profile created/updated for rahulsuranat@gmail.com';
  ELSE
    RAISE NOTICE 'Auth user not found or role missing. Please create auth user first via Supabase Dashboard.';
  END IF;
END $$;

-- =====================================================
-- 3. MEMBERSHIP TYPES SETUP
-- =====================================================

-- Ensure membership types exist (if you have a membership_types table)
-- Adjust based on your actual schema
-- Example:
-- INSERT INTO membership_types (name, description, fee)
-- VALUES
--   ('Tapasvi', 'Tapasvi member', 0),
--   ('Karyakarta', 'Karyakarta member', 0),
--   ('Shraman', 'Shraman member', 0),
--   ('Shravak', 'Shravak member', 0),
--   ('General Member', 'General community member', 0)
-- ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 4. EVENT TYPES SETUP
-- =====================================================

-- Create standard event types (if needed)
-- Example based on your schema

-- =====================================================
-- 5. SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample members for testing (optional)
-- Only insert if table is empty
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM members LIMIT 1) THEN
    -- Insert a sample member
    INSERT INTO members (
      member_id,
      full_name,
      email,
      mobile,
      date_of_birth,
      gender,
      membership_type,
      address_line1,
      city,
      state,
      pin_code,
      is_active
    )
    VALUES (
      'M-GEN-001',
      'Sample Member',
      'sample@example.com',
      '9876543210',
      '1990-01-01',
      'Male',
      'General Member',
      '123 Main Street',
      'Mumbai',
      'Maharashtra',
      '400001',
      true
    )
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Sample member inserted';
  END IF;
END $$;

-- =====================================================
-- 6. SYSTEM SETTINGS
-- =====================================================

-- Create system settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  description text,
  updated_at timestamptz DEFAULT now(),
  updated_by uuid REFERENCES user_profiles(id)
);

-- Insert default system settings
INSERT INTO system_settings (key, value, description)
VALUES
  ('branding', '{"organization_name": "Mahaveer Bhavan", "logo_url": null, "primary_color": "#0F766E", "tagline": "Jain Community Management"}', 'Branding configuration'),
  ('payment_gateway', '{"enabled": false, "provider": null, "api_key": null, "test_mode": true}', 'Payment gateway settings'),
  ('email_config', '{"smtp_host": null, "smtp_port": 587, "from_email": "noreply@mahaverbhavan.org", "from_name": "Mahaveer Bhavan"}', 'Email configuration'),
  ('member_id_format', '{"prefix": "M", "separator": "-", "type_code": true, "sequence_length": 3}', 'Member ID generation format'),
  ('currency', '{"code": "INR", "symbol": "₹", "position": "before"}', 'Currency settings')
ON CONFLICT (key) DO UPDATE SET
  value = EXCLUDED.value,
  updated_at = now();

-- =====================================================
-- 7. AUDIT LOG TABLE
-- =====================================================

-- Create audit logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now(),
  admin_user_id uuid REFERENCES user_profiles(id),
  admin_email text,
  action_type text NOT NULL,
  target_type text,
  target_id text,
  details jsonb,
  ip_address inet,
  user_agent text
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin ON audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action_type);

-- =====================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on sensitive tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can view all user profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles" ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.auth_id = auth.uid()
      AND ur.name IN ('admin', 'super_admin')
    )
  );

-- Policy: Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT
  USING (auth_id = auth.uid());

-- Policy: Only super admins can modify user profiles
DROP POLICY IF EXISTS "Super admins can modify profiles" ON user_profiles;
CREATE POLICY "Super admins can modify profiles" ON user_profiles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.auth_id = auth.uid()
      AND ur.name = 'super_admin'
    )
  );

-- Policy: Admins can view audit logs
DROP POLICY IF EXISTS "Admins can view audit logs" ON audit_logs;
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.auth_id = auth.uid()
      AND ur.name IN ('admin', 'super_admin')
    )
  );

-- Policy: Admins can view system settings
DROP POLICY IF EXISTS "Admins can view settings" ON system_settings;
CREATE POLICY "Admins can view settings" ON system_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.auth_id = auth.uid()
      AND ur.name IN ('admin', 'super_admin')
    )
  );

-- Policy: Only super admins can modify system settings
DROP POLICY IF EXISTS "Super admins can modify settings" ON system_settings;
CREATE POLICY "Super admins can modify settings" ON system_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles up
      JOIN user_roles ur ON up.role_id = ur.id
      WHERE up.auth_id = auth.uid()
      AND ur.name = 'super_admin'
    )
  );

-- =====================================================
-- 9. HELPER FUNCTIONS
-- =====================================================

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  p_action_type text,
  p_target_type text DEFAULT NULL,
  p_target_id text DEFAULT NULL,
  p_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id uuid;
  v_admin_email text;
BEGIN
  -- Get current admin user
  SELECT id, email INTO v_admin_id, v_admin_email
  FROM user_profiles
  WHERE auth_id = auth.uid();

  -- Insert audit log
  INSERT INTO audit_logs (
    admin_user_id,
    admin_email,
    action_type,
    target_type,
    target_id,
    details
  )
  VALUES (
    v_admin_id,
    v_admin_email,
    p_action_type,
    p_target_type,
    p_target_id,
    p_details
  );
END;
$$;

-- =====================================================
-- 10. VERIFICATION QUERIES
-- =====================================================

-- Check roles are set up
SELECT 'Roles:' as check_type, name, description FROM user_roles ORDER BY name;

-- Check admin users
SELECT 'Admin Users:' as check_type,
       up.email,
       up.full_name,
       ur.name as role,
       up.is_active
FROM user_profiles up
JOIN user_roles ur ON up.role_id = ur.id
WHERE ur.name IN ('admin', 'super_admin')
ORDER BY ur.name, up.email;

-- Check system settings
SELECT 'System Settings:' as check_type, key, description
FROM system_settings
ORDER BY key;

-- Count members
SELECT 'Total Members:' as check_type, COUNT(*) as count FROM members;

-- Count events
SELECT 'Total Events:' as check_type, COUNT(*) as count FROM events;

-- =====================================================
-- COMPLETION MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Database setup completed successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Log in to Web Admin with: rahulsuranat@gmail.com';
  RAISE NOTICE '2. Configure OpenRouter API secret via Supabase CLI or Dashboard';
  RAISE NOTICE '3. Update system settings in Admin Panel';
  RAISE NOTICE '========================================';
END $$;
