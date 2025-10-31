import React, { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  strokeWidth?: number;
  color?: string;
  fillColor?: string;
  showDots?: boolean;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 100,
  height = 30,
  strokeWidth = 2,
  color = '#3b82f6',
  fillColor = 'rgba(59, 130, 246, 0.1)',
  showDots = false,
  className = '',
}) => {
  const { path, fillPath, dots } = useMemo(() => {
    if (!data || data.length === 0) {
      return { path: '', fillPath: '', dots: [] };
    }

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const xStep = width / (data.length - 1 || 1);
    
    // Generate line path
    let linePath = '';
    const dotPoints: Array<{ x: number; y: number }> = [];

    data.forEach((value, index) => {
      const x = index * xStep;
      const y = height - ((value - min) / range) * height;
      
      if (index === 0) {
        linePath = `M ${x} ${y}`;
      } else {
        linePath += ` L ${x} ${y}`;
      }
      
      dotPoints.push({ x, y });
    });

    // Generate fill path (area under curve)
    let areaPath = linePath;
    if (data.length > 0) {
      const lastX = (data.length - 1) * xStep;
      areaPath += ` L ${lastX} ${height} L 0 ${height} Z`;
    }

    return {
      path: linePath,
      fillPath: areaPath,
      dots: dotPoints,
    };
  }, [data, width, height]);

  if (!data || data.length === 0) {
    return (
      <svg
        width={width}
        height={height}
        className={className}
        style={{ display: 'inline-block', verticalAlign: 'middle' }}
      >
        <line
          x1="0"
          y1={height / 2}
          x2={width}
          y2={height / 2}
          stroke="#e5e7eb"
          strokeWidth="1"
          strokeDasharray="2,2"
        />
      </svg>
    );
  }

  return (
    <svg
      width={width}
      height={height}
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      role="img"
      aria-label={`Sparkline trend showing ${data.length} data points`}
    >
      {/* Fill area */}
      {fillColor && (
        <path
          d={fillPath}
          fill={fillColor}
          stroke="none"
        />
      )}
      
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Dots */}
      {showDots && dots.map((dot, index) => (
        <circle
          key={index}
          cx={dot.x}
          cy={dot.y}
          r={strokeWidth}
          fill={color}
        />
      ))}
    </svg>
  );
};

export default Sparkline;
