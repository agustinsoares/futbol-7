'use client';

import { useActionState } from 'react';
import { Alert, buttonStyles, Field, Input, Select } from '@/components/ui';
import { LOCALE_NAMES, LOCALES, type Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import type { Profile } from '@/lib/auth';
import { saveProfileAction, type ProfileFormState } from './actions';

interface ProfileFormProps {
    locale: Locale;
    profile: Profile;
    email: string | null;
    next: string | null;
    initiallySaved: boolean;
    dict: Pick<Dictionary, 'profile' | 'levels'>;
}

export default function ProfileForm({
    locale,
    profile,
    email,
    next,
    initiallySaved,
    dict,
}: ProfileFormProps) {
    const t = dict.profile;
    const [state, action, pending] = useActionState<ProfileFormState, FormData>(
        saveProfileAction,
        initiallySaved ? { saved: true } : {},
    );

    return (
        <form action={action} className="space-y-5">
            {state.saved && <Alert tone="success">{t.saved}</Alert>}
            {state.error === 'generic' && <Alert tone="error">{t.errors.generic}</Alert>}
            <input type="hidden" name="lang" value={locale} />
            {next && <input type="hidden" name="next" value={next} />}

            <Field
                label={t.fullName}
                htmlFor="fullName"
                error={state.error === 'nameRequired' ? t.errors.nameRequired : undefined}
            >
                <Input
                    id="fullName"
                    name="fullName"
                    defaultValue={profile.full_name}
                    autoComplete="name"
                    required
                    maxLength={80}
                    aria-invalid={state.error === 'nameRequired'}
                />
            </Field>
            {email && (
                <Field label={t.email} htmlFor="email">
                    <Input id="email" value={email} readOnly disabled />
                </Field>
            )}
            <div className="grid gap-5 sm:grid-cols-2">
                <Field label={t.skillLevel} htmlFor="skillLevel">
                    <Select
                        id="skillLevel"
                        name="skillLevel"
                        defaultValue={profile.skill_level ?? ''}
                        required
                    >
                        <option value="" disabled>
                            {t.choose}
                        </option>
                        {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                            <option key={level} value={level}>
                                {dict.levels[level]}
                            </option>
                        ))}
                    </Select>
                </Field>
                <Field label={t.position} htmlFor="position">
                    <Select id="position" name="position" defaultValue={profile.preferred_position ?? ''}>
                        <option value="">{t.choose}</option>
                        {(Object.keys(t.positions) as (keyof typeof t.positions)[]).map((position) => (
                            <option key={position} value={position}>
                                {t.positions[position]}
                            </option>
                        ))}
                    </Select>
                </Field>
            </div>
            <Field label={t.language} htmlFor="locale">
                <Select id="locale" name="locale" defaultValue={profile.locale}>
                    {LOCALES.map((l) => (
                        <option key={l} value={l}>
                            {LOCALE_NAMES[l]}
                        </option>
                    ))}
                </Select>
            </Field>
            <button type="submit" disabled={pending} className={buttonStyles.primary}>
                {t.save}
            </button>
        </form>
    );
}
