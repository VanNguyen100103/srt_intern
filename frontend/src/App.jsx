import { useCallback, useEffect, useState } from 'react'
import * as api from './api'
import TaskForm from './components/TaskForm'
import Toolbar from './components/Toolbar'
import TaskList from './components/TaskList'
import Pagination from './components/Pagination'
import Toast from './components/Toast'

const PAGE_SIZE = 5

function App() {
  // Dữ liệu trang hiện tại từ server
  const [pageData, setPageData] = useState(null)
  // Điều kiện truy vấn: trang, tìm kiếm, lọc, sắp xếp
  const [query, setQuery] = useState({
    page: 0,
    keyword: '',
    filter: 'all', // all | pending | completed
    sortBy: 'createdAt',
    direction: 'desc',
  })
  // Công việc đang được chỉnh sửa (null = đang ở chế độ thêm mới)
  const [editingTask, setEditingTask] = useState(null)
  const [toast, setToast] = useState(null)

  const showToast = (message, isError = false) => setToast({ message, isError })

  const loadTasks = useCallback(async () => {
    try {
      const data = await api.fetchTasks({ ...query, size: PAGE_SIZE })
      // Nếu trang hiện tại rỗng do vừa xóa phần tử cuối, lùi về trang trước
      if (data.content.length === 0 && query.page > 0) {
        setQuery((q) => ({ ...q, page: q.page - 1 }))
        return
      }
      setPageData(data)
    } catch (err) {
      showToast(err.message, true)
    }
  }, [query])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  const handleSubmit = async (payload) => {
    if (editingTask) {
      await api.updateTask(editingTask.id, payload)
      setEditingTask(null)
      showToast('Đã cập nhật công việc ✔')
    } else {
      await api.createTask(payload)
      setQuery((q) => ({ ...q, page: 0 }))
      showToast('Đã thêm công việc mới ✔')
    }
    loadTasks()
  }

  const handleToggle = async (id) => {
    try {
      await api.toggleTask(id)
      loadTasks()
    } catch (err) {
      showToast(err.message, true)
      loadTasks()
    }
  }

  const handleDelete = async (task) => {
    if (!window.confirm(`Bạn có chắc muốn xóa công việc "${task.title}"?`)) return
    try {
      await api.deleteTask(task.id)
      showToast('Đã xóa công việc ✔')
      loadTasks()
    } catch (err) {
      showToast(err.message, true)
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="container">
      <header>
        <h1>📝 Quản lý công việc</h1>
      </header>

      <TaskForm
        editingTask={editingTask}
        onSubmit={handleSubmit}
        onCancel={() => setEditingTask(null)}
      />

      <Toolbar query={query} onChange={setQuery} />

      <TaskList
        tasks={pageData?.content ?? []}
        onToggle={handleToggle}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {pageData && (
        <Pagination
          pageData={pageData}
          onPageChange={(page) => setQuery((q) => ({ ...q, page }))}
        />
      )}

      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  )
}

export default App
