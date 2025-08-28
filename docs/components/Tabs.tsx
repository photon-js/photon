import type React from "react";
import { useState } from "react";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
}

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid var(--border-color)",
          marginBottom: "1rem",
          overflowX: "auto",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: "8px 16px",
              border: "none",
              backgroundColor: "transparent",
              color: activeTab === tab.id ? "var(--primary-color)" : "var(--text-color-secondary)",
              borderBottom: activeTab === tab.id ? "2px solid var(--primary-color)" : "2px solid transparent",
              cursor: "pointer",
              fontSize: "0.9em",
              fontWeight: activeTab === tab.id ? "500" : "normal",
              whiteSpace: "nowrap",
              transition: "all 0.2s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>{tabs.find((tab) => tab.id === activeTab)?.content}</div>
    </div>
  );
}
