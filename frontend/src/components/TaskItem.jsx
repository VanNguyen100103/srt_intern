function formatDate(isoString) {
  if (!isoString) return ''
  return new Date(isoString).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function TaskItem({ task, onToggle, onEdit, onDelete }) {
  return (
    <div className={'task-item' + (task.completed ? ' completed' : '')}>
      <input
        type="checkbox"
        checked={task.completed}
        title={task.completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
        onChange={() => onToggle(task.id)}
      />

      <div className="task-content">
        <div className="task-title">{task.title}</div>
        {task.description && <div className="task-desc">{task.description}</div>}
        <div className="task-meta">Tạo lúc: {formatDate(task.createdAt)}</div>
      </div>

      <div className="task-actions">
        <button className="icon-btn" onClick={() => onEdit(task)}>
          ✏️ Sửa
        </button>
        <button className="icon-btn delete" onClick={() => onDelete(task)}>
          🗑️ Xóa
        </button>
      </div>
    </div>
  )
}

export default TaskItem
