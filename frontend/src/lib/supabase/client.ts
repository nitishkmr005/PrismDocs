import { createBrowserClient } from '@supabase/ssr'

/**
 * Create a Supabase client for use in the browser.
 * Uses environment variables for configuration.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables not configured')
    return null
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Get the Supabase client singleton for browser use.
 */
let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function getSupabase() {
  if (!supabaseClient) {
    supabaseClient = createClient()
  }
  return supabaseClient
}
