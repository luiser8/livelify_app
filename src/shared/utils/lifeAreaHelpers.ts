/**
 * Utilidades para trabajar con Life Areas
 */

// Mapeo de nombres de API a nombres en español
export const AREA_NAME_MAP: Record<string, string> = {
  'PERSONAL_DEVELOPMENT': 'Desarrollo Personal',
  'PROFESSIONAL_ACTIVITY': 'Actividad Profesional',
  'HEALTH_NUTRITION': 'Salud y Nutrición',
  'MONEY_FINANCES': 'Dinero y Finanzas',
  'SOCIAL_RELATIONSHIPS': 'Relaciones Sociales',
  'COUPLE_INTIMACY': 'Pareja e Intimidad',
};

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
  'Desarrollo Personal': '🧠',
  'Actividad Profesional': '💼',
  'Salud y Nutrición': '🍎',
  'Dinero y Finanzas': '💰',
  'Relaciones Sociales': '🤝',
  'Pareja e Intimidad': '❤️',
};

/**
 * Convierte el nombre de área de la API a español
 * @deprecated Use getAreaTranslationKey with i18n instead
 */
export const getAreaDisplayName = (areaName: string): string => {
  return AREA_NAME_MAP[areaName] || areaName;
};

/**
 * Retorna la translation key para usar con i18n
 * Uso: t(getAreaTranslationKey(areaName))
 * 
 * Maneja 3 casos:
 * 1. Si es una key de API (ej: "PERSONAL_DEVELOPMENT") → retorna "lifeAreas.PERSONAL_DEVELOPMENT"
 * 2. Si es un nombre en español (ej: "Desarrollo Personal") → busca la key y retorna "lifeAreas.PERSONAL_DEVELOPMENT"
 * 3. Si no encuentra nada → retorna el string original (fallback)
 */
export const getAreaTranslationKey = (areaName: string): string => {
  // Caso 1: Ya es una key de API válida (viene de area.areaId del backend)
  if (areaName in AREA_NAME_MAP) {
    return `lifeAreas.${areaName}`;
  }
  
  // Caso 2: Es el nombre en español (viene de area.areaName del backend)
  const entry = Object.entries(AREA_NAME_MAP).find(([, name]) => name === areaName);
  const apiKey = entry?.[0];
  if (apiKey) {
    return `lifeAreas.${apiKey}`;
  }
  
  // Caso 3: Fallback - retornar el nombre original
  console.warn(`Translation key not found for area: "${areaName}"`);
  return areaName;
};

/**
 * Obtiene el color del área basado en el nombre (soporta inglés y español)
 */
export const getAreaColor = (areaName: string): string => {
  const displayName = getAreaDisplayName(areaName);
  return LIFE_AREA_COLORS[displayName] || 'bg-gray-500';
};

/**
 * Obtiene todas las variantes de color para un área (soporta inglés y español)
 */
export const getAreaColorVariants = (areaName: string) => {
  const displayName = getAreaDisplayName(areaName);
  return LIFE_AREA_COLOR_VARIANTS[displayName] || {
    bg: 'bg-gray-500',
    bgLight: 'bg-gray-100',
    bgLighter: 'bg-gray-50',
    border: 'border-gray-200',
    text: 'text-gray-600',
    gradient: 'from-gray-500 via-gray-600 to-gray-700',
  };
};

/**
 * Obtiene el icono del área basado en el nombre (soporta inglés y español)
 */
export const getAreaIcon = (areaName: string): string => {
  const displayName = getAreaDisplayName(areaName);
  const icon = LIFE_AREA_ICONS[displayName] || '⭐';

  return icon;
};

