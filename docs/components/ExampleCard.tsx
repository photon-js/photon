interface ExampleCardProps {
  title: string;
  description: string;
  code: string;
  language?: string;
  filename?: string;
  link?: {
    text: string;
    url: string;
  };
}

export function ExampleCard({ title, description, code, language = "ts", filename, link }: ExampleCardProps) {
  return (
    <div
      style={{
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        overflow: "hidden",
        marginBottom: "1.5rem",
      }}
    >
      <div
        style={{
          backgroundColor: "var(--bg-color-secondary)",
          padding: "16px",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <h4 style={{ margin: "0 0 8px 0", fontSize: "1.2em" }}>{title}</h4>
        <p
          style={{
            margin: 0,
            color: "var(--text-color-secondary)",
            lineHeight: "1.5",
          }}
        >
          {description}
        </p>
        {link && (
          <a
            href={link.url}
            style={{
              display: "inline-block",
              marginTop: "8px",
              color: "var(--primary-color)",
              textDecoration: "none",
              fontSize: "0.9em",
              fontWeight: "500",
            }}
          >
            {link.text} →
          </a>
        )}
      </div>

      <div style={{ position: "relative" }}>
        {filename && (
          <div
            style={{
              position: "absolute",
              top: "8px",
              right: "12px",
              backgroundColor: "var(--bg-color)",
              border: "1px solid var(--border-color)",
              borderRadius: "4px",
              padding: "2px 6px",
              fontSize: "0.75em",
              fontFamily: "monospace",
              color: "var(--text-color-secondary)",
              zIndex: 1,
            }}
          >
            {filename}
          </div>
        )}

        <pre
          style={{
            backgroundColor: "var(--code-bg-color)",
            padding: "16px",
            margin: 0,
            fontSize: "0.85em",
            lineHeight: "1.5",
            overflow: "auto",
          }}
        >
          <code className={`language-${language}`}>{code}</code>
        </pre>
      </div>
    </div>
  );
}
