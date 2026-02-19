export enum Priority {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Critical = 'Critical'
}

export enum Status {
  Backlog = 'Backlog',
  Todo = 'Todo',
  InProgress = 'In Progress',
  Review = 'Review',
  Done = 'Done',
  Archived = 'Archived'
}

export enum RecurrenceType {
  None = 'None',
  Daily = 'Daily',
  Weekly = 'Weekly',
  Monthly = 'Monthly'
}

export interface Subtask {
  id: string;
  title: string;
  isCompleted: boolean;
  completedAt?: string;
}

export interface TaskUpdate {
  id: string;
  text: string;
  timestamp: string; // ISO date
  type: 'comment' | 'system' | 'update';
  colorTag?: string; // Hex code for custom tagging
  image?: string; // Base64
}

export interface Task {
  id: string;
  displayId: string;
  projectId: string;
  title: string;
  description: string;
  dueDate: string; // ISO date string (YYYY-MM-DD)
  priority: Priority;
  status: Status;
  recurrence: RecurrenceType;
  subtasks: Subtask[];
  updates: TaskUpdate[];
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export enum ObservationStatus {
  New = 'New',
  Reviewing = 'Reviewing',
  Resolved = 'Resolved'
}

export interface Observation {
  id: string;
  content: string;
  status: ObservationStatus;
  createdAt: string;
  image?: string;
}

export interface AppSettings {
  userName: string;
  aiApiKey?: string;
  theme: 'dark' | 'light';
  notificationsEnabled: boolean;
  dataRetentionDays: number;
}