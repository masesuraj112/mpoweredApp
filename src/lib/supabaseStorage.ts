import type { SupportedStorage } from '@supabase/supabase-js'

// Web build (including Expo Router's server render pass, where `window`
// doesn't exist): let supabase-js pick its own storage. It already checks
// for a real browser localStorage and falls back to an in-memory adapter
// otherwise, so referencing `localStorage` here ourselves would just
// duplicate that check and crash during SSR.
export const authStorage: SupportedStorage | undefined = undefined
