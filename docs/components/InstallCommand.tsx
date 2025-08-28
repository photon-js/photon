import { useState } from "react";

interface InstallCommandProps {
  packages: string | string[];
  dev?: boolean;
  title?: string;
}

export function InstallCommand({ packages, dev = false, title }: InstallCommandProps) {
  const [packageManager, setPackageManager] = useState<"npm" | "pnpm" | "yarn" | "bun">("npm");

  const packageList = Array.isArray(packages) ? packages.join(" ") : packages;

  const commands = {
    npm: `npm install${dev ? " -D" : ""} ${packageList}`,
    pnpm: `pnpm add${dev ? " -D" : ""} ${packageList}`,
    yarn: `yarn add${dev ? " -D" : ""} ${packageList}`,
    bun: `bun add${dev ? " -d" : ""} ${packageList}`,
  };

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {title && <h4 style={{ marginBottom: "0.5rem", fontSize: "1.1em" }}>{title}</h4>}

      <div style={{ marginBottom: "8px" }}>
        {(["npm", "pnpm", "yarn", "bun"] as const).map((pm) => (
          <button
            key={pm}
            onClick={() => setPackageManager(pm)}
            style={{
              padding: "4px 8px",
              marginRight: "4px",
              border: "1px solid var(--border-color)",
              borderRadius: "4px",
              backgroundColor: packageManager === pm ? "var(--primary-color)" : "transparent",
              color: packageManager === pm ? "white" : "var(--text-color)",
              cursor: "pointer",
              fontSize: "0.8em",
              fontWeight: packageManager === pm ? "500" : "normal",
            }}
          >
            {pm}
          </button>
        ))}
      </div>

      <pre
        style={{
          backgroundColor: "var(--code-bg-color)",
          border: "1px solid var(--border-color)",
          borderRadius: "6px",
          padding: "12px",
          margin: 0,
          fontSize: "0.9em",
          overflow: "auto",
        }}
      >
        <code>{commands[packageManager]}</code>
      </pre>
    </div>
  );
}
