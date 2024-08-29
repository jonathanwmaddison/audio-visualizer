import { Visualizer } from './Visualizer';

export class RainbowSquarePulseVisualizer implements Visualizer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private squareSize: number;
  private rainbowColors: string[];
  private currentColorIndex: number;
  private yPosition: number;
  private lastAudioLevel: number;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.squareSize = Math.min(width, height) / 4;
    this.rainbowColors = [
      '#FF0000', '#FF7F00', '#FFFF00', '#00FF00', 
      '#0000FF', '#4B0082', '#9400D3'
    ];
    this.currentColorIndex = 0;
    this.yPosition = height / 2;
    this.lastAudioLevel = 0;
  }

  draw(audioData: Uint8Array, sensitivity: number): void {
    const ctx = this.ctx;
    const width = this.width;
    const height = this.height;

    // Clear the canvas with a slight trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, width, height);

    // Calculate the average volume, focusing on lower frequencies
    const lowFreqData = audioData.slice(0, Math.floor(audioData.length / 3));
    const average = lowFreqData.reduce((sum, value) => sum + value, 0) / lowFreqData.length;
    
    // Apply sensitivity and smooth the audio level
    const audioLevel = (average / 255) * sensitivity;
    this.lastAudioLevel = this.lastAudioLevel * 0.8 + audioLevel * 0.2;

    // Determine the y position based on the volume
    const targetY = height - this.lastAudioLevel * height;
    this.yPosition += (targetY - this.yPosition) * 0.1; // Smooth movement

    // Calculate the size of the square based on the volume
    const basePulseSize = this.squareSize + (this.lastAudioLevel * this.squareSize);
    const pulseSize = basePulseSize + Math.sin(Date.now() / 200) * (basePulseSize * 0.1);

    // Draw rainbow trails
    for (let i = 5; i >= 0; i--) {
      const trailSize = pulseSize - i * 15;
      const trailAlpha = 1 - (i / 5);
      const colorIndex = (this.currentColorIndex - i + this.rainbowColors.length) % this.rainbowColors.length;
      ctx.fillStyle = this.hexToRGBA(this.rainbowColors[colorIndex], trailAlpha);
      ctx.fillRect(
        width / 2 - trailSize / 2,
        this.yPosition - trailSize / 2,
        trailSize,
        trailSize
      );
    }

    // Draw the main square
    ctx.fillStyle = this.rainbowColors[this.currentColorIndex];
    ctx.fillRect(
      width / 2 - pulseSize / 2,
      this.yPosition - pulseSize / 2,
      pulseSize,
      pulseSize
    );

    // Add a glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.rainbowColors[this.currentColorIndex];
    ctx.strokeStyle = this.rainbowColors[this.currentColorIndex];
    ctx.lineWidth = 2;
    ctx.strokeRect(
      width / 2 - pulseSize / 2,
      this.yPosition - pulseSize / 2,
      pulseSize,
      pulseSize
    );
    ctx.shadowBlur = 0;

    // Cycle through colors based on audio intensity
    if (this.lastAudioLevel > 0.5) {
      this.currentColorIndex = (this.currentColorIndex + 1) % this.rainbowColors.length;
    }
  }

  private hexToRGBA(hex: string, alpha: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}