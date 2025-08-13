/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: 'http://localhost:5218',
    NEXT_PUBLIC_CURRENCY: 'USD'
  }
};

export default nextConfig;
