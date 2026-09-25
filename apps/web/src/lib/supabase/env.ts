export interface SupabaseEnv {
    url: string;
    publishableKey: string;
}

/** Devuelve la configuración pública de Supabase, o null si no está configurada. */
export function supabaseEnv(): SupabaseEnv | null {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!url || !publishableKey) return null;
    return { url, publishableKey };
}
