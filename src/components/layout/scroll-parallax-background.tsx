"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * ScrollParallaxBackground
 * 
 * Premium scroll-driven parallax background for the landing page.
 * Creates a luxurious mockup-like experience with:
 * - Floating geometric shapes that drift at different speeds
 * - Golden accent orbs with blur
 * - Grid lines that create a "tech blueprint" feel
 * - Smooth gradient transitions on scroll
 * All CSS + minimal JS for optimal performance.
 */
export default function ScrollParallaxBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Calculate parallax offsets at different speeds
  const slow = scrollY * 0.03;
  const medium = scrollY * 0.06;
  const fast = scrollY * 0.1;
  const rotate = scrollY * 0.015;

  return (
    <div
      ref={containerRef}
      className="scroll-parallax-bg"
      aria-hidden="true"
    >
      {/* ── Layer 1: Deep ambient gradients ── */}
      <div
        className="parallax-layer gradient-layer-1"
        style={{ transform: `translateY(${slow}px)` }}
      />
      <div
        className="parallax-layer gradient-layer-2"
        style={{ transform: `translateY(${-slow * 0.5}px)` }}
      />

      {/* ── Layer 2: Golden accent orbs ── */}
      <div
        className="parallax-layer orb orb-1"
        style={{ transform: `translate(${slow * 0.4}px, ${-medium}px)` }}
      />
      <div
        className="parallax-layer orb orb-2"
        style={{ transform: `translate(${-slow * 0.6}px, ${medium * 0.7}px)` }}
      />
      <div
        className="parallax-layer orb orb-3"
        style={{ transform: `translate(${medium * 0.3}px, ${-fast * 0.4}px)` }}
      />

      {/* ── Layer 3: Floating geometric shapes (mockup feel) ── */}
      <div
        className="parallax-layer shape shape-card shape-1"
        style={{
          transform: `translateY(${-medium}px) rotate(${12 + rotate}deg)`,
        }}
      />
      <div
        className="parallax-layer shape shape-card shape-2"
        style={{
          transform: `translateY(${-fast * 0.6}px) rotate(${-8 + rotate * 0.5}deg)`,
        }}
      />
      <div
        className="parallax-layer shape shape-card shape-3"
        style={{
          transform: `translateY(${-medium * 0.8}px) rotate(${22 - rotate * 0.3}deg)`,
        }}
      />

      {/* ── Layer 4: Thin accent lines (blueprint/tech feel) ── */}
      <div
        className="parallax-layer accent-line accent-line-1"
        style={{ transform: `translateY(${-slow * 2}px) rotate(${35}deg)` }}
      />
      <div
        className="parallax-layer accent-line accent-line-2"
        style={{ transform: `translateY(${-medium * 1.5}px) rotate(${-25}deg)` }}
      />

      {/* ── Layer 5: Floating dots constellation ── */}
      <div
        className="parallax-layer dots-layer"
        style={{ transform: `translateY(${-medium * 0.5}px)` }}
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <span
            key={i}
            className="floating-dot"
            style={{
              left: `${8 + (i * 7.5) % 85}%`,
              top: `${5 + (i * 13.7) % 80}%`,
              animationDelay: `${i * 0.4}s`,
              width: `${3 + (i % 4)}px`,
              height: `${3 + (i % 4)}px`,
              opacity: 0.15 + (i % 5) * 0.06,
            }}
          />
        ))}
      </div>

      {/* ── Layer 6: Horizontal gold shimmer strip ── */}
      <div
        className="parallax-layer shimmer-strip"
        style={{ transform: `translateY(${-fast * 0.3}px)` }}
      />
    </div>
  );
}
