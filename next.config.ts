import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The dev server only accepts requests whose origin is localhost, so phones
  // and tablets reaching this machine over Tailscale (or the home LAN) get
  // rejected unless their origin is listed here. Production (`next start`)
  // ignores this — it has no such restriction.
  //
  // Kept in step with stock-trading-app's next.config.ts; if the Tailscale
  // address of this machine ever changes, both need updating.
  allowedDevOrigins: [
    "desktop-2v0387k", // Tailscale MagicDNS short name
    "*.ts.net", // Tailscale MagicDNS FQDN
    "100.113.78.45", // Tailscale IP (stable)
    "192.168.1.10", // home LAN IP (may change on DHCP renewal)
  ],
};

export default nextConfig;
