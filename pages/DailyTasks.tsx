import React, { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ChevronRight, Calendar as CalendarIcon, Filter, Layers, Zap } from 'lucide-react';
import { Task, Status, Priority } from '../types';
import TaskModal from '../components/TaskModal';

const getWeekDates = () => {
  const dates = [];
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to start Monday
  const startOfWeek = new Date(today.setDate(diff));

  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
};

const DayCard = ({ date, count, isToday, onClick }: { date: string, count: number, isToday: boolean, onClick: () => void }) => {
  const d = new Date(date);
  const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
  const dayNum = d.getDate();
  
  // Load color coding
  let loadColor = "bg-success/20 text-success border-success/30"; // Light
  if (count > 5) loadColor = "bg-warning/20 text-warning border-warning/30"; // Medium
  if (count > 8) loadColor = "bg-danger/20 text-danger border-danger/30"; // Heavy

  return (
    <div 
      onClick={onClick}
      className={`relative p-4 rounded-2xl border cursor-pointer transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center min-w-[100px] flex-1
      ${isToday 
        ? 'bg-gradient-to-b from-primary/20 to-surface border-primary shadow-[0_0_20px_rgba(99,102,241,0.2)]' 
        : 'bg-surface border-slate-800 hover:border-slate-600'}`}
    >
      <span className={`text-xs uppercase font-bold mb-1 ${isToday ? 'text-primary' : 'text-slate-500'}`}>{dayName}</span>
      <span className={`text-2xl font-bold mb-2 ${isToday ? 'text-white' : 'text-slate-300'}`}>{dayNum}</span>
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${loadColor}`}>
        {count} Tasks
      </span>
      {isToday && <span className="absolute -top-2 px-2 py-0.5 bg-primary text-white text-[10px] rounded-full shadow-lg">TODAY</span>}
    </div>
  );
};

const FocusTaskCard = ({ task, onEdit }: { task: Task, onEdit: () => void }) => (
  <div onClick={onEdit} className="p-4 bg-slate-800 rounded-lg border border-slate-700 mb-3 cursor-pointer hover:border-primary/50 hover:shadow-lg transition-all group">
    <div className="flex justify-between items-start mb-2">
      <span className="text-xs font-mono text-slate-500">{task.displayId}</span>
      <span className={`w-2 h-2 rounded-full ${task.priority === Priority.Critical ? 'bg-danger' : 'bg-primary'}`}></span>
    </div>
    <h4 className="text-base font-bold text-slate-200 group-hover:text-primary transition-colors">{task.title}</h4>
    <div className="flex items-center justify-between mt-3">
        <span className={`text-[10px] px-2 py-0.5 rounded ${task.status === Status.Done ? 'bg-success/20 text-success' : 'bg-slate-700 text-slate-400'}`}>
            {task.status}
        </span>
        {task.subtasks.length > 0 && (
             <span className="text-[10px] text-slate-500">{task.subtasks.filter(t => t.isCompleted).length}/{task.subtasks.length} Subtasks</span>
        )}
    </div>
  </div>
);

const DailyTasks: React.FC = () => {
  const { tasks, updateTask } = useData();
  const weekDates = useMemo(() => getWeekDates(), []);
  const todayStr = new Date().toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter tasks for selected date
  const tasksForDate = tasks.filter(t => t.dueDate === selectedDate && t.status !== Status.Archived);
  
  // Focus Mode Sorting (Simplified drag simulation by just filtering lists)
  const poolTasks = tasksForDate.filter(t => t.status !== Status.Done && t.status !== Status.InProgress);
  const activeTasks = tasksForDate.filter(t => t.status === Status.InProgress);
  const doneTasks = tasksForDate.filter(t => t.status === Status.Done);

  const openTask = (task?: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Week Header */}
      <div className="flex space-x-4 overflow-x-auto pb-4 mb-6 custom-scrollbar">
        {weekDates.map(date => (
          <DayCard 
            key={date}
            date={date}
            isToday={date === todayStr}
            count={tasks.filter(t => t.dueDate === date && t.status !== Status.Done).length}
            onClick={() => {
              setSelectedDate(date);
              if (date === todayStr) setIsFocusMode(true);
            }}
          />
        ))}
      </div>

      {/* Main List Area (Standard View) */}
      {!isFocusMode && (
        <div className="flex-1 bg-surface border border-slate-800 rounded-2xl p-6 overflow-hidden flex flex-col">
          <div className="flex justify-between items-center mb-6">
             <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
               <CalendarIcon className="text-primary" />
               <span>Tasks for {new Date(selectedDate).toLocaleDateString()}</span>
             </h2>
             <button onClick={() => openTask()} className="bg-primary hover:bg-primaryDark text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
               + New Task
             </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
            {tasksForDate.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-slate-500">
                    <Layers size={48} className="mb-2 opacity-20" />
                    <p>No tasks scheduled for this day.</p>
                </div>
            ) : (
                tasksForDate.map(task => (
                    <div 
                      key={task.id} 
                      onClick={() => openTask(task)}
                      className="group flex items-center justify-between p-4 bg-slate-900/50 border border-slate-800 rounded-xl hover:border-primary/50 transition-all cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                         <div className={`w-1 h-10 rounded-full ${task.priority === Priority.Critical ? 'bg-danger' : task.priority === Priority.High ? 'bg-warning' : 'bg-primary'}`}></div>
                         <div>
                            <h4 className={`text-sm font-bold ${task.status === Status.Done ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{task.title}</h4>
                            <p className="text-xs text-slate-500 mt-1">{task.projectId} • {task.subtasks.filter(s => s.isCompleted).length}/{task.subtasks.length} subs</p>
                         </div>
                      </div>
                      <div className="flex items-center space-x-4">
                         <span className={`px-2 py-1 rounded text-[10px] ${task.status === Status.Done ? 'bg-success/20 text-success' : 'bg-slate-700 text-slate-400'}`}>
                            {task.status}
                         </span>
                         <ChevronRight className="text-slate-600 group-hover:text-primary transition-colors" />
                      </div>
                    </div>
                ))
            )}
          </div>
          
          {selectedDate === todayStr && (
              <button onClick={() => setIsFocusMode(true)} className="mt-4 w-full py-3 border border-primary text-primary hover:bg-primary/10 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                <Zap size={18} />
                <span>Enter Focus Mode</span>
              </button>
          )}
        </div>
      )}

      {/* Focus Mode Popup */}
      {isFocusMode && (
        <div className="fixed inset-0 z-40 bg-background/90 backdrop-blur-md flex items-center justify-center p-6 animate-in zoom-in-95 duration-200">
           <div className="w-full max-w-6xl h-[90vh] bg-surface border border-slate-700 rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">
             
             <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-surfaceHighlight/30">
                <div className="flex items-center gap-3">
                   <div className="p-2 bg-primary/20 rounded-lg">
                     <Zap className="text-primary" />
                   </div>
                   <div>
                     <h2 className="text-xl font-bold text-slate-100">Today's Focus</h2>
                     <p className="text-xs text-slate-400 uppercase tracking-widest">Execution Workflow</p>
                   </div>
                </div>
                <button onClick={() => setIsFocusMode(false)} className="text-slate-400 hover:text-white px-4 py-2 hover:bg-slate-800 rounded-lg transition-colors">
                  Exit Focus
                </button>
             </div>

             <div className="flex-1 flex overflow-hidden p-6 gap-6">
                
                {/* Left: Task Pool */}
                <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col">
                   <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                      <h3 className="font-bold text-slate-300">Task Pool</h3>
                      <span className="bg-slate-800 text-slate-500 px-2 py-0.5 rounded text-xs">{poolTasks.length}</span>
                   </div>
                   <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                      {poolTasks.map(task => <FocusTaskCard key={task.id} task={task} onEdit={() => openTask(task)} />)}
                      <button onClick={() => openTask()} className="w-full py-3 border border-dashed border-slate-700 text-slate-500 rounded-lg hover:border-primary hover:text-primary transition-colors text-sm">
                        + Quick Add Task
                      </button>
                   </div>
                </div>

                {/* Middle: Active Execution */}
                <div className="flex-1 bg-gradient-to-b from-primary/5 to-transparent rounded-xl border border-primary/20 flex flex-col shadow-inner">
                   <div className="p-4 border-b border-primary/20 flex justify-between items-center bg-primary/10">
                      <h3 className="font-bold text-primary">In Progress</h3>
                      <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-xs">{activeTasks.length}</span>
                   </div>
                   <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                      {activeTasks.length === 0 && (
                          <div className="text-center mt-10 opacity-40">
                              <Zap size={40} className="mx-auto mb-2" />
                              <p className="text-sm">Drag tasks here to start</p>
                          </div>
                      )}
                      {activeTasks.map(task => <FocusTaskCard key={task.id} task={task} onEdit={() => openTask(task)} />)}
                   </div>
                </div>

                {/* Right: Done */}
                <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col opacity-70 hover:opacity-100 transition-opacity">
                   <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                      <h3 className="font-bold text-success">Completed</h3>
                      <span className="bg-slate-800 text-success px-2 py-0.5 rounded text-xs">{doneTasks.length}</span>
                   </div>
                   <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
                      {doneTasks.map(task => <FocusTaskCard key={task.id} task={task} onEdit={() => openTask(task)} />)}
                   </div>
                </div>

             </div>
           </div>
        </div>
      )}

      {/* Task Edit Modal */}
      <TaskModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        task={editingTask}
        initialDate={selectedDate}
      />
    </div>
  );
};

export default DailyTasks;