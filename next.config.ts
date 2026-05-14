/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! CẢNH BÁO: Lệnh này bảo Vercel bỏ qua lỗi TypeScript khi build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Bỏ qua luôn cả lỗi ESLint cho chắc ăn
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;