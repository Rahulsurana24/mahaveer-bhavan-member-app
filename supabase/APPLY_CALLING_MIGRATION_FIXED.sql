-- ============================================================================
-- WEBRTC CALLING SYSTEM - COMPLETE MIGRATION (FIXED FOR TEXT IDs)
-- ============================================================================

DO $$ BEGIN RAISE NOTICE '📞 WebRTC Calling System - Starting Setup...'; END $$;

-- Drop table if exists (for clean re-run)
DROP TABLE IF EXISTS public.call_signals CASCADE;

DO $$ BEGIN RAISE NOTICE '📦 Creating call_signals table...'; END $$;

-- Create call_signals table with TEXT member ids
CREATE TABLE public.call_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caller_id TEXT NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    receiver_id TEXT NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    call_id UUID REFERENCES public.call_signals(id) ON DELETE CASCADE,
    call_type VARCHAR(10) NOT NULL CHECK (call_type IN ('audio', 'video')),
    signal_type VARCHAR(20) NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice_candidate', 'end')),
    signal_data JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ringing', 'active', 'ended', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$ BEGIN RAISE NOTICE '  ✓ call_signals table created'; END $$;

-- Create indexes
CREATE INDEX idx_call_signals_caller_id ON public.call_signals(caller_id);
CREATE INDEX idx_call_signals_receiver_id ON public.call_signals(receiver_id);
CREATE INDEX idx_call_signals_call_id ON public.call_signals(call_id) WHERE call_id IS NOT NULL;
CREATE INDEX idx_call_signals_status ON public.call_signals(status);
CREATE INDEX idx_call_signals_created_at ON public.call_signals(created_at DESC);
CREATE INDEX idx_call_signals_signal_type ON public.call_signals(signal_type);

DO $$ BEGIN RAISE NOTICE '  ✓ Indexes created'; END $$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_call_signals_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_call_signals_updated_at
    BEFORE UPDATE ON public.call_signals
    FOR EACH ROW
    EXECUTE FUNCTION update_call_signals_updated_at();

DO $$ BEGIN RAISE NOTICE '  ✓ Updated_at trigger created'; END $$;

-- Enable Row Level Security
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Members can view their own calls"
    ON public.call_signals
    FOR SELECT
    USING (
        caller_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
        OR receiver_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    );

CREATE POLICY "Members can create call signals"
    ON public.call_signals
    FOR INSERT
    WITH CHECK (
        caller_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    );

CREATE POLICY "Members can update their own calls"
    ON public.call_signals
    FOR UPDATE
    USING (
        caller_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
        OR receiver_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    );

CREATE POLICY "Members can delete their own call signals"
    ON public.call_signals
    FOR DELETE
    USING (
        caller_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    );

DO $$ BEGIN RAISE NOTICE '  ✓ RLS policies created'; END $$;

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
COMMENT ON COLUMN public.call_signals.call_id IS 'References the original call signal ID for subsequent signals';
COMMENT ON COLUMN public.call_signals.signal_type IS 'Type of WebRTC signal: offer, answer, ice_candidate, end';
COMMENT ON COLUMN public.call_signals.signal_data IS 'Contains SDP offer/answer or ICE candidate data in JSON format';
COMMENT ON COLUMN public.call_signals.status IS 'Current status: pending, ringing, active, ended, declined';

DO $$ BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '╔════════════════════════════════════════════╗';
  RAISE NOTICE '║  ✅ CALLING SYSTEM SETUP COMPLETE!        ║';
  RAISE NOTICE '╚════════════════════════════════════════════╝';
  RAISE NOTICE '';
  RAISE NOTICE '🎉 WebRTC calling system is ready!';
  RAISE NOTICE '   ✓ Voice calls enabled';
  RAISE NOTICE '   ✓ Video calls enabled';
  RAISE NOTICE '   ✓ Real-time signaling active';
END $$;
