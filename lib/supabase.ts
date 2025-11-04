import { createClient } from "@supabase/supabase-js"

// In Next.js, NEXT_PUBLIC_ variables are replaced at build time
// They're accessible as plain strings in the bundle
const supabaseUrl = 'https://sfirayzjkugowzeyuyns.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNmaXJheXpqa3Vnb3d6ZXl1eW5zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MjQ2NjksImV4cCI6MjA2NjMwMDY2OX0.UTqfwKAUmgEsdPiqjNkSwTcHvgvcAF49aJpgh9Vy70k'

// Client for frontend operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for server-side operations with full access
// Only create admin client on server side
export const supabaseAdmin = typeof window === 'undefined' && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(supabaseUrl, process.env.SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase // Fallback to regular client on browser

// Keep types for future use but not actively used now
export type SymptomQuestion = {
  QuestionNumber: number
  question_text: string
  question_type: "radio" | "slider" | "yes_no"
  options?: string[]
  min_value?: number
  max_value?: number
  labels?: string[]
  category?: string
}

export type SurveyResponse = {
  id?: number
  user_id?: string
  question_id: number
  response_value: string | number
  response_text?: string
  created_at?: string
}
