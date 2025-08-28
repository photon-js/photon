interface Framework {
  name: string;
  description: string;
  bestFor: string[];
  performance: "High" | "Very High" | "Excellent";
  ecosystem: "Small" | "Medium" | "Large" | "Very Large";
  runtime: string[];
}

const frameworks: Framework[] = [
  {
    name: "Hono",
    description: "Ultrafast web framework for edge runtimes",
    bestFor: ["Edge deployments", "High performance", "Modern TypeScript"],
    performance: "Excellent",
    ecosystem: "Medium",
    runtime: ["Node.js", "Cloudflare", "Deno", "Bun"],
  },
  {
    name: "Express",
    description: "The most popular Node.js web framework",
    bestFor: ["Existing apps", "Large ecosystem", "Traditional Node.js"],
    performance: "High",
    ecosystem: "Very Large",
    runtime: ["Node.js"],
  },
  {
    name: "Fastify",
    description: "High-performance web framework with schema validation",
    bestFor: ["Performance-critical apps", "Schema validation", "Plugin architecture"],
    performance: "Very High",
    ecosystem: "Large",
    runtime: ["Node.js"],
  },
  {
    name: "Elysia",
    description: "Bun-optimized framework with end-to-end type safety",
    bestFor: ["Bun runtime", "Type-safe APIs", "Modern development"],
    performance: "Excellent",
    ecosystem: "Small",
    runtime: ["Bun", "Node.js"],
  },
];

export function FrameworkComparison() {
  return (
    <div style={{ marginBottom: "2rem" }}>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            border: "1px solid var(--border-color)",
            borderRadius: "6px",
            fontSize: "0.9em",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "var(--bg-color-secondary)" }}>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                Framework
              </th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                Performance
              </th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                Ecosystem
              </th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                Runtime Support
              </th>
              <th style={{ padding: "12px", textAlign: "left", borderBottom: "1px solid var(--border-color)" }}>
                Best For
              </th>
            </tr>
          </thead>
          <tbody>
            {frameworks.map((framework, index) => (
              <tr
                key={framework.name}
                style={{
                  borderBottom: index < frameworks.length - 1 ? "1px solid var(--border-color)" : "none",
                }}
              >
                <td style={{ padding: "12px", verticalAlign: "top" }}>
                  <div>
                    <strong>{framework.name}</strong>
                    <div
                      style={{
                        fontSize: "0.85em",
                        color: "var(--text-color-secondary)",
                        marginTop: "2px",
                      }}
                    >
                      {framework.description}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "12px", verticalAlign: "top" }}>
                  <span
                    style={{
                      padding: "2px 6px",
                      borderRadius: "4px",
                      fontSize: "0.8em",
                      backgroundColor:
                        framework.performance === "Excellent"
                          ? "#d4edda"
                          : framework.performance === "Very High"
                            ? "#e2e3e5"
                            : "#f8d7da",
                      color:
                        framework.performance === "Excellent"
                          ? "#155724"
                          : framework.performance === "Very High"
                            ? "#383d41"
                            : "#721c24",
                    }}
                  >
                    {framework.performance}
                  </span>
                </td>
                <td style={{ padding: "12px", verticalAlign: "top" }}>{framework.ecosystem}</td>
                <td style={{ padding: "12px", verticalAlign: "top" }}>{framework.runtime.join(", ")}</td>
                <td style={{ padding: "12px", verticalAlign: "top" }}>
                  <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "0.85em" }}>
                    {framework.bestFor.map((item) => (
                      <li key={item} style={{ marginBottom: "2px" }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
