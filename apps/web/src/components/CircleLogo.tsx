"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  size: number;
}

export default function CircleLogo({ size }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });

  const eyeSize = Math.round(size * 0.3);
  const pupilSize = Math.round(eyeSize * 0.62);
  const gap = Math.round(size * 0.14);
  const maxMove = size * 0.07;

  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (!ref.current) return;
      const rect = ref.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
      const dist = Math.min(maxMove, Math.hypot(e.clientX - cx, e.clientY - cy) / 40);
      setPupil({ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist });
    }

    let last = window.scrollY;
    let scrollTimer: ReturnType<typeof setTimeout>;
    function onScroll() {
      const cur = window.scrollY;
      const dir = cur > last ? 1 : -1;
      last = cur;
      setPupil({ x: 0, y: dir * maxMove * 0.8 });
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => setPupil({ x: 0, y: 0 }), 300);
    }

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
    };
  }, [maxMove]);

  return (
    <span
      ref={ref}
      className="flex-shrink-0 rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        gap,
        background: "linear-gradient(145deg, #ffe8dc 0%, #ffd4c4 100%)",
        boxShadow: `0 ${Math.round(size * 0.07)}px ${Math.round(size * 0.3)}px rgba(255,180,150,0.5), inset 0 ${Math.round(size * 0.04)}px ${Math.round(size * 0.12)}px rgba(255,255,255,0.7)`,
      }}
    >
      {[0, 1].map((i) => (
        <span
          key={i}
          style={{
            width: eyeSize,
            height: eyeSize,
            borderRadius: "50%",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <span
            style={{
              width: pupilSize,
              height: pupilSize,
              borderRadius: "50%",
              background: "#2c2c2c",
              flexShrink: 0,
              transform: `translate(${pupil.x}px, ${pupil.y}px)`,
              transition: "transform 0.1s ease",
              position: "relative",
            }}
          >
            <span
              style={{
                position: "absolute",
                width: Math.round(pupilSize * 0.35),
                height: Math.round(pupilSize * 0.35),
                background: "rgba(255,255,255,0.85)",
                borderRadius: "50%",
                top: "18%",
                left: "18%",
              }}
            />
          </span>
        </span>
      ))}
    </span>
  );
}
