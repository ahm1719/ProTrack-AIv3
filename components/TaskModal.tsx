import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Flag, CheckCircle2, RotateCw, Send, Trash2, Tag, ChevronDown, Plus } from 'lucide-react';
import { Task, Priority, Status, RecurrenceType, Subtask, TaskUpdate } from '../types';
import { useData } from '../context/DataContext';

interface TaskModalProps {
  task?: Task;
  onClose: () => void;
  isOpen: boolean;
  initialDate?: string;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, isOpen, initialDate }) => {
  const { addTask, updateTask, deleteTask } = useData();
  const [formData, setFormData] = useState<Partial<Task>>({
    title: '',
    description: '',
    priority: Priority.Medium,
    status: Status.Todo,
    recurrence: RecurrenceType.None,
    dueDate: initialDate || new Date().toISOString().split('T')[0],
    subtasks: [],
    updates: [],
    projectId: 'General'
  });
  
  const [newSubtask, setNewSubtask] = useState('');
  const [newUpdate, setNewUpdate] = useState('');
  
  useEffect(() => {
    if (task) {
      setFormData({ ...task });
    } else {
      setFormData({
        title: '',
        description: '',
        priority: Priority.Medium,
        status: Status.Todo,
        recurrence: RecurrenceType.None,
        dueDate: initialDate || new Date().toISOString().split('T')[0],
        subtasks: [],
        updates: [],
        projectId: 'General',
        displayId: `T-${Math.floor(Math.random() * 1000)}`
      });
    }
  }, [task, initialDate]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!formData.title) return;

    const now = new Date().toISOString();
    const finalTask: Task = {
      id: task?.id || generateId(),
      displayId: task?.displayId || `T-${Math.floor(Math.random() * 10000)}`,
      title: formData.title!,
      description: formData.description || '',
      projectId: formData.projectId || 'General',
      dueDate: formData.dueDate!,
      priority: formData.priority!,
      status: formData.status!,
      recurrence: formData.recurrence!,
      subtasks: formData.subtasks!,
      updates: formData.updates!,
      createdAt: task?.createdAt || now,
      updatedAt: now
    };

    if (task) {
      updateTask(finalTask);
    } else {
      addTask(finalTask);
    }
    onClose();
  };

  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    const newItem: Subtask = { id: generateId(), title: newSubtask, isCompleted: false };
    setFormData(prev => ({ ...prev, subtasks: [...(prev.subtasks || []), newItem] }));
    setNewSubtask('');
  };

  const toggleSubtask = (id: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks?.map(st => st.id === id ? { ...st, isCompleted: !st.isCompleted } : st)
    }));
  };

  const addUpdate = () => {
    if (!newUpdate.trim()) return;
    const update: TaskUpdate = {
      id: generateId(),
      text: newUpdate,
      timestamp: new Date().toISOString(),
      type: 'comment'
    };
    setFormData(prev => ({ ...prev, updates: [update, ...(prev.updates || [])] }));
    setNewUpdate('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-slate-700 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden relative" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-surfaceHighlight/30">
          <div className="flex items-center space-x-3">
             <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                {task?.displayId || 'NEW TASK'}
             </span>
             <input 
               type="text"
               value={formData.title}
               onChange={e => setFormData({ ...formData, title: e.target.value })}
               placeholder="Task Title..."
               className="bg-transparent text-xl font-bold text-slate-100 placeholder-slate-600 focus:outline-none w-full min-w-[300px]"
             />
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-100 transition-colors bg-slate-800 p-2 rounded-full hover:bg-slate-700">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Main Info Column */}
          <div className="w-2/3 p-8 overflow-y-auto border-r border-slate-800 custom-scrollbar">
            
            <div className="mb-6">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Description</label>
              <textarea 
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Add more details..."
                className="w-full bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-slate-300 min-h-[120px] focus:border-primary/50 focus:outline-none resize-none transition-all"
              />
            </div>

            <div className="mb-8">
               <div className="flex items-center justify-between mb-3">
                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subtasks</label>
                 <span className="text-xs text-slate-600">{formData.subtasks?.filter(s => s.isCompleted).length}/{formData.subtasks?.length} Completed</span>
               </div>
               
               <div className="space-y-2 mb-3">
                 {formData.subtasks?.map(st => (
                   <div key={st.id} className="flex items-start space-x-3 group p-2 rounded hover:bg-slate-800/50 transition-colors">
                      <button onClick={() => toggleSubtask(st.id)} className={`mt-0.5 ${st.isCompleted ? 'text-success' : 'text-slate-600 hover:text-slate-400'}`}>
                        <CheckCircle2 size={18} className={st.isCompleted ? 'fill-success/20' : ''} />
                      </button>
                      <span className={`text-sm flex-1 ${st.isCompleted ? 'text-slate-500 line-through' : 'text-slate-200'}`}>{st.title}</span>
                      <button 
                        onClick={() => setFormData(prev => ({ ...prev, subtasks: prev.subtasks?.filter(s => s.id !== st.id) }))}
                        className="opacity-0 group-hover:opacity-100 text-danger hover:bg-danger/10 p-1 rounded transition-all">
                        <Trash2 size={14} />
                      </button>
                   </div>
                 ))}
               </div>

               <div className="flex items-center space-x-2">
                 <Plus size={16} className="text-slate-500" />
                 <input 
                   type="text" 
                   value={newSubtask}
                   onChange={e => setNewSubtask(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && addSubtask()}
                   placeholder="Add subtask..."
                   className="flex-1 bg-transparent text-sm text-slate-300 focus:outline-none placeholder-slate-600"
                 />
               </div>
            </div>

            <div className="mt-8">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Activity & Updates</label>
              
              <div className="flex items-start space-x-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">YO</div>
                <div className="flex-1">
                   <textarea 
                    value={newUpdate}
                    onChange={e => setNewUpdate(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), addUpdate())}
                    placeholder="Write an update... (Ctrl + Enter to post)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 focus:border-primary/50 focus:outline-none resize-none min-h-[80px]"
                   />
                   <div className="flex justify-end mt-2">
                     <button onClick={addUpdate} className="bg-primary hover:bg-primaryDark text-white px-4 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1">
                        <Send size={12} />
                        <span>Post Update</span>
                     </button>
                   </div>
                </div>
              </div>

              <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-0 before:w-px before:bg-slate-800">
                {formData.updates?.map(update => (
                  <div key={update.id} className="relative pl-10">
                     <div className="absolute left-2.5 top-1 w-3 h-3 rounded-full bg-slate-700 border-2 border-surface"></div>
                     <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-bold text-slate-300">User</span>
                        <span className="text-[10px] text-slate-500">{new Date(update.timestamp).toLocaleString()}</span>
                     </div>
                     <div className="bg-slate-800/40 p-3 rounded-lg border border-slate-800/50">
                        <p className="text-sm text-slate-300 whitespace-pre-wrap">{update.text}</p>
                     </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Settings Column */}
          <div className="w-1/3 bg-surfaceHighlight/10 p-6 space-y-6">
             {/* Status */}
             <div>
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Status</label>
               <div className="relative">
                 <select 
                   value={formData.status}
                   onChange={e => setFormData({ ...formData, status: e.target.value as Status })}
                   className="w-full appearance-none bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 focus:border-primary focus:outline-none cursor-pointer"
                 >
                   {Object.values(Status).map(s => <option key={s} value={s}>{s}</option>)}
                 </select>
                 <ChevronDown size={14} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
               </div>
             </div>

             {/* Priority */}
             <div>
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Priority</label>
               <div className="flex space-x-2">
                 {[Priority.Low, Priority.Medium, Priority.High, Priority.Critical].map(p => (
                   <button
                    key={p}
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={`flex-1 py-2 rounded-lg text-xs font-medium border transition-all ${
                      formData.priority === p 
                      ? p === Priority.Critical ? 'bg-danger/20 border-danger text-danger' : 
                        p === Priority.High ? 'bg-warning/20 border-warning text-warning' :
                        'bg-primary/20 border-primary text-primary'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                   >
                     {p}
                   </button>
                 ))}
               </div>
             </div>

             {/* Due Date */}
             <div>
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Due Date</label>
               <div className="relative">
                 <input 
                   type="date"
                   value={formData.dueDate}
                   onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                   className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 focus:border-primary focus:outline-none"
                 />
               </div>
             </div>

             {/* Project */}
             <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Project ID</label>
                <input 
                  type="text"
                  value={formData.projectId}
                  onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 focus:border-primary focus:outline-none"
                />
             </div>

             {/* Recurrence */}
             <div>
               <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Recurrence</label>
               <div className="relative">
                 <select 
                   value={formData.recurrence}
                   onChange={e => setFormData({ ...formData, recurrence: e.target.value as RecurrenceType })}
                   className="w-full appearance-none bg-slate-900 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2.5 focus:border-primary focus:outline-none cursor-pointer"
                 >
                   {Object.values(RecurrenceType).map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
                 <RotateCw size={14} className="absolute right-3 top-3 text-slate-500 pointer-events-none" />
               </div>
             </div>

             {/* Actions */}
             <div className="pt-6 border-t border-slate-800 flex flex-col space-y-3">
               <button 
                 onClick={handleSave}
                 className="w-full bg-primary hover:bg-primaryDark text-white py-3 rounded-lg font-semibold shadow-lg shadow-primary/25 transition-all transform hover:scale-[1.02]">
                 {task ? 'Save Changes' : 'Create Task'}
               </button>
               {task && (
                 <button 
                   onClick={() => { deleteTask(task.id); onClose(); }}
                   className="w-full bg-transparent border border-danger/30 text-danger hover:bg-danger/10 py-2 rounded-lg text-sm font-medium transition-colors">
                   Delete Task
                 </button>
               )}
             </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskModal;