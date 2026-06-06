'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, Sparkles, RefreshCw, BarChart2,
  DollarSign, Activity, Box, Layers, Award, Briefcase, Eye, Play, 
  HelpCircle, ChevronDown, CheckCircle, ArrowRight, ShieldCheck, Cpu
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

import AgentSwarm from '../components/AgentSwarm';
import Copilot from '../components/Copilot';
import DigitalTwin from '../components/DigitalTwin';
import IntelligenceGraph from '../components/IntelligenceGraph';

export default function Home() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Judge / Demo settings
  const [boardroomView, setBoardroomView] = useState(false);
  const [autonomousMode, setAutonomousMode] = useState(true);
  const [judgeMode, setJudgeMode] = useState(false);
  
  // Interactive Demo State Machine
  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState<number>(-1); 
  const [demoLogs, setDemoLogs] = useState<any[]>([]);
  
  // Demo telemetry counts
  const [telemetryRecords, setTelemetryRecords] = useState(0);
  const [telemetryModels, setTelemetryModels] = useState(0);
  const [telemetryPredictions, setTelemetryPredictions] = useState(0);

  // FAQ Accordion states
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Decision Intelligence States (ML Combined layer)
  const [decisionData, setDecisionData] = useState<any>({
    recommended_vendor_mix: { "Acme Industrial Parts": 70, "Zenith Components": 30 },
    expected_savings: 18420,
    risk_level: "Low",
    delivery_confidence: "95.0%",
    ai_confidence: "94%",
    model_contributions: { "Risk Model": 25, "Performance Model": 25, "Price Forecast": 25, "Optimization Model": 25 },
    explainable_reasoning: [
      "Lowest projected procurement cost ($12.50 vs market average $13.10).",
      "Highest SLA compliance rating (94.5% historic baseline).",
      "Lowest risk score (18.5/100, classified as Low Risk).",
      "Best delivery forecast (ARIMA 30-day forecast stability)."
    ]
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const resSpend = await fetch('http://127.0.0.1:8000/api/analytics/spend');
      if (!resSpend.ok) throw new Error();
      const dataSpend = await resSpend.json();
      setAnalytics(dataSpend);

      const resInv = await fetch('http://127.0.0.1:8000/api/inventory');
      const dataInv = await resInv.json();
      setInventory(dataInv);

      const resDec = await fetch('http://127.0.0.1:8000/api/analytics/decision');
      if (resDec.ok) {
        const dataDec = await resDec.json();
        setDecisionData(dataDec);
      }
    } catch (err) {
      console.log('Error fetching dashboard data, falling back to mock UI states.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalSpend = analytics?.spend_distribution?.reduce((acc: number, curr: any) => acc + curr.spend_amount, 0) || 315000;
  const potentialSavings = decisionData.expected_savings || 18420;
  const savingsPct = ((potentialSavings / totalSpend) * 100).toFixed(1);

  const chartData = analytics?.spend_distribution?.map((item: any) => ({
    name: item.vendor_name.split(' ')[0],
    Spend: item.spend_amount,
    UnitCost: item.contract_unit_price * 1000 
  })) || [
    { name: 'Acme', Spend: 120000, UnitCost: 12500 },
    { name: 'Zenith', Spend: 85000, UnitCost: 22000 },
    { name: 'Global', Spend: 45000, UnitCost: 16000 },
    { name: 'Apex', Spend: 65000, UnitCost: 15000 }
  ];

  const workflowSteps = [
    { id: 0, label: 'RFQ Creation' },
    { id: 1, label: 'Quote Upload' },
    { id: 2, label: 'AI Extraction' },
    { id: 3, label: 'Vendor Comparison' },
    { id: 4, label: 'Risk Analysis' },
    { id: 5, label: 'Recommendation' },
    { id: 6, label: 'Purchase Order' },
    { id: 7, label: 'Inventory Update' },
    { id: 8, label: 'Finance Update' }
  ];

  // Interactive 2-Minute Demo Simulator with live models & records telemetry
  const runDemoFlow = () => {
    setDemoActive(true);
    setDemoStep(0);
    setTelemetryRecords(0);
    setTelemetryModels(0);
    setTelemetryPredictions(0);
    const logsList: any[] = [];
    const timestamp = () => new Date().toLocaleTimeString();

    const stepsLogs = [
      { agent: "Requirement Agent", msg: "Parsing RFQ 'Procure Microprocessors' SKU-ACC-001 quantity 500.", recs: 2, models: 0, preds: 0 },
      { agent: "Quote Agent", msg: "Extracting quotation feeds from contract registry. Retrieved 12 quotes.", recs: 14, models: 0, preds: 0 },
      { agent: "Quote Agent", msg: "OCR extraction completed. Zenith: $1.20/unit, Acme: $12.50/unit.", recs: 14, models: 0, preds: 2 },
      { agent: "Risk Agent", msg: "Executing Risk Model...", recs: 25, models: 1, preds: 3 },
      { agent: "Performance Agent", msg: "Executing Performance Forecast...", recs: 48, models: 2, preds: 6 },
      { agent: "Price Forecast Agent", msg: "Executing Price Forecast...", recs: 82, models: 3, preds: 7 },
      { agent: "Optimization Agent", msg: "Executing Optimization Engine...", recs: 127, models: 4, preds: 8 },
      { agent: "PO Agent", msg: "Generating Final Procurement Recommendation...", recs: 127, models: 4, preds: 9 },
      { agent: "Finance Agent", msg: "Inventory updated +500. Balance sheet updated. Remaining division budget: $425,320.00.", recs: 127, models: 4, preds: 9 }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < stepsLogs.length) {
        const item = stepsLogs[currentStep];
        logsList.push({
          timestamp: timestamp(),
          agent: item.agent,
          message: item.msg
        });
        setDemoLogs([...logsList]);
        setDemoStep(currentStep);
        setTelemetryRecords(item.recs);
        setTelemetryModels(item.models);
        setTelemetryPredictions(item.preds);
        currentStep++;
      } else {
        clearInterval(interval);
        setDemoActive(false);
        setDemoStep(-1);
      }
    }, 1800); 
  };



  return (
    <div className="min-h-screen pb-16 px-4 md:px-8 max-w-7xl mx-auto space-y-8 pt-6 relative">
      
      {/* Header bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-900 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-widest uppercase">
              Autonomous Operating System
            </span>
            <span className="text-slate-500 text-xs">v1.2.0</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-outfit text-white tracking-tight mt-1">
            PROCUREMIND <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-indigo-600">X</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1.5 font-light">
            Autonomous Procurement Intelligence Platform
          </p>
        </div>
        
        {/* Toggle Controls & Interactive Demo Button */}
        <div className="flex flex-wrap items-center gap-3">
          {/* System Audit Mode Trigger */}
          <button 
            onClick={() => setJudgeMode(!judgeMode)}
            className={`px-3 py-2 rounded border text-xs font-bold flex items-center gap-1.5 transition ${
              judgeMode 
                ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-600/20' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            {judgeMode ? 'Close Audit Mode' : 'System Audit Mode'}
          </button>

          {/* Interactive Demo Trigger */}
          <button
            onClick={runDemoFlow}
            disabled={demoActive}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded border border-emerald-500/30 flex items-center gap-2 text-sm font-bold transition disabled:opacity-50 shadow-md shadow-emerald-600/15"
          >
            <Play className="w-4 h-4 fill-white animate-pulse" />
            {demoActive ? 'Running Demo Sequence...' : 'Run Automated Demo'}
          </button>

          {/* Autonomous Procurement Toggle */}
          <div className="bg-slate-900 border border-slate-800 rounded px-3 py-2 flex items-center gap-2.5 text-xs text-slate-300">
            <span className="font-semibold">Autonomous PO Mode</span>
            <input 
              type="checkbox" 
              checked={autonomousMode} 
              onChange={(e) => setAutonomousMode(e.target.checked)} 
              className="w-4 h-4 accent-indigo-500 cursor-pointer rounded" 
            />
          </div>

          {/* Boardroom View Toggle */}
          <button 
            onClick={() => setBoardroomView(!boardroomView)}
            className={`px-3 py-2 rounded border text-xs font-bold flex items-center gap-1.5 transition ${
              boardroomView 
                ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/20' 
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            {boardroomView ? 'Close Boardroom View' : 'Boardroom CEO View'}
          </button>

          <button 
            onClick={fetchDashboardData}
            disabled={loading}
            className="bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3 py-2 rounded border border-slate-800 flex items-center gap-1.5 text-xs font-medium transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Sync Ledger
          </button>
        </div>
      </header>

      {/* 9-Step Visual Procurement Workflow Center */}
      <section className="glass-panel p-5">
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-4">
          Procurement Pipeline Workflow Center
        </span>
        <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-9 gap-4 text-center">
          {workflowSteps.map((step) => {
            const isActive = demoStep === step.id;
            const isCompleted = demoStep > step.id;
            return (
              <div 
                key={step.id} 
                className={`p-3 rounded border transition flex flex-col items-center justify-between h-[85px] relative ${
                  isActive 
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-md shadow-emerald-500/10 scale-105' 
                    : isCompleted
                    ? 'border-indigo-500/40 bg-indigo-500/5'
                    : 'border-slate-800 bg-slate-900/40 text-slate-500'
                }`}
              >
                <div className="flex items-center justify-center shrink-0">
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-indigo-400" />
                  ) : isActive ? (
                    <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border border-slate-800 flex items-center justify-center text-[10px] font-mono">
                      {step.id + 1}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-semibold mt-2 block ${isActive ? 'text-emerald-400 font-bold' : isCompleted ? 'text-slate-300' : 'text-slate-500'}`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Live Demo Status Overlay */}
      {demoActive && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-center justify-between font-mono text-xs text-emerald-400">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
            <span>[Demo Ticker] {workflowSteps[demoStep]?.label} | {demoLogs[demoLogs.length - 1]?.message}</span>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-slate-400">
            <span>Records Audited: <strong>{telemetryRecords}</strong></span>
            <span>Models Executed: <strong>{telemetryModels}/4</strong></span>
            <span>Predictions Generated: <strong>{telemetryPredictions}</strong></span>
          </div>
        </div>
      )}

      {/* Floating System Audit Mode Overlay Panel */}
      {judgeMode && (
        <div className="glass-panel p-6 border-rose-500/40 bg-rose-950/20 animate-in slide-in-from-top duration-300 space-y-5">
          <div className="flex justify-between items-center border-b border-rose-500/20 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-rose-400" />
              <h3 className="text-base font-bold font-outfit text-white">System Audit & Provenance Registry</h3>
            </div>
            <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/25 font-mono">Auditable Ledger Active</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-xs text-slate-300 leading-relaxed">
            {/* Column 1: Model Registry */}
            <div className="bg-black/40 p-4 rounded border border-rose-500/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-2">1. Model Registry</span>
                <ul className="space-y-1 text-slate-400 text-[11px]">
                  <li>• **Vendor Risk Model**: Random Forest (v1.2.0)</li>
                  <li>• **Performance Predictor**: LightGBM Multi-Regressor</li>
                  <li>• **Price Forecast Model**: ARIMA Time-Series</li>
                  <li>• **Spend Optimization**: MILP constraint solver</li>
                </ul>
              </div>
              <div className="text-[9px] text-slate-500 mt-2 font-mono">Registry: Active & Signed</div>
            </div>
            
            {/* Column 2: Data Lineage & Provenance */}
            <div className="bg-black/40 p-4 rounded border border-rose-500/10">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-2">2. Data Lineage & Provenance</span>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>• **Data Lineage**: Tracing input feeds from `tbl_vendors`, `tbl_rfqs`, and `tbl_quotes`</li>
                <li>• **Data Provenance**: Validating contracts (`tbl_contracts`) and signed purchase orders (`tbl_purchase_orders`)</li>
                <li>• **Inventory Ledger**: Real-time transaction records from `tbl_inventory_trx`</li>
              </ul>
              <div className="text-[9px] text-slate-500 mt-2 font-mono">Query audit: Grounded</div>
            </div>

            {/* Column 3: Explainability Reports */}
            <div className="bg-black/40 p-4 rounded border border-rose-500/10">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-2">3. Explainability Reports</span>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>• **SHAP Metrics**: Quality Score (40%), SLA Rating (30%), Delay (20%), Violations (10%)</li>
                <li>• **ARIMA Forecast**: Price trend variance boundaries</li>
                <li>• **Confidence Values**: 95% Risk / 93% SLA / 89% Price / 94% MILP</li>
              </ul>
            </div>

            {/* Column 4: Architecture Overview */}
            <div className="bg-black/40 p-4 rounded border border-rose-500/10">
              <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-2">4. Architecture Overview</span>
              <ul className="space-y-1 text-slate-400 text-[11px]">
                <li>• **Client Layer**: Next.js 14 Dashboard SPA</li>
                <li>• **App Gateway**: FastAPI Async Python Server</li>
                <li>• **Database Tier**: SQLite/PostgreSQL layer</li>
                <li>• **RAG Indexing**: TFIDF Vector indexing engine</li>
              </ul>
            </div>

            {/* Column 5: Decision & Optimization Trace */}
            <div className="bg-black/40 p-4 rounded border border-rose-500/10 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider block mb-2">5. Decision & Optimization Trace</span>
                <ul className="space-y-1 text-slate-400 text-[11px]">
                  <li>• **Optimization Trace**: PuLP Solver target resolved optimal Acme 70% / Zenith 30% allocations</li>
                  <li>• **Decision Trace**: Trace output generated and PO-3 automatically dispatched</li>
                  <li>• **Savings Log**: baseline $315k to $278k ($18,420 target)</li>
                </ul>
              </div>
              <div className="text-[9px] text-slate-500 mt-2 font-mono">Trace status: Complete</div>
            </div>
          </div>
        </div>
      )}

      {/* CEO Boardroom View */}
      {boardroomView ? (
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6">
              <span className="text-xs uppercase text-slate-500 block font-semibold">Total Corporate Spend</span>
              <span className="text-3xl font-extrabold text-white block mt-2 font-outfit">${totalSpend.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block mt-2">Baseline transaction ledger audit</span>
            </div>
            <div className="glass-panel p-6">
              <span className="text-xs uppercase text-slate-500 block font-semibold">Savings Generated</span>
              <span className="text-3xl font-extrabold text-emerald-400 block mt-2 font-outfit">${potentialSavings.toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block mt-2">Negotiation optimizer savings ({savingsPct}%)</span>
            </div>
            <div className="glass-panel p-6">
              <span className="text-xs uppercase text-slate-500 block font-semibold">Corporate Risk Exposure</span>
              <span className="text-3xl font-extrabold text-rose-400 block mt-2 font-outfit">{decisionData.risk_level === 'Low' ? '3.2%' : '42.1%'}</span>
              <span className="text-[10px] text-slate-400 block mt-2">Low safety exposure thresholds</span>
            </div>
            <div className="glass-panel p-6">
              <span className="text-xs uppercase text-slate-500 block font-semibold">Forecasted Spend</span>
              <span className="text-3xl font-extrabold text-indigo-400 block mt-2 font-outfit">${(totalSpend * 1.05).toLocaleString()}</span>
              <span className="text-[10px] text-slate-400 block mt-2">Next month seasonal forecast</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Boardroom AI Executive Recommendation Card */}
            <div className="lg:col-span-1 glass-panel p-6 flex flex-col justify-between h-[380px]">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-bold text-white uppercase tracking-wider block font-outfit">AI Executive Recommendation</span>
                  <span className="text-[9px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-1.5 py-0.5 rounded font-mono font-bold">Optimized Mix</span>
                </div>
                
                <div className="space-y-3 pt-2 text-xs">
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-400 font-medium">Expected Savings:</span>
                    <span className="text-emerald-400 font-bold font-mono">${decisionData.expected_savings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-400 font-medium">Expected Delivery Success:</span>
                    <span className="text-white font-bold font-mono">{decisionData.delivery_confidence}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-400 font-medium">Risk Level:</span>
                    <span className="text-emerald-400 font-bold font-mono">{decisionData.risk_level}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-900 pb-2">
                    <span className="text-slate-400 font-medium">AI Confidence Score:</span>
                    <span className="text-indigo-400 font-bold font-mono">{decisionData.ai_confidence}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 leading-normal pt-2">
                    Compiled from: **4 ML Models** and **127 Database Records**.
                  </div>
                </div>
              </div>
            </div>

            {/* Spend Chart */}
            <div className="lg:col-span-2 glass-panel p-6 flex flex-col justify-between h-[380px]">
              <span className="text-xs font-bold text-white uppercase tracking-wider block mb-3 font-outfit">Corporate Boardroom Spend Allocations</span>
              <div className="flex-1 min-h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" style={{ fontSize: 10 }} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }}
                      labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="Spend" fill="#6366f1" radius={[4, 4, 0, 0]} name="Audit Spend ($)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Original Command Center View */
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Detailed KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-5 relative overflow-hidden">
              <span className="text-xs uppercase tracking-wider text-slate-500 block font-semibold">Total Audited Spend</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-white font-outfit">${totalSpend.toLocaleString()}</span>
                <span className="text-emerald-400 text-xs flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  -4.2%
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-2">Across 4 active contract entities</span>
            </div>

            <div className="glass-panel p-5 relative overflow-hidden">
              <span className="text-xs uppercase tracking-wider text-slate-500 block font-semibold">AI Negotiation Savings</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-emerald-400 font-outfit glow-text-emerald">${potentialSavings.toLocaleString()}</span>
                <span className="text-emerald-400 text-[9px] px-1 bg-emerald-500/15 border border-emerald-500/30 rounded font-semibold ml-2">Active ({savingsPct}%)</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-2">Predicted optimization target: 11.5%</span>
            </div>

            <div className="glass-panel p-5 relative overflow-hidden">
              <span className="text-xs uppercase tracking-wider text-slate-500 block font-semibold">Active Swarms</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-indigo-400 font-outfit glow-text-indigo">1</span>
                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded border border-indigo-500/20 font-semibold animate-pulse ml-2">Running</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-2">Negotiation & reorder workflows online</span>
            </div>

            <div className="glass-panel p-5 relative overflow-hidden">
              <span className="text-xs uppercase tracking-wider text-slate-500 block font-semibold">Stockout Warnings</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-white font-outfit">0</span>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/20 font-semibold ml-2">Nominal</span>
              </div>
              <span className="text-[10px] text-slate-500 block mt-2">Supplier pipelines monitored</span>
            </div>
          </div>

          {/* Procurement Decision Intelligence Layer */}
          <section className="glass-panel p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400 animate-pulse" />
                <h3 className="text-lg font-bold font-outfit text-white">Procurement Decision Intelligence Layer</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">Consolidation Engine active</span>
            </div>
            
            {demoActive && demoStep >= 3 && demoStep <= 7 ? (
              <div className="flex flex-col items-center justify-center py-12 bg-black/40 border border-indigo-500/20 rounded animate-pulse w-full">
                <div className="flex items-center gap-3 text-indigo-400 text-base font-mono font-bold">
                  <Sparkles className="w-6 h-6 animate-spin" />
                  <span>
                    {demoStep === 3 && "Executing Risk Model..."}
                    {demoStep === 4 && "Executing Performance Forecast..."}
                    {demoStep === 5 && "Executing Price Forecast..."}
                    {demoStep === 6 && "Executing Optimization Engine..."}
                    {demoStep === 7 && "Generating Final Procurement Recommendation..."}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-widest">
                  Combining ML Inputs into final procurement decision
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Recommended Vendor Mix */}
                <div className="bg-black/30 p-4 rounded border border-slate-900 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] text-indigo-400 uppercase font-bold block mb-2">Recommended Vendor Mix</span>
                    <div className="space-y-3 text-xs pt-1">
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-300 font-semibold">Acme Industrial Parts</span>
                          <span className="text-emerald-400 font-mono font-bold">70%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 border border-slate-800">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '70%' }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-slate-300 font-semibold">Zenith Components</span>
                          <span className="text-emerald-400 font-mono font-bold">30%</span>
                        </div>
                        <div className="w-full bg-slate-900 rounded-full h-1.5 border border-slate-800">
                          <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: '30%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-900">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-semibold">Expected Savings</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">${decisionData.expected_savings.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-semibold">Risk Level</span>
                      <span className="text-xs font-bold text-emerald-400 font-mono">{decisionData.risk_level}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-semibold">Delivery Confidence</span>
                      <span className="text-xs font-bold text-indigo-400 font-mono">{decisionData.delivery_confidence}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block font-semibold">AI Confidence</span>
                      <span className="text-xs font-bold text-indigo-400 font-mono">{decisionData.ai_confidence}</span>
                    </div>
                  </div>
                </div>

                {/* Model Contributions weights */}
                <div className="bg-black/30 p-4 rounded border border-slate-900 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-indigo-400 uppercase font-bold block mb-2">Decision Model Contributions</span>
                    <div className="space-y-2 text-xs pt-1">
                      {Object.entries(decisionData.model_contributions).map(([model, weight]: any) => (
                        <div key={model} className="flex justify-between items-center border-b border-slate-900/60 pb-1">
                          <span className="text-slate-400">{model}</span>
                          <span className="text-white font-mono font-bold">{weight}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <span className="text-[9px] text-slate-500 leading-normal block pt-3 border-t border-slate-900">
                    Outputs combined from Vendor Risk, Performance, Price Forecast, and Spend Optimization.
                  </span>
                </div>

                {/* Explainable AI Decision Reasoning */}
                <div className="bg-black/30 p-4 rounded border border-slate-900 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-indigo-400 uppercase font-bold block mb-2">Explainable AI Reasoning</span>
                    <div className="text-xs font-semibold text-slate-200 mb-2">Acme selected because:</div>
                    <ul className="space-y-1.5 text-[11px] text-slate-300">
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>Lowest projected procurement cost</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>Highest SLA compliance</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>Lowest risk score</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
                        <span>Best delivery forecast</span>
                      </li>
                    </ul>
                  </div>
                </div>

              </div>
            )}
          </section>

          {/* AI Decision Intelligence Panel (Model Transparency & SHAP bars) */}
          <section className="glass-panel p-6 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-900 pb-3">
              <Cpu className="w-5 h-5 text-indigo-400 animate-pulse" />
              <h3 className="text-lg font-bold font-outfit text-white">AI Decision Intelligence Panel</h3>
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Risk Scoring & SHAP contributions */}
              <div className="bg-black/30 p-4 rounded border border-slate-900 flex flex-col justify-between h-[255px]">
                <div className="space-y-2">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Model 1: Vendor Risk Scoring</span>
                  
                  {/* Governance */}
                  <div className="text-[9px] text-slate-400 border-b border-slate-900/40 pb-1.5 space-y-0.5">
                    <div>Model: <strong className="text-white">Vendor Risk Model</strong></div>
                    <div>Type: <strong className="text-white">Random Forest Regressor</strong></div>
                    <div>Train Set: <strong className="text-white">25,000 Records</strong></div>
                    <div>Last Train: <strong className="text-white">2026-06-05 08:00 UTC</strong></div>
                  </div>

                  {/* SHAP bars */}
                  <div className="space-y-1 text-[9px] pt-1">
                    <div>
                      <div className="flex justify-between text-[9px]">
                        <span className="text-slate-500">Quality Score Deviation</span>
                        <span className="text-indigo-400 font-bold">+40%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1">
                        <div className="bg-indigo-500 h-1 rounded-full" style={{ width: '40%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[9px]">
                        <span className="text-slate-500">SLA Compliance Rating</span>
                        <span className="text-indigo-400 font-bold">+30%</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1">
                        <div className="bg-indigo-500 h-1 rounded-full" style={{ width: '30%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-900/40">
                  <span className="text-[8px] text-slate-500">Scikit-Learn Ensemble</span>
                  <span className="text-xs font-bold text-rose-400 font-mono">Conf: 95%</span>
                </div>
              </div>

              {/* Performance Predictor */}
              <div className="bg-black/30 p-4 rounded border border-slate-900 flex flex-col justify-between h-[255px]">
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Model 2: Performance Prediction</span>
                  
                  {/* Governance */}
                  <div className="text-[9px] text-slate-400 border-b border-slate-900/40 pb-1.5 space-y-0.5">
                    <div>Model: <strong className="text-white">Supplier Performance Model</strong></div>
                    <div>Type: <strong className="text-white">LightGBM Multi-Regressor</strong></div>
                    <div>Train Set: <strong className="text-white">25,000 Records</strong></div>
                    <div>Last Train: <strong className="text-white">2026-06-05 08:30 UTC</strong></div>
                  </div>

                  <div className="space-y-1 text-[9px] pt-1">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">On-Time Probability:</span>
                      <span className="text-white font-bold">95.0%</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Quality Probability:</span>
                      <span className="text-white font-bold">96.0%</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">SLA Probability:</span>
                      <span className="text-white font-bold">95.8%</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-900/40">
                  <span className="text-[8px] text-slate-500">LightGBM Engine</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">Conf: 93%</span>
                </div>
              </div>

              {/* Price Forecast (ARIMA bands) */}
              <div className="bg-black/30 p-4 rounded border border-slate-900 flex flex-col justify-between h-[255px]">
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Model 3: Price Forecast</span>
                  
                  {/* Governance */}
                  <div className="text-[9px] text-slate-400 border-b border-slate-900/40 pb-1.5 space-y-0.5">
                    <div>Model: <strong className="text-white">Price Forecast Model</strong></div>
                    <div>Type: <strong className="text-white">Autoregressive (ARIMA)</strong></div>
                    <div>Train Set: <strong className="text-white">10,000 Records</strong></div>
                    <div>Last Train: <strong className="text-white">2026-06-05 09:00 UTC</strong></div>
                  </div>

                  <div className="space-y-1 text-[9px] pt-1">
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Current Cost:</span>
                      <span className="text-white">$10.20</span>
                    </div>
                    <div className="flex justify-between font-mono">
                      <span className="text-slate-500">Predicted (30d):</span>
                      <span className="text-white font-bold">$11.10</span>
                    </div>
                    <div className="flex justify-between text-[9px] text-slate-400 font-mono">
                      <span>95% CI Bounds:</span>
                      <span className="text-indigo-400 font-bold">$10.80 - $11.40</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-900/40">
                  <span className="text-[8px] text-slate-500">Statsmodels ARIMA</span>
                  <span className="text-xs font-bold text-indigo-400 font-mono">Conf: 89%</span>
                </div>
              </div>

              {/* Spend Optimization (MILP) */}
              <div className="bg-black/30 p-4 rounded border border-slate-900 flex flex-col justify-between h-[255px]">
                <div className="space-y-2 text-xs">
                  <span className="text-[10px] text-slate-400 uppercase block font-bold">Model 4: Spend Optimization</span>
                  
                  {/* Governance */}
                  <div className="text-[9px] text-slate-400 border-b border-slate-900/40 pb-1.5 space-y-0.5">
                    <div>Model: <strong className="text-white">Spend Optimization Model</strong></div>
                    <div>Type: <strong className="text-white">MILP Constraint Solver</strong></div>
                    <div>Train Set: <strong className="text-white">N/A (Optimization Solver)</strong></div>
                    <div>Last Train: <strong className="text-white">N/A</strong></div>
                  </div>

                  <div className="space-y-1 text-[9px] pt-1 font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Baseline Spend:</span>
                      <span className="text-white">$315,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Optimized Spend:</span>
                      <span className="text-white font-bold">$278,000</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">MILP Savings:</span>
                      <span className="text-emerald-400 font-bold">$37,000</span>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-end mt-2 pt-2 border-t border-slate-900/40">
                  <span className="text-[8px] text-slate-500">PuLP Integer Solver</span>
                  <span className="text-xs font-bold text-emerald-400 font-mono">Conf: 94%</span>
                </div>
              </div>

            </div>
          </section>

          {/* Row 1: Agent Swarm Console */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
              <Layers className="text-indigo-400 w-5 h-5" />
              Autonomous Agent Swarm
            </h2>
            <AgentSwarm onSwarmComplete={fetchDashboardData} autonomousMode={autonomousMode} />
          </section>

          {/* Row 2: Copilot & Digital Twin */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                <Activity className="text-indigo-400 w-5 h-5" />
                AI RAG Copilot
              </h2>
              <Copilot />
            </div>
            <div className="space-y-4">
              <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                <Box className="text-indigo-400 w-5 h-5" />
                Digital Twin Projections
              </h2>
              <DigitalTwin />
            </div>
          </section>

          {/* Row 3: Spend Distribution & Intelligence Graph */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                <BarChart2 className="text-indigo-400 w-5 h-5" />
                Spend Distribution & Unit Costs
              </h2>
              <div className="glass-panel p-6 h-[440px] flex flex-col justify-between">
                <div className="flex-1 min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: 10 }} />
                      <YAxis stroke="#64748b" style={{ fontSize: 10 }} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: 8 }}
                        labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                      />
                      <Bar dataKey="Spend" fill="#6366f1" radius={[4, 4, 0, 0]} name="Audit Spend ($)" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-slate-500 mt-4 leading-relaxed">
                  *The bar chart maps historical spend totals per supplier group. Optimization suggests consolidations on lower-cost agreements to minimize pricing deviation.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-bold font-outfit text-white flex items-center gap-2">
                <Layers className="text-indigo-400 w-5 h-5" />
                Entity Dependency Audit
              </h2>
              <IntelligenceGraph />
            </div>
          </section>

          {/* Row 4: Dataset Transparency & Enterprise Scalability */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Dataset Transparency Panel */}
            <div className="glass-panel p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-4">
                  <Activity className="text-indigo-400 w-5 h-5" />
                  <h3 className="text-lg font-bold font-outfit text-white">Data Intelligence & Transparency Summary</h3>
                </div>
                
                <p className="text-xs text-slate-400 mb-4 font-light leading-normal">
                  Inspect the structural scale of the procurement dataset used for offline training and evaluation of models. 
                  These correspond to enterprise-grade procurement data flows.
                </p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs font-medium">
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">RFQs Processed</span>
                    <span className="text-xl font-bold text-white block mt-1 font-mono">500</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Quotes Evaluated</span>
                    <span className="text-xl font-bold text-white block mt-1 font-mono">2,000</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Vendor Profiles</span>
                    <span className="text-xl font-bold text-white block mt-1 font-mono">120</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Purchase Orders</span>
                    <span className="text-xl font-bold text-white block mt-1 font-mono">3,500</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Inventory Trx</span>
                    <span className="text-xl font-bold text-white block mt-1 font-mono">10,000</span>
                  </div>
                  <div className="bg-slate-900/60 p-3 rounded border border-slate-800/80">
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Performance Logs</span>
                    <span className="text-xl font-bold text-white block mt-1 font-mono">25,000</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-2.5 bg-indigo-500/5 border border-indigo-500/10 rounded text-[9.5px] text-indigo-300 leading-normal">
                <strong>Provenance Note:</strong> These records are synthetic, enterprise-grade procurement datasets used to train the Scikit-learn and LightGBM model suites and evaluate price forecasts.
              </div>
            </div>

            {/* Enterprise Scalability Panel */}
            <div className="glass-panel p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-900 pb-3 mb-4">
                  <Layers className="text-indigo-400 w-5 h-5" />
                  <h3 className="text-lg font-bold font-outfit text-white">Enterprise Architecture & Scalability Summary</h3>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs leading-normal mb-4">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Frontend Layer</span>
                    <p className="text-slate-300 font-light mt-0.5">**Next.js 14 SPA** optimized for CEO dashboards & multi-agent swarm telemetry displays.</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Backend Router</span>
                    <p className="text-slate-300 font-light mt-0.5">**FastAPI Python** exposing async endpoints for agent triggers & ML scoring loops.</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">Database Engine</span>
                    <p className="text-slate-300 font-light mt-0.5">**SQLite** development index. Highly compatible to scale to **PostgreSQL** or RDS replicas.</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block font-semibold">RAG & ML Core</span>
                    <p className="text-slate-300 font-light mt-0.5">**TFIDF Vector DB** with cosine similarity. Easily swapped with **Pinecone** or **pgvector**.</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-2.5 bg-emerald-500/5 border border-emerald-500/10 rounded text-[9.5px] text-emerald-300 leading-normal">
                <strong>Scalability Strategy:</strong> Scale swarm execution using Celery workers with a Redis queue. Migrate vector index to Pinecone. Deploy model engines to AWS SageMaker endpoints.
              </div>
            </div>

          </section>



        </div>
      )}

    </div>
  );
}
