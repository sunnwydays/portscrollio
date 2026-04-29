import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const secretKey = process.env.SUPABASE_SECRET_KEY!;

// Browser client — uses publishable key, restricted by RLS
export const supabase = createClient(url, publishableKey);

// Server client — uses secret key, bypasses RLS. Never import this in client components.
export const supabaseAdmin = createClient(url, secretKey);
