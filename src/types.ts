export interface Task {
  id: number;
  title: string;
  description?: string | null;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export type FilterStatus =
  | 'all'
  | 'active'
  | 'completed';