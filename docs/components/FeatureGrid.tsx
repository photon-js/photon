interface Feature {
  icon: string;
  title: string;
  description: string | React.ReactNode;
}

interface FeatureGridProps {
  features: Feature[];
}

export function FeatureGrid({ features }: FeatureGridProps) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${280}px, 1fr))`,
        gap: "1.5rem",
        marginBottom: "2rem",
      }}
    >
      {features.map((feature, index) => (
        <div
          key={index}
          style={{
            padding: "1.5rem",
            border: "1px solid var(--border-color)",
            borderRadius: "8px",
            backgroundColor: "var(--bg-color-secondary)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "2.5em",
              marginBottom: "0.5rem",
              lineHeight: 1,
            }}
          >
            {feature.icon}
          </div>

          <h3
            style={{
              marginBottom: "0.5rem",
              fontSize: "1.2em",
              color: "var(--text-color)",
            }}
          >
            {feature.title}
          </h3>

          <p
            style={{
              margin: 0,
              color: "var(--text-color-secondary)",
              lineHeight: "1.5",
              fontSize: "0.95em",
            }}
          >
            {feature.description}
          </p>
        </div>
      ))}
    </div>
  );
}
