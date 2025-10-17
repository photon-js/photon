export { Page };

import { Link } from "@brillout/docpress";
import type React from "react";
import { FeatureGrid } from "../../components";

function Page() {
  return (
    <>
      <Block noMargin>
        <Hero />
        <div style={{ height: 20 }} />
        <Features />
      </Block>
    </>
  );
}

function Hero() {
  return (
    <>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "6px",
            padding: "12px 20px",
            marginBottom: "2rem",
            color: "#856404",
          }}
        >
          ⚠️ <strong>Beta:</strong> Photon is currently in beta: Some details may change before stable release, and the
          docs are work-in-progress.
        </div>
        <h1 style={{ fontSize: "3.4em", marginBottom: "1rem", fontWeight: 450, lineHeight: 1.2 }}>
          Any server,
          <br />
          deployed anywhere.
        </h1>
      </div>
    </>
  );
}

function Features() {
  const features = [
    {
      icon: "🔌",
      title: "Any server",
      description: "Hono, Express.js, Fastify, Elysia, H3, Srvx, HatTip.",
    },
    {
      icon: "🌍",
      title: "Any deployment",
      description: (
        <>
          Cloudflare, Vercel, self-hosted, <Link href="/guide/deploy">and more</Link>.
        </>
      ),
    },
    {
      icon: "⚡",
      title: "HMR",
      description: "No full server reload required.",
    },
    {
      icon: "✨",
      title: "Vite Environment API",
      description: "Develop against the same runtime as production (e.g. Cloudflare's `workerd` runtime).",
    },
    {
      icon: "✂️",
      title: "Code-splitting",
      description: "Per-route deployment to separate edge workers.",
    },
    {
      icon: "📦",
      title: "Zero-config",
      description: "Deploy with minimal configuration.",
    },
  ];

  return (
    <>
      <FeatureGrid features={features} />
    </>
  );
}

function Block({ children, noMargin }: { children: React.ReactNode; noMargin?: true }) {
  return (
    <div
      style={{
        backgroundColor: "var(--bg-color)",
        display: "flex",
        justifyContent: "center",
        paddingBottom: 40,
        paddingTop: 40,
        marginTop: noMargin ? 0 : "var(--block-margin)",
      }}
    >
      <div style={{ maxWidth: 1000, width: "100%", padding: "0 2rem" }}>{children}</div>
    </div>
  );
}
