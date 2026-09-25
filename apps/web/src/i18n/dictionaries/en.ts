const en = {
    meta: {
        title: 'Aalto Football · Pick-up football in Bergen',
        description:
            'Find football matches near you in Bergen, or host your own and fill the team in minutes.',
    },
    nav: {
        label: 'Main',
        howItWorks: 'How it works',
        matches: 'Matches',
        hosts: 'For hosts',
        createMatch: 'Host a match',
        logoLabel: 'Aalto Football, go to home page',
        languageLabel: 'Language',
    },
    hero: {
        titleStart: 'Find a game.',
        titleEnd: 'Or host your own.',
        subtitle:
            'Pick-up football in Bergen, from 5-a-side to 11-a-side. Hosts set up the match, you grab a spot and the team fills up in minutes.',
        ctaFind: 'Find matches',
        ctaHost: 'Host a match',
    },
    howItWorks: {
        title: 'How it works',
        subtitle: 'Three steps between you and the pitch.',
        steps: [
            {
                title: 'Find a match',
                text: 'Filter by day, area and level, and see how many spots are left.',
            },
            {
                title: 'Join in one tap',
                text: 'Grab your spot. If the match is full, you go on the waitlist.',
            },
            {
                title: 'Play',
                text: "We'll remind you before kick-off and show you the way to the pitch.",
            },
        ],
    },
    matches: {
        title: 'Upcoming matches',
        subtitle: 'This is how open matches near you will look.',
        examplesBadge: 'Examples · search coming soon',
    },
    matchCard: {
        level: 'Level',
        price: 'Price',
        perPlayer: 'per player',
        spotsLeft: { one: '{count} spot left', other: '{count} spots left' },
        ofTotal: 'of {total}',
        full: 'Full · waitlist open',
        lastSpots: 'Last spots!',
        spotsTaken: 'Spots taken',
    },
    levels: {
        beginner: 'Beginner',
        intermediate: 'Intermediate',
        advanced: 'Advanced',
    },
    hosts: {
        title: 'Organising a game?',
        subtitle:
            'Stop filling spots by hand in the group chat. Post the match and let players sign up themselves.',
        features: [
            {
                title: 'Create matches in seconds',
                text: 'Pitch, time, format, level and number of spots. Done.',
            },
            {
                title: 'Always-current player list',
                text: "Who's in, who dropped out and who's waiting, without chasing anyone.",
            },
            {
                title: 'Share with one link',
                text: 'One link per match to fill the last spots, in any chat.',
            },
            {
                title: 'Players you can trust',
                text: "Ratings and attendance, so you know who you're playing with.",
            },
        ],
        bannerTitle: 'Hosting is coming soon',
        bannerText: "We're finishing user accounts and match creation.",
    },
    footer: {
        rights: 'All rights reserved.',
    },
    notFound: {
        title: 'Page not found',
        text: "The page you're looking for doesn't exist or has moved.",
        back: 'Back to home',
    },
    offline: {
        title: "You're offline",
        text: 'Check your connection and try again.',
        retry: 'Try again',
    },
};

export default en;
export type Dictionary = typeof en;
