/**
 * Utilidades para trabajar con Life Areas
 */

// Mapeo de nombres en español a colores
export const LIFE_AREA_COLORS: Record<string, string> = {
  'Desarrollo Personal': 'bg-purple-500',
  'Actividad Profesional': 'bg-blue-500',
  'Salud y Nutrición': 'bg-green-500',
  'Dinero y Finanzas': 'bg-yellow-500',
  'Relaciones Sociales': 'bg-orange-500',
  'Pareja e Intimidad': 'bg-red-500',
};

// Mapeo de nombres en español a iconos
export const LIFE_AREA_ICONS: Record<string, string> = {
  'Desarrollo Personal': '🔥',
  'Actividad Profesional': '💼',
  'Salud y Nutrición': '💚',
  'Dinero y Finanzas': '💰',
  'Relaciones Sociales': '👨‍👩‍👧',
  'Pareja e Intimidad': '❤️',
};

/**
 * Obtiene el color del área basado en el nombre
 */
export const getAreaColor = (areaName: string): string => {
  return LIFE_AREA_COLORS[areaName] || 'bg-gray-500';
};

/**
 * Obtiene el icono del área basado en el nombre
 */
export const getAreaIcon = (areaName: string): string => {
  return LIFE_AREA_ICONS[areaName] || '⭐';
};

