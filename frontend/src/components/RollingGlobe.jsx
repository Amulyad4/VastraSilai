import React, { useEffect, useRef, useState } from 'react';

export default function RollingGlobe() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId;
    const width = canvas.width = 800;
    const height = canvas.height = 800;

    // Particle class
    const particleCount = 230;
    const particles = [];
    const radius = 245; // Sphere radius increased to 245 for a much larger rolling volume

    // Color palette matching the theme
    const colors = [
      { r: 124, g: 58, b: 237 },  // Purple (#7C3AED)
      { r: 236, g: 72, b: 153 },  // Pink (#EC4899)
      { r: 99, g: 102, b: 241 },  // Indigo (#6366F1)
      { r: 6, g: 182, b: 212 }    // Cyan (#06B6D4)
    ];

    // Helper functions to draw tailor bits (tools/items) - scale updated with 1.35x size modifier
    const drawButton = (ctx, x, y, size, color, alpha) => {
      const r = size * 3.8;
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.4})`;
      ctx.lineWidth = 1.2;
      
      // Main circle
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner rim
      ctx.beginPath();
      ctx.arc(x, y, r * 0.65, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 0, 0, ${alpha * 0.18})`;
      ctx.stroke();

      // Holes
      const offset = r * 0.3;
      ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.75})`;
      ctx.beginPath();
      ctx.arc(x - offset, y - offset, r * 0.12, 0, Math.PI * 2);
      ctx.arc(x + offset, y - offset, r * 0.12, 0, Math.PI * 2);
      ctx.arc(x - offset, y + offset, r * 0.12, 0, Math.PI * 2);
      ctx.arc(x + offset, y + offset, r * 0.12, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawSpool = (ctx, x, y, size, color, alpha) => {
      const w = size * 4.3;
      const h = size * 6.8;

      // Wooden ends
      ctx.fillStyle = `rgba(190, 140, 100, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(x, y - h / 2, w * 0.55, h * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(x, y + h / 2, w * 0.55, h * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();

      // Core tube
      ctx.fillStyle = `rgba(210, 160, 120, ${alpha})`;
      ctx.fillRect(x - w * 0.15, y - h / 2, w * 0.3, h);

      // Thread cylinder
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.fillRect(x - w * 0.42, y - h * 0.36, w * 0.84, h * 0.72);

      // Thread texture lines
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.3})`;
      ctx.lineWidth = 0.8;
      for (let dy = -h * 0.28; dy <= h * 0.28; dy += h * 0.14) {
        ctx.beginPath();
        ctx.moveTo(x - w * 0.42, y + dy);
        ctx.lineTo(x + w * 0.42, y + dy);
        ctx.stroke();
      }
    };

    const drawNeedle = (ctx, x, y, size, color, alpha, rotAngle) => {
      const len = size * 10.2;
      
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotAngle);
      
      // Needle body
      ctx.strokeStyle = `rgba(180, 180, 185, ${alpha})`;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-len / 2, 0);
      ctx.lineTo(len / 2, 0);
      ctx.stroke();

      // Eye loop
      ctx.beginPath();
      ctx.ellipse(-len / 2.3, 0, len * 0.06, len * 0.022, 0, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(120, 120, 125, ${alpha})`;
      ctx.stroke();

      // Thread dangling through eye
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.75})`;
      ctx.beginPath();
      ctx.moveTo(-len / 2.3, 0);
      ctx.bezierCurveTo(-len * 0.6, -len * 0.2, -len * 0.75, len * 0.15, -len * 0.85, 0);
      ctx.stroke();

      ctx.restore();
    };

    const drawScissors = (ctx, x, y, size, color, alpha, rotAngle) => {
      const len = size * 8.8;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotAngle);

      // Blades (crossing lines)
      ctx.strokeStyle = `rgba(150, 150, 150, ${alpha})`;
      ctx.lineWidth = 1.4;

      // Upper blade
      ctx.beginPath();
      ctx.moveTo(-len * 0.1, len * 0.05);
      ctx.lineTo(len * 0.6, -len * 0.08);
      ctx.stroke();

      // Lower blade
      ctx.beginPath();
      ctx.moveTo(-len * 0.1, -len * 0.05);
      ctx.lineTo(len * 0.6, len * 0.08);
      ctx.stroke();

      // Colored plastic handles
      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.25})`;
      ctx.lineWidth = 1.6;

      // Handle 1 loop
      ctx.beginPath();
      ctx.arc(-len * 0.25, -len * 0.15, len * 0.14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      // Handle 2 loop
      ctx.beginPath();
      ctx.arc(-len * 0.25, len * 0.15, len * 0.14, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fill();

      // Hinge screw
      ctx.fillStyle = `rgba(100, 100, 100, ${alpha})`;
      ctx.beginPath();
      ctx.arc(0, 0, len * 0.04, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const drawHanger = (ctx, x, y, size, color, alpha, rotAngle) => {
      const w = size * 10.2;
      const h = size * 5.4;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotAngle);

      ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
      ctx.lineWidth = 1.4;

      // Triangle base
      ctx.beginPath();
      ctx.moveTo(-w / 2, h * 0.15);
      ctx.lineTo(w / 2, h * 0.15);
      ctx.lineTo(0, -h * 0.25);
      ctx.closePath();
      ctx.stroke();

      // Hook
      ctx.beginPath();
      ctx.arc(0, -h * 0.4, h * 0.14, Math.PI * 0.5, Math.PI * 2.1);
      ctx.stroke();

      ctx.restore();
    };

    // Initialize particles uniformly distributed on a sphere
    for (let i = 0; i < particleCount; i++) {
      const theta = Math.acos(Math.random() * 2 - 1);
      const phi = Math.random() * Math.PI * 2;
      
      const x = radius * Math.sin(theta) * Math.cos(phi);
      const y = radius * Math.sin(theta) * Math.sin(phi);
      const z = radius * Math.cos(theta);

      // Random color
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      // Determine type: Mix of dots and tailor bits (spools, buttons, needles, scissors, hangers)
      let type = 'dot';
      
      // Around 35% of the particles will be custom tailor bits
      if (i < 70) {
        const types = ['button', 'spool', 'needle', 'scissors', 'hanger'];
        type = types[i % types.length];
      }

      // Orientation variables for bits
      const rotAngle = Math.random() * Math.PI * 2;
      const rotSpeed = (Math.random() - 0.5) * 0.025;
      
      particles.push({
        x, y, z,
        baseX: x, baseY: y, baseZ: z,
        color,
        type,
        rotAngle,
        rotSpeed
      });
    }

    // Rotation variables (speed of rolling)
    let angleX = 0.003;
    let angleY = 0.005;
    const focalLength = 450; // Increased focalLength to match sphere radius

    // Interactive offset from mouse movement
    let targetOffsetX = 0;
    let targetOffsetY = 0;
    let currentOffsetX = 0;
    let currentOffsetY = 0;

    const handleMouseMove = (e) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      targetOffsetX = (e.clientX - cx) / (rect.width / 2) * 0.2;
      targetOffsetY = (e.clientY - cy) / (rect.height / 2) * 0.2;
    };

    const handleMouseEnter = () => {
      setIsHovered(true);
    };

    const handleMouseLeave = () => {
      setIsHovered(false);
      targetOffsetX = 0;
      targetOffsetY = 0;
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseenter', handleMouseEnter);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Smooth interpolation for interactive mouse offset
      currentOffsetX += (targetOffsetX - currentOffsetX) * 0.08;
      currentOffsetY += (targetOffsetY - currentOffsetY) * 0.08;

      // Base speeds + interactive offsets (creates the dynamic rolling effect)
      const speedX = angleX + currentOffsetY * 0.04;
      const speedY = angleY + currentOffsetX * 0.04;

      // Update, rotate, and project particles
      const rotatedParticles = particles.map(p => {
        // Rotate around X-axis
        let y1 = p.y * Math.cos(speedX) - p.z * Math.sin(speedX);
        let z1 = p.y * Math.sin(speedX) + p.z * Math.cos(speedX);

        // Rotate around Y-axis
        let x2 = p.x * Math.cos(speedY) - z1 * Math.sin(speedY);
        let z2 = p.x * Math.sin(speedY) + z1 * Math.cos(speedY);

        // Update coordinate references for next frame
        p.x = x2;
        p.y = y1;
        p.z = z2;

        // Spin tailor bits individually on their axis
        p.rotAngle += p.rotSpeed;

        // Project to 2D
        const scale = focalLength / (focalLength + z2);
        const projX = centerX + x2 * scale;
        const projY = centerY + y1 * scale;

        return {
          ...p,
          projX,
          projY,
          scale,
          depth: z2
        };
      });

      // Sort by depth (back-to-front rendering)
      rotatedParticles.sort((a, b) => b.depth - a.depth);

      // Draw faint constellation lines between nearby particles (resembles stitching lines)
      ctx.lineWidth = 0.6;
      for (let i = 0; i < rotatedParticles.length; i++) {
        const p1 = rotatedParticles[i];
        for (let j = i + 1; j < rotatedParticles.length; j++) {
          const p2 = rotatedParticles[j];
          
          // 3D distance check
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dz = p1.z - p2.z;
          const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);

          if (dist < 95) { // Increased distance threshold to 95 for larger sphere
            // Calculate transparency based on distance and depth
            const avgDepth = (p1.depth + p2.depth) / 2;
            const depthAlpha = Math.max(0.04, (focalLength - avgDepth) / (2 * focalLength));
            const distAlpha = 1 - (dist / 95);
            const alpha = depthAlpha * distAlpha * 0.15;

            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p1.projX, p1.projY);
            ctx.lineTo(p2.projX, p2.projY);
            ctx.stroke();
          }
        }
      }

      // Draw particles (dots + tailor bits)
      rotatedParticles.forEach(p => {
        const { projX, projY, scale, depth, color, type, rotAngle } = p;
        
        // Calculate size based on projection scale (base particle multiplier increased to 4.2)
        const size = Math.max(0.8, (scale * 4.2));
        
        // Calculate opacity based on depth
        const alpha = Math.max(0.12, Math.min(1, (focalLength - depth) / (2 * focalLength)));

        // Glow effect for front elements
        if (depth < 0 && alpha > 0.6) {
          ctx.shadowBlur = 8 * scale;
          ctx.shadowColor = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha * 0.8})`;
        } else {
          ctx.shadowBlur = 0;
        }

        // Render based on type
        if (type === 'dot') {
          ctx.fillStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${alpha})`;
          ctx.beginPath();
          ctx.arc(projX, projY, size, 0, Math.PI * 2);
          ctx.fill();
        } else if (type === 'button') {
          drawButton(ctx, projX, projY, size, color, alpha);
        } else if (type === 'spool') {
          drawSpool(ctx, projX, projY, size, color, alpha);
        } else if (type === 'needle') {
          drawNeedle(ctx, projX, projY, size, color, alpha, rotAngle);
        } else if (type === 'scissors') {
          drawScissors(ctx, projX, projY, size, color, alpha, rotAngle);
        } else if (type === 'hanger') {
          drawHanger(ctx, projX, projY, size, color, alpha, rotAngle);
        }
      });

      // Reset shadow blur
      ctx.shadowBlur = 0;

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseenter', handleMouseEnter);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[400px] sm:h-[520px] md:h-[580px] lg:h-[650px] xl:h-[720px] max-w-[720px] flex items-center justify-center select-none cursor-pointer"
      style={{
        perspective: '1000px'
      }}
    >
      {/* 3D Rolling Sphere Canvas */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full object-contain pointer-events-none"
      />

      {/* Outer Floating Stitch Line */}
      <div 
        className="absolute w-[88%] h-[88%] rounded-full border border-purple-500/10 pointer-events-none animate-spin"
        style={{
          animationDuration: '40s',
          borderStyle: 'dashed',
          borderWidth: '1.2px'
        }}
      ></div>

      {/* Stylized Glowing Foreground Text - VASTRASILAI */}
      <div 
        className="absolute inset-0 flex items-center justify-center pointer-events-none transition-transform duration-300"
        style={{
          transform: isHovered ? 'scale(1.08) translateZ(50px)' : 'scale(1) translateZ(0px)',
          transformStyle: 'preserve-3d'
        }}
      >
        <div className="text-center select-none filter drop-shadow-[0_12px_24px_rgba(124,58,237,0.35)]">
          <h2 
            className="font-heading text-2xl sm:text-3xl md:text-3.5xl lg:text-4xl font-black tracking-[0.18em] bg-gradient-to-r from-purple-600 via-pink-500 to-cyan-500 bg-clip-text text-transparent transform-gpu leading-none"
            style={{
              textShadow: '0 4px 12px rgba(255,255,255,0.4)',
              paddingLeft: '0.18em' // offset the tracking right margin to center text perfectly
            }}
          >
            VASTRASILAI
          </h2>
          <div className="h-1 w-20 sm:w-28 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 mx-auto mt-3.5 rounded-full opacity-80 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
