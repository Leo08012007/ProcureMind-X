'use client';

import React, { useState } from 'react';
import { Network, Database, MapPin, ShieldAlert, Award, FileText, ChevronRight } from 'lucide-react';

interface GraphNode {
  id: string;
  label: string;
  type: 'vendor' | 'product' | 'location' | 'contract' | 'region' | 'po';
  risk: 'Low' | 'Medium' | 'High';
  riskScore: number;
  performance: {
    quality: number;
    onTime: number;
    compliance: number;
  };
  details: string;
  dependencies: string[];
}

export default function IntelligenceGraph() {
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const nodes: GraphNode[] = [
    { 
      id: 'n1', 
      label: 'Acme Industrial Parts', 
      type: 'vendor', 
      risk: 'Low', 
      riskScore: 18.5,
      performance: { quality: 96.0, onTime: 95.0, compliance: 98.0 },
      details: 'Primary semiconductor provider. Net 30 payment terms.',
      dependencies: ['n3', 'n7', 'n9']
    },
    { 
      id: 'n2', 
      label: 'Zenith Components Ltd', 
      type: 'vendor', 
      risk: 'Medium', 
      riskScore: 42.1,
      performance: { quality: 92.0, onTime: 89.0, compliance: 91.0 },
      details: 'Tokyo capacity supplier. Fixed capacitor agreement.',
      dependencies: ['n4', 'n8', 'n10']
    },
    { 
      id: 'n3', 
      label: 'Microprocessors (12-Core)', 
      type: 'product', 
      risk: 'Low', 
      riskScore: 12.0,
      performance: { quality: 98.0, onTime: 97.0, compliance: 99.0 },
      details: 'SKU-ACC-001. Critical processor unit.',
      dependencies: ['n5']
    },
    { 
      id: 'n4', 
      label: 'Capacitors (100uF)', 
      type: 'product', 
      risk: 'Low', 
      riskScore: 15.0,
      performance: { quality: 94.0, onTime: 92.0, compliance: 95.0 },
      details: 'SKU-ZEN-009. Basic capacity unit.',
      dependencies: ['n6']
    },
    { 
      id: 'n5', 
      label: 'Warehouse Dallas', 
      type: 'location', 
      risk: 'Low', 
      riskScore: 8.0,
      performance: { quality: 100.0, onTime: 100.0, compliance: 100.0 },
      details: 'Central US storage facility.',
      dependencies: []
    },
    { 
      id: 'n6', 
      label: 'Warehouse Tokyo', 
      type: 'location', 
      risk: 'Low', 
      riskScore: 10.0,
      performance: { quality: 100.0, onTime: 100.0, compliance: 100.0 },
      details: 'APAC transit hub.',
      dependencies: []
    },
    { 
      id: 'n7', 
      label: 'Acme Master Contract', 
      type: 'contract', 
      risk: 'Low', 
      riskScore: 22.0,
      performance: { quality: 96.0, onTime: 94.0, compliance: 98.0 },
      details: 'Value: $250k. Exp: 2027-01-01.',
      dependencies: []
    },
    { 
      id: 'n8', 
      label: 'Zenith Master Contract', 
      type: 'contract', 
      risk: 'Medium', 
      riskScore: 38.0,
      performance: { quality: 92.0, onTime: 90.0, compliance: 93.0 },
      details: 'Value: $180k. Exp: 2027-02-15.',
      dependencies: []
    },
    {
      id: 'n9',
      label: 'Purchase Order PO-1',
      type: 'po',
      risk: 'Low',
      riskScore: 15.0,
      performance: { quality: 97.0, onTime: 95.0, compliance: 97.0 },
      details: 'Autonomous Purchase Order generated for Acme. Total: $3,450.00',
      dependencies: []
    },
    {
      id: 'n10',
      label: 'Purchase Order PO-2',
      type: 'po',
      risk: 'Medium',
      riskScore: 40.0,
      performance: { quality: 92.0, onTime: 88.0, compliance: 90.0 },
      details: 'PO dispatched to Zenith Components Ltd. Total: $4,250.00',
      dependencies: []
    }
  ];

  const relations = [
    { from: 'n1', to: 'n3', label: 'Supplies' },
    { from: 'n1', to: 'n7', label: 'Bound By' },
    { from: 'n1', to: 'n9', label: 'Dispatches' },
    { from: 'n2', to: 'n4', label: 'Supplies' },
    { from: 'n2', to: 'n8', label: 'Bound By' },
    { from: 'n2', to: 'n10', label: 'Dispatches' },
    { from: 'n3', to: 'n5', label: 'Stored In' },
    { from: 'n4', to: 'n6', label: 'Stored In' }
  ];

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'vendor': return <Award className="w-5 h-5 text-indigo-400" />;
      case 'product': return <Database className="w-5 h-5 text-emerald-400" />;
      case 'location': return <MapPin className="w-5 h-5 text-amber-400" />;
      case 'contract': return <FileText className="w-5 h-5 text-purple-400" />;
      case 'po': return <FileText className="w-5 h-5 text-teal-400" />;
      default: return <Database className="w-5 h-5 text-slate-400" />;
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'Medium': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'High': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="glass-panel p-6">
      <div className="flex items-center gap-2 mb-4">
        <Network className="text-indigo-400 w-5 h-5" />
        <h3 className="text-lg font-bold font-outfit text-white">Interactive Knowledge Graph</h3>
      </div>
      <p className="text-xs text-slate-400 mb-6">
        Map and inspect relationships, risk factors, and dependencies in real-time. Click any node to audit dependency paths.
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Nodes Grid */}
        <div className="xl:col-span-2 bg-black/40 rounded p-4 border border-slate-900 grid grid-cols-2 md:grid-cols-3 gap-3 min-h-[350px] overflow-y-auto max-h-[420px]">
          {nodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;
            const isLinked = selectedNode && (
              selectedNode.dependencies.includes(node.id) || 
              node.dependencies.includes(selectedNode.id) ||
              relations.some(r => (r.from === selectedNode.id && r.to === node.id) || (r.from === node.id && r.to === selectedNode.id))
            );

            return (
              <div 
                key={node.id} 
                onClick={() => setSelectedNode(node)}
                className={`p-3 rounded border transition cursor-pointer flex flex-col justify-between h-[90px] ${
                  isSelected 
                    ? 'bg-indigo-500/15 border-indigo-500 shadow-md shadow-indigo-500/10' 
                    : isLinked
                    ? 'bg-indigo-500/5 border-indigo-500/30'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded bg-slate-950 border border-slate-800 shrink-0">
                    {getNodeIcon(node.type)}
                  </div>
                  <span className="text-xs font-semibold text-white block truncate">{node.label}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-[9px] text-slate-500 capitalize">{node.type}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded border font-mono ${getRiskColor(node.risk)}`}>
                    Score: {node.riskScore}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Node Details Pane */}
        <div className="xl:col-span-1 bg-slate-900/40 rounded border border-slate-900 p-4 flex flex-col justify-between min-h-[350px] max-h-[420px] overflow-y-auto">
          {selectedNode ? (
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase tracking-wider text-indigo-400 font-semibold">{selectedNode.type} Node Info</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] border font-medium ${getRiskColor(selectedNode.risk)}`}>
                    {selectedNode.risk} Risk ({selectedNode.riskScore})
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white">{selectedNode.label}</h4>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">{selectedNode.details}</p>
              </div>

              {/* Performance Metrics */}
              <div className="pt-3 border-t border-slate-900">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-2 font-semibold">Performance Metrics</span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-black/30 p-1.5 rounded border border-slate-900">
                    <span className="text-[9px] text-slate-500 block">Quality</span>
                    <span className="text-xs font-bold text-white">{selectedNode.performance.quality}%</span>
                  </div>
                  <div className="bg-black/30 p-1.5 rounded border border-slate-900">
                    <span className="text-[9px] text-slate-500 block">On-Time</span>
                    <span className="text-xs font-bold text-white">{selectedNode.performance.onTime}%</span>
                  </div>
                  <div className="bg-black/30 p-1.5 rounded border border-slate-900">
                    <span className="text-[9px] text-slate-500 block">SLA</span>
                    <span className="text-xs font-bold text-white">{selectedNode.performance.compliance}%</span>
                  </div>
                </div>
              </div>

              {/* Linked relations lookup */}
              <div className="pt-3 border-t border-slate-900">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 block mb-2 font-semibold">Relational Links</span>
                <div className="space-y-1">
                  {relations.filter(r => r.from === selectedNode.id || r.to === selectedNode.id).map((rel, idx) => {
                    const fromNode = nodes.find(n => n.id === rel.from);
                    const toNode = nodes.find(n => n.id === rel.to);
                    return (
                      <div key={idx} className="text-[10px] bg-slate-950 p-2 rounded border border-slate-900 text-slate-300 flex items-center justify-between">
                        <span className="truncate max-w-[80px]">{fromNode?.label}</span>
                        <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0 mx-1" />
                        <span className="text-[9px] text-indigo-400 bg-indigo-500/10 px-1 rounded border border-indigo-500/20">{rel.label}</span>
                        <ChevronRight className="w-3 h-3 text-indigo-400 shrink-0 mx-1" />
                        <span className="truncate max-w-[80px]">{toNode?.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-slate-600 text-xs flex flex-col items-center justify-center h-full text-center gap-2 py-12">
              <Network className="w-10 h-10 opacity-25" />
              <span>Select any element on the knowledge grid to load its active dependencies and risk ratings.</span>
            </div>
          )}

          {selectedNode && (
            <button 
              onClick={() => setSelectedNode(null)}
              className="text-[10px] text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 bg-slate-950 py-1.5 rounded transition mt-4 w-full"
            >
              Clear Node Inspector
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
