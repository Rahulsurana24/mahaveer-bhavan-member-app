-- =====================================================
-- ADD MISSING TABLES (Corrected for existing schema)
-- Created: 2025-01-25
-- Note: members.id is TEXT type in this schema
-- =====================================================

-- 1. AI Conversations Table (NEW)
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON public.ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_created_at ON public.ai_conversations(created_at DESC);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own AI conversations" ON public.ai_conversations;
CREATE POLICY "Users can view their own AI conversations"
    ON public.ai_conversations FOR SELECT
    USING (auth.uid() IN (
        SELECT auth_id FROM public.members WHERE id = user_id
    ));

DROP POLICY IF EXISTS "Users can insert their own AI conversations" ON public.ai_conversations;
CREATE POLICY "Users can insert their own AI conversations"
    ON public.ai_conversations FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT auth_id FROM public.members WHERE id = user_id
    ));

-- 2. Item Distributions Table (NEW)
CREATE TABLE IF NOT EXISTS public.item_distributions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id TEXT NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
    item_type TEXT NOT NULL,
    distributed_by UUID NOT NULL REFERENCES public.user_profiles(auth_id) ON DELETE RESTRICT,
    distributed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_item_distributions_member ON public.item_distributions(member_id);
CREATE INDEX IF NOT EXISTS idx_item_distributions_event ON public.item_distributions(event_id);
CREATE INDEX IF NOT EXISTS idx_item_distributions_date ON public.item_distributions(distributed_at DESC);

ALTER TABLE public.item_distributions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Members can view their own distributions" ON public.item_distributions;
CREATE POLICY "Members can view their own distributions"
    ON public.item_distributions FOR SELECT
    USING (auth.uid() IN (
        SELECT auth_id FROM public.members WHERE id = member_id
    ) OR auth.uid() IN (
        SELECT auth_id FROM public.user_profiles WHERE role_id IN (
            SELECT id FROM public.user_roles WHERE name IN ('admin', 'superadmin', 'super_admin', 'partial_admin')
        )
    ));

DROP POLICY IF EXISTS "Admins can insert distributions" ON public.item_distributions;
CREATE POLICY "Admins can insert distributions"
    ON public.item_distributions FOR INSERT
    WITH CHECK (auth.uid() IN (
        SELECT auth_id FROM public.user_profiles WHERE role_id IN (
            SELECT id FROM public.user_roles WHERE name IN ('admin', 'superadmin', 'super_admin', 'partial_admin')
        )
    ));

-- =====================================================
-- UPDATE EXISTING TABLES (Add only missing columns)
-- =====================================================

-- Check and add columns to gallery_likes if missing
DO $$
BEGIN
    -- Check if gallery_likes has correct schema
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='gallery_likes' AND column_name='gallery_item_id') THEN
        -- Need to recreate or fix gallery_likes table
        ALTER TABLE IF EXISTS public.gallery_likes
        ADD COLUMN IF NOT EXISTS gallery_item_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='gallery_likes' AND column_name='member_id') THEN
        ALTER TABLE IF EXISTS public.gallery_likes
        ADD COLUMN IF NOT EXISTS member_id TEXT;
    END IF;
END $$;

-- Check and add columns to gallery_comments if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='gallery_comments' AND column_name='gallery_item_id') THEN
        ALTER TABLE IF EXISTS public.gallery_comments
        ADD COLUMN IF NOT EXISTS gallery_item_id UUID;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='gallery_comments' AND column_name='member_id') THEN
        ALTER TABLE IF EXISTS public.gallery_comments
        ADD COLUMN IF NOT EXISTS member_id TEXT;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='gallery_comments' AND column_name='comment_text') THEN
        ALTER TABLE IF EXISTS public.gallery_comments
        ADD COLUMN IF NOT EXISTS comment_text TEXT;
    END IF;
END $$;

-- Update user_profiles table (add missing columns)
ALTER TABLE public.user_profiles
ADD COLUMN IF NOT EXISTS fcm_token TEXT,
ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{
    "event_reminders": true,
    "messages": true,
    "gallery_updates": true,
    "administrative": true
}'::jsonb,
ADD COLUMN IF NOT EXISTS language_preference TEXT DEFAULT 'en';

CREATE INDEX IF NOT EXISTS idx_user_profiles_fcm_token ON public.user_profiles(fcm_token) WHERE fcm_token IS NOT NULL;

-- Update system_settings table (add missing columns)
ALTER TABLE public.system_settings
ADD COLUMN IF NOT EXISTS trust_name TEXT DEFAULT 'Mahaveer Bhavan',
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS primary_color TEXT DEFAULT '#0F766E',
ADD COLUMN IF NOT EXISTS primary_email TEXT,
ADD COLUMN IF NOT EXISTS primary_phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS website_url TEXT,
ADD COLUMN IF NOT EXISTS razorpay_key_id TEXT,
ADD COLUMN IF NOT EXISTS razorpay_secret TEXT,
ADD COLUMN IF NOT EXISTS razorpay_test_mode BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS bank_name TEXT,
ADD COLUMN IF NOT EXISTS bank_account_number TEXT,
ADD COLUMN IF NOT EXISTS bank_ifsc TEXT,
ADD COLUMN IF NOT EXISTS bank_account_holder TEXT,
ADD COLUMN IF NOT EXISTS maintenance_mode BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS require_photo_on_registration BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS auto_approve_gallery BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS max_upload_size_mb INTEGER DEFAULT 10,
ADD COLUMN IF NOT EXISTS fcm_server_key TEXT,
ADD COLUMN IF NOT EXISTS email_service_api_key TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_business_api_key TEXT;

-- Update audit_logs table (add missing columns)
ALTER TABLE public.audit_logs
ADD COLUMN IF NOT EXISTS user_id UUID,
ADD COLUMN IF NOT EXISTS action_type TEXT,
ADD COLUMN IF NOT EXISTS target_type TEXT,
ADD COLUMN IF NOT EXISTS target_id UUID,
ADD COLUMN IF NOT EXISTS details JSONB,
ADD COLUMN IF NOT EXISTS ip_address TEXT;

CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target ON public.audit_logs(target_type, target_id);

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
    INSERT INTO public.audit_logs (user_id, action_type, target_type, target_id, details, ip_address, created_at)
    VALUES (p_user_id, p_action_type, p_target_type, p_target_id, p_details, p_ip_address, now())
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

-- Grant permissions
GRANT SELECT, INSERT ON public.ai_conversations TO authenticated;
GRANT SELECT ON public.item_distributions TO authenticated;
GRANT INSERT ON public.item_distributions TO authenticated;

COMMENT ON TABLE public.ai_conversations IS 'Stores conversation history with Dharma AI Assistant';
COMMENT ON TABLE public.item_distributions IS 'Tracks distribution of items at events';
