import { useEffect } from 'react'

/** Thông báo nổi ở cuối màn hình, tự ẩn sau 3 giây. */
function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(onDone, 3000)
    return () => clearTimeout(timer)
  }, [toast, onDone])

  if (!toast) return null

  return <div className={'toast' + (toast.isError ? ' error' : '')}>{toast.message}</div>
}

export default Toast
