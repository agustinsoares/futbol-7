'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

interface MenuUser {
    id: string;
    name: string;
}

function initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    return (
        ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase() || '?'
    );
}

/**
 * Menú de cuenta. Es un Client Component para que las páginas públicas sigan siendo estáticas:
 * la sesión se lee en el navegador.
 */
export default function UserMenu({ locale, dict }: { locale: Locale; dict: Dictionary['userMenu'] }) {
    const pathname = usePathname() ?? `/${locale}`;
    const router = useRouter();
    const [user, setUser] = useState<MenuUser | null | undefined>(undefined);
    const detailsRef = useRef<HTMLDetailsElement>(null);
    const configured = !!process.env.NEXT_PUBLIC_SUPABASE_URL;

    // El login y el logout ocurren en el servidor (Server Actions) y el header no se vuelve a
    // montar al navegar, así que releemos la sesión de las cookies en cada cambio de ruta.
    useEffect(() => {
        if (!configured) return;
        let cancelled = false;
        const supabase = createSupabaseBrowserClient();

        async function load() {
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();
            if (!authUser) {
                if (!cancelled) setUser(null);
                return;
            }
            const { data } = await supabase
                .from('profiles')
                .select('full_name')
                .eq('id', authUser.id)
                .maybeSingle();
            if (!cancelled) setUser({ id: authUser.id, name: data?.full_name || authUser.email || '' });
        }

        load();
        const { data: sub } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') load();
        });
        return () => {
            cancelled = true;
            sub.subscription.unsubscribe();
        };
    }, [configured, pathname]);

    // Cierra el menú al navegar.
    useEffect(() => {
        detailsRef.current?.removeAttribute('open');
    }, [pathname]);

    if (!configured || user === undefined) {
        return <span className="inline-block h-9 w-9" aria-hidden="true" />;
    }

    if (user === null) {
        const loginHref = `/${locale}/login?next=${encodeURIComponent(pathname)}`;
        return (
            <Link
                href={loginHref}
                className="rounded-lg bg-primary-strong px-3 py-2 text-sm font-semibold whitespace-nowrap text-white transition-colors hover:bg-primary sm:px-4"
            >
                {dict.signIn}
            </Link>
        );
    }

    // Cerramos sesión en el navegador: borra las cookies y el token en memoria del cliente.
    async function signOut() {
        await createSupabaseBrowserClient().auth.signOut();
        setUser(null);
        router.push(`/${locale}`);
        router.refresh();
    }

    const itemClass = 'block px-4 py-2 text-sm hover:bg-surface';
    return (
        <details ref={detailsRef} className="relative">
            <summary
                aria-label={dict.open}
                className="flex h-9 w-9 cursor-pointer list-none items-center justify-center rounded-full bg-primary text-sm font-bold text-white [&::-webkit-details-marker]:hidden"
            >
                {initials(user.name)}
            </summary>
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-xl border border-black/10 bg-white py-1 text-charcoal shadow-lg">
                <p className="truncate border-b border-black/5 px-4 py-2 text-sm font-semibold">
                    {user.name}
                </p>
                <Link href={`/${locale}/matches/new`} className={itemClass}>
                    {dict.hostMatch}
                </Link>
                <Link href={`/${locale}/my-matches`} className={itemClass}>
                    {dict.myMatches}
                </Link>
                <Link href={`/${locale}/profile`} className={itemClass}>
                    {dict.profile}
                </Link>
                <div className="border-t border-black/5">
                    <button type="button" onClick={signOut} className={`${itemClass} w-full text-left`}>
                        {dict.signOut}
                    </button>
                </div>
            </div>
        </details>
    );
}
