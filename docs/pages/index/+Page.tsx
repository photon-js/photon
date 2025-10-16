export { Page };

import type React from "react";
import { FeatureGrid } from "../../components";

function Page() {
  return (
    <>
    <Block noMargin>
      <Hero />
    <div style={{height: 20}} />
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
          ⚠️ <strong>Alpha:</strong> Photon is currently in alpha: APIs may change before stable release, and the docs are work-in-progress.
        </div>
        <h1 style={{ fontSize: "3.4em", marginBottom: "1rem", fontWeight: 450, lineHeight: 1.2 }}>
          Any server<br/>deployed anywhere.
        </h1>
      </div>
    </>
  );
}

function Features() {
  const features = [
    {
      icon: "🏗️",
      title: "Framework Builder",
      description: "Build frameworks and libraries that work universally across server runtimes",
    },
    {
      icon: "🚀",
      title: "Universal Server Support",
      description: "Single codebase works with Hono, Express, Fastify, Elysia, H3, HatTip",
    },
    {
      icon: "🌍",
      title: "Deploy Anywhere",
      description: "Your framework users can deploy to any platform without extra configuration",
    },
    {
      icon: "⚡",
      title: "Vite-Powered",
      description: "Built on Vite's Environment API with HMR for server code",
    },
    {
      icon: "📦",
      title: "Code Splitting",
      description: "Enable per-route deployment to separate edge workers",
    },
    {
      icon: "🔧",
      title: "Unopinionated",
      description: "Minimal design that doesn't impose architectural decisions",
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
