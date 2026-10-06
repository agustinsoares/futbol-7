import type { ComponentProps, ReactNode } from 'react';

// Estilos compartidos para formularios y botones (según la guía de marca).

export const buttonStyles = {
    primary:
        'inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 font-semibold text-white transition-colors hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-60',
    secondary:
        'inline-flex items-center justify-center gap-2 rounded-lg border border-black/15 bg-white px-5 py-2.5 font-semibold text-ink transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60',
    danger: 'inline-flex items-center justify-center gap-2 rounded-lg border border-accent-strong/40 bg-white px-5 py-2.5 font-semibold text-accent-strong transition-colors hover:bg-accent-soft disabled:cursor-not-allowed disabled:opacity-60',
    link: 'font-semibold text-primary-strong underline-offset-2 hover:underline',
};

export const inputStyles =
    'block w-full rounded-lg border border-black/20 bg-white px-3 py-2.5 text-ink placeholder:text-ink/40 focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none aria-invalid:border-accent-strong';

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
            {hint && !error && <p className="mt-1 text-sm text-ink/60">{hint}</p>}
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
        success: 'border-success/30 bg-success-soft text-success-strong',
        info: 'border-primary/20 bg-primary-soft text-primary-strong',
    }[tone];
    return (
        <div
            role={tone === 'error' ? 'alert' : 'status'}
            className={`flex gap-2 rounded-lg border px-4 py-3 text-sm font-medium ${styles}`}
        >
            {/* Los errores llevan icono: el rojo también es el color de los botones, así no depende solo del color. */}
            {tone === 'error' && (
                <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="mt-px h-4 w-4 shrink-0"
                    fill="currentColor"
                >
                    <path d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm0 4a1 1 0 0 1 1 1v4a1 1 0 1 1-2 0v-4a1 1 0 0 1 1-1Zm0 7.5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z" />
                </svg>
            )}
            <div>{children}</div>
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
            {subtitle && <p className="mt-2 text-ink/70">{subtitle}</p>}
        </div>
    );
}
