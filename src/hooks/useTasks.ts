import { useEffect, useRef, useState, useCallback } from 'react';
import type { FilterStatus, Task } from '../types';

const API_URL = `${import.meta.env.VITE_API_URL}/tasks`;


const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [meta, setMeta] = useState({ total: 0, completed: 0, active: 0 });

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const handleSetSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(q), 400);
  }, []);

  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (debouncedSearch) params.append('search', debouncedSearch);

      const res = await fetch(`${API_URL}?${params}`, {
        headers: { 'Accept': 'application/json' },
      });
      const json = await res.json();
      setTasks(json.data);
      setMeta(json.meta);
    } catch {
      setError('Gagal mengambil data');
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, debouncedSearch]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const addTask = async (data: { title: string; description?: string }) => {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: BASE_HEADERS,
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) fetchTasks();
      return json;
    } catch {
      return { success: false };
    }
  };

  const toggleTask = async (id: number) => {
    try {
      const res = await fetch(`${API_URL}/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Accept': 'application/json' },
      });
      const json = await res.json();
      fetchTasks();
      return { success: true, is_completed: json.data?.is_completed as boolean };
    } catch {
      return { success: false, is_completed: false };
    }
  };

  const editTask = async (id: number, data: Partial<Task>) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PATCH',
        headers: BASE_HEADERS,
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (json.success) fetchTasks();
      return json;
    } catch {
      return { success: false };
    }
  };

  const removeTask = async (id: number) => {
    const prev = tasks;
    setTasks(t => t.filter(task => task.id !== id));
    try {
      await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' },
      });
      fetchTasks();
      return true;
    } catch {
      setTasks(prev); 
      return false;
    }
  };

  return {
    tasks, isLoading, error, meta,
    filterStatus, setFilterStatus,
    searchQuery, setSearchQuery: handleSetSearch,
    addTask, toggleTask, editTask, removeTask,
  };
}