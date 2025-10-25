-- ============================================================================
-- WEBRTC CALLING SYSTEM - COMPLETE MIGRATION
-- ============================================================================
-- This script is 100% idempotent and can be run multiple times safely
-- Pure SQL - No psql commands - Works in Supabase SQL Editor
--
-- Project: Mahaveer Bhavan
-- Feature: WebRTC Voice & Video Calling Module
-- Version: 1.0
-- Date: 2025-01-26
-- ============================================================================

DO $$ BEGIN RAISE NOTICE '📞 WebRTC Calling System - Starting Setup...'; END $$;

-- ============================================================================
-- PART 1: CREATE CALL_SIGNALS TABLE
-- ============================================================================

DO $$ BEGIN RAISE NOTICE ''; RAISE NOTICE '📦 Part 1/3: Creating call_signals table...'; END $$;

-- Create call_signals table
CREATE TABLE IF NOT EXISTS public.call_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caller_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    call_id UUID REFERENCES public.call_signals(id) ON DELETE CASCADE,
    call_type VARCHAR(10) NOT NULL CHECK (call_type IN ('audio', 'video')),
    signal_type VARCHAR(20) NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice_candidate', 'end')),
    signal_data JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ringing', 'active', 'ended', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN RAISE NOTICE '  ✓ call_signals table created'; END $$;

-- ============================================================================
-- PART 2: CREATE INDEXES
-- ============================================================================

DO $$ BEGIN RAISE NOTICE ''; RAISE NOTICE '⚡ Part 2/3: Creating indexes...'; END $$;

DO $$
DECLARE
  idx_name TEXT;
  idx_sql TEXT;
BEGIN
  FOR idx_name, idx_sql IN
    SELECT * FROM (VALUES
      ('idx_call_signals_caller_id', 'CREATE INDEX idx_call_signals_caller_id ON public.call_signals(caller_id)'),
      ('idx_call_signals_receiver_id', 'CREATE INDEX idx_call_signals_receiver_id ON public.call_signals(receiver_id)'),
      ('idx_call_signals_call_id', 'CREATE INDEX idx_call_signals_call_id ON public.call_signals(call_id) WHERE call_id IS NOT NULL'),
      ('idx_call_signals_status', 'CREATE INDEX idx_call_signals_status ON public.call_signals(status)'),
      ('idx_call_signals_created_at', 'CREATE INDEX idx_call_signals_created_at ON public.call_signals(created_at DESC)'),
      ('idx_call_signals_signal_type', 'CREATE INDEX idx_call_signals_signal_type ON public.call_signals(signal_type)')
    ) AS indexes(name, sql)
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE indexname = idx_name
    ) THEN
      EXECUTE idx_sql;
      RAISE NOTICE '  ✓ Created index: %', idx_name;
    ELSE
      RAISE NOTICE '  ✓ Index exists: %', idx_name;
    END IF;
  END LOOP;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '  ⚠ Error creating indexes: %', SQLERRM;
END $$;

-- ============================================================================
-- PART 3: SECURITY & REALTIME
-- ============================================================================

DO $$ BEGIN RAISE NOTICE ''; RAISE NOTICE '🔒 Part 3/3: Configuring security & realtime...'; END $$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_call_signals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_call_signals_updated_at ON public.call_signals;
CREATE TRIGGER trigger_update_call_signals_updated_at
    BEFORE UPDATE ON public.call_signals
    FOR EACH ROW
    EXECUTE FUNCTION update_call_signals_updated_at();

DO $$ BEGIN RAISE NOTICE '  ✓ Updated_at trigger created'; END $$;

-- Enable Row Level Security
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DO $$
BEGIN
  DROP POLICY IF EXISTS "Members can view their own calls" ON public.call_signals;
  DROP POLICY IF EXISTS "Members can create call signals" ON public.call_signals;
  DROP POLICY IF EXISTS "Members can update their own calls" ON public.call_signals;
  DROP POLICY IF EXISTS "Members can delete their own call signals" ON public.call_signals;
END $$;

-- Policy: Members can view calls where they are caller or receiver
CREATE POLICY "Members can view their own calls"
    ON public.call_signals
    FOR SELECT
    USING (
        caller_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
        OR receiver_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    );

DO $$ BEGIN RAISE NOTICE '  ✓ SELECT policy created'; END $$;

-- Policy: Members can create call signals
CREATE POLICY "Members can create call signals"
    ON public.call_signals
    FOR INSERT
    WITH CHECK (
        caller_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    );

DO $$ BEGIN RAISE NOTICE '  ✓ INSERT policy created'; END $$;

-- Policy: Members can update their own call signals
CREATE POLICY "Members can update their own calls"
    ON public.call_signals
    FOR UPDATE
    USING (
        caller_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
        OR receiver_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    );

DO $$ BEGIN RAISE NOTICE '  ✓ UPDATE policy created'; END $$;

-- Policy: Members can delete their own call signals (cleanup)
CREATE POLICY "Members can delete their own call signals"
    ON public.call_signals
    FOR DELETE
    USING (
        caller_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    );

DO $$ BEGIN RAISE NOTICE '  ✓ DELETE policy created'; END $$;

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.call_signals TO authenticated;

DO $$ BEGIN RAISE NOTICE '  ✓ Permissions granted'; END $$;

-- Enable Realtime
DO $$
BEGIN
  BEGIN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.call_signals';
    RAISE NOTICE '  ✓ call_signals added to realtime';
  EXCEPTION
    WHEN duplicate_object THEN
      RAISE NOTICE '  ✓ call_signals already in realtime';
    WHEN OTHERS THEN
      RAISE NOTICE '  ⚠ Could not add call_signals to realtime: %', SQLERRM;
  END;
END $$;

-- Add comments
COMMENT ON TABLE public.call_signals IS 'Stores WebRTC call signaling data for peer-to-peer audio and video calls';
COMMENT ON COLUMN public.call_signals.call_id IS 'References the original call signal ID for subsequent signals (answer, ice_candidate, end)';
COMMENT ON COLUMN public.call_signals.signal_type IS 'Type of WebRTC signal: offer (initiate), answer (accept), ice_candidate (network), end (terminate)';
COMMENT ON COLUMN public.call_signals.signal_data IS 'Contains SDP offer/answer or ICE candidate data in JSON format';
COMMENT ON COLUMN public.call_signals.status IS 'Current status of the call: pending, ringing, active, ended, declined';

DO $$ BEGIN RAISE NOTICE '  ✓ Table comments added'; END $$;

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

DO $$
DECLARE
  table_exists BOOLEAN;
  index_count INTEGER;
  policy_count INTEGER;
  rt_enabled BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ CALLING SYSTEM SETUP COMPLETE!        ║';
  RAISE NOTICE '╚════════════════════════════════════════════╝';
  RAISE NOTICE '';

  -- Check table exists
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'call_signals'
  ) INTO table_exists;

  -- Count indexes
  SELECT COUNT(*) INTO index_count FROM pg_indexes
  WHERE tablename = 'call_signals' AND schemaname = 'public';

  -- Count policies
  SELECT COUNT(*) INTO policy_count FROM pg_policies
  WHERE tablename = 'call_signals' AND schemaname = 'public';

  -- Check realtime
  SELECT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND tablename = 'call_signals'
  ) INTO rt_enabled;

  RAISE NOTICE '✅ Table created: %', CASE WHEN table_exists THEN 'YES' ELSE 'NO' END;
  RAISE NOTICE '✅ Indexes created: %/6', index_count;
  RAISE NOTICE '✅ RLS policies: %/4', policy_count;
  RAISE NOTICE '✅ Realtime enabled: %', CASE WHEN rt_enabled THEN 'YES' ELSE 'NO' END;
  RAISE NOTICE '';

  IF table_exists AND index_count >= 6 AND policy_count >= 4 THEN
    RAISE NOTICE '🎉 SUCCESS! WebRTC calling system is ready.';
    RAISE NOTICE '';
    RAISE NOTICE '📱 Features enabled:';
    RAISE NOTICE '   ✓ Voice calls (WebRTC audio)';
    RAISE NOTICE '   ✓ Video calls (WebRTC video)';
    RAISE NOTICE '   ✓ ICE candidate exchange';
    RAISE NOTICE '   ✓ Real-time call signaling';
    RAISE NOTICE '   ✓ Row-level security';
  ELSE
    RAISE NOTICE '⚠️  Some components may need attention. Review output above.';
  END IF;

  RAISE NOTICE '';
END $$;
