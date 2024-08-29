import { Visualizer } from './Visualizer';

interface Node {
  x: number;
  y: number;
  frequency: number;
  connections: number[];
  intensity: number;
}

export class SynapticNetworkVisualizer implements Visualizer {
  private ctx: CanvasRenderingContext2D;
  private width: number;
  private height: number;
  private nodes: Node[];
  private readonly nodeCount = 32; // Matches typical analyser.fftSize / 2
  private time: number = 0;

  constructor(ctx: CanvasRenderingContext2D, width: number, height: number) {
    this.ctx = ctx;
    this.width = width;
    this.height = height;
    this.nodes = this.createNodes();
  }

  private createNodes(): Node[] {
    const nodes: Node[] = [];
    for (let i = 0; i < this.nodeCount; i++) {
      nodes.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        frequency: i,
        connections: this.getRandomConnections(i),
        intensity: 0
      });
    }
    return nodes;
  }

  private getRandomConnections(index: number): number[] {
    const connections: number[] = [];
    const connectionCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 connections
    for (let i = 0; i < connectionCount; i++) {
      let connection = Math.floor(Math.random() * this.nodeCount);
      while (connection === index || connections.includes(connection)) {
        connection = Math.floor(Math.random() * this.nodeCount);
      }
      connections.push(connection);
    }
    return connections;
  }

  private updateNodes(audioData: Uint8Array): void {
    this.nodes.forEach((node, index) => {
      node.intensity = audioData[index] / 255;
      
      // Move nodes based on their intensity and time
      const angle = (this.time + index) * 0.05;
      const distance = node.intensity * 2;
      node.x += Math.cos(angle) * distance;
      node.y += Math.sin(angle) * distance;

      // Keep nodes within bounds
      node.x = Math.max(0, Math.min(this.width, node.x));
      node.y = Math.max(0, Math.min(this.height, node.y));
    });
  }

  private drawNodes(): void {
    this.nodes.forEach(node => {
      const radius = node.intensity * 10 + 2;
      const hue = node.frequency * (360 / this.nodeCount);
      
      this.ctx.beginPath();
      this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `hsla(${hue}, 100%, 50%, ${node.intensity})`;
      this.ctx.fill();
    });
  }

  private drawConnections(): void {
    this.nodes.forEach(node => {
      node.connections.forEach(connectionIndex => {
        const connectedNode = this.nodes[connectionIndex];
        const intensity = (node.intensity + connectedNode.intensity) / 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(node.x, node.y);
        this.ctx.lineTo(connectedNode.x, connectedNode.y);
        this.ctx.strokeStyle = `rgba(255, 255, 255, ${intensity * 0.5})`;
        this.ctx.lineWidth = intensity * 3;
        this.ctx.stroke();
      });
    });
  }

  draw(audioData: Uint8Array): void {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.updateNodes(audioData);
    this.drawConnections();
    this.drawNodes();

    this.time += 0.1; // Increment time for animation
  }

  // Method to handle user interaction (e.g., clicking or dragging nodes)
  handleInteraction(x: number, y: number): void {
    // Find the closest node
    const closestNode = this.nodes.reduce((closest, node) => {
      const distance = Math.sqrt((node.x - x) ** 2 + (node.y - y) ** 2);
      return distance < closest.distance ? { node, distance } : closest;
    }, { node: null, distance: Infinity });

    if (closestNode.node && closestNode.distance < 20) {
      // Highlight the node and its connections
      closestNode.node.intensity = 1;
      closestNode.node.connections.forEach(index => {
        this.nodes[index].intensity = 1;
      });
    }
  }
}