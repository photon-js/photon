interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  filename?: string;
}

export function CodeBlock({ children, language = "ts", title, filename }: CodeBlockProps) {
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      {(title || filename) && (
        <div
          style={{
            backgroundColor: "var(--code-title-bg, #f6f8fa)",
            border: "1px solid var(--border-color)",
            borderBottom: "none",
            borderRadius: "6px 6px 0 0",
            padding: "8px 12px",
            fontSize: "0.85em",
            fontWeight: "500",
            color: "var(--text-color-secondary)",
          }}
        >
          {filename && <span style={{ fontFamily: "monospace" }}>{filename}</span>}
          {title && !filename && title}
        </div>
      )}
      <pre
        style={{
          backgroundColor: "var(--code-bg-color)",
          border: "1px solid var(--border-color)",
          borderRadius: title || filename ? "0 0 6px 6px" : "6px",
          padding: "16px",
          overflow: "auto",
          margin: 0,
          fontSize: "0.9em",
          lineHeight: "1.5",
        }}
      >
        <code className={`language-${language}`}>{children}</code>
      </pre>
    </div>
  );
}
