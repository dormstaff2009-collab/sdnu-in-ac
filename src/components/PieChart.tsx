/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PieChartSlice } from '../types';

interface PieChartProps {
  title: string;
  subtitle?: string;
  data: PieChartSlice[];
  isDonut?: boolean;
  onSliceClick?: (label: string) => void;
  selectedLabel?: string | null;
  emptyMessage?: string;
}

export const PieChart: React.FC<PieChartProps> = ({
  title,
  subtitle,
  data,
  isDonut = true,
  onSliceClick,
  selectedLabel,
  emptyMessage = 'ไม่พบข้อมูลในเงื่อนไขการค้นหานี้',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0 || data.length === 0) {
    return (
      <div className="bg-[#fcfaf7] rounded-2xl p-6 border border-stone-200/90 shadow-xs flex flex-col items-center justify-center min-h-[360px] text-center">
        <h3 className="font-bold text-stone-900 text-lg mb-1">{title}</h3>
        {subtitle && <p className="text-xs text-stone-500 mb-6">{subtitle}</p>}
        <div className="w-20 h-20 rounded-full border-4 border-dashed border-stone-300 flex items-center justify-center mb-3">
          <span className="text-2xl text-stone-400">📊</span>
        </div>
        <p className="text-sm text-stone-500">{emptyMessage}</p>
      </div>
    );
  }

  // Calculate coordinates for SVG paths
  const size = 300;
  const center = size / 2;
  const radius = 115;
  const innerRadius = isDonut ? 68 : 0;

  let cumulativeAngle = -Math.PI / 2; // Start from top 12 o'clock

  const slices = data.map((item, index) => {
    const fraction = item.value / total;
    const angle = fraction * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;
    cumulativeAngle = endAngle;

    const isHovered = hoveredIndex === index || selectedLabel === item.label;
    const currentRadius = isHovered ? radius + 6 : radius;
    const currentInnerRadius = isDonut ? (isHovered ? innerRadius - 2 : innerRadius) : 0;

    // Outer arc points
    const x1 = center + currentRadius * Math.cos(startAngle);
    const y1 = center + currentRadius * Math.sin(startAngle);
    const x2 = center + currentRadius * Math.cos(endAngle);
    const y2 = center + currentRadius * Math.sin(endAngle);

    // Inner arc points
    const x3 = center + currentInnerRadius * Math.cos(endAngle);
    const y3 = center + currentInnerRadius * Math.sin(endAngle);
    const x4 = center + currentInnerRadius * Math.cos(startAngle);
    const y4 = center + currentInnerRadius * Math.sin(startAngle);

    const largeArc = angle > Math.PI ? 1 : 0;

    // SVG path string
    let pathData = '';
    if (isDonut) {
      pathData = `
        M ${x1} ${y1}
        A ${currentRadius} ${currentRadius} 0 ${largeArc} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${currentInnerRadius} ${currentInnerRadius} 0 ${largeArc} 0 ${x4} ${y4}
        Z
      `;
    } else {
      pathData = `
        M ${center} ${center}
        L ${x1} ${y1}
        A ${currentRadius} ${currentRadius} 0 ${largeArc} 1 ${x2} ${y2}
        Z
      `;
    }

    // Midpoint for label position
    const midAngle = startAngle + angle / 2;
    const labelRadius = isDonut ? (radius + innerRadius) / 2 : radius * 0.65;
    const labelX = center + labelRadius * Math.cos(midAngle);
    const labelY = center + labelRadius * Math.sin(midAngle);

    return {
      ...item,
      pathData,
      labelX,
      labelY,
      midAngle,
      percentage: Math.round(fraction * 100),
      isHovered,
    };
  });

  return (
    <div className="bg-[#fcfaf7] rounded-2xl p-6 border border-stone-200/90 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
      <div>
        <div className="flex items-start justify-between mb-1">
          <div>
            <h3 className="font-bold text-stone-900 text-base md:text-lg flex items-center gap-2">
              {title}
            </h3>
            {subtitle && <p className="text-xs text-stone-500 mt-0.5">{subtitle}</p>}
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-stone-100 text-stone-700 rounded-full border border-stone-200/60">
            รวม {total} เหตุการณ์
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative flex items-center justify-center my-4">
        <svg
          viewBox={`0 0 ${size} ${size}`}
          className="w-full max-w-[280px] h-auto drop-shadow-sm select-none"
        >
          <g>
            {slices.map((slice, idx) => (
              <path
                key={slice.label}
                d={slice.pathData}
                fill={slice.color}
                stroke="#fcfaf7"
                strokeWidth={2}
                className="transition-all duration-200 cursor-pointer hover:opacity-90"
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => onSliceClick && onSliceClick(slice.label)}
                filter={slice.isHovered ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' : undefined}
              />
            ))}
          </g>

          {/* Show percentage labels on large slices */}
          {slices.map((slice) => {
            if (slice.percentage < 6) return null; // Avoid crowding small slices
            return (
              <text
                key={`label-${slice.label}`}
                x={slice.labelX}
                y={slice.labelY}
                textAnchor="middle"
                dominantBaseline="central"
                fill="#ffffff"
                fontSize={slice.percentage > 15 ? '13' : '11'}
                fontWeight="700"
                className="pointer-events-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]"
              >
                {slice.percentage}%
              </text>
            );
          })}

          {/* Donut Center Content */}
          {isDonut && (
            <g className="pointer-events-none">
              <circle cx={center} cy={center} r={innerRadius - 4} fill="#fcfaf7" />
              <text
                x={center}
                y={center - 8}
                textAnchor="middle"
                fontSize="22"
                fontWeight="800"
                fill="#292524"
              >
                {hoveredIndex !== null ? data[hoveredIndex]?.value : total}
              </text>
              <text
                x={center}
                y={center + 14}
                textAnchor="middle"
                fontSize="11"
                fontWeight="500"
                fill="#78716c"
              >
                {hoveredIndex !== null ? data[hoveredIndex]?.label : 'เหตุการณ์ทั้งหมด'}
              </text>
            </g>
          )}
        </svg>

        {/* Hover Tooltip Overlay if pie */}
        {hoveredIndex !== null && !isDonut && (
          <div className="absolute top-2 right-2 bg-stone-900/90 backdrop-blur-sm text-stone-100 px-3 py-1.5 rounded-lg text-xs pointer-events-none shadow-lg">
            <span className="font-bold">{data[hoveredIndex]?.label}</span>: {data[hoveredIndex]?.value} ครั้ง ({Math.round((data[hoveredIndex]?.value / total) * 100)}%)
          </div>
        )}
      </div>

      {/* Legend & Details */}
      <div className="mt-2 pt-3 border-t border-stone-200/80 max-h-48 overflow-y-auto space-y-1.5 pr-1">
        {data.map((item, idx) => {
          const isSelected = selectedLabel === item.label;
          const isHovered = hoveredIndex === idx;
          const pct = Math.round((item.value / total) * 100);

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onSliceClick && onSliceClick(item.label)}
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                isSelected
                  ? 'bg-amber-100/90 text-amber-950 font-semibold ring-1 ring-amber-400'
                  : isHovered
                  ? 'bg-stone-100 text-stone-900'
                  : 'text-stone-700 hover:bg-stone-100/70'
              }`}
            >
              <div className="flex items-center gap-2 truncate pr-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="truncate">{item.label}</span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="font-semibold text-stone-800">{item.value} ครั้ง</span>
                <span className="text-[11px] text-stone-400 w-9 text-right font-mono">
                  {pct}%
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
