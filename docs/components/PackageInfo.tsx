interface PackageInfoProps {
  name: string;
  description: string;
  version?: string;
  status?: "stable" | "alpha" | "beta" | "experimental";
  npmUrl?: string;
  githubUrl?: string;
}

export function PackageInfo({ name, description, version, status = "alpha", npmUrl, githubUrl }: PackageInfoProps) {
  const statusColors = {
    stable: { bg: "#d4edda", color: "#155724", text: "Stable" },
    alpha: { bg: "#fff3cd", color: "#856404", text: "Alpha" },
    beta: { bg: "#cce5ff", color: "#004085", text: "Beta" },
    experimental: { bg: "#f8d7da", color: "#721c24", text: "Experimental" },
  };

  const statusStyle = statusColors[status];

  return (
    <div
      style={{
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        padding: "20px",
        marginBottom: "1.5rem",
        backgroundColor: "var(--bg-color-secondary)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "12px",
          flexWrap: "wrap",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h2
            style={{
              margin: 0,
              fontSize: "1.5em",
              fontFamily: "monospace",
            }}
          >
            {name}
          </h2>

          {version && (
            <span
              style={{
                backgroundColor: "var(--code-bg-color)",
                padding: "2px 6px",
                borderRadius: "4px",
                fontSize: "0.8em",
                fontFamily: "monospace",
                color: "var(--text-color-secondary)",
              }}
            >
              v{version}
            </span>
          )}
        </div>

        <span
          style={{
            backgroundColor: statusStyle.bg,
            color: statusStyle.color,
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "0.8em",
            fontWeight: "500",
          }}
        >
          {statusStyle.text}
        </span>
      </div>

      <p
        style={{
          margin: "0 0 16px 0",
          color: "var(--text-color-secondary)",
          lineHeight: "1.5",
        }}
      >
        {description}
      </p>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {npmUrl && (
          <a
            href={npmUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              backgroundColor: "#cb3837",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "0.85em",
              fontWeight: "500",
            }}
          >
            📦 npm
          </a>
        )}

        {githubUrl && (
          <a
            href={githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "6px 12px",
              backgroundColor: "#24292e",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontSize: "0.85em",
              fontWeight: "500",
            }}
          >
            🐙 GitHub
          </a>
        )}
      </div>
    </div>
  );
}
