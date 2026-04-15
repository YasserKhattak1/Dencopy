/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export so this can deploy to GitHub Pages (or any static host).
  output: 'export',
  images: {
    // Required for `next export` — no Image Optimization server.
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
