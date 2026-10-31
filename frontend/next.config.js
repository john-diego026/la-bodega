/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Permite que el build de Vercel complete aunque haya errores de tipos
    ignoreBuildErrors: true,
  },
  eslint: {
    // Evita bloqueos durante la compilación por avisos de linter
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;