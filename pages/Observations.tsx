import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Observation, ObservationStatus } from '../types';
import { Plus, Trash2, CheckCircle2, MoreHorizontal } from 'lucide-react';

const Column = ({ title, status, items, onDelete, onStatusChange }: any) => {
  return (
    <div className="flex-1 flex flex-col min-w-[300px] h-full bg-surface border border-slate-800 rounded-xl overflow-hidden">
      <div className={`p-4 border-b border-slate-800 flex justify-between items-center
        ${status === ObservationStatus.New ? 'bg-primary/10' : 
          status === ObservationStatus.Reviewing ? 'bg-warning/10' : 'bg-success/10'}`}>
        <h3 className={`font-bold ${
            status === ObservationStatus.New ? 'text-primary' : 
            status === ObservationStatus.Reviewing ? 'text-warning' : 'text-success'}`}>{title}</h3>
        <span className="text-xs font-mono opacity-50 bg-black/20 px-2 py-1 rounded">{items.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar bg-slate-900/30">
        {items.map((obs: Observation) => (
          <div key={obs.id} className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 hover:border-slate-500 shadow-sm transition-all group relative">
             <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed">{obs.content}</p>
             <div className="mt-3 flex justify-between items-center border-t border-slate-700/50 pt-2">
                <span className="text-[10px] text-slate-500">{new Date(obs.createdAt).toLocaleDateString()}</span>
                <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {status !== ObservationStatus.Resolved && (
                        <button 
                            onClick={() => onStatusChange(obs.id, status === ObservationStatus.New ? ObservationStatus.Reviewing : ObservationStatus.Resolved)}
                            className="p-1 hover:bg-slate-700 rounded text-success" title="Move Forward">
                            <CheckCircle2 size={14} />
                        </button>
                    )}
                    <button 
                        onClick={() => onDelete(obs.id)}
                        className="p-1 hover:bg-slate-700 rounded text-danger" title="Delete">
                        <Trash2 size={14} />
                    </button>
                </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Observations: React.FC = () => {
  const { observations, addObservation, deleteObservation, updateObservation } = useData();
  const [newObs, setNewObs] = useState('');

  const handleAdd = () => {
    if (!newObs.trim()) return;
    addObservation({
      id: Math.random().toString(36).substr(2, 9),
      content: newObs,
      status: ObservationStatus.New,
      createdAt: new Date().toISOString()
    });
    setNewObs('');
  };

  const handleStatusChange = (id: string, newStatus: ObservationStatus) => {
    const obs = observations.find(o => o.id === id);
    if (obs) {
      updateObservation({ ...obs, status: newStatus });
    }
  };

  return (
    <div className="h-full flex flex-col">
       <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">Observations</h2>
            <p className="text-slate-400 text-sm">Track patterns, thoughts, and friction points.</p>
          </div>
       </div>

       {/* Input Area */}
       <div className="bg-surface border border-slate-800 rounded-xl p-4 mb-6 shadow-lg">
          <textarea
            value={newObs}
            onChange={e => setNewObs(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && e.ctrlKey && handleAdd()}
            placeholder="Log a new observation... (Ctrl + Enter to save)"
            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-slate-200 focus:outline-none focus:border-primary min-h-[80px]"
          />
          <div className="flex justify-between items-center mt-3">
             <span className="text-xs text-slate-500">Capture everything. Process later.</span>
             <button onClick={handleAdd} className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
               <Plus size={16} /> Add Observation
             </button>
          </div>
       </div>

       {/* Board */}
       <div className="flex-1 overflow-x-auto pb-2">
          <div className="flex gap-4 h-full min-w-[900px]">
             <Column 
                title="New" 
                status={ObservationStatus.New} 
                items={observations.filter(o => o.status === ObservationStatus.New)} 
                onDelete={deleteObservation}
                onStatusChange={handleStatusChange}
             />
             <Column 
                title="Reviewing" 
                status={ObservationStatus.Reviewing} 
                items={observations.filter(o => o.status === ObservationStatus.Reviewing)} 
                onDelete={deleteObservation}
                onStatusChange={handleStatusChange}
             />
             <Column 
                title="Resolved" 
                status={ObservationStatus.Resolved} 
                items={observations.filter(o => o.status === ObservationStatus.Resolved)} 
                onDelete={deleteObservation}
                onStatusChange={handleStatusChange}
             />
          </div>
       </div>
    </div>
  );
};

export default Observations;