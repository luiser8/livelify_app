import { useEffect, useRef } from 'react';
import { type LifeArea } from '@/infrastructure/services';
import { getAreaIcon, getAreaColorVariants } from '@/shared/utils/lifeAreaHelpers';

interface LifeWheelHexagonProps {
  lifeAreas: LifeArea[];
  onAreaClick?: (areaId: string) => void;
}

/**
 * Componente del hexágono del Life Wheel
 * Muestra las 6 áreas de vida en un hexágono con gráficos dinámicos
 */
export const LifeWheelHexagon = ({ lifeAreas, onAreaClick }: LifeWheelHexagonProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const orderedAreas = lifeAreas.filter((area): area is LifeArea => area !== undefined);

  // Calcular las posiciones de los puntos del hexágono
  const getHexagonPoints = (centerX: number, centerY: number, radius: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2; // Start from top
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push({ x, y });
    }
    return points;
  };

  // Calculate icon positions as percentages for DOM positioning
  const getIconPosition = (index: number) => {
    const angle = (Math.PI / 3) * index - Math.PI / 2;
    const radius = 48; // 48% of container
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return { left: `${x}%`, top: `${y}%` };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || orderedAreas.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const size = 400;
    canvas.width = size;
    canvas.height = size;

    const centerX = size / 2;
    const centerY = size / 2;
    const iconRadius = size * 0.48; // Radio where icons are positioned
    const maxScoreRadius = iconRadius * 0.73; // Maximum radius for scores
    const maxRadius = size * 0.35; // Hexagon radius (for reference)

    // Clear canvas
    ctx.clearRect(0, 0, size, size);
    
    // Calculate icon positions for hexagon
    const iconPositions = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      iconPositions.push({
        x: centerX + iconRadius * Math.cos(angle),
        y: centerY + iconRadius * Math.sin(angle)
      });
    }

    // Draw radial lines from center to icon positions (gray guide lines)
    iconPositions.forEach((pos) => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = '#D1D5DB';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Draw hexagon outline (dashed) - more prominent
    const hexPoints = getHexagonPoints(centerX, centerY, maxRadius);
    ctx.strokeStyle = '#9CA3AF'; // Darker gray for more prominence
    ctx.lineWidth = 2.5; // Thicker line
    ctx.setLineDash([8, 6]); // Longer dashes
    ctx.beginPath();
    hexPoints.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y);
      } else {
        ctx.lineTo(point.x, point.y);
      }
    });
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw score polygon if we have scores
    const hasScores = orderedAreas.some(area => area.score > 0);
    
    if (hasScores) {
      const scorePoints = orderedAreas.map((area, i) => {
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        // Scores align with the radial lines that go to the icons
        const scoreRadius = (area.score / 10) * maxScoreRadius;
        return {
          x: centerX + scoreRadius * Math.cos(angle),
          y: centerY + scoreRadius * Math.sin(angle),
        };
      });

      // 1. Fill the polygon with a solid semi-transparent color
      ctx.beginPath();
      scorePoints.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.closePath();
      ctx.fillStyle = 'rgba(167, 139, 250, 0.3)'; // Purple/violet semi-transparent
      ctx.fill();

      // 2. Draw the outline connecting all score points
      ctx.beginPath();
      scorePoints.forEach((point, i) => {
        if (i === 0) {
          ctx.moveTo(point.x, point.y);
        } else {
          ctx.lineTo(point.x, point.y);
        }
      });
      ctx.closePath();
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.7)'; // Visible purple outline
      ctx.lineWidth = 2;
      ctx.stroke();

      // 3. Draw lines from center to each point with area colors
      const colorMap: Record<string, string> = {
        'bg-purple-500': 'rgba(168, 85, 247, 0.9)',
        'bg-blue-500': 'rgba(59, 130, 246, 0.9)',
        'bg-green-500': 'rgba(34, 197, 94, 0.9)',
        'bg-yellow-500': 'rgba(234, 179, 8, 0.9)',
        'bg-orange-500': 'rgba(249, 115, 22, 0.9)',
        'bg-red-500': 'rgba(239, 68, 68, 0.9)',
      };

      orderedAreas.forEach((area, i) => {
        if (area.score <= 0) return; // Skip areas without scores
        
        const angle = (Math.PI / 3) * i - Math.PI / 2;
        const scoreRadius = (area.score / 10) * maxScoreRadius;
        const endX = centerX + scoreRadius * Math.cos(angle);
        const endY = centerY + scoreRadius * Math.sin(angle);

        const colorVariants = getAreaColorVariants(area.areaName);
        const lineColor = colorMap[colorVariants.bg] || 'rgba(99, 102, 241, 0.9)';
        
        // Draw line from center
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = lineColor;
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw point at the end
        ctx.beginPath();
        ctx.arc(endX, endY, 6, 0, Math.PI * 2);
        ctx.fillStyle = lineColor.replace('0.9', '1');
        ctx.fill();
        
        // Add white border to make points stand out
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    }
  }, [orderedAreas]);

  const hasScores = orderedAreas.length > 0 && orderedAreas.some(area => area.score > 0);

  return (
    <div className="relative w-full max-w-md mx-auto aspect-square">
      {/* Canvas para los gráficos */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none"
      />

      {/* Iconos en cada vértice del hexágono */}
      <div className="absolute inset-0 z-10">
        {orderedAreas.map((area, index) => {
          const position = getIconPosition(index);
          const colorVariants = getAreaColorVariants(area.areaName);
          return (
            <div
              key={area.id}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: position.left, top: position.top }}
            >
              <div className="relative">
                {/* Icono del área */}
                <button
                  onClick={() => onAreaClick?.(area.id)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 ${colorVariants.bg} rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-lg border-4 border-white transition-all duration-200 hover:scale-110 hover:shadow-xl cursor-pointer`}
                  title={`Click to manage ${area.areaName}`}
                >
                  {getAreaIcon(area.areaName)}
                </button>
                
                {/* Badge con el score */}
                <div className="absolute -bottom-8 sm:-bottom-9 left-1/2 -translate-x-1/2 bg-white px-2.5 py-1 rounded-full shadow-md border border-gray-200">
                  <span className="text-xs sm:text-sm font-bold text-gray-900">{area.score}/10</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contenido central */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-4">
              {hasScores ? (
                <>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                    Life Wheel
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Your transformation journey
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                    Configure Your Life<br />Wheel
                  </h2>
                  <p className="text-sm text-gray-500">
                    Discover your starting point
                  </p>
                </>
              )}
            </div>
          </div>
    </div>
  );
};

