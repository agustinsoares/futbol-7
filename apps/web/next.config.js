/** @type {import('next').NextConfig} */
const nextConfig = {
    turbopack: {
        root: __dirname,
    },
    async redirects() {
        // La antigua landing de ligas vivía en /dashboard.
        return [{ source: '/dashboard', destination: '/', permanent: false }];
    },
};

module.exports = nextConfig;
