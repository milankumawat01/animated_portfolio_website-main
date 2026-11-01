/** @type {import('next').NextConfig} */

// Admin uploads are served from this site's own /media/* route and stored as
// absolute URLs, so next/image must allow the site's host.
const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://milankumawat.is-a.dev');

// The admin panel is a separate app; /admin on the public site forwards to it.
const adminUrl = (process.env.NEXT_PUBLIC_ADMIN_URL ?? 'https://milan-portfolio-admin.vercel.app').replace(/\/$/, '');

const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  async redirects() {
    return [
      { source: '/projects/autoresumebot', destination: '/projects/hiro', permanent: true },
      // Matches /admin and anything below it; the admin root routes to /login or /dashboard.
      { source: '/admin/:path*', destination: `${adminUrl}/:path*`, permanent: false },
    ];
  },
  images: {
    // In dev, NEXT_PUBLIC_SITE_URL is localhost, so /media/* images resolve to a loopback IP,
    // which the optimizer refuses unless allowed. Production keeps the SSRF guard on.
    dangerouslyAllowLocalIP: process.env.NODE_ENV === 'development',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.convex.cloud',
      },
      {
        protocol: siteUrl.protocol.replace(':', ''),
        hostname: siteUrl.hostname,
        port: siteUrl.port,
        pathname: '/media/**',
      },
      // Stored media URLs point at production even when NEXT_PUBLIC_SITE_URL is localhost in dev.
      {
        protocol: 'https',
        hostname: 'milankumawat.is-a.dev',
        pathname: '/media/**',
      },
    ],
  },
};

export default nextConfig;
