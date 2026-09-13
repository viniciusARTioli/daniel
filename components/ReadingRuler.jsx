"use client";

import { useRef, useState } from "react";

// A translucent horizontal band that follows the pointer over its
// children, helping the reader track a single line at a time. Wrap it
// directly around the text you want the ruler to apply to.
//
// Height/opacity are deliberately modest defaults - tune to taste.
export default function ReadingRuler({ children, height = 40 }) {
  const containerRef = useRef(null);
  const [y, setY] = useState(null);

  function handleMove(clientY) {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setY(clientY - rect.top);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={(e) => handleMove(e.clientY)}
      onMouseLeave={() => setY(null)}
      onTouchMove={(e) => handleMove(e.touches[0].clientY)}
      onTouchEnd={() => setY(null)}
      style={{ position: "relative" }}
    >
      {children}
      {y !== null && (
        <>
          {/* Dim everything above the ruler band */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: Math.max(0, y - height / 2),
              background: "rgba(0, 0, 0, 0.35)",
              pointerEvents: "none",
              borderRadius: "12px 12px 0 0",
            }}
          />
          {/* Dim everything below the ruler band */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              top: y + height / 2,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.35)",
              pointerEvents: "none",
              borderRadius: "0 0 12px 12px",
            }}
          />
        </>
      )}
    </div>
  );
}
