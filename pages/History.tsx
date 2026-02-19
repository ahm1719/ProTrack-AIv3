import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ChevronLeft, ChevronRight, Archive } from 'lucide-react';
import { Status } from '../types';
import TaskModal from '../components/TaskModal';

const History: React.FC = () => {
  const { tasks } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [editingTask, setEditingTask] = useState<any>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay(); // 0-6

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const days = [];
  // Blank days
  for (let i = 0; i < (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); i++) {
    days.push(<div key={`blank-${i}`} className="h-32 bg-slate-900/30 border border-slate-800/50"></div>);
  }

  // Real days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), d).toISOString().split('T')[0];
    const isToday = dateStr === new Date().toISOString().split('T')[0];
    const daysTasks = tasks.filter(t => t.dueDate === dateStr);
    const doneCount = daysTasks.filter(t => t.status === Status.Done).length;
    const totalCount = daysTasks.length;

    let intensity = '';
    if (totalCount > 0) {
        const ratio = doneCount / totalCount;
        if (ratio === 1) intensity = 'bg-success/10 border-success/30';
        else if (ratio > 0.5) intensity = 'bg-primary/10 border-primary/30';
        else intensity = 'bg-slate-800 border-slate-700';
    } else {
        intensity = 'bg-surface border-slate-800';
    }

    days.push(
      <div key={d} className={`h-32 p-2 border overflow-hidden relative group hover:border-primary/50 transition-colors ${intensity} ${isToday ? 'ring-2 ring-primary ring-inset' : ''}`}>
        <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-bold ${isToday ? 'text-primary' : 'text-slate-400'}`}>{d}</span>
            {totalCount > 0 && <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded text-slate-300">{doneCount}/{totalCount}</span>}
        </div>
        <div className="space-y-1 overflow-y-auto max-h-[80px] custom-scrollbar">
            {daysTasks.map(t => (
                <div 
                  key={t.id} 
                  onClick={() => { setEditingTask(t); setIsModalOpen(true); }}
                  className={`text-[10px] px-1.5 py-1 rounded truncate cursor-pointer hover:opacity-80
                  ${t.status === Status.Done ? 'bg-success/20 text-success line-through' : 'bg-primary/20 text-primary'}`}>
                    {t.title}
                </div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
         <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Archive className="text-slate-500" />
            <span>History & Calendar</span>
         </h2>
         <div className="flex items-center space-x-4 bg-surface px-4 py-2 rounded-xl border border-slate-800">
            <button onClick={prevMonth} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><ChevronLeft /></button>
            <span className="font-bold text-slate-200 min-w-[150px] text-center">
                {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={nextMonth} className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-white"><ChevronRight /></button>
         </div>
       </div>

       <div className="flex-1 bg-surface rounded-2xl border border-slate-800 shadow-xl overflow-hidden flex flex-col">
          <div className="grid grid-cols-7 bg-slate-900 border-b border-slate-800 p-2">
             {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                 <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase">{day}</div>
             ))}
          </div>
          <div className="grid grid-cols-7 flex-1 auto-rows-fr">
             {days}
          </div>
       </div>

       <TaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} task={editingTask} />
    </div>
  );
};

export default History;