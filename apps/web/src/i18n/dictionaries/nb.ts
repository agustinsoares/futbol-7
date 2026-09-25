import type { Dictionary } from './en';

// Norsk bokmål. Typen tvinger fram samme nøkler som den engelske ordboken.
const nb: Dictionary = {
    meta: {
        title: 'Aalto Football · Løkkefotball i Bergen',
        description:
            'Finn fotballkamper i nærheten i Bergen, eller arranger din egen og fyll laget på få minutter.',
    },
    nav: {
        label: 'Hovedmeny',
        howItWorks: 'Slik fungerer det',
        matches: 'Kamper',
        hosts: 'For arrangører',
        createMatch: 'Arranger en kamp',
        logoLabel: 'Aalto Football, gå til forsiden',
        languageLabel: 'Språk',
    },
    hero: {
        titleStart: 'Finn en kamp.',
        titleEnd: 'Eller arranger din egen.',
        subtitle:
            'Løkkefotball i Bergen, fra 5er til 11er. Arrangøren setter opp kampen, du tar en plass, og laget er fullt på få minutter.',
        ctaFind: 'Finn kamper',
        ctaHost: 'Arranger en kamp',
    },
    howItWorks: {
        title: 'Slik fungerer det',
        subtitle: 'Tre steg mellom deg og banen.',
        steps: [
            {
                title: 'Finn en kamp',
                text: 'Filtrer på dag, område og nivå, og se hvor mange plasser som er ledige.',
            },
            {
                title: 'Meld deg på med ett trykk',
                text: 'Ta plassen din. Er kampen full, havner du på ventelisten.',
            },
            {
                title: 'Spill',
                text: 'Vi minner deg på kampen og viser deg veien til banen.',
            },
        ],
    },
    matches: {
        title: 'Kommende kamper',
        subtitle: 'Slik vil åpne kamper i nærheten se ut.',
        examplesBadge: 'Eksempler · søk kommer snart',
    },
    matchCard: {
        level: 'Nivå',
        price: 'Pris',
        perPlayer: 'per spiller',
        spotsLeft: { one: '{count} ledig plass', other: '{count} ledige plasser' },
        ofTotal: 'av {total}',
        full: 'Full · venteliste åpen',
        lastSpots: 'Siste plasser!',
        spotsTaken: 'Opptatte plasser',
    },
    levels: {
        beginner: 'Nybegynner',
        intermediate: 'Middels',
        advanced: 'Viderekommen',
    },
    hosts: {
        title: 'Arrangerer du kamper?',
        subtitle:
            'Slutt å fylle plasser manuelt i gruppechatten. Legg ut kampen og la spillerne melde seg på selv.',
        features: [
            {
                title: 'Opprett kamper på sekunder',
                text: 'Bane, tid, format, nivå og antall plasser. Ferdig.',
            },
            {
                title: 'Alltid oppdatert spillerliste',
                text: 'Hvem som kommer, hvem som har meldt avbud og hvem som venter, uten å mase på noen.',
            },
            {
                title: 'Del med én lenke',
                text: 'Én lenke per kamp for å fylle de siste plassene, i hvilken som helst chat.',
            },
            {
                title: 'Spillere du kan stole på',
                text: 'Vurderinger og oppmøte, så du vet hvem du spiller med.',
            },
        ],
        bannerTitle: 'Arrangering kommer snart',
        bannerText: 'Vi legger siste hånd på brukerkontoer og oppretting av kamper.',
    },
    footer: {
        rights: 'Alle rettigheter forbeholdt.',
    },
    notFound: {
        title: 'Fant ikke siden',
        text: 'Siden du leter etter finnes ikke eller er flyttet.',
        back: 'Tilbake til forsiden',
    },
    offline: {
        title: 'Du er frakoblet',
        text: 'Sjekk tilkoblingen og prøv igjen.',
        retry: 'Prøv igjen',
    },
};

export default nb;
