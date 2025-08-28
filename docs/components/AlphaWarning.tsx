interface AlphaWarningProps {
  message?: string;
}

export function AlphaWarning({
  message = "Photon is currently in alpha. APIs may change before stable release.",
}: AlphaWarningProps) {
  return (
    <div
      style={{
        backgroundColor: "#fff3cd",
        border: "1px solid #ffeaa7",
        borderRadius: "6px",
        padding: "12px 16px",
        marginBottom: "1.5rem",
        color: "#856404",
        fontSize: "0.95em",
      }}
    >
      <strong>⚠️ Alpha Stage:</strong> {message}
    </div>
  );
}
