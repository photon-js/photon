interface Parameter {
  name: string;
  type: string;
  description: string;
  optional?: boolean;
  default?: string;
}

interface ApiFunction {
  name: string;
  description: string;
  signature: string;
  parameters?: Parameter[];
  returns?: string;
  example?: string;
}

interface ApiReferenceProps {
  functions: ApiFunction[];
}

export function ApiReference({ functions }: ApiReferenceProps) {
  return (
    <div style={{ marginBottom: "2rem" }}>
      {functions.map((func, index) => (
        <div
          key={func.name}
          style={{
            marginBottom: index < functions.length - 1 ? "2rem" : 0,
            border: "1px solid var(--border-color)",
            borderRadius: "6px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-color-secondary)",
              padding: "12px 16px",
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <h4 style={{ margin: 0, fontFamily: "monospace", fontSize: "1.1em" }}>{func.name}</h4>
            <p style={{ margin: "4px 0 0 0", color: "var(--text-color-secondary)" }}>{func.description}</p>
          </div>

          <div style={{ padding: "16px" }}>
            <div style={{ marginBottom: "16px" }}>
              <h5 style={{ margin: "0 0 8px 0", fontSize: "0.9em", color: "var(--text-color-secondary)" }}>
                Signature
              </h5>
              <pre
                style={{
                  backgroundColor: "var(--code-bg-color)",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  margin: 0,
                  fontSize: "0.85em",
                  overflow: "auto",
                }}
              >
                <code>{func.signature}</code>
              </pre>
            </div>

            {func.parameters && func.parameters.length > 0 && (
              <div style={{ marginBottom: "16px" }}>
                <h5 style={{ margin: "0 0 8px 0", fontSize: "0.9em", color: "var(--text-color-secondary)" }}>
                  Parameters
                </h5>
                <div style={{ fontSize: "0.9em" }}>
                  {func.parameters.map((param) => (
                    <div key={param.name} style={{ marginBottom: "8px" }}>
                      <code
                        style={{
                          backgroundColor: "var(--code-bg-color)",
                          padding: "2px 4px",
                          borderRadius: "3px",
                          fontWeight: "500",
                        }}
                      >
                        {param.name}
                        {param.optional && "?"}
                      </code>
                      <span style={{ margin: "0 8px", color: "var(--text-color-secondary)" }}>{param.type}</span>
                      {param.default && (
                        <span
                          style={{
                            fontSize: "0.8em",
                            color: "var(--text-color-secondary)",
                            fontStyle: "italic",
                          }}
                        >
                          (default: {param.default})
                        </span>
                      )}
                      <div
                        style={{
                          marginTop: "2px",
                          color: "var(--text-color-secondary)",
                          fontSize: "0.85em",
                        }}
                      >
                        {param.description}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {func.returns && (
              <div style={{ marginBottom: "16px" }}>
                <h5 style={{ margin: "0 0 8px 0", fontSize: "0.9em", color: "var(--text-color-secondary)" }}>
                  Returns
                </h5>
                <code
                  style={{
                    backgroundColor: "var(--code-bg-color)",
                    padding: "2px 4px",
                    borderRadius: "3px",
                    fontSize: "0.9em",
                  }}
                >
                  {func.returns}
                </code>
              </div>
            )}

            {func.example && (
              <div>
                <h5 style={{ margin: "0 0 8px 0", fontSize: "0.9em", color: "var(--text-color-secondary)" }}>
                  Example
                </h5>
                <pre
                  style={{
                    backgroundColor: "var(--code-bg-color)",
                    padding: "12px",
                    borderRadius: "4px",
                    margin: 0,
                    fontSize: "0.85em",
                    overflow: "auto",
                  }}
                >
                  <code>{func.example}</code>
                </pre>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
