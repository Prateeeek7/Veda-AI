/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Allows deployment to Vercel while pointing to an externally hosted Python backend
    const backendUrl = process.env.BACKEND_URL || 'http://127.0.0.1:5001';
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/:path*`, // Proxy to dynamic Flask Backend
      },
    ];
  },
};

export default nextConfig;
