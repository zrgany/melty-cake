/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    // الصور مخزنة محلياً ضمن public/uploads، فلا حاجة لضبط نطاقات خارجية
    remotePatterns: [],
  },
};

export default nextConfig;
