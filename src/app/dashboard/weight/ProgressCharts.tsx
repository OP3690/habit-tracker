import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Line, LabelList, Legend, Label } from 'recharts';
import React from 'react';

interface Log {
  date: string;
  weight: number;
  bmi?: number;
}

interface ChartProps {
  logs: Log[];
  height?: number;
  userHeight: number;
}

function calcBMI(weight: number, height: number): number {
  if (!weight || !height) return 0;
  const h = height / 100;
  return +(weight / (h * h)).toFixed(1);
}

function median(arr: number[]): number {
  if (!arr.length) return 0;
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : +( (sorted[mid - 1] + sorted[mid]) / 2 ).toFixed(2);
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const d = payload[0].payload;
    const diff = d.diff;
    let diffText = '';
    let diffColor = '';
    if (typeof diff === 'number') {
      if (diff < 0) {
        diffText = `Lost ${Math.abs(diff).toFixed(2)} kg`;
        diffColor = 'text-green-600';
      } else if (diff > 0) {
        diffText = `Gained ${diff.toFixed(2)} kg`;
        diffColor = 'text-red-600';
      } else {
        diffText = 'No change';
        diffColor = 'text-gray-500';
      }
    }
    return (
      <div className="rounded-xl bg-white/95 border border-gray-200 shadow-lg px-4 py-2 text-sm text-gray-700">
        <div><span className="font-semibold">{label.includes('W') ? 'Week' : label.length === 7 ? 'Month' : 'Date'}:</span> {label}</div>
        <div><span className="font-semibold">Weight:</span> {d.weight} kg</div>
        <div><span className="font-semibold">BMI:</span> {d.bmi}</div>
        {typeof diff === 'number' && (
          <div><span className="font-semibold">Diff:</span> <span className={diffColor}>{diffText}</span></div>
        )}
      </div>
    );
  }
  return null;
}

function formatMonth(month: string): string {
  // month: '2025-05' => 'May-25'
  const [year, m] = month.split('-');
  const date = new Date(Number(year), Number(m) - 1, 1);
  return date.toLocaleString('default', { month: 'short' }) + '-' + year.slice(2);
}

function formatWeek(week: string): string {
  // week: '2025-W05' => 'Feb-25 (W5)'
  const [year, w] = week.split('-W');
  // Estimate month from week number (approximate)
  const firstDay = new Date(Number(year), 0, 1 + (Number(w) - 1) * 7);
  const month = firstDay.toLocaleString('default', { month: 'short' });
  return `${month}-${year.slice(2)} (W${Number(w)})`;
}

export function DailyProgressChart({ logs, height, userHeight }: ChartProps) {
  // Only last 30 days
  const sortedLogs = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const last30 = sortedLogs.slice(-30);
  const data = last30.map((log: Log, idx: number) => {
    const prev = idx > 0 ? last30[idx - 1].weight : log.weight;
    const diff = log.weight - prev;
    return {
      date: log.date,
      weight: log.weight,
      bmi: log.bmi || calcBMI(log.weight, userHeight),
      diff: idx > 0 ? diff : 0,
    };
  });
  const weights = data.map((d: { weight: number }) => d.weight);
  const minWeight = Math.floor(Math.min(...weights));
  const maxWeight = Math.ceil(Math.max(...weights));
  const start = Math.floor(minWeight);
  const end = Math.max(start + 10, maxWeight);

  return (
    <ResponsiveContainer width="100%" height={height || 320}>
      <BarChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" height={60}>
          <Label value="Date" offset={-10} position="insideBottom" />
        </XAxis>
        <YAxis domain={[start, end]} tick={{ fontSize: 12 }} interval={0} tickCount={end - start + 1} allowDecimals={false}>
          <Label value="Weight (kg)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
        </YAxis>
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" height={36} />
        <Bar dataKey="weight" fill="#60a5fa" radius={[6, 6, 0, 0]}>
          <LabelList dataKey="diff" position="top" formatter={(diff: number) => diff !== 0 ? `${diff > 0 ? '+' : ''}${diff.toFixed(2)} kg` : ''} content={({ value }) => {
            if (typeof value !== 'number' || value === 0) return null;
            if (value < 0) {
              return <span style={{ color: '#16a34a', fontWeight: 600 }}>Lost {Math.abs(value).toFixed(2)} kg</span>;
            } else if (value > 0) {
              return <span style={{ color: '#dc2626', fontWeight: 600 }}>Gained {value.toFixed(2)} kg</span>;
            }
            return <span style={{ color: '#64748b', fontWeight: 600 }}>No change</span>;
          }} />
        </Bar>
        <Line type="monotone" dataKey="weight" stroke="#22c55e" dot={false} strokeWidth={3} name="Trendline" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MonthlyProgressChart({ logs, height, userHeight }: ChartProps) {
  // Group logs by month and use median
  const monthMap: { [month: string]: Log[] } = {};
  logs.forEach((log: Log) => {
    const month = log.date.slice(0, 7); // YYYY-MM
    if (!monthMap[month]) monthMap[month] = [];
    monthMap[month].push(log);
  });
  // Sort months ascending (oldest first)
  const monthKeys = Object.keys(monthMap).sort();
  const data = monthKeys.map((month, idx) => {
    const logs = monthMap[month];
    const weights = logs.map(l => l.weight);
    const bmis = logs.map(l => l.bmi || calcBMI(l.weight, userHeight));
    const weight = median(weights);
    const bmi = median(bmis);
    const prevWeight = idx > 0 ? median(monthMap[monthKeys[idx - 1]].map(l => l.weight)) : weight;
    const diff = weight - prevWeight;
    return {
      month: formatMonth(month),
      weight,
      bmi,
      diff: idx > 0 ? diff : 0,
    };
  });
  const weights = data.map((d: { weight: number }) => d.weight);
  const minWeight = Math.floor(Math.min(...weights));
  const maxWeight = Math.ceil(Math.max(...weights));
  const start = Math.floor(minWeight);
  const end = Math.max(start + 10, maxWeight);

  return (
    <ResponsiveContainer width="100%" height={height || 320}>
      <BarChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }}>
          <Label value="Month" offset={-10} position="insideBottom" />
        </XAxis>
        <YAxis domain={[start, end]} tick={{ fontSize: 12 }} interval={0} tickCount={end - start + 1} allowDecimals={false}>
          <Label value="Weight (kg)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
        </YAxis>
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" height={36} />
        <Bar dataKey="weight" fill="#a78bfa" radius={[6, 6, 0, 0]}>
          <LabelList dataKey="diff" position="top" formatter={(diff: number) => diff !== 0 ? `${diff > 0 ? '+' : ''}${diff.toFixed(2)} kg` : ''} content={({ value }) => {
            if (typeof value !== 'number' || value === 0) return null;
            if (value < 0) {
              return <span style={{ color: '#16a34a', fontWeight: 600 }}>Lost {Math.abs(value).toFixed(2)} kg</span>;
            } else if (value > 0) {
              return <span style={{ color: '#dc2626', fontWeight: 600 }}>Gained {value.toFixed(2)} kg</span>;
            }
            return <span style={{ color: '#64748b', fontWeight: 600 }}>No change</span>;
          }} />
          <LabelList dataKey="bmi" position="top" formatter={(bmi: number) => `${bmi}`} />
        </Bar>
        <Line type="monotone" dataKey="weight" stroke="#facc15" dot={false} strokeWidth={3} name="Trendline" />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function WeeklyProgressChart({ logs, height, userHeight }: ChartProps) {
  // Group logs by ISO week and use median, last 12 weeks
  const weekMap: { [week: string]: Log[] } = {};
  logs.forEach((log: Log) => {
    const date = new Date(log.date);
    const year = date.getFullYear();
    const week = Math.ceil((((date.getTime() - new Date(year, 0, 1).getTime()) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
    const weekStr = `${year}-W${week.toString().padStart(2, '0')}`;
    if (!weekMap[weekStr]) weekMap[weekStr] = [];
    weekMap[weekStr].push(log);
  });
  // Sort weeks descending, take last 12, then reverse for display
  const weekKeys = Object.keys(weekMap).sort().reverse().slice(0, 12).reverse();
  // Prepare data with weight and bmi
  const baseData = weekKeys.map(week => {
    const logs = weekMap[week];
    const weights = logs.map(l => l.weight);
    const bmis = logs.map(l => l.bmi || calcBMI(l.weight, userHeight));
    return {
      week: formatWeek(week),
      weight: median(weights),
      bmi: median(bmis),
    };
  });
  // Now calculate diff for display order
  const data = baseData.map((d, idx) => {
    const prev = idx > 0 ? baseData[idx - 1].weight : d.weight;
    const diff = d.weight - prev;
    return { ...d, diff: idx > 0 ? diff : 0 };
  });
  const weights = data.map((d: { weight: number }) => d.weight);
  const minWeight = Math.floor(Math.min(...weights));
  const maxWeight = Math.ceil(Math.max(...weights));
  const start = Math.floor(minWeight);
  const end = Math.max(start + 10, maxWeight);

  return (
    <ResponsiveContainer width="100%" height={height || 320}>
      <BarChart data={data} margin={{ top: 30, right: 30, left: 0, bottom: 30 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="week" tick={{ fontSize: 12 }}>
          <Label value="Week" offset={-10} position="insideBottom" />
        </XAxis>
        <YAxis domain={[start, end]} tick={{ fontSize: 12 }} interval={0} tickCount={end - start + 1} allowDecimals={false}>
          <Label value="Weight (kg)" angle={-90} position="insideLeft" style={{ textAnchor: 'middle' }} />
        </YAxis>
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="top" height={36} />
        <Bar dataKey="weight" fill="#34d399" radius={[6, 6, 0, 0]}>
          <LabelList dataKey="diff" position="top" formatter={(diff: number) => diff !== 0 ? `${diff > 0 ? '+' : ''}${diff.toFixed(2)} kg` : ''} content={({ value }) => {
            if (typeof value !== 'number' || value === 0) return null;
            if (value < 0) {
              return <span style={{ color: '#16a34a', fontWeight: 600 }}>Lost {Math.abs(value).toFixed(2)} kg</span>;
            } else if (value > 0) {
              return <span style={{ color: '#dc2626', fontWeight: 600 }}>Gained {value.toFixed(2)} kg</span>;
            }
            return <span style={{ color: '#64748b', fontWeight: 600 }}>No change</span>;
          }} />
          <LabelList dataKey="bmi" position="top" formatter={(bmi: number) => `${bmi}`} />
        </Bar>
        <Line type="monotone" dataKey="weight" stroke="#2563eb" dot={false} strokeWidth={3} name="Trendline" />
      </BarChart>
    </ResponsiveContainer>
  );
} 