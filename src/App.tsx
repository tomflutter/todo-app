import { useState, useCallback, useRef } from 'react';
import type { FilterStatus, Task } from './types';
import { useTasks } from './hooks/useTasks';

interface ToastItem {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const counter = useRef(0); // ← fix: useRef bukan let

  const show = useCallback((message: string, type: ToastItem['type'] = 'success') => {
    const id = ++counter.current; // ← pakai counter.current
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  return { toasts, show };
}


function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div style={{ position: 'fixed', top: '1.5rem', right: '1.5rem', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          style={{
            padding: '0.875rem 1.25rem',
            borderRadius: '10px',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: 500,
            maxWidth: '320px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            background: toast.type === 'success' ? '#22c55e'
              : toast.type === 'error' ? '#ef4444'
                : '#6366f1',
            animation: 'slideIn 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
          }}
        >
          <span>{toast.type === 'success' ? '✓' : toast.type === 'error' ? '✕' : 'ℹ'}</span>
          {toast.message}
        </div>
      ))}
    </div>
  );
}


interface AddTaskFormProps {
  onAdd: (title: string, description: string) => Promise<boolean>;
}

function AddTaskForm({ onAdd }: AddTaskFormProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const handleSubmit = async () => {
    if (!title.trim()) {
      setErrors({ title: 'Judul tugas wajib diisi.' });
      return;
    }
    setErrors({});
    setIsLoading(true);
    const success = await onAdd(title.trim(), description.trim());
    if (success) {
      setTitle('');
      setDescription('');
    }
    setIsLoading(false);
  };

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>
        <span style={styles.cardIcon}>✏️</span>
        Tambah Tugas Baru
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        <div>
          <input
            type="text"
            placeholder="Judul tugas *"
            value={title}
            onChange={e => { setTitle(e.target.value); setErrors({}); }}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{ ...styles.input, borderColor: errors.title ? '#ef4444' : '#e2e8f0' }}
            disabled={isLoading}
          />
          {errors.title && (
            <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.title}</p>
          )}
        </div>
        <textarea
          placeholder="Deskripsi (opsional)"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={2}
          style={{ ...styles.input, resize: 'vertical', minHeight: '70px' }}
          disabled={isLoading}
        />
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          style={styles.btnPrimary}
        >
          {isLoading ? '⏳ Menyimpan...' : '+ Tambah Tugas'}
        </button>
      </div>
    </div>
  );
}


interface EditModalProps {
  task: Task;
  onSave: (id: number, title: string, description: string) => Promise<boolean>;
  onClose: () => void;
}

function EditModal({ task, onSave, onClose }: EditModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ title?: string }>({});

  const handleSave = async () => {
    if (!title.trim()) {
      setErrors({ title: 'Judul tugas wajib diisi.' });
      return;
    }
    setErrors({});
    setIsLoading(true);
    const success = await onSave(task.id, title.trim(), description.trim());
    if (success) onClose();
    setIsLoading(false);
  };

  return (
    <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.1rem', fontWeight: 700 }}>
            ✏️ Edit Tugas
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div>
            <input
              type="text"
              placeholder="Judul tugas *"
              value={title}
              onChange={e => { setTitle(e.target.value); setErrors({}); }}
              style={{ ...styles.input, borderColor: errors.title ? '#ef4444' : '#e2e8f0' }}
              autoFocus
            />
            {errors.title && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.25rem' }}>{errors.title}</p>}
          </div>
          <textarea
            placeholder="Deskripsi (opsional)"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            style={{ ...styles.input, resize: 'vertical' }}
          />
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={onClose} style={styles.btnSecondary} disabled={isLoading}>Batal</button>
            <button onClick={handleSave} style={styles.btnPrimary} disabled={isLoading}>
              {isLoading ? '⏳ Menyimpan...' : '💾 Simpan'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


interface TaskItemProps {
  task: Task;
  onToggle: (id: number) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

function TaskItem({ task, onToggle, onEdit, onDelete }: TaskItemProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Hapus tugas "${task.title}"?`)) return;
    setIsDeleting(true);
    onDelete(task.id);
  };

  return (
    <div style={{
      ...styles.taskItem,
      opacity: isDeleting ? 0.5 : 1,
      background: task.is_completed ? '#f8faff' : '#fff',
      borderLeft: `4px solid ${task.is_completed ? '#22c55e' : '#6366f1'}`,
    }}>
      {/* Checkbox + Konten */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', flex: 1, minWidth: 0 }}>
        <button
          onClick={() => onToggle(task.id)}
          title={task.is_completed ? 'Tandai belum selesai' : 'Tandai selesai'}
          style={{
            width: '22px',
            height: '22px',
            minWidth: '22px',
            borderRadius: '6px',
            border: `2px solid ${task.is_completed ? '#22c55e' : '#cbd5e1'}`,
            background: task.is_completed ? '#22c55e' : 'transparent',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '13px',
            color: '#fff',
            marginTop: '2px',
            transition: 'all 0.2s ease',
          }}
        >
          {task.is_completed && '✓'}
        </button>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontWeight: 600,
            color: task.is_completed ? '#94a3b8' : '#1e293b',
            textDecoration: task.is_completed ? 'line-through' : 'none',
            fontSize: '0.95rem',
            wordBreak: 'break-word',
          }}>
            {task.title}
          </p>
          {task.description && (
            <p style={{
              margin: '0.25rem 0 0',
              fontSize: '0.82rem',
              color: '#94a3b8',
              textDecoration: task.is_completed ? 'line-through' : 'none',
              wordBreak: 'break-word',
            }}>
              {task.description}
            </p>
          )}
          <p style={{ margin: '0.35rem 0 0', fontSize: '0.75rem', color: '#cbd5e1' }}>
            {new Date(task.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* Tombol Aksi */}
      <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
        {task.is_completed && (
          <span style={styles.badge}>Selesai ✓</span>
        )}
        <button
          onClick={() => onEdit(task)}
          title="Edit tugas"
          style={styles.btnIcon}
        >
          ✏️
        </button>
        <button
          onClick={handleDelete}
          title="Hapus tugas"
          style={{ ...styles.btnIcon, color: '#ef4444' }}
          disabled={isDeleting}
        >
          🗑️
        </button>
      </div>
    </div>
  );
}


export default function App() {
  const { toasts, show: showToast } = useToast();
  const {
    tasks, isLoading, error, meta,
    filterStatus, setFilterStatus,
    searchQuery, setSearchQuery,
    addTask, toggleTask, editTask, removeTask,
  } = useTasks();

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Handle tambah tugas
  const handleAdd = async (title: string, description: string): Promise<boolean> => {
    const result = await addTask({ title, description: description || undefined });
    if (result.success) {
      showToast('✓ Tugas berhasil ditambahkan!', 'success');
    } else {
      showToast('Gagal menambahkan tugas.', 'error');
    }
    return result.success;
  };

  const handleToggle = async (id: number) => {
    const result = await toggleTask(id);
    if (result.success) {
      const msg = result.is_completed
        ? 'Tugas ditandai selesai! ✓'
        : 'Tugas ditandai belum selesai.';
      showToast(msg, 'success');
    } else {
      showToast('Gagal mengubah status tugas.', 'error');
    }
  };

  const handleSaveEdit = async (id: number, title: string, description: string): Promise<boolean> => {
    const result = await editTask(id, { title, description: description || null });
    if (result.success) {
      showToast('Tugas berhasil diperbarui.', 'success');
    } else {
      showToast('Gagal memperbarui tugas.', 'error');
    }
    return result.success;
  };

  const handleDelete = async (id: number) => {
    const success = await removeTask(id);
    if (success) {
      showToast('Tugas berhasil dihapus.', 'info');
    } else {
      showToast('Gagal menghapus tugas.', 'error');
    }
  };

  const filters: { label: string; value: FilterStatus }[] = [
    { label: `Semua (${meta.total})`, value: 'all' },
    { label: `Aktif (${meta.active})`, value: 'active' },
    { label: `Selesai (${meta.completed})`, value: 'completed' },
  ];

  return (
    <div style={styles.root}>
      <ToastContainer toasts={toasts} />

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.logo}>📋</div>
          <div>
            <h1 style={styles.title}>TodoMaster</h1>
            <p style={styles.subtitle}>Kelola tugas Anda dengan mudah</p>
          </div>
        </div>
        {/* Stats */}
        <div style={styles.statsBar}>
          <div style={styles.statItem}><span style={styles.statNum}>{meta.total}</span><span style={styles.statLabel}>Total</span></div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}><span style={{ ...styles.statNum, color: '#f59e0b' }}>{meta.active}</span><span style={styles.statLabel}>Aktif</span></div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}><span style={{ ...styles.statNum, color: '#22c55e' }}>{meta.completed}</span><span style={styles.statLabel}>Selesai</span></div>
        </div>
      </div>

      <div style={styles.container}>
        {/* Form Tambah */}
        <AddTaskForm onAdd={handleAdd} />

        {/* Kontrol: Pencarian + Filter */}
        <div style={styles.card}>
          <input
            type="text"
            placeholder="🔍 Cari tugas berdasarkan judul..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={styles.input}
          />
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.875rem', flexWrap: 'wrap' }}>
            {filters.map(f => (
              <button
                key={f.value}
                onClick={() => setFilterStatus(f.value)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '20px',
                  border: '2px solid',
                  borderColor: filterStatus === f.value ? '#6366f1' : '#e2e8f0',
                  background: filterStatus === f.value ? '#6366f1' : 'transparent',
                  color: filterStatus === f.value ? '#fff' : '#64748b',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Daftar Tugas */}
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            <span style={styles.cardIcon}>📝</span>
            Daftar Tugas
          </h2>

          {error && (
            <div style={{ padding: '1rem', background: '#fef2f2', borderRadius: '8px', color: '#ef4444', marginBottom: '1rem', fontSize: '0.9rem' }}>
              ⚠️ {error}
            </div>
          )}

          {isLoading ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
              <p style={{ margin: 0 }}>Memuat tugas...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2.5rem', color: '#94a3b8' }}>
              <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>
                {searchQuery ? '🔍' : filterStatus === 'completed' ? '🎉' : '📋'}
              </div>
              <p style={{ margin: 0, fontSize: '0.95rem' }}>
                {searchQuery
                  ? `Tidak ada tugas dengan kata kunci "${searchQuery}"`
                  : filterStatus === 'completed'
                    ? 'Belum ada tugas yang selesai.'
                    : filterStatus === 'active'
                      ? 'Semua tugas sudah selesai! 🎉'
                      : 'Belum ada tugas. Tambahkan tugas pertama Anda!'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {tasks.map(task => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={handleToggle}
                  onEdit={setEditingTask}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Edit */}
      {editingTask && (
        <EditModal
          task={editingTask}
          onSave={handleSaveEdit}
          onClose={() => setEditingTask(null)}
        />
      )}
    </div>
  );
}


const styles: Record<string, React.CSSProperties> = {
  root: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: "'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  header: {
    background: 'rgba(255,255,255,0.12)',
    backdropFilter: 'blur(20px)',
    borderBottom: '1px solid rgba(255,255,255,0.2)',
    padding: '1.5rem 0',
  },
  headerInner: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  logo: { fontSize: '2.5rem' },
  title: { margin: 0, color: '#fff', fontSize: '1.8rem', fontWeight: 800, letterSpacing: '-0.5px' },
  subtitle: { margin: 0, color: 'rgba(255,255,255,0.75)', fontSize: '0.9rem' },
  statsBar: {
    maxWidth: '700px',
    margin: '1rem auto 0',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  statNum: { fontSize: '1.4rem', fontWeight: 800, color: '#fff', lineHeight: 1 },
  statLabel: { fontSize: '0.72rem', color: 'rgba(255,255,255,0.7)', textTransform: 'uppercase', letterSpacing: '0.5px' },
  statDivider: { width: '1px', height: '28px', background: 'rgba(255,255,255,0.3)' },
  container: {
    maxWidth: '700px',
    margin: '0 auto',
    padding: '1.75rem 1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
  },
  cardTitle: {
    margin: '0 0 1.25rem',
    fontSize: '1rem',
    fontWeight: 700,
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  cardIcon: { fontSize: '1.15rem' },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e2e8f0',
    borderRadius: '10px',
    fontSize: '0.95rem',
    color: '#1e293b',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s ease',
    fontFamily: 'inherit',
  },
  btnPrimary: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    width: '100%',
    transition: 'opacity 0.2s ease',
  },
  btnSecondary: {
    padding: '0.7rem 1.25rem',
    background: '#f1f5f9',
    color: '#64748b',
    border: 'none',
    borderRadius: '10px',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnIcon: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.3rem',
    borderRadius: '6px',
    color: '#64748b',
  },
  badge: {
    background: '#dcfce7',
    color: '#16a34a',
    fontSize: '0.75rem',
    fontWeight: 700,
    padding: '0.2rem 0.6rem',
    borderRadius: '20px',
    alignSelf: 'center',
    whiteSpace: 'nowrap',
  },
  taskItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.875rem 1rem',
    borderRadius: '10px',
    border: '1px solid #f1f5f9',
    transition: 'all 0.2s ease',
  },
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '1rem',
  },
  modal: {
    background: '#fff',
    borderRadius: '16px',
    padding: '1.5rem',
    width: '100%',
    maxWidth: '480px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
  },
};