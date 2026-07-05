import { useEffect, useState } from 'react'

const FILTERS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'pending', label: 'Đang làm' },
  { value: 'completed', label: 'Hoàn thành' },
]

const SORT_OPTIONS = [
  { value: 'createdAt,desc', label: 'Mới nhất trước' },
  { value: 'createdAt,asc', label: 'Cũ nhất trước' },
  { value: 'title,asc', label: 'Tiêu đề A → Z' },
  { value: 'title,desc', label: 'Tiêu đề Z → A' },
]

/**
 * Thanh công cụ: ô tìm kiếm (có debounce 300ms), nút lọc trạng thái, chọn sắp xếp.
 */
function Toolbar({ query, onChange }) {
  const [searchText, setSearchText] = useState(query.keyword)

  // Debounce: chỉ gọi API sau khi người dùng ngừng gõ 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange((q) =>
        q.keyword === searchText.trim() ? q : { ...q, keyword: searchText.trim(), page: 0 },
      )
    }, 300)
    return () => clearTimeout(timer)
  }, [searchText, onChange])

  return (
    <section className="card toolbar">
      <input
        type="search"
        placeholder="🔍 Tìm kiếm theo tiêu đề hoặc mô tả..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
      />

      <div className="filters">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            className={'filter-btn' + (query.filter === f.value ? ' active' : '')}
            onClick={() => onChange((q) => ({ ...q, filter: f.value, page: 0 }))}
          >
            {f.label}
          </button>
        ))}
      </div>

      <select
        title="Sắp xếp"
        value={`${query.sortBy},${query.direction}`}
        onChange={(e) => {
          const [sortBy, direction] = e.target.value.split(',')
          onChange((q) => ({ ...q, sortBy, direction, page: 0 }))
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </section>
  )
}

export default Toolbar
