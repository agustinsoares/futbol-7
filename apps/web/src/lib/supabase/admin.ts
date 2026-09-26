import 'server-only';
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Cliente con la clave secreta (salta RLS). Solo para tareas del servidor como el cron.
 * Nunca importarlo desde código que llegue al navegador.
 */
export function createSupabaseAdminClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!url || !secretKey) return null;
    return createClient<Database>(url, secretKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });
}
