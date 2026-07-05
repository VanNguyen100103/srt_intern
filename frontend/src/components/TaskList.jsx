import TaskItem from './TaskItem'

function TaskList({ tasks, onToggle, onEdit, onDelete }) {
  if (tasks.length === 0) {
    return <p className="empty-message">Chưa có công việc nào. Hãy thêm công việc đầu tiên! 🎉</p>
  }

  return (
    <section className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggle={onToggle}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </section>
  )
}

export default TaskList
