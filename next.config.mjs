/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix warning about multiple lockfiles in production
  outputFileTracingRoot: undefined
};

export default nextConfig;
