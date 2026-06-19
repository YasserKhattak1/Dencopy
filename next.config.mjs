/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Unoptimized so the SVG logo passes through cleanly.
    unoptimized: true,
  },
  // Emit trailing slashes so GitHub Pages resolves routes cleanly.
  trailingSlash: true,

  // If this site is served from a GitHub Pages subpath
  // (e.g. https://<user>.github.io/<repo>/), uncomment and set:
  // basePath: '/<repo>',
  // assetPrefix: '/<repo>/',
};

export default nextConfig;
