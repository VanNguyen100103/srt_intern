# 📝 Todo List — Ứng dụng Quản lý công việc

Bài test Intern Developer — SRT GROUP.

Ứng dụng web quản lý công việc (Todo List): backend **RESTful API bằng Java Spring Boot**, giao diện **React (Vite)**, database **PostgreSQL trên Supabase**.

## ✨ Tính năng

- ✅ Hiển thị danh sách công việc
- ✅ Thêm công việc mới
- ✅ Chỉnh sửa công việc
- ✅ Xóa công việc (có xác nhận)
- ✅ Đánh dấu hoàn thành / chưa hoàn thành
- ✅ Tìm kiếm theo tiêu đề hoặc mô tả
- ✅ Lọc theo trạng thái (Tất cả / Đang làm / Hoàn thành)
- ✅ Phân trang và sắp xếp (theo ngày tạo, tiêu đề)
- ✅ Kiểm tra dữ liệu không hợp lệ (validation cả client và server)
- ✅ Giao diện responsive (hỗ trợ mobile)
- ✅ Unit Test (Service + Controller)
- ✅ Docker

## 🛠 Công nghệ sử dụng

| Thành phần | Công nghệ |
|---|---|
| Backend | Java 21+, Spring Boot 4 (RESTful API), Spring Data JPA, Bean Validation |
| Database | PostgreSQL (Supabase cloud) |
| Frontend | React 19 + Vite, Fetch API |
| Build | Maven Wrapper (backend), npm (frontend) |
| Test | JUnit 5, Mockito, MockMvc (mock repository — không cần database) |

## 🚀 Cách chạy dự án

### Yêu cầu

- **JDK 21 trở lên** ([tải tại đây](https://adoptium.net/))
- **Node.js 20 trở lên** (để build giao diện React)
- Không cần cài Maven (dự án đã kèm Maven Wrapper)

### Bước 1 — Build giao diện React

```bash
cd frontend
npm install
npm run build
cd ..
```

> Kết quả build được đưa thẳng vào `backend/src/main/resources/static` — Spring Boot phục vụ luôn giao diện, chỉ cần chạy 1 server.

### Bước 2 — Chạy backend

Đặt mật khẩu database qua biến môi trường rồi chạy:

```powershell
# Windows (PowerShell)
cd backend
$env:SUPABASE_DB_PASSWORD = "mat-khau-database"
.\mvnw.cmd spring-boot:run
```

```bash
# macOS / Linux
cd backend
export SUPABASE_DB_PASSWORD="mat-khau-database"
./mvnw spring-boot:run
```

> Mật khẩu không lưu trong mã nguồn để tránh lộ thông tin khi đưa code lên GitHub.

### Chế độ phát triển frontend (tùy chọn)

Khi sửa giao diện, chạy thêm dev server của Vite (hot reload, tự chuyển tiếp `/api` sang backend):

```bash
cd frontend
npm run dev
# Mo http://localhost:5173
```

Sau đó mở trình duyệt tại: **http://localhost:8080**

> Lần chạy đầu tiên sẽ hơi lâu do Maven Wrapper tự tải Maven và các thư viện.

### Chạy bằng Docker

```bash
docker build -t todo-list .
docker run -p 8080:8080 -e SUPABASE_DB_PASSWORD="mat-khau-database" todo-list
```

### Chạy Unit Test

Tất cả lệnh chạy trong thư mục `backend`. Trên macOS/Linux thay `.\mvnw.cmd` bằng `./mvnw`.

```powershell
cd backend

# Chạy toàn bộ 15 test
.\mvnw.cmd test

# Chạy riêng một lớp test
.\mvnw.cmd test "-Dtest=TaskServiceTest"      # 7 test tầng Service
.\mvnw.cmd test "-Dtest=TaskControllerTest"   # 8 test tầng Controller (API)

# Chạy đúng một test (dấu # giữa tên lớp và tên hàm)
.\mvnw.cmd test "-Dtest=TaskServiceTest#createTask_trimsInput"

# Chạy nhiều test theo mẫu tên (* là ký tự đại diện)
.\mvnw.cmd test "-Dtest=Task*Test#delete*"
```

Kết quả mong đợi ở cuối log:

```
[INFO] Tests run: 15, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

**Danh sách test:**

| Lớp | Kiểm tra |
|---|---|
| `TaskServiceTest` (Mockito) | Trim dữ liệu khi tạo/sửa, mô tả rỗng thành null, toggle trạng thái, ném `TaskNotFoundException` khi id không tồn tại (get/delete) |
| `TaskControllerTest` (MockMvc) | POST hợp lệ → 201; tiêu đề trống → 400 kèm lỗi từng trường; JSON hỏng → 400; id không tồn tại → 404; id sai kiểu → 400; toggle → 200; xóa → 204 |

> Test mock toàn bộ dependency (repository/service) nên chạy nhanh và **không cần database**.

## 📡 REST API

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/tasks` | Danh sách công việc (hỗ trợ `keyword`, `completed`, `page`, `size`, `sortBy`, `direction`) |
| GET | `/api/tasks/{id}` | Chi tiết một công việc |
| POST | `/api/tasks` | Thêm công việc mới |
| PUT | `/api/tasks/{id}` | Chỉnh sửa công việc |
| PATCH | `/api/tasks/{id}/toggle` | Đảo trạng thái hoàn thành |
| DELETE | `/api/tasks/{id}` | Xóa công việc |

**Ví dụ:** `GET /api/tasks?keyword=báo cáo&completed=false&page=0&size=5&sortBy=createdAt&direction=desc`

Body cho POST/PUT:

```json
{
  "title": "Hoàn thành báo cáo tuần",
  "description": "Nộp trước 17h thứ 6"
}
```

## 🗂 Cấu trúc dự án

```
backend/                     # RESTful API — Java Spring Boot
└── src/main/java/com/srtgroup/todolist/
    ├── controller/   # Tầng nhận request, trả response (REST API)
    │   └── TaskController.java
    ├── service/      # Tầng xử lý nghiệp vụ
    │   └── TaskService.java
    ├── repository/   # Tầng truy cập dữ liệu (Spring Data JPA)
    │   └── TaskRepository.java
    ├── model/        # Entity ánh xạ bảng database
    │   └── Task.java
    ├── dto/          # Đối tượng truyền dữ liệu vào/ra API
    │   ├── TaskRequest.java
    │   ├── TaskResponse.java
    │   └── PageResponse.java
    └── exception/    # Xử lý lỗi tập trung
        ├── TaskNotFoundException.java
        └── GlobalExceptionHandler.java

frontend/                    # Giao diện React (Vite)
└── src/
    ├── api.js               # Lớp gọi REST API
    ├── App.jsx              # Component gốc, quản lý state
    └── components/          # TaskForm, TaskList, TaskItem, Toolbar, Pagination, Toast
```

## 🛡 Xử lý dữ liệu không hợp lệ

- **Tiêu đề trống hoặc chỉ có khoảng trắng** → 400, thông báo "Tiêu đề không được để trống"
- **Tiêu đề quá 255 ký tự / mô tả quá 2000 ký tự** → 400 kèm thông báo cụ thể từng trường
- **Id không tồn tại** (xem/sửa/xóa/toggle) → 404
- **Id sai kiểu** (ví dụ `/api/tasks/abc`) → 400
- **Tham số phân trang bất hợp lệ** (page âm, size quá lớn, trường sắp xếp không tồn tại) → tự chuẩn hóa về giá trị an toàn
- **Lỗi không lường trước** → 500 với thông báo chung, không lộ chi tiết nội bộ

Mọi lỗi trả về cùng một định dạng JSON thống nhất:

```json
{
  "timestamp": "2026-07-05T10:00:00",
  "status": 400,
  "message": "Dữ liệu không hợp lệ",
  "errors": { "title": "Tiêu đề không được để trống" }
}
```

## 💾 Database

- PostgreSQL trên **Supabase** (cloud) — dữ liệu lưu tập trung, không mất khi tắt ứng dụng.
- Kết nối qua Session Pooler (tương thích IPv4), bảng `tasks` tự tạo khi chạy lần đầu (`ddl-auto=update`).
- Xem dữ liệu trực tiếp: Supabase Dashboard → **Table Editor** → bảng `tasks`.
