import { createClient } from '@supabase/supabase-js';

// Configuration for "Local agent" Supabase project
const PRICING_SUPABASE_URL = 'https://ylnwebtgfngnvmmkyuya.supabase.co';
const PRICING_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlsbndlYnRnZm5nbnZtbWt5dXlhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjA2OTMsImV4cCI6MjA3OTczNjY5M30.VNLZcnVgyFKdBTRkEoTyuUu_N8loHJ3Pq2Vfvxe3iC4';

export const pricingSupabase = createClient(PRICING_SUPABASE_URL, PRICING_SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  },
});

export type PricingTier = 'budget' | 'mid_range' | 'premium';

export interface MaterialPriceData {
  material_id: string;
  budget_price: number | null;
  mid_range_price: number | null;
  premium_price: number | null;
  price_date: string;
}

export interface MaterialInfo {
  id: string;
  code: string;
  name_pl: string;
  unit: string;
}

