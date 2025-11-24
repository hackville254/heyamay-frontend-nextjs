/** @type {import('next').NextConfig} */
// Image remote patterns configured for the project's MinIO host
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
