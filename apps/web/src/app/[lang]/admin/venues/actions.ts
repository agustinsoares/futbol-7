'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { DEFAULT_LOCALE, isLocale, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export type VenueErrorKey = keyof Dictionary['admin']['errors'];
export type VenueField = 'name' | 'address' | 'area' | 'coords';

export interface VenueFormState {
    error?: VenueErrorKey;
    fieldErrors?: Partial<Record<VenueField, VenueErrorKey>>;
    values?: Record<string, string>;
}

const coordinate = (min: number, max: number) =>
    z.preprocess((v) => Number(String(v).replace(',', '.')), z.number().min(min).max(max));

const schema = z.object({
    name: z.string().trim().min(2).max(120),
    address: z.string().trim().min(2).max(200),
    area: z.string().trim().min(2).max(60),
    lat: coordinate(-90, 90),
    lng: coordinate(-180, 180),
    surface: z.enum(['artificial_turf', 'grass', 'indoor']),
    notes: z.string().trim().max(500),
});

function readLocale(formData: FormData): Locale {
    const lang = String(formData.get('lang') ?? '');
    return isLocale(lang) ? lang : DEFAULT_LOCALE;
}

function values(formData: FormData): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [k, v] of formData) if (typeof v === 'string' && !k.startsWith('$')) out[k] = v;
    return out;
}

export async function saveVenueAction(_prev: VenueFormState, formData: FormData): Promise<VenueFormState> {
    const locale = readLocale(formData);
    const venueId = String(formData.get('venueId') ?? '');
    const parsed = schema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
        const fieldErrors: VenueFormState['fieldErrors'] = {};
        for (const issue of parsed.error.issues) {
            const key = String(issue.path[0]);
            if (key === 'name') fieldErrors.name = 'name';
            else if (key === 'address' || key === 'area') fieldErrors[key] = 'required';
            else if (key === 'lat' || key === 'lng') fieldErrors.coords = 'coords';
        }
        return { fieldErrors, values: values(formData) };
    }

    const supabase = await createSupabaseServerClient();
    const row = {
        name: parsed.data.name,
        address: parsed.data.address,
        area: parsed.data.area,
        lat: parsed.data.lat,
        lng: parsed.data.lng,
        surface: parsed.data.surface,
        has_changing_rooms: formData.get('changingRooms') === 'on',
        has_lights: formData.get('lights') === 'on',
        notes: parsed.data.notes || null,
    };
    const { data, error } = venueId
        ? await supabase.from('venues').update(row).eq('id', venueId).select('id')
        : await supabase.from('venues').insert(row).select('id');

    if (error) {
        const key: VenueErrorKey = error.code === '23505' ? 'duplicate' : 'generic';
        return { error: key, values: values(formData) };
    }
    if (!data?.length) return { error: 'generic', values: values(formData) };

    revalidatePath(`/${locale}/admin/venues`);
    revalidatePath(`/${locale}/matches`);
    redirect(`/${locale}/admin/venues`);
}

export async function deleteVenueAction(_prev: VenueFormState, formData: FormData): Promise<VenueFormState> {
    const locale = readLocale(formData);
    const venueId = z.string().uuid().safeParse(formData.get('venueId'));
    if (!venueId.success) return { error: 'generic' };

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from('venues').delete().eq('id', venueId.data);
    // 23503: hay partidos que usan esta cancha (on delete restrict).
    if (error) return { error: error.code === '23503' ? 'inUse' : 'generic' };

    revalidatePath(`/${locale}/admin/venues`);
    redirect(`/${locale}/admin/venues`);
}
