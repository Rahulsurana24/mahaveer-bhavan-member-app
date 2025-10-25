-- =====================================================
-- SUPER ADMIN INITIALIZATION (Updated for actual schema)
-- Email: rahulsuranat@gmail.com
-- Password: 9480413653 (must be changed on first login)
-- =====================================================

-- Ensure super_admin role exists
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
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions;

-- Ensure superadmin role exists (alternative name)
INSERT INTO public.user_roles (name, description, permissions)
VALUES (
    'superadmin',
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
ON CONFLICT (name) DO UPDATE SET
    description = EXCLUDED.description,
    permissions = EXCLUDED.permissions;

-- Ensure admin role exists
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

-- Ensure partial_admin role exists
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

-- Ensure view_only role exists
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

-- Ensure member role exists
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

-- Note: Super admin user needs to be created manually via Supabase Dashboard
-- After creating the user, update their profile with the following SQL:

DO $$
DECLARE
    v_super_admin_role_id UUID;
    v_auth_user_id UUID;
BEGIN
    -- Get super_admin role ID
    SELECT id INTO v_super_admin_role_id
    FROM public.user_roles
    WHERE name IN ('super_admin', 'superadmin')
    LIMIT 1;

    -- Check if the user exists in auth.users
    SELECT id INTO v_auth_user_id
    FROM auth.users
    WHERE email = 'rahulsuranat@gmail.com'
    LIMIT 1;

    IF v_auth_user_id IS NULL THEN
        RAISE NOTICE '========================================';
        RAISE NOTICE 'SUPER ADMIN USER NOT FOUND';
        RAISE NOTICE '========================================';
        RAISE NOTICE 'Please create user via Supabase Dashboard:';
        RAISE NOTICE 'Email: rahulsuranat@gmail.com';
        RAISE NOTICE 'Password: 9480413653';
        RAISE NOTICE 'Then run this migration again.';
        RAISE NOTICE '========================================';
        RETURN;
    END IF;

    -- Update or insert user profile
    INSERT INTO public.user_profiles (
        auth_id,
        email,
        full_name,
        role_id,
        needs_password_change,
        is_active
    ) VALUES (
        v_auth_user_id,
        'rahulsuranat@gmail.com',
        'Rahul Suranat',
        v_super_admin_role_id,
        true,  -- Force password change on first login
        true
    )
    ON CONFLICT (auth_id) DO UPDATE SET
        role_id = v_super_admin_role_id,
        needs_password_change = true,
        is_active = true,
        updated_at = now();

    -- Log the initialization
    INSERT INTO public.audit_logs (
        user_id,
        action,
        action_type,
        details,
        created_at
    ) VALUES (
        v_auth_user_id,
        'super_admin_initialized',
        'super_admin_initialized',
        jsonb_build_object(
            'email', 'rahulsuranat@gmail.com',
            'role', 'super_admin',
            'initialized_at', now()
        ),
        now()
    );

    RAISE NOTICE '========================================';
    RAISE NOTICE 'SUPER ADMIN INITIALIZED SUCCESSFULLY';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Email: rahulsuranat@gmail.com';
    RAISE NOTICE 'Password: 9480413653';
    RAISE NOTICE 'IMPORTANT: User will be forced to change password on first login';
    RAISE NOTICE '========================================';

END $$;
