import { useEffect, useRef } from 'react';

export function NeonBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particlesArray: Particle[] = [];
    const numberOfParticles = 80;
    let animationId: number;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let mouse = {
      x: null as number | null,
      y: null as number | null,
      radius: 120
    };

    const handleMouseMove = (event: MouseEvent) => {
      mouse.x = event.x;
      mouse.y = event.y;
    };
    
    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        mouse.x = event.touches[0].clientX;
        mouse.y = event.touches[0].clientY;
      }
    };
    
    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      init();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('resize', handleResize);

    class Particle {
      x: number;
      y: number;
      size: number;
      baseX: number;
      baseY: number;
      density: number;
      vx: number;
      vy: number;

      constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.baseX = this.x;
        this.baseY = this.y;
        this.density = (Math.random() * 30) + 1;
        this.size = Math.random() * 2 + 1;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(245, 158, 11, 1)';
      }

      update() {
        // Space drift
        this.baseX += this.vx;
        this.baseY += this.vy;

        // Wrap around boundaries to keep particles flowing
        if (this.baseX > canvas.width) {
          this.baseX = 0;
          this.x = 0;
        } else if (this.baseX < 0) {
          this.baseX = canvas.width;
          this.x = canvas.width;
        }
        
        if (this.baseY > canvas.height) {
          this.baseY = 0;
          this.y = 0;
        } else if (this.baseY < 0) {
          this.baseY = canvas.height;
          this.y = canvas.height;
        }

        // Calculate distance to mouse
        let forceDirectionX = 0;
        let forceDirectionY = 0;
        let force = 0;

        if (mouse.x != null && mouse.y != null) {
          let dxMouse = mouse.x - this.x;
          let dyMouse = mouse.y - this.y;
          let distance = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
          
          if (distance < mouse.radius) {
            forceDirectionX = dxMouse / distance;
            forceDirectionY = dyMouse / distance;
            // Easing the force for smoother interaction
            force = (mouse.radius - distance) / mouse.radius;
          }
        }

        // Repel from mouse smoothly
        if (force > 0) {
           let pushX = forceDirectionX * force * this.density * 0.5;
           let pushY = forceDirectionY * force * this.density * 0.5;
           this.x -= pushX;
           this.y -= pushY;
        }

        // Spring back to base position smoothly (lower multiplier = smoother/slower return)
        this.x += (this.baseX - this.x) * 0.03;
        this.y += (this.baseY - this.y) * 0.03;
      }
    }

    function init() {
      particlesArray = [];
      for (let i = 0; i < numberOfParticles; i++) {
        let x = Math.random() * canvas.width;
        let y = Math.random() * canvas.height;
        particlesArray.push(new Particle(x, y));
      }
    }
    
    function connect() {
      if (!ctx) return;
      let opacityValue = 1;
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          let dx = particlesArray[a].x - particlesArray[b].x;
          let dy = particlesArray[a].y - particlesArray[b].y;
          let distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < 120) {
            opacityValue = 1 - (distance / 120);
            ctx.shadowBlur = 0;
            ctx.strokeStyle = `rgba(245, 158, 11, ${opacityValue * 0.4})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].draw();
        particlesArray[i].update();
      }
      connect();
      animationId = requestAnimationFrame(animate);
    }

    init();
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}
