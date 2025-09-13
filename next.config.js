// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'gateway.pinata.cloud',
      'ipfs.io',
      'cloudflare-ipfs.com',
      'dweb.link',
      'supabase.co' // Add if using Supabase
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'usntsibicvemzidzpzbi.supabase.co'
      },
      {
        protocol: 'https',
        hostname: '**.pinata.cloud',
      },
      {
        protocol: 'https',
        hostname: 'gateway.pinata.cloud',
        port: '',
        pathname: '/ipfs/**',
      },  
    ]
  }
};

module.exports = nextConfig; 