import { Database } from '@/lib/types/database.types'
import { createBrowserClient } from '@supabase/ssr'

export function supabaseclient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}