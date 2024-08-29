'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Sliders, Play, Pause, Maximize, Minimize } from 'lucide-react';
import { ParticleConstellationVisualizer } from './ParticleConstellationVisualizer';
import { SynapticNetworkVisualizer } from './SynapticNetworkVisualizer';
import { RainbowSquarePulseVisualizer } from './RainbowSquarePulseVisualizer';
import { QuantumRippleVisualizer } from './QuantumRippleVisualizer';
import { Visualizer } from './Visualizer';

type VisualizationType = 'bars' | 'wave' | 'circular' | 'constellation' | 'synaptic' | 'rainbowSquare' | 'quantumRipple';

const AudioVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [dataArray, setDataArray] = useState<Uint8Array | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [visualizationType, setVisualizationType] = useState<VisualizationType>('quantumRipple');
  const [sensitivity, setSensitivity] = useState<number>(1.5);
  const [currentVisualizer, setCurrentVisualizer] = useState<Visualizer | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  useEffect(() => {
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        switch (visualizationType) {
          case 'constellation':
            setCurrentVisualizer(new ParticleConstellationVisualizer(ctx, canvasRef.current.width, canvasRef.current.height));
            break;
          case 'synaptic':
            setCurrentVisualizer(new SynapticNetworkVisualizer(ctx, canvasRef.current.width, canvasRef.current.height));
            break;
          case 'rainbowSquare':
            setCurrentVisualizer(new RainbowSquarePulseVisualizer(ctx, canvasRef.current.width, canvasRef.current.height));
            break;
          case 'quantumRipple':
            setCurrentVisualizer(new QuantumRippleVisualizer(ctx, canvasRef.current.width, canvasRef.current.height));
            break;
          default:
            setCurrentVisualizer(null);
        }
      }
    }
  }, [visualizationType]);
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx && currentVisualizer) {
          if (currentVisualizer instanceof ParticleConstellationVisualizer) {
            setCurrentVisualizer(new ParticleConstellationVisualizer(ctx, canvasRef.current.width, canvasRef.current.height));
          } else if (currentVisualizer instanceof SynapticNetworkVisualizer) {
            setCurrentVisualizer(new SynapticNetworkVisualizer(ctx, canvasRef.current.width, canvasRef.current.height));
          } else if (currentVisualizer instanceof RainbowSquarePulseVisualizer) {
            setCurrentVisualizer(new RainbowSquarePulseVisualizer(ctx, canvasRef.current.width, canvasRef.current.height));
          }
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [currentVisualizer]);

  useEffect(() => {
    if (typeof window !== 'undefined' && isRecording && canvasRef.current && analyser && dataArray) {
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      const draw = () => {
        requestAnimationFrame(draw);
        const canvas = canvasRef.current;
        if (!canvas) return;

        const WIDTH = canvas.width;
        const HEIGHT = canvas.height;

        analyser.getByteFrequencyData(dataArray);

        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'; // Increased trail effect
        ctx.fillRect(0, 0, WIDTH, HEIGHT);

        if (currentVisualizer) {
          currentVisualizer.draw(dataArray, sensitivity);
        } else {
          switch (visualizationType) {
            case 'bars':
              drawBars(ctx, WIDTH, HEIGHT, dataArray);
              break;
            case 'wave':
              drawWave(ctx, WIDTH, HEIGHT, dataArray);
              break;
            case 'circular':
              drawCircular(ctx, WIDTH, HEIGHT, dataArray);
              break;
          }
        }
      };
      draw();
    }
  }, [isRecording, analyser, dataArray, visualizationType, sensitivity, currentVisualizer]);

  const drawBars = (ctx: CanvasRenderingContext2D, WIDTH: number, HEIGHT: number, dataArray: Uint8Array) => {
    const barWidth = (WIDTH / dataArray.length) * 2.5;
    let x = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const barHeight = (dataArray[i] / 255) * HEIGHT * sensitivity;
      const r = barHeight + 25 * (i / dataArray.length);
      const g = 250 * (i / dataArray.length);
      const b = 50;
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  };

  const drawWave = (ctx: CanvasRenderingContext2D, WIDTH: number, HEIGHT: number, dataArray: Uint8Array) => {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = 'rgb(0, 255, 0)';
    const sliceWidth = WIDTH * 1.0 / dataArray.length;
    let x = 0;
    for (let i = 0; i < dataArray.length; i++) {
      const v = (dataArray[i] / 128.0) * sensitivity;
      const y = v * HEIGHT / 2;
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
      x += sliceWidth;
    }
    ctx.lineTo(WIDTH, HEIGHT / 2);
    ctx.stroke();
  };

  const drawCircular = (ctx: CanvasRenderingContext2D, WIDTH: number, HEIGHT: number, dataArray: Uint8Array) => {
    const center_x = WIDTH / 2;
    const center_y = HEIGHT / 2;
    const radius = Math.min(WIDTH, HEIGHT) / 3;
    
    ctx.beginPath();
    ctx.arc(center_x, center_y, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgb(0, 255, 0)';
    ctx.stroke();

    for (let i = 0; i < dataArray.length; i++) {
      const rads = Math.PI * 2 / dataArray.length;
      const bar_height = (dataArray[i] / 255) * radius * sensitivity;
      const x = center_x + Math.cos(rads * i) * (radius);
      const y = center_y + Math.sin(rads * i) * (radius);
      const x_end = center_x + Math.cos(rads * i) * (radius + bar_height);
      const y_end = center_y + Math.sin(rads * i) * (radius + bar_height);
      
      ctx.beginPath();
      ctx.strokeStyle = `hsl(${i / dataArray.length * 360}, 100%, 50%)`;
      ctx.moveTo(x, y);
      ctx.lineTo(x_end, y_end);
      ctx.stroke();
    }
  };

  const startRecording = async () => {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyserNode = audioCtx.createAnalyser();
    analyserNode.fftSize = 1024; // Increased for more detailed data
    analyserNode.minDecibels = -90; // Increased sensitivity to quieter sounds
    analyserNode.maxDecibels = -10;
    analyserNode.smoothingTimeConstant = 0.85;

    const bufferLength = analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyserNode);

      setAudioContext(audioCtx);
      setAnalyser(analyserNode);
      setDataArray(dataArray);
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (audioContext) {
      audioContext.close();
    }
    setIsRecording(false);
    setAudioContext(null);
    setAnalyser(null);
    setDataArray(null);
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (currentVisualizer instanceof SynapticNetworkVisualizer) {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      currentVisualizer.handleInteraction(x, y);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div 
      ref={containerRef} 
      className={`flex flex-col items-center justify-center ${isFullscreen ? 'fixed inset-0 z-50 bg-black' : 'min-h-screen bg-gray-800'}`}
    >
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={400} 
        className={`bg-black mb-4 rounded ${isFullscreen ? 'w-full h-full' : ''}`}
        onClick={handleCanvasClick}
      />
      <div className={`flex space-x-4 mb-4 ${isFullscreen ? 'absolute bottom-4' : ''}`}>
        <button
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex items-center px-4 py-2 rounded ${
            isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isRecording ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isRecording ? 'Stop' : 'Start'}
        </button>
        <select
          value={visualizationType}
          onChange={(e) => setVisualizationType(e.target.value as VisualizationType)}
          className="bg-gray-700 rounded px-2 py-1"
        >
          <option value="bars">Bars</option>
          <option value="wave">Wave</option>
          <option value="circular">Circular</option>
          <option value="constellation">Constellation</option>
          <option value="synaptic">Synaptic Network</option>
          <option value="rainbowSquare">Rainbow Square</option>
          <option value="quantumRipple">Quantum Ripple</option>
        </select>
        <div className="flex items-center">
          <Sliders className="mr-2" />
          <input
            type="range"
            min={0.5}
            max={4}
            step={0.1}
            value={sensitivity}
            onChange={(e) => setSensitivity(parseFloat(e.target.value))}
            className="w-32"
          />
        </div>
        <button
          onClick={toggleFullscreen}
          className="flex items-center px-4 py-2 rounded bg-blue-500 hover:bg-blue-600"
        >
          {isFullscreen ? <Minimize className="mr-2" /> : <Maximize className="mr-2" />}
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </div>
    </div>
  );
};

export default AudioVisualizer;