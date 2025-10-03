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

// Mapeo completo de variantes de colores para cada área
export const LIFE_AREA_COLOR_VARIANTS: Record<string, {
  bg: string;
  bgLight: string;
  bgLighter: string;
  border: string;
  text: string;
  gradient: string;
}> = {
  'Desarrollo Personal': {
    bg: 'bg-purple-500',
    bgLight: 'bg-purple-100',
    bgLighter: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    gradient: 'from-purple-500 via-purple-600 to-purple-700',
  },
  'Actividad Profesional': {
    bg: 'bg-blue-500',
    bgLight: 'bg-blue-100',
    bgLighter: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    gradient: 'from-blue-500 via-blue-600 to-blue-700',
  },
  'Salud y Nutrición': {
    bg: 'bg-green-500',
    bgLight: 'bg-green-100',
    bgLighter: 'bg-green-50',
    border: 'border-green-200',
    text: 'text-green-600',
    gradient: 'from-green-500 via-green-600 to-green-700',
  },
  'Dinero y Finanzas': {
    bg: 'bg-yellow-500',
    bgLight: 'bg-yellow-100',
    bgLighter: 'bg-yellow-50',
    border: 'border-yellow-200',
    text: 'text-yellow-600',
    gradient: 'from-yellow-500 via-yellow-600 to-yellow-700',
  },
  'Relaciones Sociales': {
    bg: 'bg-orange-500',
    bgLight: 'bg-orange-100',
    bgLighter: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    gradient: 'from-orange-500 via-orange-600 to-orange-700',
  },
  'Pareja e Intimidad': {
    bg: 'bg-red-500',
    bgLight: 'bg-red-100',
    bgLighter: 'bg-red-50',
    border: 'border-red-200',
    text: 'text-red-600',
    gradient: 'from-red-500 via-red-600 to-red-700',
  },
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
 * Obtiene todas las variantes de color para un área
 */
export const getAreaColorVariants = (areaName: string) => {
  return LIFE_AREA_COLOR_VARIANTS[areaName] || {
    bg: 'bg-gray-500',
    bgLight: 'bg-gray-100',
    bgLighter: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-600',
    gradient: 'from-gray-500 via-gray-600 to-gray-700',
  };
};

/**
 * Obtiene el icono del área basado en el nombre
 */
export const getAreaIcon = (areaName: string): string => {
  return LIFE_AREA_ICONS[areaName] || '⭐';
};

