package com.srtgroup.todolist.controller;

import com.srtgroup.todolist.dto.PageResponse;
import com.srtgroup.todolist.dto.TaskRequest;
import com.srtgroup.todolist.dto.TaskResponse;
import com.srtgroup.todolist.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

/**
 * REST API quản lý công việc.
 *
 * GET    /api/tasks             — danh sách (tìm kiếm, lọc, phân trang, sắp xếp)
 * GET    /api/tasks/{id}        — chi tiết một công việc
 * POST   /api/tasks             — thêm mới
 * PUT    /api/tasks/{id}        — chỉnh sửa
 * PATCH  /api/tasks/{id}/toggle — đảo trạng thái hoàn thành
 * DELETE /api/tasks/{id}        — xóa
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    /** Các trường được phép sắp xếp — tránh lỗi khi client truyền trường không tồn tại. */
    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of("createdAt", "updatedAt", "title");
    private static final int MAX_PAGE_SIZE = 100;

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    @GetMapping
    public PageResponse<TaskResponse> getTasks(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean completed,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Pageable pageable = buildPageable(page, size, sortBy, direction);
        return PageResponse.from(taskService.getTasks(keyword, completed, pageable));
    }

    @GetMapping("/{id}")
    public TaskResponse getTask(@PathVariable Long id) {
        return taskService.getTask(id);
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(@Valid @RequestBody TaskRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(taskService.createTask(request));
    }

    @PutMapping("/{id}")
    public TaskResponse updateTask(@PathVariable Long id, @Valid @RequestBody TaskRequest request) {
        return taskService.updateTask(id, request);
    }

    @PatchMapping("/{id}/toggle")
    public TaskResponse toggleTask(@PathVariable Long id) {
        return taskService.toggleTask(id);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(@PathVariable Long id) {
        taskService.deleteTask(id);
        return ResponseEntity.noContent().build();
    }

    /** Chuẩn hóa tham số phân trang: chặn giá trị âm, giới hạn kích thước trang, chỉ cho sắp xếp theo trường hợp lệ. */
    private Pageable buildPageable(int page, int size, String sortBy, String direction) {
        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);
        String safeSortBy = ALLOWED_SORT_FIELDS.contains(sortBy) ? sortBy : "createdAt";
        Sort.Direction safeDirection = "asc".equalsIgnoreCase(direction)
                ? Sort.Direction.ASC
                : Sort.Direction.DESC;

        return PageRequest.of(safePage, safeSize, Sort.by(safeDirection, safeSortBy));
    }
}
