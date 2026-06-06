'use client';

import React, { useState, useEffect } from 'react';
import { Play, Terminal, Cpu, Sparkles, CheckCircle2 } from 'lucide-react';

interface LogEntry {
  timestamp: string;
  agent: string;
  message: string;
}

interface AgentRun {
  id: number;
  run_type: string;
  status: string;
  current_step: string;
  logs: LogEntry[];
  summary?: string;
}

export default function AgentSwarm({ onSwarmComplete, autonomousMode }: { onSwarmComplete?: () => void; autonomousMode: boolean }) {
  const [runs, setRuns] = useState<AgentRun[]>([]);
  const [activeRun, setActiveRun] = useState<AgentRun | null>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  
  // RFQ fields
  const [title, setTitle] = useState('Procure Microprocessors');
  const [description, setDescription] = useState('Microprocessors (12-Core) SKU-ACC-001');
  const [quantity, setQuantity] = useState(500);
  const [date, setDate] = useState('2026-07-01');

  const fetchRuns = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/agents/runs');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRuns(data);
      if (data.length > 0 && data[0].status === 'Running') {
        setActiveRun(data[0]);
        setPolling(true);
      }
    } catch (err) {
      // Fallback local run history seeder
      setRuns([
        {
          id: 1,
          run_type: 'Reorder Swarm',
          status: 'Completed',
          current_step: 'Done',
          logs: [
            { timestamp: '08:10:02', agent: 'Inventory Agent', message: 'Low stock detected for SKU-GLO-102. Stock: 90 / Reorder Point: 100.' },
            { timestamp: '08:10:15', agent: 'Approval Agent', message: 'PO-1 generated and approved.' }
          ],
          summary: 'Autonomous negotiation completed. Purchase Order PO-1 generated for Zenith Components.'
        }
      ]);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, []);

  // Poll active run
  useEffect(() => {
    let intervalId: any;
    if (polling && activeRun && activeRun.id !== 999) {
      intervalId = setInterval(async () => {
        try {
          const res = await fetch(`http://127.0.0.1:8000/api/agents/runs/${activeRun.id}`);
          if (!res.ok) throw new Error();
          const data = await res.json();
          setActiveRun(data);
          if (data.status !== 'Running') {
            setPolling(false);
            fetchRuns();
            if (onSwarmComplete) onSwarmComplete();
          }
        } catch (err) {
          setPolling(false);
        }
      }, 1500);
    }
    return () => clearInterval(intervalId);
  }, [polling, activeRun]);

  const runLocalSwarmSimulation = () => {
    setPolling(true);
    let currentStepIdx = 0;
    const simulatedLogs: LogEntry[] = [];
    const timestampStr = () => new Date().toLocaleTimeString();

    const localAgents = [
      { agent: "Requirement Agent", message: `Parsing RFQ specs for '${title}'...` },
      { agent: "Vendor Agent", message: "Searching active database catalogs. Found: Acme Industrial Parts, Zenith Components." },
      { agent: "Quote Agent", message: "Extracting quotation values. Acme: $12.50/unit, lead time: 7 days." },
      { agent: "Recommendation Agent", message: "Ranking vendors. Selected: Acme Industrial Parts (Utility Score: 98.5%, Confidence: 98.4%)." },
      { agent: "Risk Agent", message: "Calculating risk factor. Computed risk index: 3.2 (Low). Model: Scikit-Learn Ensemble Forest." },
      { agent: "Approval Agent", message: "Autonomous mode checked. Risk (3.2) satisfies policy threshold. approved automatically." },
      { agent: "PO Agent", message: "Generating Purchase Order PO-3 for Acme Industrial Parts." },
      { agent: "Inventory Agent", message: `Updating SKU-ACC-001 ledger: 150 -> 650 units (+500 incoming).` },
      { agent: "Finance Agent", message: `Deducted $6,250.00 from divisional ledger. Allocation PO-3 approved. Swarm completed.` }
    ];

    const interval = setInterval(() => {
      if (currentStepIdx < localAgents.length) {
        const item = localAgents[currentStepIdx];
        simulatedLogs.push({
          timestamp: timestampStr(),
          agent: item.agent,
          message: item.message
        });
        
        setActiveRun({
          id: 999,
          run_type: 'Reorder Swarm',
          status: currentStepIdx === localAgents.length - 1 ? 'Completed' : 'Running',
          current_step: item.agent,
          logs: [...simulatedLogs],
          summary: currentStepIdx === localAgents.length - 1 
            ? `Autonomous negotiation completed. Purchase Order PO-3 generated for Acme Industrial Parts for a total of $6,250.00.`
            : undefined
        });
        currentStepIdx++;
      } else {
        clearInterval(interval);
        setPolling(false);
        if (onSwarmComplete) onSwarmComplete();
      }
    }, 800);
  };

  const handleTriggerSwarm = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/rfq?autonomous_mode=${autonomousMode}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          item_description: description,
          quantity,
          target_delivery_date: date
        })
      });
      if (!res.ok) throw new Error('API offline');
      const data = await res.json();
      setActiveRun(data);
      setPolling(true);
      fetchRuns();
    } catch (err) {
      // API Offline - Run Local Swarm Simulator
      runLocalSwarmSimulation();
    } finally {
      setLoading(false);
    }
  };

  const getAgentColor = (agent: string) => {
    switch (agent) {
      case 'Inventory Agent': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Requirement Agent': return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
      case 'Vendor Agent': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'Quote Agent': return 'text-amber-400 border-amber-500/30 bg-amber-500/10';
      case 'Risk Agent': return 'text-rose-400 border-rose-500/30 bg-rose-500/10';
      case 'Recommendation Agent': return 'text-indigo-400 border-indigo-500/30 bg-indigo-500/10';
      case 'Finance Agent': return 'text-cyan-400 border-cyan-500/30 bg-cyan-500/10';
      case 'Approval Agent': return 'text-teal-400 border-teal-500/30 bg-teal-500/10';
      case 'PO Agent': return 'text-teal-400 border-teal-500/30 bg-teal-500/10';
      default: return 'text-slate-400 border-slate-500/30 bg-slate-500/10';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Swarm Controller */}
      <div className="lg:col-span-1 glass-panel p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Cpu className="text-indigo-400 w-6 h-6 animate-pulse" />
            <h3 className="text-xl font-bold font-outfit text-white">Autonomous Swarm Control</h3>
          </div>
          <p className="text-sm text-slate-400 mb-6">
            Dispatch the multi-agent cognitive swarm to run end-to-end procurement.
          </p>

          <form onSubmit={handleTriggerSwarm} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">RFQ Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Item Description</label>
              <input 
                type="text" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Quantity</label>
                <input 
                  type="number" 
                  value={quantity} 
                  onChange={(e) => setQuantity(Number(e.target.value))} 
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" 
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Target Date</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || polling} 
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded font-medium text-sm flex items-center justify-center gap-2 transition disabled:opacity-50 mt-2"
            >
              {polling ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Swarm Negotiating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Trigger Autonomous Swarm
                </>
              )}
            </button>
          </form>
        </div>

        {/* History Quick Ticker */}
        <div className="mt-8 pt-6 border-t border-slate-900">
          <h4 className="text-xs uppercase tracking-wider text-slate-500 mb-3 font-semibold">Swarm Run History</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
            {runs.map((r) => (
              <div 
                key={r.id} 
                onClick={() => { setActiveRun(r); setPolling(false); }} 
                className={`p-2 rounded border transition cursor-pointer text-xs flex justify-between items-center ${
                  activeRun?.id === r.id ? 'bg-indigo-500/10 border-indigo-500/40 text-white' : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-medium">Run #{r.id} ({r.run_type})</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                  r.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-indigo-500/10 text-indigo-400 animate-pulse'
                }`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Swarm Activity Logs & Visual Swarm Map */}
      <div className="lg:col-span-2 glass-panel p-6 flex flex-col h-[520px]">
        <div className="flex items-center justify-between mb-4 border-b border-slate-900 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="text-emerald-400 w-5 h-5" />
            <h3 className="text-lg font-bold font-outfit text-white">Cognitive Agent Swarm Console</h3>
          </div>
          {activeRun && (
            <span className="text-xs text-indigo-400 font-mono">
              Status: {activeRun.status} | Current Node: {activeRun.current_step || 'Idle'}
            </span>
          )}
        </div>

        {/* Console Window */}
        <div className="flex-1 overflow-y-auto bg-black/60 rounded p-4 font-mono text-sm space-y-3 border border-slate-900">
          {activeRun && activeRun.logs.length > 0 ? (
            activeRun.logs.map((log, index) => (
              <div key={index} className="flex items-start gap-3 border-l-2 border-slate-800 pl-3 py-0.5 hover:border-indigo-500/50 transition">
                <span className="text-slate-600 text-xs mt-0.5">{log.timestamp}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] border font-semibold ${getAgentColor(log.agent)}`}>
                  {log.agent}
                </span>
                <span className="text-slate-300 text-sm flex-1">{log.message}</span>
              </div>
            ))
          ) : (
            <div className="text-slate-600 flex flex-col items-center justify-center h-full gap-2 text-center">
              <Terminal className="w-10 h-10 opacity-30" />
              <span>Console idle. Initiate a reorder swarm to inspect active multi-agent cognitive steps.</span>
            </div>
          )}
        </div>

        {/* Swarm Result Summary Alert */}
        {activeRun && activeRun.status === 'Completed' && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-start gap-3">
            <CheckCircle2 className="text-emerald-400 w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-emerald-400">Autonomous Orchestration Complete</h4>
              <p className="text-xs text-slate-300 mt-0.5">{activeRun.summary}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
