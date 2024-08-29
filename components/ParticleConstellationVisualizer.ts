import { Visualizer } from './Visualizer';

interface Particle {
  x: number;
  y: number;
  size: number;
  color: string;
  speed: number;
}

export class ParticleConstellationVisualizer implements Visualizer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private particles: Particle[];
  private readonly particleCount = 100;
  private readonly connectionDistance = 100;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.particles = this.createParticles();
  }

  private createParticles(): Particle[] {
    return Array.from({ length: this.particleCount }, () => ({
      x: Math.random() * this.width,
      y: Math.random() * this.height,
      size: Math.random() * 2 + 1,
      color: `hsl(${Math.random() * 360}, 50%, 50%)`,
      speed: Math.random() * 0.5 + 0.1
    }));
  }

  private updateParticles(audioData: Uint8Array): void {
    this.particles.forEach((particle, index) => {
      // Move particle
      particle.y -= particle.speed;
      
      // Reset particle if it moves off screen
      if (particle.y < 0) {
        particle.y = this.height;
        particle.x = Math.random() * this.width;
      }

      // Update particle based on audio data
      const audioIndex = Math.floor(index / this.particles.length * audioData.length);
      particle.size = (audioData[audioIndex] / 255) * 3 + 1;
      particle.color = `hsl(${audioData[audioIndex]}, 50%, 50%)`;
    });
  }

  private drawParticles(): void {
    this.particles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.fill();
    });
  }

  private drawConnections(): void {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    this.ctx.lineWidth = 0.5;

    for (let i = 0; i < this.particles.length; i++) {
      for (let j = i + 1; j < this.particles.length; j++) {
        const dx = this.particles[i].x - this.particles[j].x;
        const dy = this.particles[i].y - this.particles[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.connectionDistance) {
          this.ctx.beginPath();
          this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
          this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
          this.ctx.stroke();
        }
      }
    }
  }

  draw(audioData: Uint8Array): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.updateParticles(audioData);
    this.drawConnections();
    this.drawParticles();
  }
}