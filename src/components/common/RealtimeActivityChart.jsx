import React, { useState, useId } from 'react';
import { ChevronDown, ArrowUpRight } from 'lucide-react';

export default function RealtimeActivityChart({
  title = "Activity Overview",
  subtitle = "Coursework submissions and evaluations",
  metricLabel = "Submissions",
  unit = "",
  dataSets = {
    'Week': [
      { label: 'Mon', value: 12 },
      { label: 'Tue', value: 19 },
      { label: 'Wed', value: 15 },
      { label: 'Thu', value: 27 },
      { label: 'Fri', value: 32 },
      { label: 'Sat', value: 24 },
      { label: 'Sun', value: 38 },
    ],
    'Month': [
      { label: 'Week 1', value: 85 },
      { label: 'Week 2', value: 112 },
      { label: 'Week 3', value: 145 },
      { label: 'Week 4', value: 178 },
    ],
    'Year': [
      { label: 'Jan', value: 180 },
      { label: 'Feb', value: 240 },
      { label: 'Mar', value: 310 },
      { label: 'Apr', value: 290 },
      { label: 'May', value: 380 },
      { label: 'Jun', value: 420 },
      { label: 'Jul', value: 390 },
      { label: 'Aug', value: 450 },
      { label: 'Sep', value: 510 },
      { label: 'Oct', value: 580 },
      { label: 'Nov', value: 620 },
      { label: 'Dec', value: 680 },
    ]
  },
  accentColor = "#2563EB", // Royal Blue
  growthPercentage = "+14.8%"
}) {
  const [activeRange, setActiveRange] = useState('Week');
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const gradientId = useId();

  const data = dataSets[activeRange] || dataSets['Week'] || Object.values(dataSets)[0];
  const values = data.map(d => d.value);
  const maxValue = Math.max(...values, 10);
  const totalMetric = values.reduce((acc, curr) => acc + curr, 0);
  const avgMetric = Math.round(totalMetric / values.length);

  // SVG coordinate dimensions
  const width = 640;
  const height = 220;
  const paddingX = 40;
  const paddingTop = 25;
  const paddingBottom = 35;

  const chartWidth = width - paddingX * 2;
  const chartHeight = height - paddingTop - paddingBottom;

  const getX = (index) => paddingX + (index / (data.length - 1)) * chartWidth;
  const getY = (val) => height - paddingBottom - (val / (maxValue * 1.15)) * chartHeight;

  // Construct smooth cubic Bezier curve path
  const points = data.map((d, i) => ({ x: getX(i), y: getY(d.value) }));
  
  const generateSplinePath = (pts) => {
    if (pts.length < 2) return '';
    let path = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = i > 0 ? pts[i - 1] : pts[i];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = i < pts.length - 2 ? pts[i + 2] : p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return path;
  };

  const linePath = generateSplinePath(points);
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingBottom} L ${points[0].x} ${height - paddingBottom} Z` 
    : '';

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-100 shadow-sm space-y-4">
      
      {/* 1. Header & Range Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-heading font-bold text-slate-800 text-base tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {subtitle}
          </p>
        </div>

        {/* Clean Range Tabs */}
        <div className="flex items-center bg-slate-100/80 p-1 rounded-xl self-start sm:self-auto">
          {Object.keys(dataSets).map((range) => (
            <button
              key={range}
              onClick={() => {
                setActiveRange(range);
                setHoveredIndex(null);
              }}
              className={`
                px-3 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer
                ${activeRange === range 
                  ? 'bg-white text-blue-600 shadow-xs' 
                  : 'text-slate-500 hover:text-slate-800'}
              `}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Key Metrics Row */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        <div className="p-3 bg-slate-50/70 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 block">Total {metricLabel}</span>
          <span className="font-heading font-bold text-lg text-slate-900 mt-0.5 block">
            {totalMetric.toLocaleString()}{unit}
          </span>
        </div>

        <div className="p-3 bg-slate-50/70 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 block">Average</span>
          <span className="font-heading font-bold text-lg text-slate-900 mt-0.5 block">
            {avgMetric.toLocaleString()}{unit}
          </span>
        </div>

        <div className="p-3 bg-slate-50/70 rounded-xl">
          <span className="text-[11px] font-medium text-slate-400 block">Period Trend</span>
          <span className="font-heading font-bold text-lg text-emerald-600 mt-0.5 flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4" />
            <span>{growthPercentage}</span>
          </span>
        </div>
      </div>

      {/* 3. Smooth SVG Spline Chart */}
      <div className="relative pt-2">
        <div className="w-full h-52 sm:h-60 relative">
          <svg 
            viewBox={`0 0 ${width} ${height}`} 
            className="w-full h-full overflow-visible select-none"
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={accentColor} stopOpacity="0.22" />
                <stop offset="85%" stopColor={accentColor} stopOpacity="0.02" />
                <stop offset="100%" stopColor={accentColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0, 0.33, 0.66, 1].map((pct, i) => {
              const y = height - paddingBottom - pct * chartHeight;
              const val = Math.round(pct * maxValue);
              return (
                <g key={i} className="opacity-40">
                  <line 
                    x1={paddingX} 
                    y1={y} 
                    x2={width - paddingX} 
                    y2={y} 
                    stroke="#E2E8F0" 
                    strokeDasharray="4 4" 
                    strokeWidth="1" 
                  />
                  <text 
                    x={paddingX - 10} 
                    y={y + 3} 
                    textAnchor="end" 
                    className="text-[10px] fill-slate-400 font-mono select-none"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Gradient Area Fill */}
            {areaPath && (
              <path 
                d={areaPath} 
                fill={`url(#${gradientId})`} 
                className="transition-all duration-300"
              />
            )}

            {/* Spline Path */}
            {linePath && (
              <path 
                d={linePath} 
                fill="none" 
                stroke={accentColor} 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                className="transition-all duration-300"
              />
            )}

            {/* Data Points */}
            {points.map((pt, i) => {
              const isHovered = hoveredIndex === i;
              return (
                <g key={i}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 5 : 3.5}
                    fill={isHovered ? accentColor : "#FFFFFF"}
                    stroke={accentColor}
                    strokeWidth="2"
                    className="transition-all duration-150 cursor-pointer"
                  />
                  {/* Invisible Hover Hitbox */}
                  <rect
                    x={pt.x - 20}
                    y={0}
                    width={40}
                    height={height}
                    fill="transparent"
                    className="cursor-pointer"
                    onMouseEnter={() => setHoveredIndex(i)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  />
                  {/* X-Axis Label */}
                  <text
                    x={pt.x}
                    y={height - 12}
                    textAnchor="middle"
                    className={`text-[10px] select-none transition-colors ${
                      isHovered ? 'fill-blue-600 font-bold' : 'fill-slate-400 font-medium'
                    }`}
                  >
                    {data[i].label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Interactive Tooltip Card */}
          {hoveredIndex !== null && data[hoveredIndex] && (
            <div 
              className="absolute z-20 pointer-events-none -translate-x-1/2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-lg"
              style={{
                left: `${(points[hoveredIndex].x / width) * 100}%`,
                top: `${(points[hoveredIndex].y / height) * 100 - 32}%`
              }}
            >
              <div className="font-semibold text-[11px] text-slate-300">
                {data[hoveredIndex].label}
              </div>
              <div className="font-bold text-white text-xs">
                {data[hoveredIndex].value}{unit} {metricLabel}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
