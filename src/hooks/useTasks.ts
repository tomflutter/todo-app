import { useEffect, useRef, useState, useCallback } from 'react';
import type { FilterStatus, Task } from '../types';

const API_URL = `${import.meta.env.VITE_API_URL}/tasks`;


const BASE_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',   // ← fix: Laravel return JSON, bukan HTML
};

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [meta, setMeta] = useState({ total: 0, completed: 0, active: 0 });

  // fix: debounce search dengan useRef
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
      setError(null); // ← fix: reset error sebelum fetch baru

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

  // fix: return status baru dari API supaya toast benar
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
      if (json.success) fetchTasks(); // ← fix: hanya fetch jika berhasil
      return json;
    } catch {
      return { success: false };
    }
  };

  // fix: optimistic delete — hapus dari state dulu, rollback jika gagal
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
      setTasks(prev); // rollback
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