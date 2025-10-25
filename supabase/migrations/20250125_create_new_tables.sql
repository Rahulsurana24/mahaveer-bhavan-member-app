-- =====================================================
-- SREE MAHAVEER SEVA - NEW TABLES MIGRATION
-- Created: 2025-01-25
-- Purpose: Add new tables for complete ecosystem functionality
-- =====================================================

-- 1. AI Conversations Table
-- Stores chat history between members and Dharma AI Assistant
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Indexes for performance
    CONSTRAINT ai_conversations_pkey PRIMARY KEY (id)
);

CREATE INDEX idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX idx_ai_conversations_created_at ON public.ai_conversations(created_at DESC);

-- Row Level Security
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own AI conversations"
    ON public.ai_conversations FOR SELECT
    USING (auth.uid() IN (
        SELECT auth_id FROM public.members WHERE id = user_id
    ));

CREATE POLICY "Users can insert their own AI conversations"
    ON public.ai_conversations FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT auth_id FROM public.members WHERE id = user_id
    ));

-- 2. Gallery Likes Table
-- Stores likes on gallery posts
CREATE TABLE IF NOT EXISTS public.gallery_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_item_id UUID NOT NULL REFERENCES public.gallery_items(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Unique constraint: one like per user per post
    CONSTRAINT gallery_likes_unique UNIQUE (gallery_item_id, member_id)
);

CREATE INDEX idx_gallery_likes_item ON public.gallery_likes(gallery_item_id);
CREATE INDEX idx_gallery_likes_member ON public.gallery_likes(member_id);

ALTER TABLE public.gallery_likes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view likes on public gallery items"
    ON public.gallery_likes FOR SELECT
    USING (true);

CREATE POLICY "Users can like gallery items"
    ON public.gallery_likes FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT auth_id FROM public.members WHERE id = member_id
    ));

CREATE POLICY "Users can unlike their own likes"
    ON public.gallery_likes FOR DELETE
    USING (auth.uid() IN (
        SELECT auth_id FROM public.members WHERE id = member_id
    ));

-- 3. Gallery Comments Table
-- Stores comments on gallery posts
CREATE TABLE IF NOT EXISTS public.gallery_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gallery_item_id UUID NOT NULL REFERENCES public.gallery_items(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    comment_text TEXT NOT NULL CHECK (char_length(comment_text) <= 500),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE INDEX idx_gallery_comments_item ON public.gallery_comments(gallery_item_id);
CREATE INDEX idx_gallery_comments_member ON public.gallery_comments(member_id);
CREATE INDEX idx_gallery_comments_created_at ON public.gallery_comments(created_at DESC);

ALTER TABLE public.gallery_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view comments on public gallery items"
    ON public.gallery_comments FOR SELECT
    USING (true);

CREATE POLICY "Users can post comments"
    ON public.gallery_comments FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT auth_id FROM public.members WHERE id = member_id
    ));

CREATE POLICY "Users can update their own comments"
    ON public.gallery_comments FOR UPDATE
    USING (auth.uid() IN (
        SELECT auth_id FROM public.members WHERE id = member_id
    ));

CREATE POLICY "Users can delete their own comments"
    ON public.gallery_comments FOR DELETE
    USING (auth.uid() IN (
        SELECT auth_id FROM public.members WHERE id = member_id
    ));

-- 4. Item Distributions Table
-- Tracks distribution of items (gift bags, prasad, etc.) at events
CREATE TABLE IF NOT EXISTS public.item_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    item_type TEXT NOT NULL,
    distributed_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    distributed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT
);

CREATE INDEX idx_item_distributions_member ON public.item_distributions(member_id);
CREATE INDEX idx_item_distributions_event ON public.item_distributions(event_id);
CREATE INDEX idx_item_distributions_date ON public.item_distributions(distributed_at DESC);

ALTER TABLE public.item_distributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view their own distributions"
    ON public.item_distributions FOR SELECT
    USING (auth.uid() IN (
        SELECT auth_id FROM public.members WHERE id = member_id
    ) OR auth.uid() IN (
        SELECT id FROM public.user_profiles WHERE role_id IN (
            SELECT id FROM public.user_roles WHERE name IN ('admin', 'super_admin', 'partial_admin')
        )
    ));

CREATE POLICY "Admins can insert distributions"
    ON public.item_distributions FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT id FROM public.user_profiles WHERE role_id IN (
            SELECT id FROM public.user_roles WHERE name IN ('admin', 'super_admin', 'partial_admin')
        )
    ));

-- 5. Calendar Holidays Table
-- Stores marked holidays with notifications
CREATE TABLE IF NOT EXISTS public.calendar_holidays (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    target_audience TEXT[] DEFAULT ARRAY['all'],
    created_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_calendar_holidays_date ON public.calendar_holidays(date);
CREATE INDEX idx_calendar_holidays_created_by ON public.calendar_holidays(created_by);

ALTER TABLE public.calendar_holidays ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view holidays"
    ON public.calendar_holidays FOR SELECT
    USING (true);

CREATE POLICY "Admins can create holidays"
    ON public.calendar_holidays FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT id FROM public.user_profiles WHERE role_id IN (
            SELECT id FROM public.user_roles WHERE name IN ('admin', 'super_admin', 'partial_admin')
        )
    ));

CREATE POLICY "Admins can update holidays"
    ON public.calendar_holidays FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM public.user_profiles WHERE role_id IN (
            SELECT id FROM public.user_roles WHERE name IN ('admin', 'super_admin', 'partial_admin')
        )
    ));

CREATE POLICY "Admins can delete holidays"
    ON public.calendar_holidays FOR DELETE
    USING (auth.uid() IN (
        SELECT id FROM public.user_profiles WHERE role_id IN (
            SELECT id FROM public.user_roles WHERE name IN ('admin', 'super_admin')
        )
    ));

-- 6. Calendar Overrides Table
-- Stores admin overrides for Upavas/Biyashna schedule
CREATE TABLE IF NOT EXISTS public.calendar_overrides (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('Upavas', 'Biyashna')),
    notes TEXT,
    created_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE RESTRICT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Unique constraint: one override per date
    CONSTRAINT calendar_overrides_date_unique UNIQUE (date)
);

CREATE INDEX idx_calendar_overrides_date ON public.calendar_overrides(date);

ALTER TABLE public.calendar_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view calendar overrides"
    ON public.calendar_overrides FOR SELECT
    USING (true);

CREATE POLICY "Admins can create overrides"
    ON public.calendar_overrides FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT id FROM public.user_profiles WHERE role_id IN (
            SELECT id FROM public.user_roles WHERE name IN ('admin', 'super_admin', 'partial_admin')
        )
    ));

CREATE POLICY "Admins can update overrides"
    ON public.calendar_overrides FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM public.user_profiles WHERE role_id IN (
            SELECT id FROM public.user_roles WHERE name IN ('admin', 'super_admin', 'partial_admin')
        )
    ));

-- 7. System Settings Table
-- Stores global app configuration (branding, payments, etc.)
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Branding
    trust_name TEXT DEFAULT 'Mahaveer Bhavan',
    logo_url TEXT,
    primary_color TEXT DEFAULT '#0F766E',

    -- Contact Information
    primary_email TEXT,
    primary_phone TEXT,
    address TEXT,
    website_url TEXT,

    -- Payment Gateway Configuration (encrypted)
    razorpay_key_id TEXT,
    razorpay_secret TEXT,
    razorpay_test_mode BOOLEAN DEFAULT true,

    -- Bank Details for Offline Payments
    bank_name TEXT,
    bank_account_number TEXT,
    bank_ifsc TEXT,
    bank_account_holder TEXT,

    -- App Behavior Settings
    maintenance_mode BOOLEAN DEFAULT false,
    require_photo_on_registration BOOLEAN DEFAULT true,
    auto_approve_gallery BOOLEAN DEFAULT false,
    max_upload_size_mb INTEGER DEFAULT 10,

    -- Firebase/Notification Settings
    fcm_server_key TEXT,
    email_service_api_key TEXT,
    whatsapp_business_api_key TEXT,

    -- Metadata
    updated_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,

    -- Ensure only one settings record exists
    CONSTRAINT single_settings_row CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid)
);

-- Insert default settings row
INSERT INTO public.system_settings (id, trust_name, primary_color)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, 'Mahaveer Bhavan', '#0F766E')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view system settings"
    ON public.system_settings FOR SELECT
    USING (true);

CREATE POLICY "Only super admins can update system settings"
    ON public.system_settings FOR UPDATE
    USING (auth.uid() IN (
        SELECT id FROM public.user_profiles WHERE role_id IN (
            SELECT id FROM public.user_roles WHERE name = 'super_admin'
        )
    ));

-- 8. Audit Logs Table
-- Comprehensive activity logging for security and compliance
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    target_type TEXT,
    target_id UUID,
    details JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON public.audit_logs(action_type);
CREATE INDEX idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_target ON public.audit_logs(target_type, target_id);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can view audit logs"
    ON public.audit_logs FOR SELECT
    USING (auth.uid() IN (
        SELECT id FROM public.user_profiles WHERE role_id IN (
            SELECT id FROM public.user_roles WHERE name IN ('admin', 'super_admin')
        )
    ));

CREATE POLICY "System can insert audit logs"
    ON public.audit_logs FOR INSERT
    WITH CHECK (true);

-- =====================================================
-- UPDATE EXISTING TABLES
-- =====================================================

-- Update gallery_items table
ALTER TABLE public.gallery_items
ADD COLUMN IF NOT EXISTS moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
ADD COLUMN IF NOT EXISTS reviewed_by UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_gallery_items_moderation_status ON public.gallery_items(moderation_status);

-- Update user_profiles table
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS fcm_token TEXT,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
    "event_reminders": true,
    "messages": true,
    "gallery_updates": true,
    "administrative": true
}'::jsonb,
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en' CHECK (language_preference IN ('en', 'hi'));

CREATE INDEX IF NOT EXISTS idx_user_profiles_fcm_token ON public.user_profiles(fcm_token) WHERE fcm_token IS NOT NULL;

-- Update members table
ALTER TABLE public.members
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

CREATE INDEX IF NOT EXISTS idx_members_is_active ON public.members(is_active);

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- Function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
    p_user_id UUID,
    p_action_type TEXT,
    p_target_type TEXT DEFAULT NULL,
    p_target_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL,
    p_ip_address TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
BEGIN
    INSERT INTO public.audit_logs (user_id, action_type, target_type, target_id, details, ip_address)
    VALUES (p_user_id, p_action_type, p_target_type, p_target_id, p_details, p_ip_address)
    RETURNING id INTO v_audit_id;

    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get gallery item with engagement stats
CREATE OR REPLACE FUNCTION public.get_gallery_item_stats(p_item_id UUID)
RETURNS TABLE (
    likes_count BIGINT,
    comments_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM public.gallery_likes WHERE gallery_item_id = p_item_id) AS likes_count,
        (SELECT COUNT(*) FROM public.gallery_comments WHERE gallery_item_id = p_item_id) AS comments_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- TRIGGERS FOR AUTO-UPDATED TIMESTAMPS
-- =====================================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to system_settings
DROP TRIGGER IF EXISTS update_system_settings_updated_at ON public.system_settings;
CREATE TRIGGER update_system_settings_updated_at
    BEFORE UPDATE ON public.system_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Apply to gallery_comments
DROP TRIGGER IF EXISTS update_gallery_comments_updated_at ON public.gallery_comments;
CREATE TRIGGER update_gallery_comments_updated_at
    BEFORE UPDATE ON public.gallery_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT SELECT ON public.ai_conversations TO authenticated;
GRANT INSERT ON public.ai_conversations TO authenticated;

GRANT SELECT ON public.gallery_likes TO authenticated;
GRANT INSERT, DELETE ON public.gallery_likes TO authenticated;

GRANT SELECT ON public.gallery_comments TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_comments TO authenticated;

GRANT SELECT ON public.item_distributions TO authenticated;

GRANT SELECT ON public.calendar_holidays TO authenticated;
GRANT SELECT ON public.calendar_overrides TO authenticated;

GRANT SELECT ON public.system_settings TO authenticated;

-- Admin-only tables
GRANT SELECT ON public.audit_logs TO authenticated;

COMMENT ON TABLE public.ai_conversations IS 'Stores conversation history with Dharma AI Assistant';
COMMENT ON TABLE public.gallery_likes IS 'Tracks likes on gallery posts';
COMMENT ON TABLE public.gallery_comments IS 'Stores comments on gallery posts';
COMMENT ON TABLE public.item_distributions IS 'Tracks distribution of items at events';
COMMENT ON TABLE public.calendar_holidays IS 'Stores marked holidays';
COMMENT ON TABLE public.calendar_overrides IS 'Stores admin overrides for Upavas/Biyashna';
COMMENT ON TABLE public.system_settings IS 'Global application configuration';
COMMENT ON TABLE public.audit_logs IS 'Comprehensive activity logging';
