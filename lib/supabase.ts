import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Client for frontend operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for server-side operations with full access
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

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
