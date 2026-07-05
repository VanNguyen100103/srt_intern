# 📝 Todo List — Ứng dụng Quản lý công việc

Bài test Intern Developer — SRT GROUP.

Ứng dụng web quản lý công việc (Todo List): backend **RESTful API bằng Java Spring Boot**, giao diện **React (Vite)**, database **PostgreSQL trên Supabase**.

## 🌐 Demo online

**👉 https://srt-intern.onrender.com**

> Deploy trên gói Free của Render nên nếu lâu không có người truy cập, lần mở đầu tiên sẽ chờ **30–60 giây** để server khởi động lại — vui lòng đợi một chút.

Link GitHub: https://github.com/VanNguyen100103/srt_intern

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

Ứng dụng đọc toàn bộ thông tin kết nối database từ **biến môi trường** (không hardcode trong code):

| Biến | Ý nghĩa | Ví dụ |
|---|---|---|
| `SUPABASE_DB_URL` | JDBC URL tới PostgreSQL | `jdbc:postgresql://aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres` |
| `SUPABASE_DB_USER` | Username database | `postgres.<project-ref>` |
| `SUPABASE_DB_PASSWORD` | Mật khẩu database | *(mật khẩu bạn đặt trên Supabase)* |

```powershell
# Windows (PowerShell)
cd backend
$env:SUPABASE_DB_URL = "jdbc:postgresql://<host>:5432/postgres"
$env:SUPABASE_DB_USER = "postgres.<project-ref>"
$env:SUPABASE_DB_PASSWORD = "mat-khau-database"
.\mvnw.cmd spring-boot:run
```

```bash
# macOS / Linux
cd backend
export SUPABASE_DB_URL="jdbc:postgresql://<host>:5432/postgres"
export SUPABASE_DB_USER="postgres.<project-ref>"
export SUPABASE_DB_PASSWORD="mat-khau-database"
./mvnw spring-boot:run
```

> Mẹo: tạo file `backend/run.bat` chứa sẵn các biến trên để chạy 1 lệnh (file này đã nằm trong `.gitignore`, không bị đẩy lên GitHub).

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
docker run -p 8080:8080 \
  -e SUPABASE_DB_URL="jdbc:postgresql://<host>:5432/postgres" \
  -e SUPABASE_DB_USER="postgres.<project-ref>" \
  -e SUPABASE_DB_PASSWORD="mat-khau-database" \
  todo-list
```

Khi deploy lên **Render** (hoặc nền tảng tương tự): tạo Web Service từ repo (tự nhận Dockerfile) và điền 3 biến môi trường trên vào mục Environment Variables.

### Chạy Unit Test

Tất cả lệnh chạy trong thư mục `backend`. Trên macOS/Linux thay `.\mvnw.cmd` bằng `./mvnw`.

```powershell
cd backend

# Chạy toàn bộ 15 test
.\mvnw.cmd test

# Chạy riêng một lớp test
.\mvnw.cmd test "-Dtest=TaskServiceTest"      # 7 test tầng Service
.\mvnw.cmd test "-Dtest=TaskControllerTest"   # 8 test tầng Controller (API)

# Chạy đúng một test duy nhất (dấu # giữa tên lớp và tên hàm)
.\mvnw.cmd test "-Dtest=TaskServiceTest#createTask_trimsInput"
.\mvnw.cmd test "-Dtest=TaskControllerTest#createTask_blankTitle_returns400"

# Chạy nhiều test cụ thể trong cùng một lớp (ngăn cách bằng dấu +)
.\mvnw.cmd test "-Dtest=TaskServiceTest#createTask_trimsInput+toggleTask_flipsCompleted"

# Chạy mọi test có tên khớp mẫu (* là ký tự đại diện)
.\mvnw.cmd test "-Dtest=Task*Test#delete*"      # mọi test bắt đầu bằng "delete" trong cả 2 lớp

# Chạy nhiều lớp cùng lúc (ngăn cách bằng dấu phẩy)
.\mvnw.cmd test "-Dtest=TaskServiceTest,TaskControllerTest"
```

Kết quả mong đợi ở cuối log:

```
[INFO] Tests run: 15, Failures: 0, Errors: 0, Skipped: 0
[INFO] BUILD SUCCESS
```

Project có **15 unit test** chia làm 2 lớp, mỗi lớp test một tầng riêng:

#### 1. `TaskServiceTest` — test tầng nghiệp vụ (7 test)

Dùng **Mockito** giả lập (`@Mock`) tầng `TaskRepository`, nên test chạy không cần database:

| Test | Kiểm tra điều gì |
|---|---|
| `createTask_trimsInput` | Tạo task với tiêu đề `"  Học Spring Boot  "` → khoảng trắng thừa bị cắt trước khi lưu |
| `createTask_blankDescriptionBecomesNull` | Mô tả chỉ toàn khoảng trắng → chuẩn hóa thành `null` |
| `updateTask_updatesFields` | Sửa task → tiêu đề và mô tả mới được lưu đúng |
| `getTask_notFound_throwsException` | Lấy task id không tồn tại → ném `TaskNotFoundException` |
| `toggleTask_flipsCompleted` | Toggle task chưa hoàn thành → thành hoàn thành |
| `deleteTask_existing_deletes` | Xóa task tồn tại → `repository.delete` được gọi đúng task đó |
| `deleteTask_notFound_throwsException` | Xóa task không tồn tại → ném `TaskNotFoundException` |

#### 2. `TaskControllerTest` — test tầng API (8 test)

Dùng **`@WebMvcTest` + MockMvc**: giả lập HTTP request thật gửi vào controller (service bị mock bằng `@MockitoBean`), kiểm tra mã HTTP và JSON trả về:

| Test | Request | Kỳ vọng |
|---|---|---|
| `createTask_valid_returns201` | POST dữ liệu hợp lệ | 201 + JSON task vừa tạo |
| `createTask_blankTitle_returns400` | POST tiêu đề toàn khoảng trắng | 400 + `errors.title` |
| `createTask_malformedJson_returns400` | POST body không phải JSON | 400 + thông báo rõ ràng |
| `getTask_notFound_returns404` | GET id không tồn tại | 404 |
| `getTask_invalidId_returns400` | GET `/api/tasks/abc` (id không phải số) | 400 |
| `toggleTask_returnsUpdatedTask` | PATCH toggle | 200 + `completed: true` |
| `deleteTask_returns204` | DELETE id tồn tại | 204 No Content |
| `deleteTask_notFound_returns404` | DELETE id không tồn tại | 404 |

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
