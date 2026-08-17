"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

export default function MouseFollower() {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const cursorRingRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on fine pointer devices (desktop/mouse)
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const dot = cursorDotRef.current;
    const ring = cursorRingRef.current;
    if (!dot || !ring) return;

    // Quick setters for performant 60fps movement
    const setDotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power3.out" });
    const setDotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power3.out" });
    const setRingX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power2.out" });
    const setRingY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power2.out" });

    let isHoveringInteractive = false;

    const onMouseMove = (e: MouseEvent) => {
      if (!isVisible) setIsVisible(true);

      const { clientX, clientY } = e;
      setDotX(clientX);
      setDotY(clientY);
      setRingX(clientX);
      setRingY(clientY);

      // Check if hovering over clickable or interactive element
      const target = e.target as HTMLElement | null;
      const interactive = target?.closest('a, button, [role="button"], input, textarea, select, .interactive-hover');

      if (interactive && !isHoveringInteractive) {
        isHoveringInteractive = true;
        gsap.to(ring, {
          scale: 1.8,
          borderColor: "rgba(99, 102, 241, 0.8)",
          backgroundColor: "rgba(99, 102, 241, 0.08)",
          duration: 0.3,
          ease: "power2.out",
        });
        gsap.to(dot, {
          scale: 0.5,
          backgroundColor: "#4F46E5",
          duration: 0.2,
        });
      } else if (!interactive && isHoveringInteractive) {
        isHoveringInteractive = false;
        gsap.to(ring, {
          scale: 1,
          borderColor: "rgba(148, 163, 184, 0.5)",
          backgroundColor: "transparent",
          duration: 0.3,
          ease: "power2.out",
        });
        gsap.to(dot, {
          scale: 1,
          backgroundColor: "#0F172A",
          duration: 0.2,
        });
      }
    };

    const onMouseLeave = () => {
      setIsVisible(false);
      gsap.to([dot, ring], { opacity: 0, duration: 0.3 });
    };

    const onMouseEnter = () => {
      setIsVisible(true);
      gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
    };

    window.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
    };
  }, [isVisible]);

  return (
    <>
      {/* Center pinpoint cursor dot */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 w-2.5 h-2.5 bg-slate-900 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block transition-opacity duration-300"
        style={{ opacity: isVisible ? 1 : 0 }}
      />
      {/* Outer lagging smooth aura ring */}
      <div
        ref={cursorRingRef}
        className="fixed top-0 left-0 w-9 h-9 border border-slate-400/50 rounded-full pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 hidden md:block transition-opacity duration-300 backdrop-blur-[0.5px]"
        style={{ opacity: isVisible ? 1 : 0 }}
      />
    </>
  );
}
