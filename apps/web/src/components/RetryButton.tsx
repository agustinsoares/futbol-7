'use client';

export default function RetryButton({ label }: { label: string }) {
    return (
        <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-8 rounded-lg bg-primary-strong px-6 py-3 font-semibold text-white transition-colors hover:bg-primary"
        >
            {label}
        </button>
    );
}
