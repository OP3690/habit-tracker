"use client";
import { useState, useEffect, useRef } from "react";
import { ChartBarIcon, ArrowTrendingDownIcon, UserCircleIcon, CalendarIcon, CheckCircleIcon, SparklesIcon, PlusIcon, XMarkIcon, ClockIcon } from '@heroicons/react/24/outline';
import { DailyProgressChart, MonthlyProgressChart, WeeklyProgressChart } from './ProgressCharts';
import InsightsSimulator from './InsightsSimulator';

const initialGoal = {
  age: "",
  height: "",
  startWeight: "",
  targetWeight: "",
  targetDate: "",
  unit: "kg",
};

// Helper for BMI zone
const getBMIZone = (bmi: number) => {
  if (bmi < 18.5) return { label: "Underweight", color: "#60a5fa" };
  if (bmi < 25) return { label: "Normal", color: "#22c55e" };
  if (bmi < 30) return { label: "Overweight", color: "#facc15" };
  return { label: "Obese", color: "#ef4444" };
};

// BMI Meter Gauge SVG
function BMIGauge({ current, target }: { current: number; target: number }) {
  // Gauge: 180deg, 0-40 BMI
  const min = 10, max = 40;
  const angle = (val: number) => ((val - min) / (max - min)) * 180 - 90;
  const currentAngle = angle(current);
  const targetAngle = angle(target);
  const zone = getBMIZone(current);
  return (
    <svg viewBox="0 0 200 120" width="100%" height="120">
      {/* Background arc */}
      <path d="M20,100 A80,80 0 0,1 180,100" fill="none" stroke="#e5e7eb" strokeWidth="18" />
      {/* Zones */}
      <path d="M20,100 A80,80 0 0,1 80,20" fill="none" stroke="#60a5fa" strokeWidth="18" />
      <path d="M80,20 A80,80 0 0,1 120,20" fill="none" stroke="#22c55e" strokeWidth="18" />
      <path d="M120,20 A80,80 0 0,1 160,60" fill="none" stroke="#facc15" strokeWidth="18" />
      <path d="M160,60 A80,80 0 0,1 180,100" fill="none" stroke="#ef4444" strokeWidth="18" />
      {/* Current BMI needle */}
      <g>
        <line
          x1="100"
          y1="100"
          x2={100 + 80 * Math.cos((Math.PI / 180) * currentAngle)}
          y2={100 + 80 * Math.sin((Math.PI / 180) * currentAngle)}
          stroke="#2563eb"
          strokeWidth="4"
        />
        <circle cx="100" cy="100" r="7" fill="#2563eb" />
        {/* As on date label */}
        <text x={100 + 60 * Math.cos((Math.PI / 180) * currentAngle)} y={100 + 60 * Math.sin((Math.PI / 180) * currentAngle) - 10} textAnchor="middle" fontSize="12" fill="#2563eb">Now</text>
      </g>
      {/* Target BMI marker */}
      <g>
        <circle
          cx={100 + 70 * Math.cos((Math.PI / 180) * targetAngle)}
          cy={100 + 70 * Math.sin((Math.PI / 180) * targetAngle)}
          r="6"
          fill="#22c55e"
          stroke="#065f46"
          strokeWidth="2"
        />
        <text x={100 + 70 * Math.cos((Math.PI / 180) * targetAngle)} y={100 + 70 * Math.sin((Math.PI / 180) * targetAngle) + 18} textAnchor="middle" fontSize="12" fill="#22c55e">Target</text>
      </g>
      {/* Labels */}
      <text x="20" y="115" fontSize="12" fill="#60a5fa">Under</text>
      <text x="70" y="25" fontSize="12" fill="#22c55e">Normal</text>
      <text x="150" y="55" fontSize="12" fill="#facc15">Over</text>
      <text x="170" y="115" fontSize="12" fill="#ef4444">Obese</text>
    </svg>
  );
}

// --- BMI Meter with Start, Current, Target ---
function MultiBMIGauge({ start, current, target, height, startDate, currentDate, targetDate, startWeight, currentWeight, targetWeight }: {
  start: number;
  current: number;
  target: number;
  height: number;
  startDate: string;
  currentDate: string;
  targetDate: string;
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
}) {
  // Gauge: 180deg, 0-40 BMI
  const min = 10, max = 40;
  const angle = (val: number) => ((val - min) / (max - min)) * 180 - 90;
  const startAngle = angle(start);
  const currentAngle = angle(current);
  const targetAngle = angle(target);
  // Helper for marker position
  const pos = (ang: number, r: number) => ({
    x: 100 + r * Math.cos((Math.PI / 180) * ang),
    y: 100 + r * Math.sin((Math.PI / 180) * ang)
  });
  // Color zones
  const zones = [
    { from: 10, to: 18.5, color: "#60a5fa" },
    { from: 18.5, to: 25, color: "#22c55e" },
    { from: 25, to: 30, color: "#facc15" },
    { from: 30, to: 40, color: "#ef4444" },
  ];
  // Arc path helper
  function describeArc(startA: number, endA: number, r: number) {
    const startP = pos(startA, r);
    const endP = pos(endA, r);
    const largeArc = endA - startA <= 180 ? 0 : 1;
    return `M${startP.x},${startP.y} A${r},${r} 0 ${largeArc},1 ${endP.x},${endP.y}`;
  }
  return (
    <svg viewBox="0 0 200 120" width="100%" height="120">
      {/* Color zones */}
      {zones.map((z, i) => (
        <path key={i} d={describeArc(angle(z.from), angle(z.to), 80)} fill="none" stroke={z.color} strokeWidth="18" />
      ))}
      {/* Progress arc from start to current */}
      <path d={describeArc(startAngle, currentAngle, 80)} fill="none" stroke="#2563eb" strokeWidth="6" />
      {/* Progress arc from current to target (dashed) */}
      <path d={describeArc(currentAngle, targetAngle, 80)} fill="none" stroke="#22c55e" strokeWidth="4" strokeDasharray="6,6" />
      {/* Markers */}
      {/* Start */}
      <g>
        <circle {...pos(startAngle, 80)} r="7" fill="#60a5fa" stroke="#2563eb" strokeWidth="2" />
        <text x={pos(startAngle, 80).x} y={pos(startAngle, 80).y - 18} textAnchor="middle" fontSize="12" fill="#2563eb">Start</text>
        <text x={pos(startAngle, 80).x} y={pos(startAngle, 80).y + 22} textAnchor="middle" fontSize="11" fill="#2563eb">{start} BMI</text>
        <text x={pos(startAngle, 80).x} y={pos(startAngle, 80).y + 36} textAnchor="middle" fontSize="10" fill="#64748b">{startWeight}kg</text>
      </g>
      {/* Current */}
      <g>
        <circle {...pos(currentAngle, 80)} r="9" fill="#2563eb" stroke="#fff" strokeWidth="3" />
        <text x={pos(currentAngle, 80).x} y={pos(currentAngle, 80).y - 18} textAnchor="middle" fontSize="12" fill="#2563eb">Now</text>
        <text x={pos(currentAngle, 80).x} y={pos(currentAngle, 80).y + 22} textAnchor="middle" fontSize="11" fill="#2563eb">{current} BMI</text>
        <text x={pos(currentAngle, 80).x} y={pos(currentAngle, 80).y + 36} textAnchor="middle" fontSize="10" fill="#64748b">{currentWeight}kg</text>
      </g>
      {/* Target */}
      <g>
        <circle {...pos(targetAngle, 80)} r="7" fill="#22c55e" stroke="#065f46" strokeWidth="2" />
        <text x={pos(targetAngle, 80).x} y={pos(targetAngle, 80).y - 18} textAnchor="middle" fontSize="12" fill="#22c55e">Target</text>
        <text x={pos(targetAngle, 80).x} y={pos(targetAngle, 80).y + 22} textAnchor="middle" fontSize="11" fill="#22c55e">{target} BMI</text>
        <text x={pos(targetAngle, 80).x} y={pos(targetAngle, 80).y + 36} textAnchor="middle" fontSize="10" fill="#64748b">{targetWeight}kg</text>
      </g>
      {/* Labels */}
      <text x="20" y="115" fontSize="12" fill="#60a5fa">Under</text>
      <text x="70" y="25" fontSize="12" fill="#22c55e">Normal</text>
      <text x="150" y="55" fontSize="12" fill="#facc15">Over</text>
      <text x="170" y="115" fontSize="12" fill="#ef4444">Obese</text>
    </svg>
  );
}

// --- Milestone Timeline ---
function MilestoneTimeline({ start, current, target, startDate, currentDate, targetDate, startBMI, currentBMI, targetBMI, unit }: any) {
  // Helper for color zones
  const getColor = (bmi: number) => {
    if (bmi < 18.5) return "#60a5fa";
    if (bmi < 25) return "#22c55e";
    if (bmi < 30) return "#facc15";
    return "#ef4444";
  };
  return (
    <div className="flex flex-col items-center justify-between h-full py-4">
      {/* Start */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ background: getColor(startBMI) }}>{start}</div>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500">{startBMI} BMI</span>
        </div>
        <span className="mt-2 text-xs text-gray-400">{startDate}</span>
      </div>
      {/* Progress Line */}
      <div className="w-1 bg-gradient-to-b from-blue-400 via-green-400 to-green-600 flex-1 my-2 rounded-full" style={{ minHeight: 40 }} />
      {/* Current */}
      <div className="flex flex-col items-center">
        <div className="relative animate-pulse">
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-xl ring-4 ring-indigo-400" style={{ background: getColor(currentBMI) }}>{current}</div>
          <SparklesIcon className="w-5 h-5 text-yellow-400 absolute -top-3 -right-3 animate-bounce" />
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500">{currentBMI} BMI</span>
        </div>
        <span className="mt-2 text-xs text-gray-400">{currentDate}</span>
      </div>
      {/* Progress Line */}
      <div className="w-1 bg-gradient-to-b from-green-400 to-green-600 flex-1 my-2 rounded-full" style={{ minHeight: 40 }} />
      {/* Target */}
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg" style={{ background: getColor(targetBMI) }}>{target}</div>
          <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs text-gray-500">{targetBMI} BMI</span>
        </div>
        <span className="mt-2 text-xs text-gray-400">{targetDate}</span>
      </div>
    </div>
  );
}

// --- BMI Gauge Infographic ---
function BMIGaugeInfographic({ bmi }: { bmi: number }) {
  // Color zones and ranges
  const zones = [
    { from: 10, to: 18.5, color: '#a78bfa', label: '<18.5', legend: 'Underweight' },
    { from: 18.5, to: 25, color: '#22c55e', label: '18.5 - 25', legend: 'Normal weight' },
    { from: 25, to: 30, color: '#fbbf24', label: '25 - 30', legend: 'Overweight' },
    { from: 30, to: 40, color: '#ef4444', label: '>30', legend: 'Obese' },
  ];
  // Gauge math
  const min = 10, max = 40;
  const angle = (val: number) => ((val - min) / (max - min)) * 180 - 90;
  const bmiAngle = angle(bmi);
  return (
    <div className="flex flex-col items-center w-full">
      <svg viewBox="0 0 200 120" width="100%" height="120">
        {/* Zones */}
        <path d="M20,100 A80,80 0 0,1 60,36" fill="none" stroke="#a78bfa" strokeWidth="18" />
        <path d="M60,36 A80,80 0 0,1 120,20" fill="none" stroke="#22c55e" strokeWidth="18" />
        <path d="M120,20 A80,80 0 0,1 160,60" fill="none" stroke="#fbbf24" strokeWidth="18" />
        <path d="M160,60 A80,80 0 0,1 180,100" fill="none" stroke="#ef4444" strokeWidth="18" />
        {/* Needle */}
        <g>
          <line
            x1="100"
            y1="100"
            x2={100 + 70 * Math.cos((Math.PI / 180) * bmiAngle)}
            y2={100 + 70 * Math.sin((Math.PI / 180) * bmiAngle)}
            stroke="#2563eb"
            strokeWidth="4"
          />
          <circle cx="100" cy="100" r="7" fill="#2563eb" />
        </g>
        {/* Value */}
        <text x="100" y="80" textAnchor="middle" fontSize="2.2rem" fontWeight="bold" fill="#2563eb">{bmi > 0 ? bmi : '--'}</text>
        {/* Labels */}
        <text x="30" y="115" fontSize="12" fill="#a78bfa">{'<18.5'}</text>
        <text x="80" y="30" fontSize="12" fill="#22c55e">{'18.5-25'}</text>
        <text x="150" y="55" fontSize="12" fill="#fbbf24">{'25-30'}</text>
        <text x="170" y="115" fontSize="12" fill="#ef4444">{'>30'}</text>
      </svg>
      {/* Legend */}
      <div className="flex justify-center gap-4 mt-2 text-xs">
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{background:'#a78bfa'}}></span> Underweight</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{background:'#22c55e'}}></span> Normal</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{background:'#fbbf24'}}></span> Overweight</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{background:'#ef4444'}}></span> Obese</div>
      </div>
    </div>
  );
}

// --- Enhanced AddGoalModal ---
function AddGoalModal({ open, onClose, onSubmit, goal, viewOnlyDefault = false }: { open: boolean, onClose: () => void, onSubmit: (goal: any) => void, goal?: any, viewOnlyDefault?: boolean }) {
  const today = new Date();
  const defaultTarget = new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [age, setAge] = useState(goal?.age || 25);
  const [height, setHeight] = useState(goal?.height || 170);
  const [heightUnit, setHeightUnit] = useState<'cm'|'ftin'>('cm');
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(7);
  const [currentWeight, setCurrentWeight] = useState(goal?.startWeight || 70);
  const [targetWeight, setTargetWeight] = useState(goal?.targetWeight || 65);
  const [weightUnit, setWeightUnit] = useState<'kg'|'lbs'|'pound'>(goal?.unit || 'kg');
  const [targetDate, setTargetDate] = useState(goal?.targetDate || defaultTarget);
  const [error, setError] = useState('');
  const [viewOnly, setViewOnly] = useState(viewOnlyDefault);

  useEffect(() => {
    setViewOnly(viewOnlyDefault);
    if (goal) {
      setAge(goal.age);
      setHeight(goal.height);
      setCurrentWeight(goal.startWeight);
      setTargetWeight(goal.targetWeight);
      setWeightUnit(goal.unit || 'kg');
      setTargetDate(goal.targetDate);
    }
  }, [goal, viewOnlyDefault, open]);

  // Helper to clear input on focus
  const clearOnFocus = (setter: (v: any) => void) => (e: any) => setter('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!age || !height || !currentWeight || !targetWeight || !targetDate) {
      setError('All fields are required');
      return;
    }
    if (+height <= 0 || +currentWeight <= 0 || +targetWeight <= 0) {
      setError('Height and weight must be positive numbers');
      return;
    }
    if (+targetWeight < 30) {
      setError('Target weight should be at least 30kg');
      return;
    }
    setError('');
    onSubmit({
      age,
      height,
      startWeight: currentWeight,
      targetWeight,
      targetDate,
      unit: weightUnit,
    });
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white/95 rounded-2xl shadow-2xl px-6 py-6 w-full max-w-sm relative border border-gray-100 flex flex-col gap-4 animate-fadein">
        <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-700" onClick={onClose}><XMarkIcon className="w-5 h-5" /></button>
        <h2 className="text-xl font-extrabold text-center mb-1 tracking-tight">{viewOnly ? 'Your Current Weight Goal' : 'Set New Weight Goal'}</h2>
        {error && <div className="text-red-600 text-xs font-semibold text-center">{error}</div>}
        {viewOnly ? (
          <div className="flex flex-col gap-3 mt-2 text-base text-gray-700">
            <div><span className="font-semibold">Age:</span> {age}</div>
            <div><span className="font-semibold">Height:</span> {height} cm</div>
            <div><span className="font-semibold">Start Weight:</span> {currentWeight} {weightUnit}</div>
            <div><span className="font-semibold">Target Weight:</span> {targetWeight} {weightUnit}</div>
            <div><span className="font-semibold">Target Date:</span> {targetDate}</div>
            <button
              className="mt-4 w-full py-2 rounded-xl bg-gradient-to-r from-blue-400 to-green-500 text-white font-bold text-base shadow-lg hover:from-blue-500 hover:to-green-600 transition-all"
              onClick={() => setViewOnly(false)}
            >
              Modify Goal
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-x-4 gap-y-3 mt-2">
            {/* Age */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700 text-xs">Age</label>
              <input type="number" min={1} value={age} onChange={e => setAge(+e.target.value)} onFocus={clearOnFocus(setAge)} className="modal-input-sm" placeholder="Age" required />
            </div>
            {/* Height */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700 text-xs">Height</label>
              <input type="number" min={1} value={height} onChange={e => setHeight(+e.target.value)} onFocus={clearOnFocus(setHeight)} className="modal-input-sm" placeholder="cm" required />
            </div>
            {/* Current Weight */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700 text-xs">Current Weight</label>
              <input type="number" min={1} value={currentWeight} onChange={e => setCurrentWeight(+e.target.value)} onFocus={clearOnFocus(setCurrentWeight)} className="modal-input-sm" placeholder={weightUnit} required />
              <div className="flex justify-center gap-1 mt-1">
                {['kg','lbs','pound'].map(u => (
                  <button type="button" key={u} className={`px-2 py-0.5 rounded font-semibold border text-xs ${weightUnit===u?'bg-blue-500 text-white border-blue-500':'bg-gray-100 text-gray-700 border-gray-200'} hover:bg-blue-100 transition`} onClick={() => setWeightUnit(u as any)}>{u}</button>
                ))}
              </div>
            </div>
            {/* Target Weight */}
            <div className="flex flex-col gap-1">
              <label className="font-medium text-gray-700 text-xs">Target Weight</label>
              <input type="number" min={1} value={targetWeight} onChange={e => setTargetWeight(+e.target.value)} onFocus={clearOnFocus(setTargetWeight)} className="modal-input-sm" placeholder={weightUnit} required />
              <div className="flex justify-center gap-1 mt-1">
                {['kg','lbs','pound'].map(u => (
                  <button type="button" key={u} className={`px-2 py-0.5 rounded font-semibold border text-xs ${weightUnit===u?'bg-blue-500 text-white border-blue-500':'bg-gray-100 text-gray-700 border-gray-200'} hover:bg-blue-100 transition`} onClick={() => setWeightUnit(u as any)}>{u}</button>
                ))}
              </div>
            </div>
            {/* Target Date (full width) */}
            <div className="flex flex-col gap-1 col-span-2">
              <label className="font-medium text-gray-700 text-xs">Target Date</label>
              <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} onFocus={clearOnFocus(setTargetDate)} className="modal-input-sm" required />
              <div className="text-xs text-gray-400 text-center mt-1">(Default: 90 days from today)</div>
            </div>
            {/* Submit button full width */}
            <div className="col-span-2 mt-1">
              <button type="submit" className="w-full py-2 rounded-xl bg-gradient-to-r from-green-400 to-blue-500 text-white font-bold text-base shadow-lg hover:from-green-500 hover:to-blue-600 transition-all">Set Goal</button>
            </div>
          </form>
        )}
        <style jsx>{`
          .modal-input-sm {
            width: 100%;
            padding: 0.5rem 0.8rem;
            border-radius: 0.8rem;
            border: 1.2px solid #e5e7eb;
            background: rgba(255,255,255,0.95);
            box-shadow: 0 1px 4px 0 rgba(0,0,0,0.03);
            font-size: 0.98rem;
            outline: none;
            transition: border 0.2s, box-shadow 0.2s;
            margin-right: 0;
            display: block;
          }
          .modal-input-sm:focus {
            border: 1.2px solid #2563eb;
            box-shadow: 0 2px 8px 0 rgba(34,197,94,0.08);
          }
          .animate-fadein {
            animation: fadein 0.4s cubic-bezier(.4,0,.2,1);
          }
          @keyframes fadein {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: none; }
          }
        `}</style>
        <style jsx global>{`
          input[type=number]::-webkit-inner-spin-button,
          input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none !important;
            margin: 0 !important;
          }
          input[type=number] {
            -moz-appearance: textfield !important;
            appearance: textfield !important;
          }
        `}</style>
      </div>
    </div>
  );
}

// --- BMI Card (not a gauge) ---
function BMICard({ bmi }: { bmi: number }) {
  // BMI zones
  const zones = [
    { from: 10, to: 18.5, color: '#a78bfa', label: 'Underweight' },
    { from: 18.5, to: 25, color: '#22c55e', label: 'Normal' },
    { from: 25, to: 30, color: '#fbbf24', label: 'Overweight' },
    { from: 30, to: 40, color: '#ef4444', label: 'Obese' },
  ];
  const getZone = (bmi: number) => {
    if (bmi < 18.5) return zones[0];
    if (bmi < 25) return zones[1];
    if (bmi < 30) return zones[2];
    if (bmi >= 30) return zones[3];
    return null;
  };
  const zone = getZone(bmi);
  // Dot position on bar
  const min = 10, max = 40;
  const percent = bmi > 0 ? Math.min(1, Math.max(0, (bmi - min) / (max - min))) : 0;
  return (
    <div className="w-full max-w-xs bg-white/80 rounded-2xl shadow-lg p-6 flex flex-col items-center gap-2 border border-gray-100">
      <div className="text-xs text-gray-500 mb-1">Body Mass Index (BMI)</div>
      <div className="text-4xl font-extrabold" style={{ color: zone?.color || '#64748b' }}>{bmi > 0 ? bmi : '--'}</div>
      <div className="text-sm font-semibold mb-2" style={{ color: zone?.color || '#64748b' }}>{zone ? zone.label : '—'}</div>
      {/* Color bar */}
      <div className="relative w-full h-4 flex rounded-full overflow-hidden mb-2" style={{ background: '#f3f4f6' }}>
        {zones.map((z, i) => (
          <div key={i} style={{ background: z.color, width: `${((z.to - z.from) / (max - min)) * 100}%`, height: '100%' }} />
        ))}
        {/* Dot for current BMI */}
        {bmi > 0 && (
          <div style={{ left: `calc(${percent * 100}% - 8px)` }} className="absolute top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 rounded-full border-2 border-white" style={{ background: zone?.color || '#64748b' }} />
          </div>
        )}
      </div>
      {/* Range labels */}
      <div className="flex justify-between w-full text-xs text-gray-400">
        <span>&lt;18.5</span>
        <span>18.5</span>
        <span>25</span>
        <span>30</span>
        <span>&gt;30</span>
      </div>
      {/* Legend */}
      <div className="flex justify-center gap-3 mt-2 text-xs">
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{background:'#a78bfa'}}></span> Underweight</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{background:'#22c55e'}}></span> Normal</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{background:'#fbbf24'}}></span> Overweight</div>
        <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{background:'#ef4444'}}></span> Obese</div>
      </div>
    </div>
  );
}

// --- Progress Path Component ---
function ProgressPath({ start, current, target, startDate, currentDate, targetDate, unit }: {
  start: number;
  current: number;
  target: number;
  startDate: string;
  currentDate: string;
  targetDate: string;
  unit: string;
}) {
  // Calculate progress percent
  const percent = start !== target ? Math.min(100, Math.max(0, ((start - current) / (start - target)) * 100)) : 0;
  // Helper for font size
  const getFontSize = (val: number) => val > 99.99 ? 'text-xl' : 'text-2xl';
  const getCurrentFontSize = (val: number) => val > 99.99 ? 'text-2xl' : 'text-3xl';
  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex items-center justify-between w-full max-w-2xl mx-auto gap-6">
        {/* Start */}
        <div className="flex flex-col items-center z-10 group transition-all">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-100 to-blue-300 shadow-xl flex items-center justify-center border-2 border-blue-400 group-hover:scale-105 transition-transform duration-200">
            <span className="flex flex-col items-center">
              <span className={`${getFontSize(start)} font-extrabold text-blue-600 leading-none`}>{start}</span>
              <span className="text-xs font-semibold text-blue-400 -mt-1">{unit}</span>
            </span>
          </div>
          <span className="mt-2 text-xs text-gray-500 font-medium">{startDate}</span>
          <span className="mt-0.5 text-xs text-blue-400 font-semibold tracking-wide">Started</span>
        </div>
        {/* Progress Bar with animated dot */}
        <div className="flex-1 h-4 relative mx-2 flex items-center">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-2 rounded-full bg-gradient-to-r from-blue-200 via-green-200 to-gray-200 shadow-inner" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-gradient-to-r from-blue-400 to-green-400 transition-all duration-500" style={{ width: `${percent}%` }} />
          {/* Animated dot */}
          <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `calc(${percent}% - 10px)` }}>
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-400 to-blue-400 border-2 border-white shadow-lg animate-pulse" />
          </div>
        </div>
        {/* Current */}
        <div className="flex flex-col items-center z-10 group transition-all">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-300 shadow-2xl flex items-center justify-center border-4 border-green-500 ring-4 ring-green-200 animate-pulse group-hover:scale-110 transition-transform duration-200">
            <span className="flex flex-col items-center">
              <span className={`${getCurrentFontSize(current)} font-extrabold text-green-700 leading-none`}>{current}</span>
              <span className="text-sm font-semibold text-green-400 -mt-1">{unit}</span>
            </span>
          </div>
          <span className="mt-2 text-xs text-gray-500 font-medium">{currentDate}</span>
          <span className="mt-0.5 text-xs text-green-600 font-semibold tracking-wide">Current</span>
        </div>
        {/* Progress Bar to target */}
        <div className="flex-1 h-4 relative mx-2 flex items-center">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-2 rounded-full bg-gradient-to-r from-green-200 to-gray-200 shadow-inner" />
        </div>
        {/* Target */}
        <div className="flex flex-col items-center z-10 group transition-all">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-green-300 shadow-xl flex items-center justify-center border-2 border-green-500 group-hover:scale-105 transition-transform duration-200">
            <span className="flex flex-col items-center">
              <span className={`${getFontSize(target)} font-extrabold text-green-600 leading-none`}>{target}</span>
              <span className="text-xs font-semibold text-green-400 -mt-1">{unit}</span>
            </span>
          </div>
          <span className="mt-2 text-xs text-gray-500 font-medium">{targetDate}</span>
          <span className="mt-0.5 text-xs text-green-500 font-semibold tracking-wide">Target</span>
        </div>
      </div>
      <style jsx>{`
        .group:hover .group-hover\\:scale-105 { transform: scale(1.05); }
        .group:hover .group-hover\\:scale-110 { transform: scale(1.10); }
      `}</style>
    </div>
  );
}

export default function WeightManagementPage() {
  const [goal, setGoal] = useState<any>(initialGoal);
  const [activeGoal, setActiveGoal] = useState<any>(null); // fetched from backend
  const [logs, setLogs] = useState<any[]>([]); // daily logs
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showForm, setShowForm] = useState(true);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [modalViewOnly, setModalViewOnly] = useState(false);
  const [logDate, setLogDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [logWeight, setLogWeight] = useState('');
  const [editRow, setEditRow] = useState<string | null>(null); // date string of row in edit mode
  const [editWeight, setEditWeight] = useState<string>('');
  const [editDate, setEditDate] = useState<string>('');

  // Pagination state for Log History
  const [logPage, setLogPage] = useState(1);
  const LOGS_PER_PAGE = 10;
  const paginatedLogHistory = [...logs].sort((a, b) => b.date.localeCompare(a.date)).slice((logPage - 1) * LOGS_PER_PAGE, logPage * LOGS_PER_PAGE);
  const totalPages = Math.ceil(logs.length / LOGS_PER_PAGE);

  // --- API utility functions ---
  const USER_ID = '68144435f74e9d8077904b14'; // TODO: Replace with real userId from auth

  async function fetchGoals(userId: string) {
    const res = await fetch(`/api/weight/goal?userId=${userId}`);
    const data = await res.json();
    return data.goals || [];
  }

  async function createGoal(goal: any) {
    const res = await fetch('/api/weight/goal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(goal),
    });
    const data = await res.json();
    return data.goal;
  }

  async function updateGoal(goalId: string, updates: any) {
    const res = await fetch(`/api/weight/goal/${goalId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    return data.goal;
  }

  async function deleteGoal(goalId: string) {
    await fetch(`/api/weight/goal/${goalId}`, { method: 'DELETE' });
  }

  async function fetchLogs(goalId: string) {
    const res = await fetch(`/api/weight/goal/${goalId}/logs`);
    const data = await res.json();
    return data.logs || [];
  }

  async function addLog(goalId: string, log: any) {
    const res = await fetch(`/api/weight/goal/${goalId}/logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(log),
    });
    const data = await res.json();
    return data.log;
  }

  // --- State for API-driven goals/logs ---
  const [goals, setGoals] = useState<any[]>([]); // all goals for user
  const [archivedGoals, setArchivedGoals] = useState<any[]>([]); // all archived goals

  // On mount, fetch all goals and set active/archived
  useEffect(() => {
    async function loadGoalsAndLogs() {
      const allGoals = await fetchGoals(USER_ID);
      setGoals(allGoals);
      // Find active goal (status: 'ongoing' and isActive !== false)
      const active = allGoals.find((g: any) => g.status === 'ongoing' && g.isActive !== false);
      setActiveGoal(active || null);
      // Set archived goals (not ongoing)
      setArchivedGoals(allGoals.filter((g: any) => g.status !== 'ongoing'));
      // Fetch logs for active goal
      if (active) {
        const goalLogs = await fetchLogs(active._id);
        setLogs(goalLogs);
      } else {
        setLogs([]);
      }
    }
    loadGoalsAndLogs();
  }, []);

  // When activeGoal changes, fetch its logs
  useEffect(() => {
    if (activeGoal && activeGoal._id) {
      fetchLogs(activeGoal._id).then(setLogs);
    } else {
      setLogs([]);
    }
  }, [activeGoal]);

  // Handler to mark a goal as achieved, not achieved, or discarded
  const handleMarkGoalStatus = (goalId: string, status: 'achieved' | 'not_achieved' | 'discarded') => {
    setArchivedGoals(prev => prev.map(goal => {
      if (goal.id !== goalId) return goal;
      // Use last log as finalWeight/finalBMI
      const lastLog = goal.logs[goal.logs.length - 1];
      return {
        ...goal,
        status,
        finalWeight: lastLog?.weight ?? goal.finalWeight,
        finalBMI: lastLog?.bmi ?? goal.finalBMI,
        progress: 100,
      };
    }));
  };

  // TODO: Fetch active goal and logs from backend on mount
  useEffect(() => {
    async function fetchGoalAndLogs() {
      try {
        const res = await fetch('/api/weight/history?userId=68144435f74e9d8077904b14');
        const data = await res.json();
        if (data.success && data.goal) {
          setActiveGoal(data.goal);
          setGoal({
            age: data.goal.age,
            height: data.goal.height,
            startWeight: data.goal.startWeight,
            targetWeight: data.goal.targetWeight,
            targetDate: data.goal.targetDate,
            unit: data.goal.unit,
          });
          setLogs(data.goal.logs || []);
        } else {
          setError(data.error || 'Failed to fetch goal');
        }
      } catch (err) {
        setError('Failed to fetch goal');
      }
    }
    fetchGoalAndLogs();
  }, []);

  // Validation
  const validate = () => {
    if (!goal.age || !goal.height || !goal.startWeight || !goal.targetWeight || !goal.targetDate) {
      setError("All fields are required");
      return false;
    }
    if (+goal.height <= 0 || +goal.startWeight <= 0 || +goal.targetWeight <= 0) {
      setError("Height and weight must be positive numbers");
      return false;
    }
    if (+goal.targetWeight < 30) {
      setError("Target weight should be at least 30kg");
      return false;
    }
    if (new Date(goal.targetDate) <= new Date()) {
      setError("Target date must be in the future");
      return false;
    }
    setError("");
    return true;
  };

  // Handle goal submission
  const handleGoalSubmit = (e: any) => {
    e.preventDefault();
    if (!validate()) return;
    // TODO: Send to backend, set as active goal
    setActiveGoal({ ...goal, startDate: new Date().toISOString().split("T")[0] });
    setShowForm(false);
    setSuccess("Goal set successfully!");
  };

  // Handle daily log
  const handleLog = (date: string, weight: string) => {
    setLogs((prev) => [...prev, { date, weight: +weight }]);
    setLogDate(() => {
      const today = new Date();
      return today.toISOString().split('T')[0];
    });
    setLogWeight('');
  };

  // Allow new goal if previous is over
  const handleNewGoal = () => {
    setActiveGoal(null);
    setGoal(initialGoal);
    setShowForm(true);
    setLogs([]);
    setSuccess("");
  };

  // BMI calculation
  const calcBMI = (weight: number, height: number) => {
    if (!weight || !height) return 0;
    const h = height / 100;
    return +(weight / (h * h)).toFixed(1);
  };

  // Progress %
  const progressPercent = () => {
    if (!activeGoal) return 0;
    const start = +activeGoal.startWeight;
    const target = +activeGoal.targetWeight;
    const current = logs.length > 0 ? logs[logs.length - 1].weight : start;
    if (start === target) return 100;
    return +(((start - current) / (start - target)) * 100).toFixed(1);
  };

  // --- BMI values and dates ---
  const unit = activeGoal?.unit || 'kg';
  const startWeight = activeGoal?.startWeight ? +activeGoal.startWeight : 0;
  const targetWeight = activeGoal?.targetWeight ? +activeGoal.targetWeight : 0;
  const currentWeight = logs.length > 0 ? logs[logs.length - 1].weight : startWeight;
  const height = activeGoal?.height ? +activeGoal.height : 0;
  const startBMI = calcBMI(startWeight, height);
  const currentBMI = calcBMI(currentWeight, height);
  const targetBMI = calcBMI(targetWeight, height);
  const startDate = activeGoal?.startDate || "-";
  const currentDate = logs.length > 0 ? logs[logs.length - 1].date : startDate;
  const targetDate = activeGoal?.targetDate || "-";
  const daysLeft = activeGoal ? Math.max(0, Math.ceil((new Date(activeGoal.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : 0;
  const progress = progressPercent();

  // --- Tabs for right card ---
  const [tab, setTab] = useState<'log'|'chart'|'insights'|'archival'>('log');
  const [selectedArchiveGoalId, setSelectedArchiveGoalId] = useState<string|null>(null);

  // --- handle new goal from modal ---
  const handleAddGoal = (goal: any) => {
    setGoal(goal);
    setActiveGoal({ ...goal, startDate: new Date().toISOString().split("T")[0] });
    setShowForm(false);
    setLogs([]);
    setSuccess("Goal set successfully!");
  };

  // --- handle + button click ---
  const handlePlusClick = () => {
    if (activeGoal) {
      setModalViewOnly(true);
      setShowAddGoal(true);
    } else {
      setModalViewOnly(false);
      setShowAddGoal(true);
    }
  };

  // --- Log History with missed days ---
  function getLogHistory(logs: any[], startDate: string) {
    if (!startDate || startDate === '-') return [];
    // Sort logs ascending by date
    const sorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
    const history = [];
    let prevDate = startDate;
    let prevWeight = startWeight;
    let i = 0;
    const today = new Date().toISOString().split('T')[0];
    for (let d = new Date(startDate); d <= new Date(today); d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      if (i < sorted.length && sorted[i].date === dateStr) {
        history.push({ ...sorted[i], autoFilled: false });
        prevWeight = sorted[i].weight;
        prevDate = dateStr;
        i++;
      } else {
        // Missed day, auto-fill
        history.push({ date: dateStr, weight: prevWeight, autoFilled: true });
        prevDate = dateStr;
      }
    }
    return history.reverse();
  }

  const logHistory = getLogHistory(logs, startDate);

  // --- Add or modify log for a date ---
  const handleAddOrModifyLog = (date: string, weight: string) => {
    // If log exists for this date, modify it; else, add new
    setLogs(prev => {
      const idx = prev.findIndex(l => l.date === date);
      if (idx !== -1) {
        // Modify
        const updated = [...prev];
        updated[idx] = { ...updated[idx], weight: +weight };
        return updated;
      } else {
        // Add
        return [...prev, { date, weight: +weight }];
      }
    });
    setEditRow(null);
    setEditWeight('');
    setEditDate('');
  };

  // Add chartType state at the top of the component:
  const [chartType, setChartType] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Add at the top-level of the component:
  const [showAchieveModal, setShowAchieveModal] = useState(false);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Handler to move current goal to archive
  const archiveCurrentGoal = async (status: 'achieved' | 'discarded') => {
    if (!activeGoal) return;
    const lastLog = logs[logs.length - 1];
    try {
      await fetch(`/api/weight/goal/${activeGoal._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          finalWeight: lastLog?.weight ?? activeGoal.startWeight,
          finalBMI: lastLog ? calcBMI(lastLog.weight, activeGoal.height) : undefined,
          progress: 100,
          archivedAt: new Date().toISOString().split('T')[0],
          logs: [...logs],
        }),
      });
      // Refresh goals from backend
      const allGoals = await fetchGoals(USER_ID);
      setGoals(allGoals);
      setActiveGoal(allGoals.find((g: any) => g.status === 'ongoing' && g.isActive !== false) || null);
      setArchivedGoals(allGoals.filter((g: any) => ['achieved', 'not_achieved', 'discarded'].includes(g.status) && g.startDate && g.targetDate));
      setGoal(initialGoal);
      setLogs([]);
      setShowForm(true);
      setToast({
        message: status === 'achieved' ? '🎉 Goal marked as Achieved! Check your Hall of Fame.' : 'Goal discarded. Set a new goal to continue your journey.',
        type: status === 'achieved' ? 'success' : 'error',
      });
    } catch (err) {
      setToast({ message: 'Failed to update goal status. Please try again.', type: 'error' });
    }
  };

  // Add at the top of the component:
  const [hoveredAction, setHoveredAction] = useState<'achieve' | 'discard' | null>(null);

  // Move this helper function inside WeightManagementPage and type its parameters
  function renderArchiveCard(
    goal: any,
    status: 'achieved' | 'not_achieved' | 'discarded',
    selectedArchiveGoalId: string | null,
    setSelectedArchiveGoalId: (id: string) => void,
    idx?: number
  ) {
    // Calculate achievement
    let finalWeight = goal.finalWeight;
    if (finalWeight == null) {
      // fallback: use last log's weight if available
      if (goal.logs && goal.logs.length > 0) {
        finalWeight = goal.logs[goal.logs.length - 1].weight;
      } else {
        finalWeight = goal.startWeight;
      }
    }
    let weightDiff = 0;
    if (status === 'achieved') {
      weightDiff = goal.startWeight - finalWeight;
    } else if (status === 'not_achieved') {
      weightDiff = finalWeight - goal.startWeight;
    } else {
      weightDiff = 0;
    }
    let achievementMsg = '';
    let badge = '';
    let cardBg = '';
    let borderColor = '';
    let topBar = '';
    let statusLabel = '';
    let statusLabelColor = '';
    // Extract year from targetDate or startDate
    const year = (goal.targetDate || goal.startDate || '').slice(0, 4);
    if (status === 'achieved') {
      achievementMsg = `Lost: ${Math.abs(weightDiff).toFixed(1)} Kg`;
      badge = '🏆';
      cardBg = 'bg-green-50';
      borderColor = 'border-green-300';
      topBar = 'bg-gradient-to-r from-green-400 to-green-200';
      statusLabel = 'Achieved';
      statusLabelColor = 'bg-green-500 text-white';
    } else if (status === 'not_achieved') {
      achievementMsg = `Gained: ${Math.abs(weightDiff).toFixed(1)} Kg`;
      badge = '💪';
      cardBg = 'bg-red-50';
      borderColor = 'border-red-300';
      topBar = 'bg-gradient-to-r from-red-400 to-red-200';
      statusLabel = 'Not Achieved';
      statusLabelColor = 'bg-red-500 text-white';
    } else {
      achievementMsg = 'Maintained Weight';
      badge = '🎯';
      cardBg = 'bg-gray-50';
      borderColor = 'border-gray-300';
      topBar = 'bg-gradient-to-r from-gray-400 to-gray-200';
      statusLabel = 'Discarded';
      statusLabelColor = 'bg-gray-400 text-white';
    }
    return (
      <div
        key={goal._id || idx}
        className={`rounded-xl shadow border ${borderColor} flex flex-col items-center justify-between cursor-pointer transition-all duration-200 min-h-[200px] w-full max-w-[220px] mx-auto ${cardBg} p-0 text-xs ${selectedArchiveGoalId === goal._id ? 'ring-4 ring-yellow-400 scale-105' : ''}`}
        style={{ fontSize: '0.92rem' }}
        onClick={() => setSelectedArchiveGoalId(goal._id)}
      >
        {/* Top colored bar */}
        <div className={`w-full h-2 rounded-t-xl ${topBar}`} />
        <div className="w-full flex justify-center -mt-3 mb-1">
          <span className={`px-2 py-0.5 rounded-full text-[0.7rem] font-bold shadow ${statusLabelColor}`}>{statusLabel}</span>
        </div>
        {/* Year badge inside card */}
        <div className="w-full flex justify-center mb-1">
          <span className="bg-blue-600 text-white text-[0.7rem] font-bold px-2 py-0.5 rounded-full shadow">Year: {year}</span>
        </div>
        {/* Badge and Achievement */}
        <div className="flex flex-col items-center w-full pt-1 pb-1">
          <span className="text-xl mb-1 drop-shadow-lg">{badge}</span>
          <span className="text-base font-bold tracking-tight px-2 py-1 rounded-xl shadow bg-white/80 text-center mb-1">{achievementMsg}</span>
        </div>
        {/* Details */}
        <div className="flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium text-gray-700 w-full px-2">
          <span>Start: <b>{goal.startDate}</b></span>
          <span>End: <b>{goal.targetDate}</b></span>
          <span>Start: <b>{goal.startWeight}kg</b> → Target: <b>{goal.targetWeight}kg</b> → Final: <b>{finalWeight ?? '-'}</b></span>
          <span>BMI: <b>{goal.startBMI}</b> → <b>{goal.finalBMI ?? '-'}</b></span>
        </div>
        {/* Progress Bar */}
        <div className="w-4/5 h-2 bg-gray-200 rounded-full mt-2 mx-auto">
          <div className={`h-2 rounded-full ${status === 'achieved' ? 'bg-green-400' : status === 'not_achieved' ? 'bg-red-400' : 'bg-gray-300'}`} style={{ width: `${goal.progress || 100}%` }} />
        </div>
        {/* Archived Date */}
        <div className="text-[0.7rem] text-gray-400 mt-1 mb-2 text-center w-full">{goal.archivedAt && `Archived: ${goal.archivedAt}`}</div>
      </div>
    );
  }

  // In the archival tab, sort archivedGoals by targetDate descending before rendering
  const sortedArchivedGoals = [...archivedGoals]
    .filter(goal => ['achieved', 'not_achieved', 'discarded'].includes(goal.status) && goal.startDate && goal.targetDate)
    .sort((a, b) => (b.targetDate || '').localeCompare(a.targetDate || ''));

  // --- Add state for selected archive log pagination ---
  const [archiveLogPage, setArchiveLogPage] = useState(1);
  const ARCHIVE_LOGS_PER_PAGE = 10;

  // 1. Toast auto-dismiss
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-blue-100 flex flex-col pb-32">
      {/* Hero Section */}
      {activeGoal ? (
        <div className="w-full px-2 md:px-0 max-w-6xl mx-auto mt-4 mb-4">
          <div className="rounded-3xl bg-gradient-to-r from-green-200/80 to-blue-200/80 shadow-2xl flex flex-col md:flex-row items-center justify-between px-4 py-5 gap-4 border border-gray-100 backdrop-blur-md relative overflow-hidden">
            {/* Left: Title & Motivation */}
            <div className="flex-1 flex flex-col items-start gap-4 z-10">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 drop-shadow-sm">Your Weight Journey</h1>
                <button
                  className="ml-2 w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-blue-500 text-white flex items-center justify-center shadow-lg hover:from-green-500 hover:to-blue-600 hover:scale-110 transition-all text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-400"
                  title="Set New Weight Goal"
                  onClick={handlePlusClick}
                  aria-label="Set New Weight Goal"
                >
                  +
                </button>
              </div>
              <div className="text-lg text-gray-700 font-medium">Lose <span className="text-green-600 font-bold">{startWeight - targetWeight} {unit}</span> by <span className="text-blue-600 font-bold">{targetDate}</span></div>
              <div className="text-md text-gray-500 mt-2">Stay consistent! Every log brings you closer to your goal. <span className="text-green-500 font-bold">You got this!</span></div>
              <div className="mt-4 w-full">
                <ProgressPath
                  start={startWeight || 0}
                  current={currentWeight || 0}
                  target={targetWeight || 0}
                  startDate={startDate || '-'}
                  currentDate={currentDate || '-'}
                  targetDate={targetDate || '-'}
                  unit={unit}
                />
              </div>
            </div>
            {/* Right: BMI Card */}
            <div className="flex-1 flex flex-col items-center justify-center z-10">
              <BMICard bmi={height && currentWeight ? +(currentWeight / Math.pow(height / 100, 2)).toFixed(1) : 0} />
            </div>
            {/* Decorative BG */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-100/60 to-blue-100/60 pointer-events-none rounded-3xl" />
          </div>
          {/* Achieve Modal */}
          {showAchieveModal && activeGoal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white/95 rounded-2xl shadow-2xl px-6 py-6 w-full max-w-sm relative border border-green-200 flex flex-col gap-4 animate-fadein">
                <h2 className="text-2xl font-extrabold text-center mb-1 tracking-tight text-green-700">Mark Goal as Achieved?</h2>
                <div className="text-gray-700 text-center mb-2">Are you sure you want to mark this goal as <span className='text-green-600 font-bold'>Achieved</span>? This will move it to your Hall of Fame.</div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex flex-col gap-2 text-sm mb-2">
                  <div><b>Start Weight:</b> {activeGoal.startWeight} kg</div>
                  <div><b>Current Weight:</b> {logs.length > 0 ? logs[logs.length-1].weight : activeGoal.startWeight} kg</div>
                  <div><b>Target Weight:</b> {activeGoal.targetWeight} kg</div>
                  <div><b>Start Date:</b> {activeGoal.startDate}</div>
                  <div><b>Target Date:</b> {activeGoal.targetDate}</div>
                  <div><b>Progress:</b> {progressPercent()}%</div>
                </div>
                <div className="flex gap-3 mt-4 justify-center">
                  <button className="px-4 py-2 rounded-lg bg-green-500 text-white font-bold shadow hover:bg-green-600 transition" onClick={() => { archiveCurrentGoal('achieved'); setShowAchieveModal(false); }}>Confirm</button>
                  <button className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 font-bold shadow hover:bg-gray-400 transition" onClick={() => setShowAchieveModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          {/* Discard Modal */}
          {showDiscardModal && activeGoal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white/95 rounded-2xl shadow-2xl px-6 py-6 w-full max-w-sm relative border border-gray-200 flex flex-col gap-4 animate-fadein">
                <h2 className="text-2xl font-extrabold text-center mb-1 tracking-tight text-gray-700">Discard Goal?</h2>
                <div className="text-gray-700 text-center mb-2">Are you sure you want to <span className='text-gray-500 font-bold'>discard</span> this goal? This cannot be undone.</div>
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col gap-2 text-sm mb-2">
                  <div><b>Start Weight:</b> {activeGoal.startWeight} kg</div>
                  <div><b>Current Weight:</b> {logs.length > 0 ? logs[logs.length-1].weight : activeGoal.startWeight} kg</div>
                  <div><b>Target Weight:</b> {activeGoal.targetWeight} kg</div>
                  <div><b>Start Date:</b> {activeGoal.startDate}</div>
                  <div><b>Target Date:</b> {activeGoal.targetDate}</div>
                  <div><b>Progress:</b> {progressPercent()}%</div>
                </div>
                <div className="flex gap-3 mt-4 justify-center">
                  <button className="px-4 py-2 rounded-lg bg-gray-400 text-white font-bold shadow hover:bg-gray-500 transition" onClick={() => { archiveCurrentGoal('discarded'); setShowDiscardModal(false); }}>Confirm</button>
                  <button className="px-4 py-2 rounded-lg bg-gray-300 text-gray-700 font-bold shadow hover:bg-gray-400 transition" onClick={() => setShowDiscardModal(false)}>Cancel</button>
                </div>
              </div>
            </div>
          )}
          {/* Toast/Snackbar */}
          {toast && (
            <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-lg font-semibold text-white ${toast.type === 'success' ? 'bg-green-500' : 'bg-gray-700'}`}>{toast.message}</div>
          )}
        </div>
      ) : (
        <div className="w-full px-2 md:px-0 max-w-6xl mx-auto mt-4 mb-4">
          <div className="rounded-3xl bg-gradient-to-r from-green-200/80 to-blue-200/80 shadow-2xl flex flex-col items-center justify-center px-4 py-10 border border-gray-100 backdrop-blur-md relative overflow-hidden">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 drop-shadow-sm mb-2">No Active Goal</h1>
            <div className="text-lg text-gray-700 font-medium mb-4">Set a new weight goal to start your journey!</div>
            <button
              className="mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-400 to-green-500 text-white font-bold text-lg shadow-lg hover:from-blue-500 hover:to-green-600 transition-all"
              onClick={handlePlusClick}
            >
              Set New Goal
            </button>
          </div>
        </div>
      )}
      {/* Main Content Cards */}
      <div className="max-w-6xl mx-auto w-full flex flex-col md:flex-row gap-4">
        {/* Log/Chart/Insights Card: Now full width on md+ screens */}
        <div className="flex-1 bg-white/90 rounded-2xl shadow-xl p-4 flex flex-col gap-4 border border-gray-100 backdrop-blur-md">
          <div className="flex gap-4 mb-4">
            <button onClick={() => setTab('log')} className={`px-4 py-2 rounded-lg font-semibold transition ${tab==='log' ? 'bg-blue-100 text-blue-700 shadow' : 'hover:bg-blue-50 text-gray-500'}`}>Log</button>
            <button onClick={() => setTab('chart')} className={`px-4 py-2 rounded-lg font-semibold transition ${tab==='chart' ? 'bg-green-100 text-green-700 shadow' : 'hover:bg-green-50 text-gray-500'}`}>Progress Chart</button>
            <button onClick={() => setTab('insights')} className={`px-4 py-2 rounded-lg font-semibold transition ${tab==='insights' ? 'bg-yellow-100 text-yellow-700 shadow' : 'hover:bg-yellow-50 text-gray-500'}`}>Insights</button>
            <button onClick={() => setTab('archival')} className={`px-4 py-2 rounded-lg font-semibold transition ${tab==='archival' ? 'bg-purple-100 text-purple-700 shadow' : 'hover:bg-purple-50 text-gray-500'}`}>Archival</button>
          </div>
          {tab === 'log' && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2 justify-between">
                {/* Left: Heading */}
                <span className="flex items-center gap-2"><ChartBarIcon className="w-5 h-5 text-blue-500" /> Daily Weight Log</span>
                {/* Center: Days Left Message */}
                {activeGoal && (
                  <div className="flex-1 flex justify-center">
                    {(() => {
                      let colorClass = '';
                      if (daysLeft > 45) colorClass = 'bg-green-50 text-green-700 border-green-100';
                      else if (daysLeft > 30) colorClass = 'bg-yellow-50 text-yellow-700 border-yellow-100';
                      else colorClass = 'bg-red-50 text-red-700 border-red-200';
                      return (
                        <span
                          className={`px-3 py-1 rounded-lg font-semibold text-sm shadow border ${colorClass}`}
                          style={{ whiteSpace: 'nowrap' }}
                        >
                          {daysLeft > 0
                            ? `You are ${daysLeft} day${daysLeft === 1 ? '' : 's'} away to achieve your goal!!!`
                            : 'Today is your target date!'}
                        </span>
                      );
                    })()}
                  </div>
                )}
                {/* Right: CTAs */}
                {activeGoal && (
                  <div className="hidden sm:flex items-center gap-4 ml-2"> {/* Increased gap for more space between icons */}
                    <div className="relative">
                      <button
                        className="w-10 h-10 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center shadow transition group"
                        onMouseEnter={() => setHoveredAction('achieve')}
                        onMouseLeave={() => setHoveredAction(null)}
                        onClick={() => setShowAchieveModal(true)}
                        aria-label="Mark as Achieved"
                      >
                        <span className="text-2xl">🏆</span>
                      </button>
                      {hoveredAction === 'achieve' && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-12 z-40 bg-white border-2 border-green-300 shadow-2xl rounded-2xl px-6 py-3 text-green-700 font-semibold text-base animate-fadein flex flex-col items-center gap-1"
                          style={{ minWidth: '220px' }}
                        >
                          <span className="text-center leading-tight font-bold">Mark this goal as Achieved</span>
                        </div>
                      )}
                    </div>
                    <div className="relative">
                      <button
                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center shadow transition group"
                        onMouseEnter={() => setHoveredAction('discard')}
                        onMouseLeave={() => setHoveredAction(null)}
                        onClick={() => setShowDiscardModal(true)}
                        aria-label="Discard Goal"
                      >
                        <span className="text-2xl">🗑️</span>
                      </button>
                      {hoveredAction === 'discard' && (
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-12 z-40 bg-white border-2 border-gray-300 shadow-2xl rounded-2xl px-6 py-3 text-gray-700 font-semibold text-base animate-fadein flex flex-col items-center gap-1"
                          style={{ minWidth: '220px' }}
                        >
                          <span className="text-center leading-tight font-bold">Discard this goal</span>
                          <span className="text-gray-500 font-medium text-xs text-center mt-1">You can always set a new one!</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </h3>
              {/* Show prompt if no active goal */}
              {!activeGoal ? (
                <div className="w-full text-center py-6 text-lg font-semibold text-blue-600 bg-blue-50 rounded-xl mb-6 border border-blue-100 shadow animate-fadein">
                  Set a New Goal to continue your journey!
                </div>
              ) : null}
              {/* Only show the table if there is an active goal */}
              {activeGoal && (
                <table className="w-full text-sm rounded-xl overflow-hidden border border-gray-200 mb-6">
                  <thead>
                    <tr className="bg-gradient-to-r from-green-100 to-blue-100 text-gray-700">
                      <th className="p-2 text-center w-32 pl-4">Date</th>
                      <th className="p-2 text-center w-32">Weight (kg)</th>
                      <th className="p-2 text-center w-32">BMI</th>
                      <th className="p-2 text-center w-24">Diff</th>
                      <th className="p-2 text-center w-32">Trend</th>
                      <th className="p-2 pr-4 text-right w-32">Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const logExists = logs.some(l => l.date === logDate);
                      const log = logs.find(l => l.date === logDate);
                      const prevLog = logs.length > 0 ? [...logs].sort((a, b) => b.date.localeCompare(a.date)).find(l => l.date < logDate) : null;
                      const prevWeight = prevLog ? prevLog.weight : startWeight;
                      const bmi = logWeight ? calcBMI(Number(logWeight), height) : log ? calcBMI(log.weight, height) : '';
                      const diff = logWeight ? (Number(logWeight) - prevWeight) : log ? (log.weight - prevWeight) : '';
                      if (editRow === logDate || (!logExists && !editRow)) {
                        // Editable mode
                        return (
                          <tr>
                            <td className="p-2 text-center w-32 pl-4"><input type="date" className="input-glass" value={logDate} onChange={e => setLogDate(e.target.value)} /></td>
                            <td className="p-2 text-center w-32"><input type="number" className="input-glass" value={logWeight} onChange={e => setLogWeight(e.target.value)} /></td>
                            <td className="p-2 text-center w-32">{bmi}</td>
                            <td className={`p-2 text-center w-24 ${typeof diff === 'number' && diff > 0 ? 'text-red-500' : typeof diff === 'number' && diff < 0 ? 'text-green-500' : 'text-gray-400'}`}>{typeof diff === 'number' && diff !== 0 ? (diff > 0 ? '+' : '') + diff.toFixed(2) : diff}</td>
                            <td className="p-2 text-center w-32">{typeof diff === 'number' ? (diff > 0 ? <span className="text-red-500">↑</span> : diff < 0 ? <span className="text-green-500">↓</span> : <span className="text-gray-400">→</span>) : ''}</td>
                            <td className="p-2 pr-4 text-right w-32">
                              {editRow === logDate ? (
                                <div className="flex gap-2 justify-end">
                                  <button className="bg-green-500 text-white px-3 py-1 rounded-lg shadow hover:bg-green-600 transition" onClick={() => { handleAddOrModifyLog(logDate, logWeight); }}>Save</button>
                                  <button className="bg-gray-300 text-gray-700 px-3 py-1 rounded-lg shadow hover:bg-gray-400 transition" onClick={() => { setEditRow(null); setLogWeight(''); }}>Cancel</button>
                                </div>
                              ) : logExists ? (
                                <button className="bg-blue-500 text-white px-3 py-1 rounded-lg shadow hover:bg-blue-600 transition" onClick={() => { setEditRow(log.date); setLogWeight(log.weight.toString()); setLogDate(log.date); }}>Modify</button>
                              ) : (
                                <button className="bg-blue-500 text-white px-3 py-1 rounded-lg shadow hover:bg-blue-600 transition" onClick={() => { if (logDate && logWeight) { handleAddOrModifyLog(logDate, logWeight); setEditRow(null); } }}>Add Log</button>
                              )}
                            </td>
                          </tr>
                        );
                      } else if (logExists) {
                        // View-only mode for today: show Modify button
                        return (
                          <tr>
                            <td className="p-2 text-center w-32 pl-4 font-mono">{log.date}</td>
                            <td className="p-2 text-center w-32">{log.weight}</td>
                            <td className="p-2 text-center w-32">{calcBMI(log.weight, height)}</td>
                            <td className={`p-2 text-center w-24 ${typeof diff === 'number' && diff > 0 ? 'text-red-500' : typeof diff === 'number' && diff < 0 ? 'text-green-500' : 'text-gray-400'}`}>{typeof diff === 'number' && diff !== 0 ? (diff > 0 ? '+' : '') + diff.toFixed(2) : diff}</td>
                            <td className="p-2 text-center w-32">{typeof diff === 'number' ? (diff > 0 ? <span className="text-red-500">↑</span> : diff < 0 ? <span className="text-green-500">↓</span> : <span className="text-gray-400">→</span>) : ''}</td>
                            <td className="p-2 pr-4 text-right w-32">
                              <button className="bg-blue-500 text-white px-3 py-1 rounded-lg shadow hover:bg-blue-600 transition" onClick={() => { setEditRow(log.date); setLogWeight(log.weight.toString()); setLogDate(log.date); }}>Modify</button>
                            </td>
                          </tr>
                        );
                      } else {
                        return null;
                      }
                    })()}
                  </tbody>
                </table>
              )}
              {/* Log History Section */}
              {activeGoal ? (
                <>
                  <h4 className="font-semibold mb-2 mt-6 text-gray-700 flex items-center gap-2"><ClockIcon className="w-5 h-5 text-blue-500" /> Log History</h4>
                  <table className="w-full text-sm rounded-xl overflow-hidden border border-gray-200">
                    <thead>
                      <tr className="bg-gradient-to-r from-green-100 to-blue-100 text-gray-700">
                        <th className="p-2 text-center w-32 pl-4">Date</th>
                        <th className="p-2 text-center w-32">Weight (kg)</th>
                        <th className="p-2 text-center w-32">BMI</th>
                        <th className="p-2 text-center w-24">Diff</th>
                        <th className="p-2 text-center w-32">Trend</th>
                        <th className="p-2 pr-4 text-right w-32">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedLogHistory.map((log, idx) => {
                        const prev = idx < paginatedLogHistory.length - 1 ? paginatedLogHistory[idx + 1].weight : startWeight;
                        const diff = log.weight - prev;
                        let diffColor = '';
                        if (diff < 0) diffColor = 'text-green-600 font-bold';
                        else if (diff === 0) diffColor = 'text-yellow-500 font-bold';
                        else if (diff > 0) diffColor = 'text-red-600 font-bold';
                        return (
                          <tr key={log.date} className={log.autoFilled ? 'bg-red-50' : idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                            <td className="p-2 text-center w-32 pl-4 font-mono">{log.date}</td>
                            <td className="p-2 text-center w-32">{log.weight}</td>
                            <td className="p-2 text-center w-32">{calcBMI(log.weight, height)}</td>
                            <td className={`p-2 text-center w-24 ${typeof diff === 'number' && diff > 0 ? 'text-red-500' : typeof diff === 'number' && diff < 0 ? 'text-green-500' : 'text-gray-400'}`}>{typeof diff === 'number' && diff !== 0 ? (diff > 0 ? '+' : '') + diff.toFixed(2) : diff}</td>
                            <td className="p-2 text-center w-32">{typeof diff === 'number' ? (diff > 0 ? <span className="text-red-500">↑</span> : diff < 0 ? <span className="text-green-500">↓</span> : <span className="text-gray-400">→</span>) : ''}</td>
                            <td className="p-2 pr-4 text-right w-32">{log.autoFilled ? "Auto-filled: Used previous day's weight" : ""}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {/* Pagination Controls */}
                  <div className="flex justify-end items-center gap-2 mt-2">
                    <button
                      className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-50"
                      onClick={() => setLogPage(p => Math.max(1, p - 1))}
                      disabled={logPage === 1}
                    >
                      Previous
                    </button>
                    <span className="text-sm font-medium">Page {logPage} of {totalPages}</span>
                    <button
                      className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-50"
                      onClick={() => setLogPage(p => Math.min(totalPages, p + 1))}
                      disabled={logPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full text-center py-6 text-base text-gray-500">
                  No log history to display.
                </div>
              )}
            </div>
          )}
          {tab === 'chart' && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2"><ChartBarIcon className="w-5 h-5 text-green-500" /> Progress Chart</h3>
              {!activeGoal ? (
                <div className="w-full text-center py-8 text-lg font-semibold text-blue-600 bg-blue-50 rounded-xl mb-6 border border-blue-100 shadow animate-fadein flex flex-col items-center gap-2">
                  Set a New Goal to continue your journey!
                  <span className="text-base text-gray-500 flex items-center gap-2"><PlusIcon className="w-6 h-6 text-blue-400 animate-bounce" /> Click the <b className='text-blue-600'>+</b> button on top to set a new goal!</span>
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mb-4 w-full max-w-md">
                    <button
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition text-center ${chartType === 'daily' ? 'bg-blue-100 text-blue-700 shadow' : 'bg-white text-gray-500 border border-gray-200 hover:bg-blue-50'}`}
                      onClick={() => setChartType('daily')}
                    >
                      Daily
                    </button>
                    <button
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition text-center ${chartType === 'weekly' ? 'bg-green-100 text-green-700 shadow' : 'bg-white text-gray-500 border border-gray-200 hover:bg-green-50'}`}
                      onClick={() => setChartType('weekly')}
                    >
                      Weekly
                    </button>
                    <button
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold transition text-center ${chartType === 'monthly' ? 'bg-purple-100 text-purple-700 shadow' : 'bg-white text-gray-500 border border-gray-200 hover:bg-purple-50'}`}
                      onClick={() => setChartType('monthly')}
                    >
                      Monthly
                    </button>
                  </div>
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                    {chartType === 'daily' && <DailyProgressChart logs={logs} userHeight={height} />}
                    {chartType === 'weekly' && <WeeklyProgressChart logs={logs} userHeight={height} />}
                    {chartType === 'monthly' && <MonthlyProgressChart logs={logs} userHeight={height} />}
                  </div>
                </>
              )}
            </div>
          )}
          {tab === 'insights' && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2"><SparklesIcon className="w-5 h-5 text-yellow-500" /> Insights & Motivation</h3>
              {/* User-level Insights Card */}
              <UserInsightsCard logs={logs} startWeight={startWeight} currentWeight={currentWeight} targetWeight={targetWeight} startDate={startDate} currentDate={currentDate} targetDate={targetDate} />
              <InsightsSimulator />
            </div>
          )}
          {tab === 'archival' && (
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2 text-purple-700"><SparklesIcon className="w-5 h-5 text-purple-500" /> Hall of Fame: Past Weight Goals</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                {sortedArchivedGoals.length === 0 && (
                  <div className="col-span-full text-center text-gray-400 text-lg py-12">No archived goals yet.</div>
                )}
                {sortedArchivedGoals.map((goal, idx) =>
                  renderArchiveCard(goal, goal.status as 'achieved' | 'not_achieved' | 'discarded', selectedArchiveGoalId, setSelectedArchiveGoalId, idx)
                )}
              </div>
              {/* Log History Table for selected goal */}
              {selectedArchiveGoalId && (() => {
                const selectedGoal = archivedGoals.find(g => g._id === selectedArchiveGoalId);
                const logs = selectedGoal?.logs || [];
                const totalArchivePages = Math.ceil(logs.length / ARCHIVE_LOGS_PER_PAGE);
                const paginatedLogs = logs.slice((archiveLogPage - 1) * ARCHIVE_LOGS_PER_PAGE, archiveLogPage * ARCHIVE_LOGS_PER_PAGE);
                return logs.length > 0 ? (
                  <div className="mt-8">
                    <h4 className="font-semibold mb-2 text-gray-700 flex items-center gap-2"><ClockIcon className="w-5 h-5 text-blue-500" /> Log History for Selected Goal</h4>
                    <table className="w-full text-sm rounded-xl overflow-hidden border border-gray-200">
                      <thead>
                        <tr className="bg-gradient-to-r from-green-100 to-blue-100 text-gray-700">
                          <th className="p-2 text-center w-32 pl-4">Date</th>
                          <th className="p-2 text-center w-32">Weight (kg)</th>
                          <th className="p-2 text-center w-32">BMI</th>
                          <th className="p-2 text-center w-24">Diff</th>
                          <th className="p-2 text-center w-32">Trend</th>
                          <th className="p-2 pr-4 text-right w-32">Remarks</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedLogs.map((log: { date: string; weight: number; bmi?: number; autoFilled?: boolean }, idx: number, arr: { date: string; weight: number; bmi?: number; autoFilled?: boolean }[]) => {
                          const prev = idx < paginatedLogs.length - 1 ? paginatedLogs[idx + 1].weight : paginatedLogs[idx].weight;
                          const diff = log.weight - prev;
                          let diffColor = '';
                          if (diff < 0) diffColor = 'text-green-600 font-bold';
                          else if (diff === 0) diffColor = 'text-yellow-500 font-bold';
                          else if (diff > 0) diffColor = 'text-red-600 font-bold';
                          // For archived goals, estimate height from startWeight and startBMI if height is not present
                          let archivedGoalHeight = 0;
                          if (selectedGoal?.startWeight && selectedGoal?.startBMI) {
                            archivedGoalHeight = Math.sqrt(selectedGoal.startWeight / selectedGoal.startBMI) * 100;
                          } else {
                            archivedGoalHeight = 0;
                          }
                          return (
                            <tr key={log.date} className={log.autoFilled ? 'bg-red-50' : idx % 2 === 0 ? 'bg-white' : 'bg-blue-50'}>
                              <td className="p-2 text-center w-32 pl-4 font-mono">{log.date}</td>
                              <td className="p-2 text-center w-32">{log.weight}</td>
                              <td className="p-2 text-center w-32">{calcBMI(log.weight, archivedGoalHeight)}</td>
                              <td className={`p-2 text-center w-24 ${typeof diff === 'number' && diff > 0 ? 'text-red-500' : typeof diff === 'number' && diff < 0 ? 'text-green-500' : 'text-gray-400'}`}>{typeof diff === 'number' && diff !== 0 ? (diff > 0 ? '+' : '') + diff.toFixed(2) : diff}</td>
                              <td className="p-2 text-center w-32">{typeof diff === 'number' ? (diff > 0 ? <span className="text-red-500">↑</span> : diff < 0 ? <span className="text-green-500">↓</span> : <span className="text-gray-400">→</span>) : ''}</td>
                              <td className="p-2 pr-4 text-right w-32">{log.autoFilled ? "Auto-filled: Used previous day's weight" : ""}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    {/* Pagination Controls */}
                    <div className="flex justify-end items-center gap-2 mt-2">
                      <button
                        className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-50"
                        onClick={() => setArchiveLogPage(p => Math.max(1, p - 1))}
                        disabled={archiveLogPage === 1}
                      >
                        Previous
                      </button>
                      <span className="text-sm font-medium">Page {archiveLogPage} of {totalArchivePages}</span>
                      <button
                        className="px-3 py-1 rounded bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 disabled:opacity-50"
                        onClick={() => setArchiveLogPage(p => Math.min(totalArchivePages, p + 1))}
                        disabled={archiveLogPage === totalArchivePages}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
      </div>
      <AddGoalModal open={showAddGoal} onClose={() => setShowAddGoal(false)} onSubmit={handleAddGoal} goal={activeGoal} viewOnlyDefault={modalViewOnly} />
      {/* CSS for glassmorphism and floating labels */}
      <style jsx>{`
        .input-glass {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 1rem;
          border: 1px solid #e5e7eb;
          background: rgba(255,255,255,0.7);
          box-shadow: 0 2px 8px 0 rgba(0,0,0,0.03);
          font-size: 1rem;
          outline: none;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .input-glass:focus {
          border: 1.5px solid #22c55e;
          box-shadow: 0 4px 16px 0 rgba(34,197,94,0.08);
        }
        .floating-label {
          position: absolute;
          left: 1rem;
          top: 1.1rem;
          font-size: 1rem;
          color: #94a3b8;
          pointer-events: none;
          transition: all 0.2s;
          background: transparent;
        }
        .peer:focus ~ .floating-label,
        .peer:not(:placeholder-shown):not(:focus):not([value=""]) ~ .floating-label {
          top: -0.7rem;
          left: 0.75rem;
          font-size: 0.85rem;
          color: #22c55e;
          background: #fff;
          padding: 0 0.25rem;
        }
      `}</style>
      <style jsx>{`
        .animate-fadein {
          animation: fadein 0.3s cubic-bezier(.4,0,.2,1);
        }
        @keyframes fadein {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  );
}

// Add this component at the bottom of the file:
type UserInsightsCardProps = {
  logs: { date: string; weight: number }[];
  startWeight: number;
  currentWeight: number;
  targetWeight: number;
  startDate: string;
  currentDate: string;
  targetDate: string;
};
function UserInsightsCard({ logs, startWeight, currentWeight, targetWeight, startDate, currentDate, targetDate }: UserInsightsCardProps) {
  // Calculate weight change in last 30 days
  const today = new Date();
  const lastMonth = new Date();
  lastMonth.setDate(today.getDate() - 30);
  const logsSorted = [...logs].sort((a, b) => a.date.localeCompare(b.date));
  const monthAgoLog = logsSorted.find(l => new Date(l.date) >= lastMonth) || logsSorted[0];
  const monthAgoWeight = monthAgoLog ? monthAgoLog.weight : startWeight;
  const weightChange = currentWeight - monthAgoWeight;
  const toGoal = currentWeight - targetWeight;
  let message = '';
  let color = '';
  if (weightChange < 0) {
    message = `🎉 Awesome! You've lost ${Math.abs(weightChange).toFixed(1)} kg in the last 30 days.`;
    color = 'text-green-700';
  } else if (weightChange > 0) {
    message = `😅 Oops! You've gained ${weightChange.toFixed(1)} kg in the last 30 days. Don't give up!`;
    color = 'text-red-600';
  } else {
    message = `😐 No change in your weight in the last 30 days. Stay consistent!`;
    color = 'text-yellow-600';
  }
  let goalMsg = '';
  if (toGoal > 0) {
    goalMsg = `You are only ${toGoal.toFixed(1)} kg away from your goal! Keep going! 🚀`;
  } else if (toGoal < 0) {
    goalMsg = `You've surpassed your goal by ${Math.abs(toGoal).toFixed(1)} kg! Amazing! 🏆`;
  } else {
    goalMsg = `You've reached your goal weight! Congratulations! 🥳`;
  }
  return (
    <div className="w-full max-w-2xl mx-auto mb-6 p-5 rounded-xl bg-gradient-to-r from-green-50 to-yellow-50 border border-yellow-100 shadow flex flex-col gap-2 text-center">
      <div className={`text-lg font-bold ${color}`}>{message}</div>
      <div className="text-base font-medium text-blue-700">{goalMsg}</div>
    </div>
  );
} 