import React, { createContext, useContext, useState, type ReactNode } from "react";

interface NotificationContextType {
  showNotification: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  const showNotification = (msg: string) => {
    setMessage(msg);
    setVisible(true);
    setTimeout(() => {
      setVisible(false);
    }, 2500);
  };

  // Responsive styles for toast
  const toastStyle: React.CSSProperties = {
    background: "#22c55e", // Verde validación
    color: "#fff",
    padding: "10px 14px",
    borderRadius: 8,
    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
    minWidth: 120,
    maxWidth: 260,
    fontWeight: 500,
    fontSize: 14,
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  // Media query para móvil: más chico y debajo de la navbar (por ejemplo, top: 60px)
  const mobileStyle = `
    @media (max-width: 600px) {
      .jl-toast {
        min-width: 90px !important;
        max-width: 80vw !important;
        font-size: 12px !important;
        padding: 6px 10px !important;
        border-radius: 5px !important;
      }
      .jl-toast-container {
        top: 60px !important;
        bottom: auto !important;
        right: 6px !important;
      }
    }
  `;

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <style>{mobileStyle}</style>
      <div
        className="jl-toast-container"
        style={{
          position: "fixed",
          top: 18,
          right: 12,
          zIndex: 9999,
          transition: "opacity 0.3s",
          opacity: visible ? 1 : 0,
          pointerEvents: "none",
        }}
      >
        {visible && message && (
          <div className="jl-toast" style={toastStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" fill="#22c55e"/><path d="M9 12l2 2l4-4" stroke="#fff" strokeWidth="2"/></svg>
            <span>{message}</span>
          </div>
        )}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error("useNotification must be used within a NotificationProvider");
  return context;
}; 