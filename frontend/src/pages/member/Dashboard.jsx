import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import ProgressBar from '../../components/ProgressBar';
import StatCard from '../../components/StatCard';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const priorityColors = { low: 'green', medium: 'yellow', high: 'red' };
const statusColors   = { todo: 'gray', 'in-progress': 'blue', done: 'green' };
const statusLabels   = { todo: 'To Do', 'in-progress': 'In Progress', done: 'Done' };

const MemberDashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('all');
  const [updating, setUpdating] = useState(null);

  const fetchTasks = async () => {
    try {
      const res = await API.get('/tasks/my');
      setTasks(res.data.tasks);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleStatusChange = async (taskId, newStatus) => {
    setUpdating(taskId);
    try {
      const res = await API.patch(`/tasks/${taskId}/status`, { status: newStatus });
      setTasks((prev) => prev.map((t) => t._id === taskId ? res.data.task : t));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const totalTasks       = tasks.length;
  const doneTasks        = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks  = tasks.filter((t) => t.status === 'in-progress').length;
  const todoTasks        = tasks.filter((t) => t.status === 'todo').length;
  const overallProgress  = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const projectGroups = tasks.reduce((acc, task) => {
    const id   = task.project?._id || 'unassigned';
    const name = task.project?.name || 'Unassigned';
    if (!acc[id]) acc[id] = { name, tasks: [] };
    acc[id].tasks.push(task);
    return acc;
  }, {});

  const filteredTasks = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  const tabs = [
    { key: 'all',         label: 'All',         count: totalTasks },
    { key: 'todo',        label: 'To Do',       count: todoTasks },
    { key: 'in-progress', label: 'In Progress', count: inProgressTasks },
    { key: 'done',        label: 'Done',        count: doneTasks },
  ];

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

  const isOverdue = (task) =>
    task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">My Tasks</h1>
            <p className="page-subtitle">Hello, {user?.name}! Here's your work overview.</p>
          </div>
        </header>

        {loading ? (
          <div className="loading-screen"><div className="spinner" /></div>
        ) : (
          <>
            {/* ── Stats ── */}
            <section className="stats-grid">
              <StatCard icon="📋" label="Total Assigned" value={totalTasks}       color="purple" />
              <StatCard icon="✅" label="Completed"      value={doneTasks}        color="green"  sub={`${overallProgress}% done`} />
              <StatCard icon="⏳" label="In Progress"    value={inProgressTasks}  color="blue" />
              <StatCard icon="📌" label="To Do"          value={todoTasks}        color="orange" />
            </section>

            {/* ── Overall Progress ── */}
            {totalTasks > 0 && (
              <section className="section">
                <div className="overall-progress-card">
                  <div className="overall-progress-header">
                    <h2>Overall Progress</h2>
                    <span className="progress-percent">{overallProgress}%</span>
                  </div>
                  <ProgressBar value={overallProgress} showLabel={false} color="gradient" />
                  <p style={{ fontSize: 12, color: 'var(--txt2)', marginTop: 8 }}>
                    {doneTasks} of {totalTasks} tasks completed
                  </p>
                </div>
              </section>
            )}

            {/* ── Per-project Progress ── */}
            {Object.keys(projectGroups).length > 0 && (
              <section className="section">
                <h2 className="section-title">Progress by Project</h2>
                <div className="project-progress-list">
                  {Object.entries(projectGroups).map(([id, group]) => {
                    const done  = group.tasks.filter((t) => t.status === 'done').length;
                    const total = group.tasks.length;
                    const pct   = total ? Math.round((done / total) * 100) : 0;
                    return (
                      <div key={id} className="project-progress-card">
                        <div className="project-progress-header">
                          <h4 className="project-name">{group.name}</h4>
                          <span style={{ fontSize: 12, color: 'var(--txt2)' }}>{done}/{total} done</span>
                        </div>
                        <ProgressBar value={pct} />
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* ── My Tasks List ── */}
            <section className="section">
              <div className="section-header-row">
                <h2 className="section-title" style={{ margin: 0 }}>My Tasks</h2>
                <div className="filter-tabs">
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
                      onClick={() => setFilter(tab.key)}
                    >
                      {tab.label}
                      {tab.count > 0 && (
                        <span className={`tab-count ${filter === tab.key ? 'tab-count--active' : ''}`}>
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="empty-state" style={{ marginTop: 16 }}>
                  <div className="empty-icon">
                    {filter === 'done' ? '🎉' : filter === 'in-progress' ? '⏳' : filter === 'todo' ? '📋' : '✨'}
                  </div>
                  <h3>
                    {filter === 'done'        ? 'No completed tasks yet'
                     : filter === 'in-progress' ? 'Nothing in progress'
                     : filter === 'todo'        ? 'No pending tasks'
                     : 'No tasks assigned yet'}
                  </h3>
                  <p>
                    {filter === 'all'
                      ? 'Your admin will assign tasks to you soon!'
                      : 'Try a different filter to see your tasks.'}
                  </p>
                </div>
              ) : (
                <div className="tasks-grid" style={{ marginTop: 16 }}>
                  {filteredTasks.map((task) => {
                    const overdue  = isOverdue(task);
                    const isUpdating = updating === task._id;

                    return (
                      <div
                        key={task._id}
                        className={`member-task-card ${task.status === 'done' ? 'task-done' : ''} ${overdue ? 'task-overdue' : ''}`}
                        style={{ opacity: isUpdating ? 0.6 : 1, transition: 'opacity 0.2s' }}
                      >
                        {/* Header: priority + status badges */}
                        <div className="task-card-header">
                          <div className="task-badges">
                            <span className={`badge badge--priority-${priorityColors[task.priority]}`}>
                              {task.priority}
                            </span>
                            <span className={`badge badge--status-${statusColors[task.status]}`}>
                              {statusLabels[task.status]}
                            </span>
                            {overdue && <span className="badge badge--overdue">Overdue</span>}
                          </div>
                        </div>

                        {/* Title */}
                        <h4 className="task-title">{task.title}</h4>

                        {/* Description */}
                        {task.description && (
                          <p className="task-description">{task.description}</p>
                        )}

                        {/* Meta */}
                        <div className="task-meta">
                          <span>📁 {task.project?.name || '—'}</span>
                          {task.deadline && (
                            <span style={{ color: overdue ? 'var(--red)' : 'var(--txt2)' }}>
                              📅 {formatDate(task.deadline)}
                            </span>
                          )}
                        </div>

                        {/* Action */}
                        {task.status === 'done' ? (
                          <div className="task-completed-badge">✅ Completed</div>
                        ) : (
                          <button
                            className={`btn-status-toggle ${task.status === 'in-progress' ? 'btn-status-done' : ''}`}
                            onClick={() => handleStatusChange(task._id, task.status === 'todo' ? 'in-progress' : 'done')}
                            disabled={isUpdating}
                          >
                            {isUpdating
                              ? '...'
                              : task.status === 'todo'
                              ? '▶ Start Task'
                              : '✔ Mark as Done'}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default MemberDashboard;
