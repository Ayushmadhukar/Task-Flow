import { useEffect, useState } from 'react';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import ProgressBar from '../../components/ProgressBar';
import API from '../../api/axios';

const AdminDashboard = () => {
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, tRes, mRes] = await Promise.all([
          API.get('/projects'),
          API.get('/tasks'),
          API.get('/members'),
        ]);
        setProjects(pRes.data.projects);
        setTasks(tRes.data.tasks);
        setMembers(mRes.data.members);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === 'done').length;
  const inProgressTasks = tasks.filter((t) => t.status === 'in-progress').length;
  const todoTasks = tasks.filter((t) => t.status === 'todo').length;

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <header className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Welcome back, Admin! Here's your overview.</p>
          </div>
        </header>

        {loading ? (
          <div className="loading-screen">
            <div className="spinner" />
          </div>
        ) : (
          <>
            <section className="stats-grid">
              <StatCard icon="📁" label="Total Projects" value={projects.length} color="purple" />
              <StatCard icon="✅" label="Tasks Done" value={doneTasks} color="green" sub={`of ${totalTasks} total`} />
              <StatCard icon="⏳" label="In Progress" value={inProgressTasks} color="blue" />
              <StatCard icon="📋" label="To Do" value={todoTasks} color="orange" />
              <StatCard icon="👥" label="Members" value={members.length} color="pink" />
            </section>

            <section className="section">
              <h2 className="section-title">Project Progress</h2>
              <div className="projects-list">
                {projects.length === 0 ? (
                  <div className="empty-state">
                    <p>📁 No projects yet. Create your first project!</p>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div key={project._id} className="project-progress-card">
                      <div className="project-progress-header">
                        <div>
                          <h4 className="project-name">{project.name}</h4>
                          <span className={`badge badge--status-${project.status === 'active' ? 'blue' : project.status === 'completed' ? 'green' : 'gray'}`}>
                            {project.status}
                          </span>
                        </div>
                        <span className="project-tasks-count">
                          {project.taskStats.done}/{project.taskStats.total} tasks
                        </span>
                      </div>
                      <ProgressBar value={project.taskStats.progress} />
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="section">
              <h2 className="section-title">Recent Tasks</h2>
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Task</th>
                      <th>Project</th>
                      <th>Assigned To</th>
                      <th>Priority</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.slice(0, 8).map((task) => (
                      <tr key={task._id}>
                        <td>{task.title}</td>
                        <td>{task.project?.name || '—'}</td>
                        <td>{task.assignedTo?.name || '—'}</td>
                        <td>
                          <span className={`badge badge--priority-${task.priority === 'high' ? 'red' : task.priority === 'medium' ? 'yellow' : 'green'}`}>
                            {task.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge--status-${task.status === 'done' ? 'green' : task.status === 'in-progress' ? 'blue' : 'gray'}`}>
                            {task.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {tasks.length === 0 && (
                      <tr><td colSpan={5} className="empty-cell">No tasks yet</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
