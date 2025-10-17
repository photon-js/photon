interface BetaWarningProps {
  message?: string;
}

export function BetaWarning({
  message = "Photon is currently in beta. APIs may change before stable release.",
}: BetaWarningProps) {
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
      <strong>⚠️ Beta Stage:</strong> {message}
    </div>
  );
}
