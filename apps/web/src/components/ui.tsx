import type { ComponentProps, ReactNode } from 'react';

// Estilos compartidos para formularios y botones (según la guía de marca).

export const buttonStyles = {
    primary:
        'inline-flex items-center justify-center gap-2 rounded-lg bg-primary-strong px-5 py-2.5 font-semibold text-white transition-colors hover:bg-primary disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
        'inline-flex items-center justify-center gap-2 rounded-lg border border-black/15 bg-white px-5 py-2.5 font-semibold text-charcoal transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60',
    danger: 'inline-flex items-center justify-center gap-2 rounded-lg border border-accent-strong/40 bg-white px-5 py-2.5 font-semibold text-accent-strong transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60',
    link: 'font-semibold text-primary-strong underline-offset-2 hover:underline',
};

export const inputStyles =
    'block w-full rounded-lg border border-black/20 bg-white px-3 py-2.5 text-charcoal placeholder:text-charcoal/40 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none aria-invalid:border-accent-strong';

export function Field({
    label,
    htmlFor,
    hint,
    error,
    children,
}: {
    label: string;
    htmlFor: string;
    hint?: string;
    error?: string;
    children: ReactNode;
}) {
    return (
        <div>
            <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-semibold">
                {label}
            </label>
            {children}
            {hint && !error && <p className="mt-1 text-sm text-charcoal/60">{hint}</p>}
            {error && (
                <p id={`${htmlFor}-error`} className="mt-1 text-sm font-medium text-accent-strong">
                    {error}
                </p>
            )}
        </div>
    );
}

export function Alert({ tone, children }: { tone: 'error' | 'success' | 'info'; children: ReactNode }) {
    const styles = {
        error: 'border-accent-strong/30 bg-accent-soft text-accent-strong',
        success: 'border-emerald-700/20 bg-emerald-50 text-emerald-800',
        info: 'border-primary/20 bg-primary-soft text-primary-strong',
    }[tone];
    return (
        <div
            role={tone === 'error' ? 'alert' : 'status'}
            className={`rounded-lg border px-4 py-3 text-sm font-medium ${styles}`}
        >
            {children}
        </div>
    );
}

export function Select(props: ComponentProps<'select'>) {
    return <select {...props} className={`${inputStyles} ${props.className ?? ''}`} />;
}

export function Input(props: ComponentProps<'input'>) {
    return <input {...props} className={`${inputStyles} ${props.className ?? ''}`} />;
}

export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
    return (
        <div>
            <h1 className="text-3xl sm:text-4xl">{title}</h1>
            {subtitle && <p className="mt-2 text-charcoal/70">{subtitle}</p>}
        </div>
    );
}
