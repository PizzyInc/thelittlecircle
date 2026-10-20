"use client";

import { useEffect, useState } from "react";

const LABELS = ["The Little Circle", "Your Little Circle"];

export default function BrandName() {
  const [idx, setIdx] = useState(0);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIdx((i) => (i + 1) % LABELS.length);
        setFading(false);
      }, 280);
    }, 4000);
    return () => clearInterval(id);
  }, []);

  return (
    <span
      className="font-semibold text-sky-900 text-sm"
      style={{
        display: "inline-block",
        opacity: fading ? 0 : 1,
        transform: fading ? "translateY(-5px)" : "translateY(0)",
        transition: "opacity 0.28s ease, transform 0.28s ease",
      }}
    >
      {LABELS[idx]}
    </span>
  );
}
