/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fix warning about multiple lockfiles in production
  outputFileTracingRoot: undefined,
  experimental: {
    // Disable warnings about multiple lockfiles
    outputFileTracingIncludes: undefined,
  }
};

export default nextConfig;
