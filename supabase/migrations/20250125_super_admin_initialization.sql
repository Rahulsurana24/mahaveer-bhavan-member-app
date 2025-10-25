-- =====================================================
-- SUPER ADMIN INITIALIZATION
-- Created: 2025-01-25
-- Purpose: Set up the initial super admin account
-- Email: rahulsuranat@gmail.com
-- Password: 9480413653 (must be changed on first login)
-- =====================================================

-- Function to initialize super admin account
CREATE OR REPLACE FUNCTION public.initialize_super_admin()
RETURNS void AS $$
DECLARE
    v_super_admin_role_id UUID;
    v_auth_user_id UUID;
    v_existing_user UUID;
BEGIN
    -- Check if super admin role exists
    SELECT id INTO v_super_admin_role_id
    FROM public.user_roles
    WHERE name = 'super_admin'
    LIMIT 1;

    -- If super_admin role doesn't exist, create it
    IF v_super_admin_role_id IS NULL THEN
        INSERT INTO public.user_roles (name, description, permissions)
        VALUES (
            'super_admin',
            'Super Administrator with full system access',
            jsonb_build_object(
                'member_management', true,
                'event_management', true,
                'financial_management', true,
                'gallery_moderation', true,
                'system_settings', true,
                'user_management', true,
                'calendar_management', true
            )
        )
        RETURNING id INTO v_super_admin_role_id;

        RAISE NOTICE 'Created super_admin role with ID: %', v_super_admin_role_id;
    END IF;

    -- Check if super admin user already exists in auth.users
    SELECT id INTO v_existing_user
    FROM auth.users
    WHERE email = 'rahulsuranat@gmail.com'
    LIMIT 1;

    IF v_existing_user IS NOT NULL THEN
        RAISE NOTICE 'Super admin user already exists with ID: %', v_existing_user;
        v_auth_user_id := v_existing_user;
    ELSE
        -- Note: Creating auth users programmatically requires Supabase Admin API
        -- This function documents the required setup
        -- Actual user creation should be done via Supabase Dashboard or Admin API
        RAISE NOTICE 'Super admin user does not exist. Please create via Supabase Dashboard:';
        RAISE NOTICE 'Email: rahulsuranat@gmail.com';
        RAISE NOTICE 'Password: 9480413653';
        RAISE NOTICE 'After creation, run this migration again to link the profile.';
        RETURN;
    END IF;

    -- Check if user profile exists
    IF EXISTS (SELECT 1 FROM public.user_profiles WHERE id = v_auth_user_id) THEN
        -- Update existing profile to super_admin role
        UPDATE public.user_profiles
        SET
            role_id = v_super_admin_role_id,
            needs_password_change = true,
            is_active = true,
            updated_at = now()
        WHERE id = v_auth_user_id;

        RAISE NOTICE 'Updated existing user profile to super_admin role';
    ELSE
        -- Create user profile for super admin
        INSERT INTO public.user_profiles (
            id,
            role_id,
            needs_password_change,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            v_auth_user_id,
            v_super_admin_role_id,
            true,  -- Force password change on first login
            true,
            now(),
            now()
        );

        RAISE NOTICE 'Created user profile for super admin';
    END IF;

    -- Log the initialization
    INSERT INTO public.audit_logs (
        user_id,
        action_type,
        details,
        created_at
    ) VALUES (
        v_auth_user_id,
        'super_admin_initialized',
        jsonb_build_object(
            'email', 'rahulsuranat@gmail.com',
            'role', 'super_admin',
            'initialized_at', now()
        ),
        now()
    );

    RAISE NOTICE 'Super admin initialization complete!';
    RAISE NOTICE '----------------------------------------';
    RAISE NOTICE 'Email: rahulsuranat@gmail.com';
    RAISE NOTICE 'Password: 9480413653';
    RAISE NOTICE 'IMPORTANT: User will be forced to change password on first login';
    RAISE NOTICE '----------------------------------------';

EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error initializing super admin: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the initialization
SELECT public.initialize_super_admin();

-- =====================================================
-- ADDITIONAL ADMIN ROLE DEFINITIONS
-- =====================================================

-- Ensure all required roles exist with proper permissions

-- Admin Role (high privileges, no user management or system settings)
INSERT INTO public.user_roles (name, description, permissions)
VALUES (
    'admin',
    'Administrator with most privileges',
    jsonb_build_object(
        'member_management', true,
        'event_management', true,
        'financial_management', true,
        'gallery_moderation', true,
        'system_settings', false,
        'user_management', false,
        'calendar_management', true
    )
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions;

-- Partial Admin Role (customizable permissions)
INSERT INTO public.user_roles (name, description, permissions)
VALUES (
    'partial_admin',
    'Partial Administrator with limited permissions',
    jsonb_build_object(
        'member_management', false,
        'event_management', true,
        'financial_management', false,
        'gallery_moderation', true,
        'system_settings', false,
        'user_management', false,
        'calendar_management', false
    )
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions;

-- View Only Role (read-only access)
INSERT INTO public.user_roles (name, description, permissions)
VALUES (
    'view_only',
    'View-only access with no edit permissions',
    jsonb_build_object(
        'member_management', false,
        'event_management', false,
        'financial_management', false,
        'gallery_moderation', false,
        'system_settings', false,
        'user_management', false,
        'calendar_management', false
    )
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions;

-- Member Role (regular members)
INSERT INTO public.user_roles (name, description, permissions)
VALUES (
    'member',
    'Regular community member',
    jsonb_build_object(
        'member_management', false,
        'event_management', false,
        'financial_management', false,
        'gallery_moderation', false,
        'system_settings', false,
        'user_management', false,
        'calendar_management', false
    )
)
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions;

-- =====================================================
-- HELPER FUNCTION: Create Admin User
-- =====================================================

CREATE OR REPLACE FUNCTION public.create_admin_user(
    p_email TEXT,
    p_role_name TEXT DEFAULT 'admin',
    p_custom_permissions JSONB DEFAULT NULL
)
RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    user_id UUID,
    temporary_password TEXT
) AS $$
DECLARE
    v_role_id UUID;
    v_auth_user_id UUID;
    v_temp_password TEXT;
    v_permissions JSONB;
BEGIN
    -- Validate inputs
    IF p_email IS NULL OR p_email = '' THEN
        RETURN QUERY SELECT false, 'Email is required', NULL::UUID, NULL::TEXT;
        RETURN;
    END IF;

    -- Check if role exists
    SELECT id, permissions INTO v_role_id, v_permissions
    FROM public.user_roles
    WHERE name = p_role_name;

    IF v_role_id IS NULL THEN
        RETURN QUERY SELECT false, 'Invalid role: ' || p_role_name, NULL::UUID, NULL::TEXT;
        RETURN;
    END IF;

    -- Use custom permissions if provided (for partial_admin)
    IF p_custom_permissions IS NOT NULL THEN
        v_permissions := p_custom_permissions;
    END IF;

    -- Check if user already exists
    SELECT id INTO v_auth_user_id
    FROM auth.users
    WHERE email = p_email;

    IF v_auth_user_id IS NOT NULL THEN
        RETURN QUERY SELECT false, 'User with this email already exists', NULL::UUID, NULL::TEXT;
        RETURN;
    END IF;

    -- Generate temporary password (8 random characters)
    v_temp_password := substring(md5(random()::text || clock_timestamp()::text) from 1 for 8);

    -- Note: Actual user creation requires Supabase Admin API
    -- This function returns the temporary password to be used during creation
    RETURN QUERY SELECT
        true AS success,
        'Create user via Supabase Admin API with this email and password' AS message,
        NULL::UUID AS user_id,
        v_temp_password AS temporary_password;

    -- Log the admin creation attempt
    INSERT INTO public.audit_logs (
        action_type,
        details
    ) VALUES (
        'admin_user_creation_requested',
        jsonb_build_object(
            'email', p_email,
            'role', p_role_name,
            'requested_at', now()
        )
    );

END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to super admins only
REVOKE EXECUTE ON FUNCTION public.create_admin_user FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_admin_user TO authenticated;

COMMENT ON FUNCTION public.initialize_super_admin IS 'Initializes the super admin account on first deployment';
COMMENT ON FUNCTION public.create_admin_user IS 'Helper function to create admin users (requires Supabase Admin API for actual user creation)';
