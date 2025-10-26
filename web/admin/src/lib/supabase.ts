import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// Type definitions for Database (simplified - extend as needed)
export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          auth_id: string
          full_name: string
          email: string
          mobile: string
          role_id: string
          membership_type: string
          photo_url: string | null
          created_at: string
          updated_at: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string
          event_type: string
          start_datetime: string
          end_datetime: string
          location: string
          registration_fee: number
          created_at: string
        }
      }
      gallery: {
        Row: {
          id: string
          media_url: string
          media_type: string
          caption: string | null
          item_type: string
          is_approved: boolean
          member_id: string
          created_at: string
        }
      }
    }
  }
}
