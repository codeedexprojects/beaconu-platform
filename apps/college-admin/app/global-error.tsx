"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "sans-serif",
          background: "#0b0f1a",
          color: "#e2e8f0",
        }}
      >
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: 700,
              marginBottom: "0.5rem",
            }}
          >
            Something went wrong
          </h1>
          <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>
            {error.digest && (
              <span
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.75rem",
                  display: "block",
                  marginBottom: "0.5rem",
                }}
              >
                Error ID: {error.digest}
              </span>
            )}
            The application encountered an unexpected error.
          </p>
          <button
            onClick={reset}
            style={{
              background: "#3b82f6",
              color: "#fff",
              border: "none",
              padding: "0.625rem 1.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
