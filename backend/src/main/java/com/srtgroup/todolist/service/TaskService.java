package com.srtgroup.todolist.service;

import com.srtgroup.todolist.dto.TaskRequest;
import com.srtgroup.todolist.dto.TaskResponse;
import com.srtgroup.todolist.exception.TaskNotFoundException;
import com.srtgroup.todolist.model.Task;
import com.srtgroup.todolist.repository.TaskRepository;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

/**
 * Chứa toàn bộ nghiệp vụ quản lý công việc.
 */
@Service
@Transactional
public class TaskService {

    private final TaskRepository taskRepository;

    public TaskService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * Lấy danh sách công việc, hỗ trợ tìm kiếm theo từ khóa,
     * lọc theo trạng thái và phân trang/sắp xếp.
     *
     * @param keyword   từ khóa tìm trong tiêu đề hoặc mô tả (có thể null)
     * @param completed trạng thái cần lọc (null = tất cả)
     */
    @Transactional(readOnly = true)
    public Page<TaskResponse> getTasks(String keyword, Boolean completed, Pageable pageable) {
        Specification<Task> spec = buildSpecification(keyword, completed);
        return taskRepository.findAll(spec, pageable).map(TaskResponse::from);
    }

    @Transactional(readOnly = true)
    public TaskResponse getTask(Long id) {
        return TaskResponse.from(findTaskOrThrow(id));
    }

    public TaskResponse createTask(TaskRequest request) {
        Task task = new Task(request.title().trim(), normalize(request.description()));
        return TaskResponse.from(taskRepository.save(task));
    }

    public TaskResponse updateTask(Long id, TaskRequest request) {
        Task task = findTaskOrThrow(id);
        task.setTitle(request.title().trim());
        task.setDescription(normalize(request.description()));
        return TaskResponse.from(taskRepository.save(task));
    }

    /** Đảo trạng thái hoàn thành / chưa hoàn thành. */
    public TaskResponse toggleTask(Long id) {
        Task task = findTaskOrThrow(id);
        task.setCompleted(!task.isCompleted());
        return TaskResponse.from(taskRepository.save(task));
    }

    public void deleteTask(Long id) {
        Task task = findTaskOrThrow(id);
        taskRepository.delete(task);
    }

    private Task findTaskOrThrow(Long id) {
        return taskRepository.findById(id)
                .orElseThrow(() -> new TaskNotFoundException(id));
    }

    private Specification<Task> buildSpecification(String keyword, Boolean completed) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (keyword != null && !keyword.isBlank()) {
                String pattern = "%" + keyword.trim().toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("title")), pattern),
                        cb.like(cb.lower(root.get("description")), pattern)
                ));
            }
            if (completed != null) {
                predicates.add(cb.equal(root.get("completed"), completed));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private String normalize(String value) {
        return (value == null || value.isBlank()) ? null : value.trim();
    }
}
