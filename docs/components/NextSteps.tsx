interface NextStep {
  title: string;
  description: string;
  url: string;
  external?: boolean;
}

interface NextStepsProps {
  steps: NextStep[];
  title?: string;
}

export function NextSteps({ steps, title = "Next Steps" }: NextStepsProps) {
  return (
    <div style={{ marginTop: "2rem" }}>
      <h3 style={{ marginBottom: "1rem", fontSize: "1.3em" }}>{title}</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1rem",
        }}
      >
        {steps.map((step) => (
          <a
            key={step.url}
            href={step.url}
            style={{
              display: "block",
              padding: "16px",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              textDecoration: "none",
              color: "inherit",
              backgroundColor: "var(--bg-color)",
              transition: "all 0.2s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "var(--primary-color)";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "var(--border-color)";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
            {...(step.external && {
              target: "_blank",
              rel: "noopener noreferrer",
            })}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "8px",
              }}
            >
              <h4
                style={{
                  margin: 0,
                  fontSize: "1.1em",
                  color: "var(--primary-color)",
                }}
              >
                {step.title}
              </h4>
              <span
                style={{
                  fontSize: "1.2em",
                  color: "var(--text-color-secondary)",
                }}
              >
                {step.external ? "↗" : "→"}
              </span>
            </div>

            <p
              style={{
                margin: 0,
                color: "var(--text-color-secondary)",
                fontSize: "0.9em",
                lineHeight: "1.4",
              }}
            >
              {step.description}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
