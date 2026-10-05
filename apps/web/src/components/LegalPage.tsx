import { contactEmail, type LegalDoc } from '@/content/legal';

function fill(text: string) {
    return text.replaceAll('{email}', contactEmail());
}

/** Página de texto legal (privacidad, términos) a partir de src/content/legal.ts. */
export default function LegalPage({ doc }: { doc: LegalDoc }) {
    return (
        <article className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
            <h1 className="text-3xl sm:text-4xl">{doc.title}</h1>
            <p className="mt-2 text-sm text-charcoal/60">{doc.updated}</p>
            <p className="mt-6 text-lg text-charcoal/85">{fill(doc.intro)}</p>
            {doc.sections.map((section) => (
                <section key={section.heading} className="mt-8">
                    <h2 className="text-xl font-bold">{section.heading}</h2>
                    {section.paragraphs?.map((p) => (
                        <p key={p} className="mt-3 text-charcoal/85">
                            {fill(p)}
                        </p>
                    ))}
                    {section.list && (
                        <ul className="mt-3 list-disc space-y-2 pl-5 text-charcoal/85">
                            {section.list.map((item) => (
                                <li key={item}>{fill(item)}</li>
                            ))}
                        </ul>
                    )}
                </section>
            ))}
        </article>
    );
}
