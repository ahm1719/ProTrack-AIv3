import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Task, Observation, AppSettings, Priority, Status, RecurrenceType, ObservationStatus } from '../types';

interface DataContextType {
  tasks: Task[];
  observations: Observation[];
  settings: AppSettings;
  addTask: (task: Task) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  addObservation: (obs: Observation) => void;
  updateObservation: (obs: Observation) => void;
  deleteObservation: (id: string) => void;
  updateSettings: (settings: AppSettings) => void;
  isOffline: boolean;
  purgeData: (days: number) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const SEED_TASKS: Task[] = [
  {
    id: 't-1',
    displayId: 'PRJ-101',
    projectId: 'General',
    title: 'Review Quarterly Goals',
    description: 'Check progress on Q3 OKRs.',
    dueDate: new Date().toISOString().split('T')[0],
    priority: Priority.High,
    status: Status.Todo,
    recurrence: RecurrenceType.None,
    subtasks: [],
    updates: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-2',
    displayId: 'DEV-404',
    projectId: 'Platform',
    title: 'Fix Sync Latency',
    description: 'Investigate slow response times in the legacy module.',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    priority: Priority.Critical,
    status: Status.InProgress,
    recurrence: RecurrenceType.None,
    subtasks: [{ id: 'st-1', title: 'Check logs', isCompleted: true }, { id: 'st-2', title: 'Refactor DB query', isCompleted: false }],
    updates: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [observations, setObservations] = useState<Observation[]>([]);
  const [settings, setSettings] = useState<AppSettings>({
    userName: 'User',
    theme: 'dark',
    notificationsEnabled: true,
    dataRetentionDays: 90
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  // Load Initial Data
  useEffect(() => {
    const loadData = () => {
      const storedTasks = localStorage.getItem('protrack_tasks');
      const storedObs = localStorage.getItem('protrack_obs');
      const storedSettings = localStorage.getItem('protrack_settings');

      if (storedTasks) setTasks(JSON.parse(storedTasks));
      else setTasks(SEED_TASKS);

      if (storedObs) setObservations(JSON.parse(storedObs));
      if (storedSettings) setSettings(JSON.parse(storedSettings));
    };

    loadData();

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Persistence Helper
  const persist = useCallback(() => {
    localStorage.setItem('protrack_tasks', JSON.stringify(tasks));
    localStorage.setItem('protrack_obs', JSON.stringify(observations));
    localStorage.setItem('protrack_settings', JSON.stringify(settings));
    // Here we would trigger the Cloud Sync Promise
  }, [tasks, observations, settings]);

  useEffect(() => {
    persist();
  }, [tasks, observations, settings, persist]);

  // Task Actions
  const addTask = (task: Task) => {
    setTasks(prev => [task, ...prev]);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  // Observation Actions
  const addObservation = (obs: Observation) => {
    setObservations(prev => [obs, ...prev]);
  };

  const updateObservation = (updatedObs: Observation) => {
    setObservations(prev => prev.map(o => o.id === updatedObs.id ? updatedObs : o));
  };

  const deleteObservation = (id: string) => {
    setObservations(prev => prev.filter(o => o.id !== id));
  };

  // Settings Actions
  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  const purgeData = (days: number) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    setTasks(prev => prev.filter(t => {
      if (t.status === Status.Done || t.status === Status.Archived) {
        return new Date(t.updatedAt) > cutoffDate;
      }
      return true;
    }));
    
    setObservations(prev => prev.filter(o => {
      if (o.status === ObservationStatus.Resolved) {
        return new Date(o.createdAt) > cutoffDate;
      }
      return true;
    }));
  };

  return (
    <DataContext.Provider value={{
      tasks,
      observations,
      settings,
      addTask,
      updateTask,
      deleteTask,
      addObservation,
      updateObservation,
      deleteObservation,
      updateSettings,
      isOffline,
      purgeData
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("useData must be used within a DataProvider");
  return context;
};