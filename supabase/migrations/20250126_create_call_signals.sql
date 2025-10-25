-- Migration: Create call_signals table for WebRTC calling
-- Created: 2025-01-26
-- Description: Stores call signaling data for peer-to-peer WebRTC calls

-- Create call_signals table
CREATE TABLE IF NOT EXISTS public.call_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    caller_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
    call_id UUID REFERENCES public.call_signals(id),
    call_type VARCHAR(10) NOT NULL CHECK (call_type IN ('audio', 'video')),
    signal_type VARCHAR(20) NOT NULL CHECK (signal_type IN ('offer', 'answer', 'ice_candidate', 'end')),
    signal_data JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ringing', 'active', 'ended', 'declined')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_call_signals_caller_id ON public.call_signals(caller_id);
CREATE INDEX IF NOT EXISTS idx_call_signals_receiver_id ON public.call_signals(receiver_id);
CREATE INDEX IF NOT EXISTS idx_call_signals_call_id ON public.call_signals(call_id);
CREATE INDEX IF NOT EXISTS idx_call_signals_status ON public.call_signals(status);
CREATE INDEX IF NOT EXISTS idx_call_signals_created_at ON public.call_signals(created_at DESC);

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

-- Enable Row Level Security
ALTER TABLE public.call_signals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for call_signals

-- Policy: Members can view calls where they are caller or receiver
CREATE POLICY "Members can view their own calls"
    ON public.call_signals
    FOR SELECT
    USING (
        caller_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
        OR receiver_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    );

-- Policy: Members can create call signals
CREATE POLICY "Members can create call signals"
    ON public.call_signals
    FOR INSERT
    WITH CHECK (
        caller_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    );

-- Policy: Members can update their own call signals
CREATE POLICY "Members can update their own calls"
    ON public.call_signals
    FOR UPDATE
    USING (
        caller_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
        OR receiver_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    );

-- Policy: Members can delete their own call signals (cleanup)
CREATE POLICY "Members can delete their own call signals"
    ON public.call_signals
    FOR DELETE
    USING (
        caller_id IN (SELECT id FROM public.members WHERE auth_id = auth.uid())
    );

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.call_signals TO authenticated;

-- Add comment
COMMENT ON TABLE public.call_signals IS 'Stores WebRTC call signaling data for peer-to-peer audio and video calls';
COMMENT ON COLUMN public.call_signals.call_id IS 'References the original call signal ID for subsequent signals (answer, ice_candidate, end)';
COMMENT ON COLUMN public.call_signals.signal_type IS 'Type of WebRTC signal: offer (initiate), answer (accept), ice_candidate (network), end (terminate)';
COMMENT ON COLUMN public.call_signals.signal_data IS 'Contains SDP offer/answer or ICE candidate data in JSON format';
COMMENT ON COLUMN public.call_signals.status IS 'Current status of the call: pending, ringing, active, ended, declined';
