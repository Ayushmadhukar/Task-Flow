const priorityColors = { low: 'green', medium: 'yellow', high: 'red' };
const statusColors = { todo: 'gray', 'in-progress': 'blue', done: 'green' };

const TaskCard = ({ task, onStatusChange, isAdmin, onEdit, onDelete }) => {
  const handleStatusToggle = () => {
    if (!isAdmin) {
      const nextStatus =
        task.status === 'todo'
          ? 'in-progress'
          : task.status === 'in-progress'
          ? 'done'
          : 'todo';
      onStatusChange(task._id, nextStatus);
    }
  };

  const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';

  return (
    <div className={`task-card ${task.status === 'done' ? 'task-done' : ''} ${isOverdue ? 'task-overdue' : ''}`}>
      <div className="task-card-header">
        <div className="task-badges">
          <span className={`badge badge--priority-${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          <span className={`badge badge--status-${statusColors[task.status]}`}>
            {task.status}
          </span>
          {isOverdue && <span className="badge badge--overdue">overdue</span>}
        </div>
        {isAdmin && (
          <div className="task-actions">
            <button className="icon-btn edit-btn" onClick={() => onEdit(task)} title="Edit">✏️</button>
            <button className="icon-btn delete-btn" onClick={() => onDelete(task._id)} title="Delete">🗑️</button>
          </div>
        )}
      </div>

      <h4 className="task-title">{task.title}</h4>
      {task.description && <p className="task-description">{task.description}</p>}

      <div className="task-meta">
        <span>📁 {task.project?.name || '—'}</span>
        <span>👤 {task.assignedTo?.name || '—'}</span>
        <span>📅 {formatDate(task.deadline)}</span>
      </div>

      {!isAdmin && task.status !== 'done' && (
        <button className="btn-status-toggle" onClick={handleStatusToggle}>
          {task.status === 'todo' ? '▶ Start Task' : '✔ Mark Done'}
        </button>
      )}
      {!isAdmin && task.status === 'done' && (
        <div className="task-completed-badge">✅ Completed</div>
      )}
    </div>
  );
};

export default TaskCard;
