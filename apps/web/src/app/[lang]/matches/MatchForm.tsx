'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';
import { Alert, buttonStyles, Field, Input, Select, inputStyles } from '@/components/ui';
import type { Locale } from '@/i18n/config';
import type { Dictionary } from '@/i18n/dictionaries';
import type { MatchFormat, SkillLevel, Venue } from '@/lib/match-data';
import { createMatchAction, updateMatchAction, type MatchFormState } from './form-actions';

export interface MatchFormValues {
    title: string;
    venueId: string;
    date: string;
    time: string;
    duration: number;
    format: MatchFormat;
    maxPlayers: number;
    level: SkillLevel;
    gender: 'mixed' | 'men' | 'women';
    visibility: 'public' | 'private';
    price: string;
    description: string;
}

interface MatchFormProps {
    locale: Locale;
    venues: Pick<Venue, 'id' | 'name' | 'area'>[];
    initial: MatchFormValues;
    minDate: string;
    matchId?: string;
    cancelHref: string;
    dict: Pick<Dictionary, 'matchForm' | 'levels' | 'match' | 'recurring'>;
}

const PLAYERS_PER_FORMAT: Record<MatchFormat, number> = { '5v5': 10, '7v7': 14, '9v9': 18, '11v11': 22 };

export default function MatchForm({
    locale,
    venues,
    initial,
    minDate,
    matchId,
    cancelHref,
    dict,
}: MatchFormProps) {
    const t = dict.matchForm;
    const editing = !!matchId;
    const [state, action, pending] = useActionState<MatchFormState, FormData>(
        editing ? updateMatchAction : createMatchAction,
        {},
    );
    const [maxPlayers, setMaxPlayers] = useState(String(initial.maxPlayers));
    const [repeat, setRepeat] = useState(state.values?.repeat === 'on');
    // Tras un error, mostramos lo que el usuario había escrito en lugar de los valores iniciales.
    const v = (key: keyof MatchFormValues): string => state.values?.[key] ?? String(initial[key]);
    const fe = (field: keyof NonNullable<MatchFormState['fieldErrors']>) => {
        const key = state.fieldErrors?.[field];
        return key ? t.errors[key] : undefined;
    };

    return (
        <form action={action} className="space-y-5" noValidate>
            <input type="hidden" name="lang" value={locale} />
            {matchId && <input type="hidden" name="matchId" value={matchId} />}
            {state.error && <Alert tone="error">{t.errors[state.error]}</Alert>}

            <Field label={t.title} htmlFor="title" error={fe('title')}>
                <Input
                    id="title"
                    name="title"
                    defaultValue={v('title')}
                    placeholder={t.titlePlaceholder}
                    required
                    minLength={3}
                    maxLength={120}
                    aria-invalid={!!fe('title')}
                />
            </Field>

            <Field label={t.venue} htmlFor="venueId" error={fe('venueId')}>
                <Select
                    id="venueId"
                    name="venueId"
                    defaultValue={v('venueId')}
                    required
                    aria-invalid={!!fe('venueId')}
                >
                    <option value="" disabled>
                        {t.chooseVenue}
                    </option>
                    {venues.map((venue) => (
                        <option key={venue.id} value={venue.id}>
                            {venue.name} ({venue.area})
                        </option>
                    ))}
                </Select>
            </Field>

            <div className="grid gap-5 sm:grid-cols-3">
                <Field label={t.date} htmlFor="date" error={fe('dateTime')}>
                    <Input
                        id="date"
                        name="date"
                        type="date"
                        min={minDate}
                        defaultValue={v('date')}
                        required
                        aria-invalid={!!fe('dateTime')}
                    />
                </Field>
                <Field label={t.time} htmlFor="time">
                    <Input id="time" name="time" type="time" step={300} defaultValue={v('time')} required />
                </Field>
                <Field label={t.duration} htmlFor="duration" error={fe('duration')}>
                    <Input
                        id="duration"
                        name="duration"
                        type="number"
                        min={30}
                        max={240}
                        step={15}
                        defaultValue={v('duration')}
                        required
                        aria-invalid={!!fe('duration')}
                    />
                </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-3">
                <Field label={t.format} htmlFor="format">
                    <Select
                        id="format"
                        name="format"
                        defaultValue={v('format')}
                        onChange={(e) => {
                            if (!editing)
                                setMaxPlayers(String(PLAYERS_PER_FORMAT[e.target.value as MatchFormat]));
                        }}
                    >
                        {(Object.keys(PLAYERS_PER_FORMAT) as MatchFormat[]).map((format) => (
                            <option key={format} value={format}>
                                {format}
                            </option>
                        ))}
                    </Select>
                </Field>
                <Field
                    label={t.maxPlayers}
                    htmlFor="maxPlayers"
                    hint={editing ? undefined : t.maxPlayersHint}
                    error={fe('maxPlayers')}
                >
                    <Input
                        id="maxPlayers"
                        name="maxPlayers"
                        type="number"
                        min={2}
                        max={30}
                        value={maxPlayers}
                        onChange={(e) => setMaxPlayers(e.target.value)}
                        required
                        aria-invalid={!!fe('maxPlayers')}
                    />
                </Field>
                <Field label={t.level} htmlFor="level">
                    <Select id="level" name="level" defaultValue={v('level')}>
                        {(['beginner', 'intermediate', 'advanced'] as const).map((level) => (
                            <option key={level} value={level}>
                                {dict.levels[level]}
                            </option>
                        ))}
                    </Select>
                </Field>
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
                <Field label={t.gender} htmlFor="gender">
                    <Select id="gender" name="gender" defaultValue={v('gender')}>
                        {(['mixed', 'men', 'women'] as const).map((gender) => (
                            <option key={gender} value={gender}>
                                {dict.match.genders[gender]}
                            </option>
                        ))}
                    </Select>
                </Field>
                <Field label={t.price} htmlFor="price" hint={t.priceHint} error={fe('price')}>
                    <Input
                        id="price"
                        name="price"
                        type="number"
                        inputMode="decimal"
                        min={0}
                        step={10}
                        defaultValue={v('price')}
                        aria-invalid={!!fe('price')}
                    />
                </Field>
            </div>

            <fieldset>
                <legend className="mb-1.5 text-sm font-semibold">{t.visibility}</legend>
                <div className="space-y-2">
                    {(['public', 'private'] as const).map((visibility) => (
                        <label key={visibility} className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="visibility"
                                value={visibility}
                                defaultChecked={v('visibility') === visibility}
                                className="h-4 w-4 accent-primary-strong"
                            />
                            {t.visibilityOptions[visibility]}
                        </label>
                    ))}
                </div>
            </fieldset>

            {!editing && (
                <fieldset className="rounded-xl bg-surface p-4">
                    <label className="flex items-center gap-2 font-semibold">
                        <input
                            type="checkbox"
                            name="repeat"
                            checked={repeat}
                            onChange={(e) => setRepeat(e.target.checked)}
                            className="h-4 w-4 accent-primary-strong"
                        />
                        {dict.recurring.repeat}
                    </label>
                    {repeat && (
                        <div className="mt-3 max-w-xs">
                            <Field label={dict.recurring.weeks} htmlFor="weeks" hint={dict.recurring.hint}>
                                <Select id="weeks" name="weeks" defaultValue={state.values?.weeks ?? '4'}>
                                    {Array.from({ length: 11 }, (_, i) => i + 2).map((n) => (
                                        <option key={n} value={n}>
                                            {n}
                                        </option>
                                    ))}
                                </Select>
                            </Field>
                        </div>
                    )}
                </fieldset>
            )}

            <Field label={t.description} htmlFor="description" error={fe('description')}>
                <textarea
                    id="description"
                    name="description"
                    rows={4}
                    maxLength={2000}
                    defaultValue={v('description')}
                    placeholder={t.descriptionPlaceholder}
                    className={inputStyles}
                    aria-invalid={!!fe('description')}
                />
            </Field>

            <div className="flex flex-wrap gap-3">
                <button type="submit" disabled={pending} className={buttonStyles.primary}>
                    {editing ? t.save : t.create}
                </button>
                <Link href={cancelHref} className={buttonStyles.secondary}>
                    {t.cancel}
                </Link>
            </div>
        </form>
    );
}
