import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  life: number;
  color: string;
}

const ParticleTrail = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const animationFrameId = useRef<number>();
  const isDarkMode = useRef<boolean>(false);

  useEffect(() => {
    // Check if we're in dark mode initially and watch for changes
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains('dark');
      isDarkMode.current = isDark;
    };

    // Initial check
    checkTheme();

    // Create a mutation observer to watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = {
        x: e.clientX,
        y: e.clientY,
      };
      createParticles();
    };

    const createParticles = () => {
      // Different color sets for dark and light modes
      const darkColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FF9AA2', '#FFDAC1'];
      const lightColors = ['#FF5252', '#2196F3', '#673AB7', '#009688', '#FF9800'];
      
      const numParticles = 4;

      for (let i = 0; i < numParticles; i++) {
        const size = Math.random() * 5 + 2;
        const speedX = (Math.random() - 0.5) * 2;
        const speedY = (Math.random() - 0.5) * 2;
        
        // Choose colors based on current theme
        const colors = isDarkMode.current ? darkColors : lightColors;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particles.current.push({
          x: mousePos.current.x,
          y: mousePos.current.y,
          size,
          speedX,
          speedY,
          life: 1,
          color,
        });
      }
    };

    const animate = () => {
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Get current blend mode based on theme
      canvas.style.mixBlendMode = isDarkMode.current ? 'screen' : 'multiply';

      particles.current = particles.current.filter((particle) => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.life -= 0.02; // Slightly faster fade

        if (particle.life <= 0) return false;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        
        // Stronger opacity for better visibility on all backgrounds
        const opacity = Math.floor(particle.life * 255).toString(16).padStart(2, '0');
        ctx.fillStyle = `${particle.color}${opacity}`;
        ctx.fill();

        return true;
      });

      animationFrameId.current = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    resizeCanvas();
    animate();

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-50"
    />
  );
};

export default ParticleTrail; 