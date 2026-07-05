import { useEffect, useState } from 'react'

/**
 * Form dùng chung cho cả thêm mới và chỉnh sửa.
 * Có kiểm tra dữ liệu phía client + hiển thị lỗi validation từ server.
 */
function TaskForm({ editingTask, onSubmit, onCancel }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [errors, setErrors] = useState({})

  // Khi bấm "Sửa" ở một công việc, đổ dữ liệu của nó vào form
  useEffect(() => {
    setTitle(editingTask?.title ?? '')
    setDescription(editingTask?.description ?? '')
    setErrors({})
  }, [editingTask])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setErrors({})

    const payload = { title: title.trim(), description: description.trim() }
    if (!payload.title) {
      setErrors({ title: 'Tiêu đề không được để trống' })
      return
    }

    try {
      await onSubmit(payload)
      setTitle('')
      setDescription('')
    } catch (err) {
      if (err.fieldErrors) {
        setErrors(err.fieldErrors)
      } else {
        setErrors({ title: err.message })
      }
    }
  }

  return (
    <section className="card">
      <h2>{editingTask ? 'Chỉnh sửa công việc' : 'Thêm công việc mới'}</h2>
      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label htmlFor="title">
            Tiêu đề <span className="required">*</span>
          </label>
          <input
            id="title"
            type="text"
            maxLength={255}
            placeholder="Ví dụ: Hoàn thành báo cáo tuần"
            autoComplete="off"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <small className="error-text">{errors.title}</small>
        </div>

        <div className="form-group">
          <label htmlFor="description">Mô tả</label>
          <textarea
            id="description"
            maxLength={2000}
            rows={2}
            placeholder="Mô tả chi tiết (không bắt buộc)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <small className="error-text">{errors.description}</small>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            {editingTask ? 'Lưu thay đổi' : 'Thêm công việc'}
          </button>
          {editingTask && (
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Hủy
            </button>
          )}
        </div>
      </form>
    </section>
  )
}

export default TaskForm
