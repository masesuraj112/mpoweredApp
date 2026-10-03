import 'react-native-url-polyfill/auto'

import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database'

import { authStorage } from './supabaseStorage'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabasePublishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
console.log('URL loaded:', supabaseUrl);

export const supabase = createClient<Database>(supabaseUrl, supabasePublishableKey, {
  auth: {
    storage: authStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})