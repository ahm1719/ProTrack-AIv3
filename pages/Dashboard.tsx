import React from 'react';
import { useData } from '../context/DataContext';
import { CheckCircle, AlertCircle, Clock, Archive } from 'lucide-react';
import { Priority, Status } from '../types';

const StatCard = ({ label, count, icon: Icon, colorClass }: any) => (
  <div className="bg-surface border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-slate-700 transition-all">
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${colorClass}`}>
      <Icon size={80} />
    </div>
    <div className="relative z-10">
      <div className={`p-3 rounded-xl w-fit mb-4 bg-opacity-20 ${colorClass.replace('text-', 'bg-')}`}>
        <Icon size={24} className={colorClass} />
      </div>
      <h3 className="text-3xl font-bold text-slate-100 mb-1">{count}</h3>
      <p className="text-sm text-slate-400 font-medium">{label}</p>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const { tasks, observations } = useData();

  const todoCount = tasks.filter(t => t.status === Status.Todo).length;
  const inProgressCount = tasks.filter(t => t.status === Status.InProgress).length;
  const doneCount = tasks.filter(t => t.status === Status.Done).length;
  const criticalCount = tasks.filter(t => t.priority === Priority.Critical && t.status !== Status.Done).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-100">Welcome Back</h2>
          <p className="text-slate-400 mt-2">Here is your execution overview for today.</p>
        </div>
        <div className="text-right hidden md:block">
          <p className="text-sm font-bold text-slate-300">{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Pending Tasks" count={todoCount} icon={CheckCircle} colorClass="text-primary" />
        <StatCard label="In Progress" count={inProgressCount} icon={Clock} colorClass="text-warning" />
        <StatCard label="Completed" count={doneCount} icon={Archive} colorClass="text-success" />
        <StatCard label="Critical Items" count={criticalCount} icon={AlertCircle} colorClass="text-danger" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Recent High Priority */}
        <div className="bg-surface border border-slate-800 rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center space-x-2">
            <span className="w-2 h-6 bg-danger rounded-full"></span>
            <span>Critical & High Priority</span>
          </h3>
          <div className="space-y-3">
            {tasks.filter(t => (t.priority === Priority.Critical || t.priority === Priority.High) && t.status !== Status.Done)
              .slice(0, 5)
              .map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-800 hover:border-slate-600 transition-colors">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{task.displayId} • {task.dueDate}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${task.priority === Priority.Critical ? 'bg-danger/20 text-danger' : 'bg-warning/20 text-warning'}`}>
                    {task.priority.toUpperCase()}
                  </span>
                </div>
            ))}
            {tasks.filter(t => (t.priority === Priority.Critical || t.priority === Priority.High) && t.status !== Status.Done).length === 0 && (
              <p className="text-slate-500 text-sm italic py-4 text-center">No critical items pending. Good job!</p>
            )}
          </div>
        </div>

        {/* System Stats */}
        <div className="bg-surface border border-slate-800 rounded-2xl p-6 shadow-lg">
           <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center space-x-2">
            <span className="w-2 h-6 bg-accent rounded-full"></span>
            <span>System Health</span>
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
               <p className="text-xs text-slate-500 uppercase">Total Observations</p>
               <p className="text-2xl font-bold text-slate-200 mt-1">{observations.length}</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-800">
               <p className="text-xs text-slate-500 uppercase">Sync Status</p>
               <p className="text-2xl font-bold text-success mt-1">Active</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl border border-primary/10">
            <p className="text-sm text-slate-300 italic">"Consistency is the code of execution."</p>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;