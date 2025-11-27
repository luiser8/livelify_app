interface WaveDividerProps {
  fillColor?: string;
  useGradient?: boolean;
  gradientFrom?: string;
  gradientVia?: string;
  gradientTo?: string;
  height?: number;
}

export function WaveDivider({ 
  fillColor = '#f9fafb', // gray-50 by default
  useGradient = false,
  gradientFrom = '#4f46e5', // indigo-600
  gradientVia = '#9333ea', // purple-600
  gradientTo = '#db2777', // pink-600
  height = 2
}: WaveDividerProps) {

  if (useGradient) {
    return (
      <div 
        className="w-full"
        style={{ 
          height: `${height}px`,
          background: `linear-gradient(to right, ${gradientFrom}, ${gradientVia}, ${gradientTo})`
        }}
      />
    );
  }
  
  return (
    <div 
      className="w-full"
      style={{ 
        height: `${height}px`,
        backgroundColor: fillColor
      }}
    />
  );
}

