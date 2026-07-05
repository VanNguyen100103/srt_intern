/**
 * Todo List — giao tiếp với REST API /api/tasks
 */
const API_URL = '/api/tasks';
const PAGE_SIZE = 5;

// Trạng thái hiện tại của giao diện
const state = {
    page: 0,
    keyword: '',
    filter: 'all',          // all | pending | completed
    sortBy: 'createdAt',
    direction: 'desc',
    editingId: null,
};

// ===== DOM =====
const taskForm = document.getElementById('task-form');
const formTitle = document.getElementById('form-title');
const titleInput = document.getElementById('title');
const descriptionInput = document.getElementById('description');
const titleError = document.getElementById('title-error');
const descriptionError = document.getElementById('description-error');
const submitBtn = document.getElementById('submit-btn');
const cancelBtn = document.getElementById('cancel-btn');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const taskList = document.getElementById('task-list');
const emptyMessage = document.getElementById('empty-message');
const pagination = document.getElementById('pagination');
const toast = document.getElementById('toast');

// ===== API helpers =====
async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
    });
    if (response.status === 204) return null;

    const data = await response.json().catch(() => null);
    if (!response.ok) {
        const error = new Error(data?.message || 'Đã xảy ra lỗi, vui lòng thử lại');
        error.fieldErrors = data?.errors;
        throw error;
    }
    return data;
}

// ===== Tải và hiển thị danh sách =====
async function loadTasks() {
    const params = new URLSearchParams({
        page: state.page,
        size: PAGE_SIZE,
        sortBy: state.sortBy,
        direction: state.direction,
    });
    if (state.keyword) params.set('keyword', state.keyword);
    if (state.filter === 'completed') params.set('completed', 'true');
    if (state.filter === 'pending') params.set('completed', 'false');

    try {
        const pageData = await apiRequest(`${API_URL}?${params}`);

        // Nếu trang hiện tại rỗng do vừa xóa phần tử cuối, lùi về trang trước
        if (pageData.content.length === 0 && state.page > 0) {
            state.page -= 1;
            return loadTasks();
        }
        renderTasks(pageData.content);
        renderPagination(pageData);
    } catch (err) {
        showToast(err.message, true);
    }
}

function renderTasks(tasks) {
    taskList.innerHTML = '';
    emptyMessage.classList.toggle('hidden', tasks.length > 0);

    tasks.forEach((task) => {
        const item = document.createElement('div');
        item.className = 'task-item' + (task.completed ? ' completed' : '');

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = task.completed;
        checkbox.title = task.completed ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành';
        checkbox.addEventListener('change', () => toggleTask(task.id));

        const content = document.createElement('div');
        content.className = 'task-content';

        const title = document.createElement('div');
        title.className = 'task-title';
        title.textContent = task.title;
        content.appendChild(title);

        if (task.description) {
            const desc = document.createElement('div');
            desc.className = 'task-desc';
            desc.textContent = task.description;
            content.appendChild(desc);
        }

        const meta = document.createElement('div');
        meta.className = 'task-meta';
        meta.textContent = 'Tạo lúc: ' + formatDate(task.createdAt);
        content.appendChild(meta);

        const actions = document.createElement('div');
        actions.className = 'task-actions';

        const editBtn = document.createElement('button');
        editBtn.className = 'icon-btn';
        editBtn.textContent = '✏️ Sửa';
        editBtn.addEventListener('click', () => startEdit(task));

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'icon-btn delete';
        deleteBtn.textContent = '🗑️ Xóa';
        deleteBtn.addEventListener('click', () => deleteTask(task.id, task.title));

        actions.append(editBtn, deleteBtn);
        item.append(checkbox, content, actions);
        taskList.appendChild(item);
    });
}

function renderPagination(pageData) {
    pagination.innerHTML = '';
    if (pageData.totalPages <= 1) return;

    const prevBtn = createPageButton('‹', () => goToPage(state.page - 1));
    prevBtn.disabled = pageData.first;
    pagination.appendChild(prevBtn);

    for (let i = 0; i < pageData.totalPages; i++) {
        const btn = createPageButton(i + 1, () => goToPage(i));
        if (i === state.page) btn.classList.add('active');
        pagination.appendChild(btn);
    }

    const nextBtn = createPageButton('›', () => goToPage(state.page + 1));
    nextBtn.disabled = pageData.last;
    pagination.appendChild(nextBtn);

    const info = document.createElement('span');
    info.className = 'page-info';
    info.textContent = `Tổng: ${pageData.totalElements} công việc`;
    pagination.appendChild(info);
}

function createPageButton(label, onClick) {
    const btn = document.createElement('button');
    btn.className = 'page-btn';
    btn.textContent = label;
    btn.addEventListener('click', onClick);
    return btn;
}

function goToPage(page) {
    state.page = page;
    loadTasks();
}

// ===== Thêm / sửa =====
taskForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    clearFormErrors();

    const payload = {
        title: titleInput.value.trim(),
        description: descriptionInput.value.trim(),
    };

    // Kiểm tra phía client trước khi gửi
    if (!payload.title) {
        titleError.textContent = 'Tiêu đề không được để trống';
        titleInput.focus();
        return;
    }

    try {
        if (state.editingId) {
            await apiRequest(`${API_URL}/${state.editingId}`, {
                method: 'PUT',
                body: JSON.stringify(payload),
            });
            showToast('Đã cập nhật công việc ✔');
        } else {
            await apiRequest(API_URL, {
                method: 'POST',
                body: JSON.stringify(payload),
            });
            state.page = 0;
            showToast('Đã thêm công việc mới ✔');
        }
        resetForm();
        loadTasks();
    } catch (err) {
        if (err.fieldErrors) {
            if (err.fieldErrors.title) titleError.textContent = err.fieldErrors.title;
            if (err.fieldErrors.description) descriptionError.textContent = err.fieldErrors.description;
        } else {
            showToast(err.message, true);
        }
    }
});

function startEdit(task) {
    state.editingId = task.id;
    titleInput.value = task.title;
    descriptionInput.value = task.description || '';
    formTitle.textContent = 'Chỉnh sửa công việc';
    submitBtn.textContent = 'Lưu thay đổi';
    cancelBtn.classList.remove('hidden');
    clearFormErrors();
    titleInput.focus();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

cancelBtn.addEventListener('click', resetForm);

function resetForm() {
    state.editingId = null;
    taskForm.reset();
    formTitle.textContent = 'Thêm công việc mới';
    submitBtn.textContent = 'Thêm công việc';
    cancelBtn.classList.add('hidden');
    clearFormErrors();
}

function clearFormErrors() {
    titleError.textContent = '';
    descriptionError.textContent = '';
}

// ===== Toggle / xóa =====
async function toggleTask(id) {
    try {
        await apiRequest(`${API_URL}/${id}/toggle`, { method: 'PATCH' });
        loadTasks();
    } catch (err) {
        showToast(err.message, true);
        loadTasks();
    }
}

async function deleteTask(id, title) {
    if (!confirm(`Bạn có chắc muốn xóa công việc "${title}"?`)) return;
    try {
        await apiRequest(`${API_URL}/${id}`, { method: 'DELETE' });
        showToast('Đã xóa công việc ✔');
        loadTasks();
    } catch (err) {
        showToast(err.message, true);
    }
}

// ===== Tìm kiếm (debounce), lọc, sắp xếp =====
let searchTimer;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
        state.keyword = searchInput.value.trim();
        state.page = 0;
        loadTasks();
    }, 300);
});

document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        state.filter = btn.dataset.filter;
        state.page = 0;
        loadTasks();
    });
});

sortSelect.addEventListener('change', () => {
    const [sortBy, direction] = sortSelect.value.split(',');
    state.sortBy = sortBy;
    state.direction = direction;
    state.page = 0;
    loadTasks();
});

// ===== Toast =====
let toastTimer;
function showToast(message, isError = false) {
    toast.textContent = message;
    toast.className = 'toast' + (isError ? ' error' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.add('hidden'), 3000);
}

function formatDate(isoString) {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleString('vi-VN', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit',
    });
}

// Khởi động
loadTasks();
