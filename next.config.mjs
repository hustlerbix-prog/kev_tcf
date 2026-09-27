/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: false,
  },
  images: {
    remotePatterns: [],
  },
  // @ffmpeg-installer/ffmpeg resolves its platform binary via a dynamic
  // require(platform-name) at load time — webpack can't statically analyze
  // that, so bundling it breaks. Leave it as a real Node require at runtime.
  serverExternalPackages: ["@ffmpeg-installer/ffmpeg"],
};

export default nextConfig;
