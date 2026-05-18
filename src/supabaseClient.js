import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://bymsgweaglwsxpbcccur.supabase.co';
const supabaseAnonKey = 'sb_publishable_jNz_TOplejRkmlE-MbzJYA_lfKv0q2T';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);