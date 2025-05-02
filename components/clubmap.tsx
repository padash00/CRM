"use client";
import { useEffect, useRef } from "react";

interface Zone {
  id: string;
  name: string;
  description: string;
  created_at: string;
}

interface Computer {
  id: string;
  name: string;
  type: "PC" | "PlayStation";
  status: "free" | "occupied";
  zone_id: string;
  position_x: number;
  position_y: number;
  created_at: string;
}

interface ClubMapProps {
  zones: Zone[];
  computers: Computer[];
  hoveredZone: string | null;
  onEditComputer: (computer: Computer) => void;
  onHoverZone: (zoneId: string | null) => void;
}

export function ClubMap({ zones, computers, hoveredZone, onEditComputer, onHoverZone }: ClubMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("ClubMap: Canvas is null");
      return;
    }

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error("ClubMap: Canvas context is null");
      return;
    }

    if (!zones.length || !computers.length) {
      console.warn("ClubMap: No zones or computers to render");
      return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    zones.forEach((zone, index) => {
      const y = 50 + index * 120;
      ctx.fillStyle = hoveredZone === zone.id ? "#d0d0d0" : "#e0e0e0";
      ctx.fillRect(10, y - 30, 480, 100);
      ctx.fillStyle = "#000";
      ctx.font = "16px Arial";
      ctx.fillText(zone.name, 20, y - 10);

      const zoneComputers = computers.filter((comp) => comp.zone_id === zone.id);
      zoneComputers.forEach((comp) => {
        const x = comp.position_x;
        const yPos = y + comp.position_y - 30;
        ctx.fillStyle = comp.status === "free" ? "green" : "red";
        ctx.beginPath();
        ctx.arc(x, yPos, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(comp.name, x, yPos + 4);
      });
    });
  }, [zones, computers, hoveredZone]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedComputer = computers.find((comp) => {
      const dx = x - comp.position_x;
      const dy = y - (50 + zones.findIndex((z) => z.id === comp.zone_id) * 120 + comp.position_y - 30);
      return Math.sqrt(dx * dx + dy * dy) < 15;
    });

    if (clickedComputer) {
      onEditComputer(clickedComputer);
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const y = e.clientY - rect.top;

    const hoveredZoneIndex = Math.floor((y - 20) / 120);
    const zone = zones[hoveredZoneIndex];
    onHoverZone(zone ? zone.id : null);
  };

  const handleCanvasMouseLeave = () => {
    onHoverZone(null);
  };

  return (
    <canvas
      ref={canvasRef}
      width={500}
      height={zones.length * 120 + 50}
      className="border rounded-md"
      onClick={handleCanvasClick}
      onMouseMove={handleCanvasMouseMove}
      onMouseLeave={handleCanvasMouseLeave}
    />
  );
}
