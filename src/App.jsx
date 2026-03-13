import React, { useMemo, useState } from 'react';
import { Calculator, TrendingUp, Sparkles, Wallet } from 'lucide-react';

const formatKzt = (val) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', maximumFractionDigits: 0 }).format(val || 0);
const formatKzt2 = (val) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'KZT', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val || 0);
const formatNum = (val, digits = 2) => new Intl.NumberFormat('ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(val || 0);

const Card = ({ children, className = "" }) => <div className={`bg-white rounded-3xl shadow-sm ring-1 ring-slate-200 ${className}`}>{children}</div>;
const InputField = ({ label, value, onChange }) => (
  <div className="space-y-1">
    <label className="text-xs font-medium text-slate-500 ml-1">{label}</label>
    <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full px-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"/>
  </div>
);

const initialProcedures = [
  { id: 1, name: 'Плазменное омоложение лица', price: 120000, impulses: 300, materials: 2000, countPerMonth: 8 },
  { id: 2, name: 'Плазменное омоложение шеи', price: 98000, impulses: 300, materials: 2000, countPerMonth: 8 },
  { id: 3, name: 'Лифтинг области век', price: 98000, impulses: 200, materials: 2000, countPerMonth: 8 },
  { id: 4, name: 'Лечение акне', price: 39000, impulses: 100, materials: 2000, countPerMonth: 8 },
  { id: 5, name: 'Лечение розацеа', price: 39000, impulses: 100, materials: 2000, countPerMonth: 8 },
];

export default function App() {
  const [equipmentCost, setEquipmentCost] = useState(29200000);
  const [tipCost, setTipCost] = useState(89000);
  const [tipResource, setTipResource] = useState(2500);
  const [nitrogenCost, setNitrogenCost] = useState(70000);
  const [nitrogenMonths, setNitrogenMonths] = useState(12);
  const [nitrogenImpulsesPerMonth, setNitrogenImpulsesPerMonth] = useState(10000);
  const [handleCost, setHandleCost] = useState(2100000);
  const [handleResource, setHandleResource] = useState(250000);
  const [salaryPercent, setSalaryPercent] = useState(30);
  const [procedures, setProcedures] = useState(initialProcedures);

  const metrics = useMemo(() => {
    const tipImpulseCost = tipCost / (tipResource || 1);
    const nitrogenImpulseCost = nitrogenCost / ((nitrogenMonths || 1) * (nitrogenImpulsesPerMonth || 1));
    const handleImpulseCost = handleCost / (handleResource || 1);
    const impulseCost = tipImpulseCost + nitrogenImpulseCost + handleImpulseCost;

    const enriched = procedures.map((p) => {
      const totalExpenses = (p.impulses * impulseCost) + p.materials;
      const profitPerProc = p.price - totalExpenses;
      return { ...p, totalExpenses, profitPerProc, monthlyRevenue: p.price * p.countPerMonth, monthlyProfit: profitPerProc * p.countPerMonth };
    });

    const totalRevenue = enriched.reduce((sum, p) => sum + p.monthlyRevenue, 0);
    const netProfit = enriched.reduce((sum, p) => sum + p.monthlyProfit, 0) - (totalRevenue * (salaryPercent / 100));
    return { impulseCost, enriched, netProfit, payback: netProfit > 0 ? equipmentCost / netProfit : 0 };
  }, [equipmentCost, tipCost, tipResource, nitrogenCost, nitrogenMonths, nitrogenImpulsesPerMonth, handleCost, handleResource, salaryPercent, procedures]);

  return (
    <div className="min-h-screen p-6 max-w-6xl mx-auto space-y-8">
      <Card className="p-8 border-l-8 border-l-blue-600 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold">NEOGEN Payback</h1>
          <p className="text-slate-500">Расчет окупаемости и прибыльности системы</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 text-white p-4 rounded-2xl min-w-[160px]">
            <p className="text-xs text-slate-400">Окупаемость</p>
            <p className="text-2xl font-bold">{formatNum(metrics.payback, 1)} мес.</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 space-y-4">
          <h2 className="font-bold flex items-center gap-2"><Calculator size={18}/> Основные расходы</h2>
          <InputField label="Цена аппарата, ₸" value={equipmentCost} onChange={setEquipmentCost}/>
          <InputField label="Зарплата персонала, %" value={salaryPercent} onChange={setSalaryPercent}/>
          <div className="pt-4 grid grid-cols-2 gap-4">
            <InputField label="Цена насадки" value={tipCost} onChange={setTipCost}/>
            <InputField label="Ресурс насадки" value={tipResource} onChange={setTipResource}/>
          </div>
        </Card>

        <Card className="p-6 bg-blue-600 text-white flex flex-col justify-center items-center text-center">
          <p className="text-blue-100 uppercase tracking-widest text-xs font-bold mb-2">Чистая прибыль в месяц</p>
          <p className="text-5xl font-black">{formatKzt(metrics.netProfit)}</p>
          <div className="mt-6 p-3 bg-white/10 rounded-xl w-full">
            <p className="text-xs">Себестоимость 1 импульса: <strong>{formatKzt2(metrics.impulseCost)}</strong></p>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
            <tr>
              <th className="p-4">Процедура</th>
              <th className="p-4">Цена</th>
              <th className="p-4 text-emerald-600">Прибыль/мес</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {metrics.enriched.map((p) => (
              <tr key={p.id}>
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">{formatKzt(p.price)}</td>
                <td className="p-4 font-bold text-emerald-600">{formatKzt(p.monthlyProfit)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
