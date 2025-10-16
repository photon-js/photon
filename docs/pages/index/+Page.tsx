export { Page };

import type React from "react";
import logoWithText from "../../assets/logo-with-text.svg";
import { FeatureGrid } from "../../components";

function Page() {
  return (
    <>
      <Hero />
      <Features />
      <GetStarted />
    </>
  );
}

function Hero() {
  return (
    <Block noMargin>
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
          ⚠️ <strong>Alpha Stage:</strong> Photon is currently in alpha. APIs may change before stable release.
        </div>
        <h1 style={{ fontSize: "3.4em", marginBottom: "1rem" }}>
          <img src={logoWithText} height={50} />
        </h1>
        <p style={{ fontSize: "1.4em", color: "var(--text-color-secondary)", marginBottom: "1rem" }}>
          Next generation server toolkit
        </p>
        <p style={{ fontSize: "1.1em", maxWidth: "700px", margin: "0 auto 1rem", lineHeight: "1.6" }}>
          Unopinionated and flexible alternative to Nitro.
        </p>
        <p
          style={{
            fontSize: "0.95em",
            maxWidth: "600px",
            margin: "0 auto 1rem",
            lineHeight: "1.5",
            color: "var(--text-color-secondary)",
          }}
        >
          Build apps that work with any server (Hono, Express, Fastify, Elysia, H3, HatTip) and deploy anywhere.
        </p>
        <p
          style={{
            fontSize: "0.85em",
            maxWidth: "500px",
            margin: "0 auto 2rem",
            lineHeight: "1.4",
            color: "var(--text-color-secondary)",
            fontStyle: "italic",
          }}
        >
          Powers frameworks like{" "}
          <a href="https://vike.dev" style={{ color: "var(--primary-color)", textDecoration: "none" }}>
            Vike
          </a>{" "}
          and enables universal deployment capabilities.
        </p>
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="/get-started"
            style={{
              padding: "12px 24px",
              backgroundColor: "var(--primary-color)",
              color: "white",
              textDecoration: "none",
              borderRadius: "6px",
              fontWeight: "500",
            }}
          >
            Get Started
          </a>
          <a
            href="/guide"
            style={{
              padding: "12px 24px",
              border: "1px solid var(--border-color)",
              color: "var(--text-color)",
              textDecoration: "none",
              borderRadius: "6px",
            }}
          >
            Learn More
          </a>
        </div>
      </div>
    </Block>
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
    <Block>
      <h2 style={{ textAlign: "center", marginBottom: "3rem", fontSize: "2.2em" }}>Why Photon?</h2>
      <FeatureGrid features={features} />
    </Block>
  );
}

function GetStarted() {
  return (
    <Block>
      <div style={{ textAlign: "center" }}>
        <h2 style={{ marginBottom: "1rem", fontSize: "2em" }}>Ready to build universal frameworks?</h2>
        <p style={{ marginBottom: "2rem", color: "var(--text-color-secondary)" }}>
          Start building libraries that work everywhere
        </p>
        <div
          style={{
            backgroundColor: "var(--code-bg-color)",
            padding: "1rem",
            borderRadius: "6px",
            fontFamily: "monospace",
            marginBottom: "2rem",
            textAlign: "left",
            maxWidth: "500px",
            margin: "0 auto 2rem",
          }}
        >
          <div>npm install @photonjs/core</div>
          <div># Choose your server adapter</div>
          <div>npm install @photonjs/hono</div>
        </div>
        <a
          href="/get-started"
          style={{
            padding: "12px 24px",
            backgroundColor: "var(--primary-color)",
            color: "white",
            textDecoration: "none",
            borderRadius: "6px",
            fontWeight: "500",
          }}
        >
          Get Started →
        </a>
      </div>
    </Block>
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
