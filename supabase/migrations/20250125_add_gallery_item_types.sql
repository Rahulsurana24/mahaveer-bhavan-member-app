-- Add item_type column to gallery table to support posts, stories, and reels
-- This migration adds Instagram-style functionality

-- Create enum type for item types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gallery_item_type') THEN
    CREATE TYPE public.gallery_item_type AS ENUM ('post', 'story', 'reel');
  END IF;
END $$;

-- Add item_type column to gallery table
ALTER TABLE public.gallery
ADD COLUMN IF NOT EXISTS item_type public.gallery_item_type DEFAULT 'post' NOT NULL;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_gallery_item_type ON public.gallery(item_type);
CREATE INDEX IF NOT EXISTS idx_gallery_type_created ON public.gallery(item_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gallery_type_public ON public.gallery(item_type, is_approved) WHERE is_approved = true;

-- Update existing records to be 'post' type
UPDATE public.gallery
SET item_type = 'post'
WHERE item_type IS NULL;

-- Create index for stories (24-hour content query optimization)
CREATE INDEX IF NOT EXISTS idx_gallery_story_recent
ON public.gallery(item_type, created_at DESC, is_approved)
WHERE item_type = 'story' AND is_approved = true;

-- Comments
COMMENT ON COLUMN public.gallery.item_type IS 'Type of gallery item: post (normal post), story (24-hour content), reel (short video)';
COMMENT ON TYPE public.gallery_item_type IS 'Gallery content types: post, story (24h), reel (short video)';
