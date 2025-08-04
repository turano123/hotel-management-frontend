
// src/components/MonthlyProfitChart.jsx
import React, { useMemo } from 'react';
import { calculateNetAmount, monthKey } from '../utils/accountingUtils';

function MonthlyProfitChart({ entries }) {
  const monthlyTotals = useMemo(() => {
    const map = {};
    entries.forEach(e => {
      if (e.currency !== '₺') return; // sadece TL
      const key = monthKey(e.date);
      const net = calculateNetAmount(e);
      if (!map[key]) map[key] = 0;
      map[key] += e.type === 'Gelir' ? net : -net;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
  }, [entries]);

  const chartWidth = 720;
  const chartHeight = 200;
  const padding = 30;

  const values = monthlyTotals.map(([_, v]) => v);
  const max = Math.max(...values, 0);
  const min = Math.min(...values, 0);
  const range = max - min || 1;

  const barW = monthlyTotals.length ? (chartWidth - padding * 2) / monthlyTotals.length - 10 : 0;

  return (
    <div style={{ overflowX: 'auto', margin: '1rem 0', border: '1px solid #ccc', borderRadius: 12 }}>
      <h2 style={{ margin: '10px', fontSize: 18 }}>📈 Aylık Net Kâr / Zarar (₺)</h2>
      <svg width={chartWidth} height={chartHeight}>
        <line x1={padding} y1={padding} x2={padding} y2={chartHeight - padding} stroke="#aaa" />
        <line x1={padding} y1={chartHeight - padding} x2={chartWidth - padding} y2={chartHeight - padding} stroke="#aaa" />

        {/* Sıfır çizgisi */}
        {min < 0 && max > 0 && (
          <line
            x1={padding}
            x2={chartWidth - padding}
            y1={padding + (1 - (0 - min) / range) * (chartHeight - padding * 2)}
            y2={padding + (1 - (0 - min) / range) * (chartHeight - padding * 2)}
            stroke="#bbb"
            strokeDasharray="4 4"
          />
        )}

        {monthlyTotals.map(([month, value], i) => {
          const x = padding + i * ((chartWidth - padding * 2) / monthlyTotals.length) + 5;
          const h = (Math.abs(value) / range) * (chartHeight - padding * 2);
          const yBase = padding + (1 - (0 - min) / range) * (chartHeight - padding * 2);
          const y = value >= 0 ? (yBase - h) : yBase;
          const color = value >= 0 ? '#16a34a' : '#dc2626';

          return (
            <g key={month}>
              <rect x={x} y={y} width={barW} height={h} fill={color} rx="3" />
              <text x={x + barW / 2} y={chartHeight - 4} fontSize="10" textAnchor="middle">{month}</text>
              <title>{`${month}: ${value.toFixed(2)} ₺`}</title>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default MonthlyProfitChart;
