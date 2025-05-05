import React, { useState } from 'react';

const bmiZones = [
  { label: 'Underweight', min: 0, max: 18.5, color: '#60a5fa' },
  { label: 'Normal', min: 18.5, max: 25, color: '#22c55e' },
  { label: 'Overweight', min: 25, max: 30, color: '#facc15' },
  { label: 'Obese', min: 30, max: 100, color: '#ef4444' },
];

function calcBMI(weight: number, height: number) {
  if (!weight || !height) return 0;
  const h = height / 100;
  return +(weight / (h * h)).toFixed(1);
}

function getBMICategory(bmi: number) {
  return bmiZones.find(z => bmi >= z.min && bmi < z.max) || bmiZones[0];
}

function getHealthyWeightRange(height: number) {
  // Normal BMI: 18.5 - 25
  const h = height / 100;
  const min = +(18.5 * h * h).toFixed(1);
  const max = +(25 * h * h).toFixed(1);
  return [min, max];
}

export default function InsightsSimulator() {
  const [age, setAge] = useState(30);
  const [weight, setWeight] = useState(70);
  const [weightUnit, setWeightUnit] = useState<'kg'|'lbs'>('kg');
  const [height, setHeight] = useState(170);
  const [heightUnit, setHeightUnit] = useState<'cm'|'ftin'>('cm');
  const [heightFt, setHeightFt] = useState(5);
  const [heightIn, setHeightIn] = useState(7);

  // Convert units if needed
  const displayWeight = weightUnit === 'kg' ? weight : +(weight / 2.20462).toFixed(1);
  const displayHeight = heightUnit === 'cm' ? height : +(heightFt * 30.48 + heightIn * 2.54).toFixed(1);
  const bmi = calcBMI(displayWeight, displayHeight);
  const bmiCat = getBMICategory(bmi);
  const [healthyMin, healthyMax] = getHealthyWeightRange(displayHeight);

  return (
    <div className="w-full max-w-3xl mx-auto bg-white/90 rounded-2xl shadow-xl p-6 flex flex-col gap-8 border border-gray-100 mt-2">
      <h2 className="text-2xl font-bold mb-2 text-gray-800">BMI Simulator</h2>
      {/* Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Age</label>
          <input type="number" min={1} value={age} onChange={e => setAge(+e.target.value)} className="input-glass" />
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Weight</label>
          <div className="flex gap-2 items-center">
            <input type="number" min={1} value={weight} onChange={e => setWeight(+e.target.value)} className="input-glass" />
            <div className="flex gap-1">
              <button className={`px-2 py-1 rounded ${weightUnit==='kg'?'bg-blue-500 text-white':'bg-gray-100 text-gray-700'}`} onClick={() => setWeightUnit('kg')}>kg</button>
              <button className={`px-2 py-1 rounded ${weightUnit==='lbs'?'bg-blue-500 text-white':'bg-gray-100 text-gray-700'}`} onClick={() => setWeightUnit('lbs')}>lbs</button>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <label className="font-semibold text-gray-700">Height</label>
          <div className="flex gap-2 items-center">
            {heightUnit==='cm' ? (
              <input type="number" min={1} value={height} onChange={e => setHeight(+e.target.value)} className="input-glass" />
            ) : (
              <>
                <input type="number" min={1} value={heightFt} onChange={e => setHeightFt(+e.target.value)} className="input-glass w-16" placeholder="ft" />
                <input type="number" min={0} value={heightIn} onChange={e => setHeightIn(+e.target.value)} className="input-glass w-16" placeholder="in" />
              </>
            )}
            <div className="flex gap-1">
              <button className={`px-2 py-1 rounded ${heightUnit==='cm'?'bg-blue-500 text-white':'bg-gray-100 text-gray-700'}`} onClick={() => setHeightUnit('cm')}>cm</button>
              <button className={`px-2 py-1 rounded ${heightUnit==='ftin'?'bg-blue-500 text-white':'bg-gray-100 text-gray-700'}`} onClick={() => setHeightUnit('ftin')}>ft+in</button>
            </div>
          </div>
        </div>
      </div>
      {/* BMI Gauge */}
      <div className="flex flex-col md:flex-row gap-8 items-center justify-between mt-4">
        <div className="flex-1 flex flex-col items-center">
          <div className="text-5xl font-extrabold mb-2" style={{ color: bmiCat.color }}>{bmi > 0 ? bmi : '--'}</div>
          <div className="text-lg font-semibold mb-2" style={{ color: bmiCat.color }}>{bmiCat.label}</div>
          <div className="w-full max-w-xs">
            <svg viewBox="0 0 300 60" width="100%" height="60">
              {/* Zones */}
              {bmiZones.map((z, i) => (
                <rect key={i} x={i*75} y={20} width={75} height={20} fill={z.color} rx={6} />
              ))}
              {/* Pointer */}
              {bmi > 0 && (
                <polygon points={`${Math.min(299, Math.max(0, (bmi-10)*7.5))},40 ${Math.min(299, Math.max(0, (bmi-10)*7.5-7))},55 ${Math.min(299, Math.max(0, (bmi-10)*7.5+7))},55`} fill={bmiCat.color} />
              )}
              {/* Labels */}
              <text x="0" y="18" fontSize="12" fill="#60a5fa">Under</text>
              <text x="75" y="18" fontSize="12" fill="#22c55e">Normal</text>
              <text x="150" y="18" fontSize="12" fill="#facc15">Over</text>
              <text x="225" y="18" fontSize="12" fill="#ef4444">Obese</text>
            </svg>
          </div>
        </div>
        {/* BMI Table */}
        <div className="flex-1 flex flex-col items-center">
          <table className="w-full max-w-xs text-sm rounded-xl overflow-hidden border border-gray-200 shadow">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="p-2">BMI Range</th>
                <th className="p-2">Category</th>
              </tr>
            </thead>
            <tbody>
              {bmiZones.map((z, i) => (
                <tr key={i} className="text-center">
                  <td className="p-2">{z.min} - {z.max === 100 ? '∞' : z.max}</td>
                  <td className="p-2 font-semibold" style={{ color: z.color }}>{z.label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Healthy Weight Table */}
      <div className="mt-6">
        <div className="font-semibold mb-2 text-gray-700">Healthy Weight Range for Height {displayHeight} cm:</div>
        <table className="w-full max-w-xs text-sm rounded-xl overflow-hidden border border-gray-200 shadow">
          <thead>
            <tr className="bg-green-100 text-green-700">
              <th className="p-2">BMI</th>
              <th className="p-2">Weight (kg)</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center">
              <td className="p-2">18.5</td>
              <td className="p-2">{healthyMin}</td>
            </tr>
            <tr className="text-center">
              <td className="p-2">25</td>
              <td className="p-2">{healthyMax}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <style jsx>{`
        .input-glass {
          width: 100%;
          padding: 0.7rem 1rem;
          border-radius: 0.8rem;
          border: 1.2px solid #e5e7eb;
          background: rgba(255,255,255,0.95);
          box-shadow: 0 1px 4px 0 rgba(0,0,0,0.03);
          font-size: 1rem;
          outline: none;
          transition: border 0.2s, box-shadow 0.2s;
        }
        .input-glass:focus {
          border: 1.2px solid #2563eb;
          box-shadow: 0 2px 8px 0 rgba(34,197,94,0.08);
        }
      `}</style>
    </div>
  );
} 