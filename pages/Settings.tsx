import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Trash, Cpu, Database } from 'lucide-react';
import { generateWeeklySummary } from '../services/geminiService';

const Settings: React.FC = () => {
  const { purgeData, tasks, observations } = useData();
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    try {
        const summary = await generateWeeklySummary(tasks, observations);
        setAiSummary(summary);
    } catch (e: any) {
        alert(e.message);
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <h2 className="text-3xl font-bold text-slate-100">System Configuration</h2>

      {/* AI Section */}
      <section className="bg-surface border border-slate-800 rounded-2xl p-6 shadow-lg">
         <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Cpu className="text-accent" /> AI Integration
         </h3>
         <p className="text-slate-400 text-sm mb-6">Generate weekly summaries and pattern analysis using Gemini.</p>
         
         <div className="space-y-4">
            <div className="flex gap-4">
                <button 
                  onClick={handleGenerateSummary}
                  disabled={isGenerating}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-lg disabled:opacity-50">
                  {isGenerating ? 'Analyzing...' : 'Generate Weekly Summary'}
                </button>
            </div>
         </div>

         {aiSummary && (
            <div className="mt-6 p-6 bg-slate-900/50 rounded-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
                <h4 className="text-accent font-bold mb-2 text-sm uppercase">AI Executive Summary</h4>
                <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{aiSummary}</p>
            </div>
         )}
      </section>

      {/* Data Hygiene */}
      <section className="bg-surface border border-slate-800 rounded-2xl p-6 shadow-lg border-t-4 border-t-danger/50">
         <h3 className="text-xl font-bold text-slate-200 mb-4 flex items-center gap-2">
            <Database className="text-danger" /> Data Hygiene
         </h3>
         <div className="flex items-center justify-between bg-slate-900/50 p-4 rounded-xl border border-slate-800">
            <div>
                <h4 className="font-bold text-slate-300">Purge Old Data</h4>
                <p className="text-xs text-slate-500">Remove completed tasks and resolved observations older than 90 days.</p>
            </div>
            <button 
              onClick={() => { if(window.confirm('Are you sure? This cannot be undone.')) purgeData(90); }}
              className="bg-danger/10 text-danger hover:bg-danger hover:text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2">
               <Trash size={16} /> Purge Now
            </button>
         </div>
      </section>

      {/* User Manual Placeholder */}
      <section className="bg-surface border border-slate-800 rounded-2xl p-6 shadow-lg">
         <h3 className="text-xl font-bold text-slate-200 mb-4">User Manual</h3>
         <div className="prose prose-invert prose-sm max-w-none text-slate-400">
            <p><strong>Focus Mode:</strong> Click on Today in the Daily Tasks view to enter the execution cockpit.</p>
            <p><strong>Sync:</strong> Data is persisted locally immediately. Cloud sync runs in background.</p>
            <p><strong>Shortcuts:</strong> use Ctrl+Enter to save inputs quickly.</p>
         </div>
      </section>
    </div>
  );
};

export default Settings;