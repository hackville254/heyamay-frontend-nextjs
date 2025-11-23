/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "demo-bucket-minio.dubabf.easypanel.host",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
