export { Page };

import { Link } from "@brillout/docpress";
import type React from "react";
import logoWithText from "../../assets/logo-with-text.svg";
import { FeatureGrid } from "../../components";

function Page() {
  return (
    <>
      <Block noMargin>
        <Hero />
        <div style={{ height: 27 }} />
      </Block>
      <Block>
        <div style={{ height: 20 }} />
        <Features />
      </Block>
    </>
  );
}

function Hero() {
  return (
    <>
      <div
        style={
          {
            // textAlign: "center",
          }
        }
      >
        <div
          style={{
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "6px",
            padding: "12px 20px",
            color: "#856404",
          }}
        >
          ⚠️ <strong>Beta:</strong> Photon is currently in beta: Some details may change before stable release, and the
          docs are work-in-progress.
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <h1 style={{ fontSize: "3.4em", marginBottom: "1rem", fontWeight: 450, lineHeight: 1.2 }}>
            Any server,
            <br />
            deployed anywhere.
          </h1>
          {/*
          <img src={logoWithText} height={50} style={{ marginRight: 40 }} />
          */}
        </div>
        <div
          style={{
            textAlign: "left",
            // margin: 'auto',
            // width:100%;margin:auto;margin-top:10px;line-height:1.35;
            fontSize: 20,
            fontWeight: 450,
            color: "#666",
            maxWidth: 750,
          }}
        >
          <p>
            Photon allows you to choose any JavaScript server (Hono, Express.js, Fastify, ...) and deloy it anywhere
            (Cloudflare, Vercel, self-hosted, ...).
          </p>
          <p>
            It currently supports <a href="https://vike.dev">Vike</a> and will soon support other frameworks as well
            (reach out to your framework if you want it to add Photon support — Photon aims for broad framework
            support).
          </p>
        </div>
      </div>
    </>
  );
}

function Features() {
  const features = [
    {
      icon: "🔌",
      title: "Any server",
      description: "Hono, Express.js, Fastify, Elysia, H3, Srvx, Hattip.",
    },
    {
      icon: "🌍",
      title: "Deploy anywhere",
      description: (
        <>
          Cloudflare, Vercel, self-hosted, and more.
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
      description: (
        <>
          Develop against the same runtime as production (e.g. Cloudflare's <code>workerd</code> runtime).
        </>
      ),
    },
    {
      icon: "✂️",
      title: "Code-splitting",
      description: "Per-route deployment to separate edge workers.",
    },
    {
      icon: "📦",
      title: "Zero-config",
      description: "Integrate your server and deploy with minimal configuration.",
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
