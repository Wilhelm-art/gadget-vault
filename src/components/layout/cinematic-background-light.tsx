"use client";

import React, { useEffect, useRef } from "react";

export default function CinematicBackgroundLight() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = containerRef.current?.clientWidth || window.innerWidth);
    let height = (canvas.height = containerRef.current?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas || !containerRef.current) return;
      width = canvas.width = containerRef.current.clientWidth;
      height = canvas.height = containerRef.current.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle settings - reduced count for performance & subtleness
    const particleCount = Math.min(45, Math.floor(width / 30));
    const particles: Particle[] = [];
    const mouse = { x: 0, y: 0, active: false, radius: 160 };

    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      baseColor: string;

      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        // Super drift speed
        this.vx = (Math.random() - 0.5) * 0.2;
        this.vy = (Math.random() - 0.5) * 0.2;
        this.size = Math.random() * 2.5 + 1.5; // 1.5px to 4px
        this.alpha = Math.random() * 0.4 + 0.15; // 0.15 to 0.55 opacity
        this.baseColor = Math.random() > 0.4 ? "201, 169, 110" : "116, 90, 39"; // Gold (#c9a96e) or Deep Bronze (#745a27)
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Wrap boundaries
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Mouse interaction (gentle push away)
        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.hypot(dx, dy);
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            // Push away gently
            this.x -= (dx / distance) * force * 0.8;
            this.y -= (dy / distance) * force * 0.8;
          }
        }
      }

      draw(c: CanvasRenderingContext2D) {
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = `rgba(${this.baseColor}, ${this.alpha})`;
        c.fill();
        c.restore();
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Mouse listeners
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    const parent = containerRef.current;
    if (parent) {
      parent.addEventListener("mousemove", handleMouseMove, { passive: true });
      parent.addEventListener("mouseleave", handleMouseLeave, { passive: true });
    }

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw digital HUD grid lines (very faint)
      ctx.strokeStyle = "rgba(201, 169, 110, 0.025)";
      ctx.lineWidth = 0.75;
      const gridSize = 64;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Update & Draw particles
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      // Draw constellation links (faint connections between nearby particles)
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.hypot(dx, dy);
          if (dist < 120) {
            const alpha = ((120 - dist) / 120) * 0.15;
            ctx.strokeStyle = `rgba(201, 169, 110, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      if (parent) {
        parent.removeEventListener("mousemove", handleMouseMove);
        parent.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none"
    >
      {/* Warm ambient background radials behind the canvas */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(201,169,110,0.15),transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(201,169,110,0.08),transparent_50%)] pointer-events-none" />
      
      {/* Interactive canvas on top of radials, but behind hero content */}
      <canvas ref={canvasRef} className="w-full h-full block opacity-100 pointer-events-none" />
    </div>
  );
}
