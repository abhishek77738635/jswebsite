import React from 'react';

function formatShortDate(dateKey) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function formatWeekday(dateKey) {
  const date = new Date(`${dateKey}T00:00:00.000Z`);
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

export function ProgressDonut({ percent = 0, solved = 0, total = 0 }) {
  const radius = 58;
  const stroke = 14;
  const normalizedRadius = radius - stroke / 2;
  const circumference = 2 * Math.PI * normalizedRadius;
  const safePercent = Math.min(1, Math.max(0, percent));
  const offset = circumference - safePercent * circumference;

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:gap-6">
      <svg
        width={radius * 2}
        height={radius * 2}
        viewBox={`0 0 ${radius * 2} ${radius * 2}`}
        role="img"
        aria-label={`Overall progress ${Math.round(safePercent * 100)} percent`}
        className="shrink-0"
      >
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          className="stroke-gray-200 dark:stroke-gray-700"
          strokeWidth={stroke}
        />
        <circle
          cx={radius}
          cy={radius}
          r={normalizedRadius}
          fill="none"
          className="stroke-blue-600 dark:stroke-blue-400"
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${radius} ${radius})`}
        />
        <text
          x={radius}
          y={radius - 2}
          textAnchor="middle"
          className="fill-gray-900 text-[1.35rem] font-bold dark:fill-gray-100"
          style={{ fontSize: '1.35rem', fontWeight: 700 }}
        >
          {Math.round(safePercent * 100)}%
        </text>
        <text
          x={radius}
          y={radius + 16}
          textAnchor="middle"
          className="fill-gray-500 dark:fill-gray-400"
          style={{ fontSize: '0.7rem' }}
        >
          {solved}/{total}
        </text>
      </svg>
      <div className="text-center sm:text-left">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Overall completion</p>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          {solved} of {total} questions solved across the full catalog.
        </p>
      </div>
    </div>
  );
}

export function DailyActivityChart({ data = [] }) {
  const maxCount = Math.max(1, ...data.map((item) => item.count));

  return (
    <div>
      <div className="flex h-44 items-end gap-1.5 sm:gap-2">
        {data.map((item) => {
          const height = Math.max(4, Math.round((item.count / maxCount) * 100));
          return (
            <div key={item.date} className="flex min-w-0 flex-1 flex-col items-center gap-1">
              <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400">{item.count || ''}</span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className={`w-full rounded-t-md transition-all ${
                    item.count > 0
                      ? 'bg-blue-600 dark:bg-blue-400'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  style={{ height: `${height}%` }}
                  title={`${formatShortDate(item.date)}: ${item.count} solved`}
                />
              </div>
              <span className="truncate text-[10px] text-gray-500 dark:text-gray-400">{formatWeekday(item.date)}</span>
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">Questions solved per day (last 14 days)</p>
    </div>
  );
}

export function CumulativeProgressChart({ data = [] }) {
  if (!data.length) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400">
        Solve your first question to start tracking cumulative progress.
      </p>
    );
  }

  const width = 520;
  const height = 180;
  const padding = { top: 16, right: 16, bottom: 28, left: 36 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;
  const maxY = Math.max(...data.map((item) => item.cumulative), 1);

  const points = data.map((item, index) => {
    const x = padding.left + (index / Math.max(data.length - 1, 1)) * chartWidth;
    const y = padding.top + chartHeight - (item.cumulative / maxY) * chartHeight;
    return { x, y, ...item };
  });

  const polyline = points.map((point) => `${point.x},${point.y}`).join(' ');
  const areaPath = [
    `M ${points[0].x} ${padding.top + chartHeight}`,
    ...points.map((point) => `L ${point.x} ${point.y}`),
    `L ${points[points.length - 1].x} ${padding.top + chartHeight}`,
    'Z',
  ].join(' ');

  const yTicks = [0, Math.ceil(maxY / 2), maxY];

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="min-w-[320px] w-full"
        role="img"
        aria-label="Cumulative solved questions over time"
      >
        {yTicks.map((tick) => {
          const y = padding.top + chartHeight - (tick / maxY) * chartHeight;
          return (
            <g key={tick}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                className="stroke-gray-200 dark:stroke-gray-700"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-gray-500 dark:fill-gray-400"
                style={{ fontSize: '10px' }}
              >
                {tick}
              </text>
            </g>
          );
        })}

        <path d={areaPath} className="fill-blue-500/15 dark:fill-blue-400/20" />
        <polyline
          points={polyline}
          fill="none"
          className="stroke-blue-600 dark:stroke-blue-400"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {points.map((point) => (
          <circle
            key={point.date}
            cx={point.x}
            cy={point.y}
            r="3.5"
            className="fill-blue-600 dark:fill-blue-400"
          >
            <title>
              {formatShortDate(point.date)}: +{point.count} (total {point.cumulative})
            </title>
          </circle>
        ))}

        {[points[0], points[points.length - 1]].map((point) => (
          <text
            key={`label-${point.date}`}
            x={point.x}
            y={height - 8}
            textAnchor="middle"
            className="fill-gray-500 dark:fill-gray-400"
            style={{ fontSize: '10px' }}
          >
            {formatShortDate(point.date)}
          </text>
        ))}
      </svg>
      <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">Total solved questions over time</p>
    </div>
  );
}

const DIFFICULTY_COLORS = {
  Beginner: 'bg-green-500',
  Intermediate: 'bg-amber-500',
  Advanced: 'bg-sky-500',
  Expert: 'bg-red-500',
};

export function DifficultyProgressChart({ rows = [] }) {
  return (
    <div className="space-y-4">
      {rows.map((row) => {
        const ratio = row.total > 0 ? row.solved / row.total : 0;
        const color = DIFFICULTY_COLORS[row.name] || 'bg-violet-500';
        return (
          <div key={row.name}>
            <div className="mb-1.5 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-800 dark:text-gray-200">{row.name}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {row.solved}/{row.total} ({Math.round(ratio * 100)}%)
              </span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className={`h-full rounded-full ${color}`}
                style={{ width: `${Math.max(ratio > 0 ? 6 : 0, Math.round(ratio * 100))}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function CategoryProgressChart({ rows = [] }) {
  const topRows = rows.slice(0, 8);
  const maxTotal = Math.max(1, ...topRows.map((row) => row.total));

  return (
    <div className="space-y-3">
      {topRows.map((row) => {
        const solvedWidth = (row.solved / maxTotal) * 100;
        const totalWidth = (row.total / maxTotal) * 100;
        return (
          <div key={row.name}>
            <div className="mb-1 flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span className="truncate pr-2 font-medium text-gray-800 dark:text-gray-200">{row.name}</span>
              <span className="shrink-0">
                {row.solved}/{row.total}
              </span>
            </div>
            <div className="relative h-2.5 rounded-full bg-gray-100 dark:bg-gray-800">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-blue-200 dark:bg-blue-900/50"
                style={{ width: `${totalWidth}%` }}
              />
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-blue-600 dark:bg-blue-400"
                style={{ width: `${solvedWidth}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
