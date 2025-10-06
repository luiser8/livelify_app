import { useEffect, useRef } from 'react';
import { type LifeWheelArea } from '@/infrastructure/services';
import { getAreaIcon, getAreaColorVariants } from '@/shared/utils/lifeAreaHelpers';

interface LifeWheelHexagonProps {
  lifeAreas: LifeWheelArea[];
  onAreaClick?: (areaId: string) => void;
  enabledAreaIds?: Set<string>;
}

/**
 * Componente del hexágono del Life Wheel
 * Muestra las 6 áreas de vida en un hexágono con gráficos dinámicos
 */
export const LifeWheelHexagon = ({ lifeAreas, onAreaClick, enabledAreaIds }: LifeWheelHexagonProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const orderedAreas = lifeAreas.filter((area): area is LifeWheelArea => area !== undefined);

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
          const isEnabled = !enabledAreaIds || enabledAreaIds.size === 0 || enabledAreaIds.has(area.id);
          
          return (
            <div
              key={area.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: position.left, top: position.top }}
            >
              <div className="relative">
                {/* Icono del área */}
                <button
                  onClick={() => isEnabled && onAreaClick?.(area.id)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 ${colorVariants.bg} rounded-full flex items-center justify-center text-2xl sm:text-3xl shadow-lg border-4 border-white transition-all duration-200 ${
                    isEnabled 
                      ? 'hover:scale-110 hover:shadow-xl cursor-pointer' 
                      : 'cursor-not-allowed opacity-60'
                  }`}
                  title={
                    isEnabled 
                      ? `Click to manage ${area.areaName}` 
                      : area.score === 0 
                        ? `${area.areaName} - Complete the assessment to unlock`
                        : `${area.areaName} - Focus on lower scoring areas first`
                  }
                  disabled={!isEnabled}
                >
                  {getAreaIcon(area.areaName)}
                </button>
                
                {/* Tooltip con el nombre del área */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-12 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50">
                  <div className={`${
                    isEnabled 
                      ? 'bg-gray-900' 
                      : area.score === 0 
                        ? 'bg-amber-500' 
                        : 'bg-red-600'
                  } text-white px-3 py-1.5 rounded-lg shadow-lg text-xs sm:text-sm font-medium whitespace-nowrap`}>
                    {isEnabled 
                      ? area.areaName 
                      : area.score === 0 
                        ? `${area.areaName} - Complete assessment first`
                        : `${area.areaName} - Locked`}
                    <div className={`absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 ${
                      isEnabled 
                        ? 'bg-gray-900' 
                        : area.score === 0 
                          ? 'bg-amber-500' 
                          : 'bg-red-600'
                    } rotate-45`}></div>
                  </div>
                </div>
                
                {/* Badge con el score */}
                <div className={`absolute -bottom-8 sm:-bottom-9 left-1/2 -translate-x-1/2 bg-white px-2.5 py-1 rounded-full shadow-md border ${
                  isEnabled 
                    ? 'border-gray-200' 
                    : area.score === 0 
                      ? 'border-amber-300 bg-amber-50' 
                      : 'border-red-200 bg-red-50'
                }`}>
                  <span className={`text-xs sm:text-sm font-bold ${
                    isEnabled 
                      ? 'text-gray-900' 
                      : area.score === 0 
                        ? 'text-amber-700' 
                        : 'text-red-600'
                  }`}>
                    {area.score === 0 ? '—' : `${area.score}/10`}
                  </span>
                </div>

                {/* Icono para áreas deshabilitadas */}
                {!isEnabled && (
                  <div className={`absolute top-0 right-0 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white ${
                    area.score === 0 ? 'bg-amber-500' : 'bg-red-500'
                  }`}>
                    {area.score === 0 ? (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Contenido central */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="text-center px-6 py-4 max-w-[140px] sm:max-w-[180px]">
              {hasScores ? (
                <>
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1 leading-tight">
                    Life Wheel
                  </h2>
                  <p className="text-xs text-gray-500 leading-tight">
                    Your journey
                  </p>
                </>
              ) : (
                <>
                  <div className="mb-2">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h2 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">
                      Start Your Assessment
                    </h2>
                  </div>
                  <p className="text-xs text-gray-500 leading-tight">
                    Click an area above
                  </p>
                </>
              )}
            </div>
          </div>
    </div>
  );
};

