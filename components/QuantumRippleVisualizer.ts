import { Visualizer } from './Visualizer';

interface Particle {
  x: number;
  y: number;
  amplitude: number;
  phase: number;
  frequency: number;
}

export class QuantumRippleVisualizer implements Visualizer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private particles: Particle[];
  private time: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.particles = this.initializeParticles();
    this.time = 0;
  }

  private initializeParticles(): Particle[] {
    const particles: Particle[] = [];
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        amplitude: Math.random() * 20 + 10,
        phase: Math.random() * Math.PI * 2,
        frequency: Math.random() * 0.02 + 0.01
      });
    }
    return particles;
  }

  draw(audioData: Uint8Array, sensitivity: number): void {
    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;

    // Clear the canvas with a fade effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // Calculate average audio level
    const avgAudio = audioData.reduce((sum, val) => sum + val, 0) / audioData.length;
    const normalizedAudio = avgAudio / 255 * sensitivity;

    // Update and draw particles
    this.particles.forEach((particle, index) => {
      const audioIndex = Math.floor(index / this.particles.length * audioData.length);
      const audioValue = audioData[audioIndex] / 255 * sensitivity;

      particle.amplitude = 10 + audioValue * 40;
      particle.frequency = 0.01 + audioValue * 0.03;

      const waveX = Math.sin(this.time * particle.frequency + particle.phase) * particle.amplitude;
      const waveY = Math.cos(this.time * particle.frequency + particle.phase) * particle.amplitude;

      const x = (particle.x + waveX + width) % width;
      const y = (particle.y + waveY + height) % height;

      // Draw quantum particle
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, particle.amplitude);
      gradient.addColorStop(0, `hsla(${audioValue * 360}, 100%, 50%, 0.8)`);
      gradient.addColorStop(1, `hsla(${audioValue * 360}, 100%, 50%, 0)`);

      ctx.beginPath();
      ctx.arc(x, y, particle.amplitude, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    });

    // Draw interference patterns
    ctx.globalCompositeOperation = 'screen';
    ctx.lineWidth = 2;
    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const p1 = this.particles[i];
        const p2 = this.particles[j];
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < 100) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `hsla(${normalizedAudio * 360}, 100%, 50%, ${1 - distance / 100})`;
          ctx.stroke();
        }
      }
    }
    ctx.globalCompositeOperation = 'source-over';

    this.time += 0.1;
  }
}