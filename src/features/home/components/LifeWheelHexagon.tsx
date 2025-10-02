import { type LifeArea } from '@/infrastructure/services';
import { getAreaIcon } from '@/shared/utils/lifeAreaHelpers';

interface LifeWheelHexagonProps {
  lifeAreas: LifeArea[];
}

/**
 * Componente del hexágono del Life Wheel
 * Muestra las 6 áreas de vida en un hexágono
 */
export const LifeWheelHexagon = ({ lifeAreas }: LifeWheelHexagonProps) => {
  // Ordenar las áreas en el orden correcto para el hexágono
  const areaOrder = [
    'Desarrollo Personal',
    'Actividad Profesional', 
    'Salud y Nutrición',
    'Dinero y Finanzas',
    'Relaciones Sociales',
    'Pareja e Intimidad',
  ];

  const orderedAreas = areaOrder
    .map(areaName => lifeAreas.find(area => area.areaName === areaName))
    .filter((area): area is LifeArea => area !== undefined);

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Hexágono con SVG */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Líneas del hexágono */}
        <path
          d="M 100 20 L 165 55 L 165 130 L 100 165 L 35 130 L 35 55 Z"
          stroke="#E5E7EB"
          strokeWidth="2"
          strokeDasharray="5,5"
          fill="none"
        />
      </svg>

      {/* Iconos en cada vértice */}
      {/* Top */}
      {orderedAreas[0] && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
            {getAreaIcon(orderedAreas[0].areaName)}
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-semibold text-gray-700">{orderedAreas[0].score}</span>
          </div>
        </div>
      )}

      {/* Top Right */}
      {orderedAreas[1] && (
        <div className="absolute top-[15%] right-0 translate-x-1/2 -translate-y-1/2">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
            {getAreaIcon(orderedAreas[1].areaName)}
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-semibold text-gray-700">{orderedAreas[1].score}</span>
          </div>
        </div>
      )}

      {/* Bottom Right */}
      {orderedAreas[2] && (
        <div className="absolute bottom-[15%] right-0 translate-x-1/2 translate-y-1/2">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
            {getAreaIcon(orderedAreas[2].areaName)}
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-semibold text-gray-700">{orderedAreas[2].score}</span>
          </div>
        </div>
      )}

      {/* Bottom */}
      {orderedAreas[3] && (
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
            {getAreaIcon(orderedAreas[3].areaName)}
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-semibold text-gray-700">{orderedAreas[3].score}</span>
          </div>
        </div>
      )}

      {/* Bottom Left */}
      {orderedAreas[4] && (
        <div className="absolute bottom-[15%] left-0 -translate-x-1/2 translate-y-1/2">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
            {getAreaIcon(orderedAreas[4].areaName)}
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-semibold text-gray-700">{orderedAreas[4].score}</span>
          </div>
        </div>
      )}

      {/* Top Left */}
      {orderedAreas[5] && (
        <div className="absolute top-[15%] left-0 -translate-x-1/2 -translate-y-1/2">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-2xl">
            {getAreaIcon(orderedAreas[5].areaName)}
          </div>
          <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-semibold text-gray-700">{orderedAreas[5].score}</span>
          </div>
        </div>
      )}

      {/* Contenido central */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Configure Your Life<br />Wheel
          </h2>
          <p className="text-sm text-gray-500">
            Discover your starting point
          </p>
        </div>
      </div>
    </div>
  );
};

