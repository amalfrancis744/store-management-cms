'use client';

import { useEffect, useRef } from 'react';

export function VisitorChart() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth;
    canvas.height = 300;

    // Chart data
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
    ];
    const pageViews = [110, 80, 125, 70, 95, 75, 90, 110, 80];
    const sessions = [85, 60, 100, 50, 75, 55, 70, 90, 60];

    // Chart settings
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const maxValue = Math.max(...pageViews, ...sessions) * 1.2;
    const xStep = chartWidth / (months.length - 1);

    // Draw grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();

      // Draw y-axis labels
      ctx.fillStyle = '#9ca3af';
      ctx.font = '12px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(
        Math.round((maxValue / 4) * (4 - i)).toString(),
        padding - 10,
        y + 4
      );
    }

    // Draw x-axis labels
    ctx.fillStyle = '#9ca3af';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    months.forEach((month, i) => {
      const x = padding + xStep * i;
      ctx.fillText(month, x, canvas.height - 10);
    });

    // Draw current month indicator
    const currentMonthIndex = 5; // June
    const currentX = padding + xStep * currentMonthIndex;
    ctx.strokeStyle = '#374151';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(currentX, padding);
    ctx.lineTo(currentX, padding + chartHeight);
    ctx.stroke();
    ctx.setLineDash([]);

    // Function to draw a line
    const drawLine = (data: number[], color: string, fillColor: string) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();

      // Draw the line
      data.forEach((value, i) => {
        const x = padding + xStep * i;
        const y = padding + chartHeight - (value / maxValue) * chartHeight;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Fill area under the line
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      data.forEach((value, i) => {
        const x = padding + xStep * i;
        const y = padding + chartHeight - (value / maxValue) * chartHeight;
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.lineTo(padding + chartWidth, padding + chartHeight);
      ctx.lineTo(padding, padding + chartHeight);
      ctx.closePath();
      ctx.fill();
    };

    // Draw page views line (blue)
    drawLine(pageViews, '#3b82f6', 'rgba(59, 130, 246, 0.1)');

    // Draw legend
    const legendY = 30;

    // Page views legend
    ctx.fillStyle = '#3b82f6';
    ctx.beginPath();
    ctx.arc(padding + 100, legendY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#374151';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Page views', padding + 115, legendY + 5);

    // Sessions legend
    ctx.fillStyle = '#2563eb';
    ctx.beginPath();
    ctx.arc(padding + 220, legendY, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#374151';
    ctx.fillText('Sessions', padding + 235, legendY + 5);
  }, []);

  return (
    <div className="h-[300px] w-full">
      <canvas ref={canvasRef} className="h-full w-full" />
    </div>
  );
}
