import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import TaskCard from '../../components/TaskCard';
import API from '../../api/axios';

const defaultForm = {
  title: '', description: '', project: '', assignedTo: '',
  status: 'todo', priority: 'medium', deadline: '',
};

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [filters, setFilters] = useState({ status: '', priority: '', project: '' });

  const fetchData = async () => {
    try {
      const [tRes, pRes, mRes] = await Promise.all([
        API.get('/tasks'),
        API.get('/projects'),
        API.get('/members'),
      ]);
      setTasks(tRes.data.tasks);
      setProjects(pRes.data.projects);
      setMembers(mRes.data.members);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const filteredTasks = tasks.filter((t) => {
    if (filters.status && t.status !== filters.status) return false;
    if (filters.priority && t.priority !== filters.priority) return false;
    if (filters.project && t.project?._id !== filters.project) return false;
    return true;
  });

  const openCreate = () => {
    setEditTask(null);
    setForm(defaultForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      project: task.project?._id || '',
      assignedTo: task.assignedTo?._id || '',
      status: task.status,
      priority: task.priority,
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFilterChange = (e) => setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editTask) {
        await API.put(`/tasks/${editTask._id}`, form);
      } else {
        await API.post('/tasks', form);
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to save task.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${id}`);
      setTasks(tasks.filter((t) => t._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">Tasks</h1>
            <p className="page-subtitle">Assign and track all tasks</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Assign Task</button>
        </header>

        
        <div className="filters-bar">
          <select name="status" value={filters.status} onChange={handleFilterChange} className="filter-select">
            <option value="">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select name="priority" value={filters.priority} onChange={handleFilterChange} className="filter-select">
            <option value="">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <select name="project" value={filters.project} onChange={handleFilterChange} className="filter-select">
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>{p.name}</option>
            ))}
          </select>
          <span className="filter-count">{filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}</span>
        </div>

        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✅</div>
            <h3>No tasks found</h3>
            <p>Try adjusting your filters or create a new task</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {filteredTasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                isAdmin={true}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTask ? 'Edit Task' : 'Assign Task'}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Task Title *</label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="Enter task title"
                required
                minLength={2}
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Task details..."
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Project *</label>
                <select name="project" value={form.project} onChange={handleChange} required>
                  <option value="">Select project</option>
                  {projects.map((p) => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Assign To *</label>
                <select name="assignedTo" value={form.assignedTo} onChange={handleChange} required>
                  <option value="">Select member</option>
                  {members.map((m) => (
                    <option key={m._id} value={m._id}>{m.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={form.priority} onChange={handleChange}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label>Deadline</label>
                <input type="date" name="deadline" value={form.deadline} onChange={handleChange} />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? <span className="btn-spinner" /> : editTask ? 'Update Task' : 'Assign Task'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default Tasks;
