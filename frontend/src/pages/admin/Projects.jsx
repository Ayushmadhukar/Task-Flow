import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import Modal from '../../components/Modal';
import ProgressBar from '../../components/ProgressBar';
import API from '../../api/axios';

const defaultForm = { name: '', description: '', status: 'active', deadline: '' };

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProjects = async () => {
    try {
      const res = await API.get('/projects');
      setProjects(res.data.projects);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const openCreate = () => {
    setEditProject(null);
    setForm(defaultForm);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (project) => {
    setEditProject(project);
    setForm({
      name: project.name,
      description: project.description || '',
      status: project.status,
      deadline: project.deadline ? project.deadline.split('T')[0] : '',
    });
    setError('');
    setModalOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      if (editProject) {
        await API.put(`/projects/${editProject._id}`, form);
      } else {
        await API.post('/projects', form);
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Failed to save project.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">Projects</h1>
            <p className="page-subtitle">Create and manage all your projects</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ New Project</button>
        </header>

        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : (
          <div className="projects-grid">
            {projects.length === 0 ? (
              <div className="empty-state full-width">
                <div className="empty-icon">📁</div>
                <h3>No projects yet</h3>
                <p>Create your first project to get started</p>
                <button className="btn btn-primary" onClick={openCreate}>Create Project</button>
              </div>
            ) : (
              projects.map((project) => (
                <div key={project._id} className="project-card">
                  <div className="project-card-header">
                    <h3 className="project-card-name">{project.name}</h3>
                    <div className="project-card-actions">
                      <button className="icon-btn edit-btn" onClick={() => openEdit(project)}>✏️</button>
                      <button className="icon-btn delete-btn" onClick={() => handleDelete(project._id)}>🗑️</button>
                    </div>
                  </div>

                  {project.description && <p className="project-card-desc">{project.description}</p>}

                  <div className="project-card-meta">
                    <span className={`badge badge--status-${project.status === 'active' ? 'blue' : project.status === 'completed' ? 'green' : 'gray'}`}>
                      {project.status}
                    </span>
                    <span className="meta-text">📅 {formatDate(project.deadline)}</span>
                  </div>

                  <div className="project-progress-section">
                    <div className="progress-header">
                      <span>Progress</span>
                      <span>{project.taskStats.done}/{project.taskStats.total} tasks</span>
                    </div>
                    <ProgressBar value={project.taskStats.progress} />
                  </div>

                  <div className="project-footer">
                    <span className="meta-text">By {project.createdBy?.name}</span>
                    <span className="meta-text">{new Date(project.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editProject ? 'Edit Project' : 'New Project'}>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit} className="modal-form">
            <div className="form-group">
              <label>Project Name *</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Enter project name"
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
                placeholder="Project description..."
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select name="status" value={form.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="on-hold">On Hold</option>
                  <option value="completed">Completed</option>
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
                {saving ? <span className="btn-spinner" /> : editProject ? 'Update' : 'Create'}
              </button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default Projects;
