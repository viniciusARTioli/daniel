/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: this app has no server-side rendering, API routes, or
  // dynamic server functions (everything is client-side), so it builds
  // straight to plain HTML/CSS/JS. Deploy the resulting `out/` folder as a
  // standard Cloudflare Pages static site - no Workers/OpenNext adapter
  // needed, which avoids the "Missing required next.config file" /
  // OpenNext migration wizard entirely.
  output: "export",
};

export default nextConfig;
