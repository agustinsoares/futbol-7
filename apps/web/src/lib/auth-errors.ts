import type { AuthError } from '@supabase/supabase-js';
import type { Dictionary } from '@/i18n/dictionaries';

export type AuthErrorKey = keyof Dictionary['auth']['errors'];

/** Traduce los códigos de error de Supabase Auth a claves del diccionario. */
export function mapAuthError(error: AuthError): AuthErrorKey {
    switch (error.code) {
        case 'invalid_credentials':
            return 'invalidCredentials';
        case 'email_not_confirmed':
            return 'emailNotConfirmed';
        case 'user_already_exists':
        case 'email_exists':
            return 'emailTaken';
        case 'weak_password':
            return 'weakPassword';
        case 'over_request_rate_limit':
        case 'over_email_send_rate_limit':
            return 'rateLimited';
        case 'email_address_invalid':
        case 'validation_failed':
            return 'invalidEmail';
        default:
            return 'generic';
    }
}
