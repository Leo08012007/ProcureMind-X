'use client';

import React, { useState, useEffect } from 'react';
import { Sliders, AlertTriangle, Activity, AlertCircle, DollarSign, Calendar, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function DigitalTwin() {
  const [scenario, setScenario] = useState<'delay' | 'price_spike' | 'bankruptcy' | 'demand_spike'>('delay');
  const [delayDays, setDelayDays] = useState(5);
  const [priceSpike, setPriceSpike] = useState(15);
  const [demandSpike, setDemandSpike] = useState(25);
  
  const [chartData, setChartData] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({
    procurement_cost_impact: 0.0,
    stockout_risk: 'Low',
    delivery_impact: 'Normal',
    recommended_action: 'Maintain baseline schedule.'
  });
  const [skuFilter, setSkuFilter] = useState('SKU-ACC-001');

  const runSimulation = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/twin/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario,
          delay_days: delayDays,
          price_spike_pct: priceSpike,
          demand_spike_pct: demandSpike
        })
      });
      const data = await res.json();
      
      const baseMap = new Map();
      data.base_case.forEach((c: any) => {
        if (c.sku === skuFilter) {
          baseMap.set(c.day, c.stock);
        }
      });

      const formatted = data.simulated_case
        .filter((c: any) => c.sku === skuFilter)
        .map((c: any) => ({
          day: `Day ${c.day}`,
          BaseStock: baseMap.get(c.day) || 0,
          SimulatedStock: c.stock
        }));

      setChartData(formatted);
      setAlerts(data.risk_alerts);
      setMetrics(data.metrics);
    } catch (err) {
      console.error('Error running Digital Twin simulation:', err);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [scenario, delayDays, priceSpike, demandSpike, skuFilter]);

  return (
    <div className="glass-panel p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Simulation Controls */}
      <div className="xl:col-span-1 space-y-5">
        <div className="flex items-center gap-2">
          <Sliders className="text-indigo-400 w-5 h-5" />
          <h3 className="text-lg font-bold font-outfit text-white">Digital Twin Simulator</h3>
        </div>
        <p className="text-xs text-slate-400">
          Model supply chain disruptions, commodity hikes, bankruptcies, and demand surges to evaluate safety stock limits.
        </p>

        {/* Scenario Select */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-semibold">Select Scenario</label>
          <select 
            value={scenario} 
            onChange={(e) => setScenario(e.target.value as any)} 
            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="delay">Scenario 1: Supplier Delay</option>
            <option value="price_spike">Scenario 2: Material Price Increase</option>
            <option value="bankruptcy">Scenario 3: Supplier Bankruptcy</option>
            <option value="demand_spike">Scenario 4: Demand Spike</option>
          </select>
        </div>

        {/* Item filter */}
        <div>
          <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1.5 font-semibold">Audit Component SKU</label>
          <select 
            value={skuFilter} 
            onChange={(e) => setSkuFilter(e.target.value)} 
            className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
          >
            <option value="SKU-ACC-001">Microprocessors (SKU-ACC-001)</option>
            <option value="SKU-ZEN-009">Capacitors (SKU-ZEN-009)</option>
            <option value="SKU-GLO-102">Sensors (SKU-GLO-102)</option>
          </select>
        </div>

        {/* Dynamic Slider based on selected scenario */}
        <div className="pt-2 border-t border-slate-900 space-y-3">
          {scenario === 'delay' && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Delay Period</span>
                <span className="text-indigo-400 font-semibold">{delayDays} Days</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="25" 
                value={delayDays} 
                onChange={(e) => setDelayDays(Number(e.target.value))} 
                className="w-full accent-indigo-500" 
              />
            </div>
          )}

          {scenario === 'price_spike' && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Material Cost Spike</span>
                <span className="text-indigo-400 font-semibold">+{priceSpike}%</span>
              </div>
              <input 
                type="range" 
                min="5" 
                max="50" 
                value={priceSpike} 
                onChange={(e) => setPriceSpike(Number(e.target.value))} 
                className="w-full accent-indigo-500" 
              />
            </div>
          )}

          {scenario === 'demand_spike' && (
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Sales Demand Surge</span>
                <span className="text-indigo-400 font-semibold">+{demandSpike}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="100" 
                value={demandSpike} 
                onChange={(e) => setDemandSpike(Number(e.target.value))} 
                className="w-full accent-indigo-500" 
              />
            </div>
          )}

          {scenario === 'bankruptcy' && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span className="text-[10px] text-rose-400 leading-normal">
                Supplier Bankruptcy initiates a complete re-routing procedure. Lead times are automatically modeled with a 21-day vendor-switching latency penalty.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Simulator Graph & Metrics Panel */}
      <div className="xl:col-span-2 flex flex-col h-[320px] xl:h-auto justify-between space-y-4">
        {/* Recharts graph */}
        <div className="flex-1 min-h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: 9 }} />
              <YAxis stroke="#64748b" style={{ fontSize: 9 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }}
                labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
              />
              <Legend verticalAlign="top" height={28} iconType="circle" style={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="BaseStock" stroke="#10b981" strokeWidth={2} name="Base Case" dot={false} />
              <Line type="monotone" dataKey="SimulatedStock" stroke="#ef4444" strokeWidth={2} name="Simulated Case" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Dynamic Simulation KPI widgets */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-black/30 p-2 rounded border border-slate-900 flex flex-col justify-between">
            <span className="text-[9px] uppercase text-slate-500 block font-semibold">TCO cost impact</span>
            <span className={`text-sm font-bold block ${metrics.procurement_cost_impact > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {metrics.procurement_cost_impact > 0 ? `+$${metrics.procurement_cost_impact.toLocaleString()}` : '$0.00'}
            </span>
          </div>
          <div className="bg-black/30 p-2 rounded border border-slate-900 flex flex-col justify-between">
            <span className="text-[9px] uppercase text-slate-500 block font-semibold">Stockout Risk</span>
            <span className={`text-sm font-bold block ${metrics.stockout_risk === 'Critical' ? 'text-rose-400 glow-text-rose' : 'text-emerald-400'}`}>
              {metrics.stockout_risk}
            </span>
          </div>
          <div className="bg-black/30 p-2 rounded border border-slate-900 flex flex-col justify-between">
            <span className="text-[9px] uppercase text-slate-500 block font-semibold">logistics Latency</span>
            <span className="text-xs font-bold text-white block truncate">
              {metrics.delivery_impact}
            </span>
          </div>
        </div>

        {/* Dynamic Action Alerts */}
        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/25 rounded flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="text-[9px] text-slate-500 uppercase block font-bold">Recommended Mitigation Action</span>
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{metrics.recommended_action}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
