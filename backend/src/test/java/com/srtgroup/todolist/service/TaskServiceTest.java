package com.srtgroup.todolist.service;

import com.srtgroup.todolist.dto.TaskRequest;
import com.srtgroup.todolist.dto.TaskResponse;
import com.srtgroup.todolist.exception.TaskNotFoundException;
import com.srtgroup.todolist.model.Task;
import com.srtgroup.todolist.repository.TaskRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * Unit test cho TaskService — mock tầng Repository.
 */
@ExtendWith(MockitoExtension.class)
class TaskServiceTest {

    @Mock
    private TaskRepository taskRepository;

    private TaskService taskService;

    @BeforeEach
    void setUp() {
        taskService = new TaskService(taskRepository);
    }

    @Test
    @DisplayName("Tạo công việc mới: tiêu đề và mô tả được trim trước khi lưu")
    void createTask_trimsInput() {
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskResponse response = taskService.createTask(
                new TaskRequest("  Học Spring Boot  ", "  Ôn tập JPA  "));

        assertThat(response.title()).isEqualTo("Học Spring Boot");
        assertThat(response.description()).isEqualTo("Ôn tập JPA");
        assertThat(response.completed()).isFalse();
    }

    @Test
    @DisplayName("Tạo công việc mới: mô tả rỗng được chuẩn hóa thành null")
    void createTask_blankDescriptionBecomesNull() {
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskResponse response = taskService.createTask(new TaskRequest("Việc A", "   "));

        assertThat(response.description()).isNull();
    }

    @Test
    @DisplayName("Cập nhật công việc: thay đổi tiêu đề và mô tả")
    void updateTask_updatesFields() {
        Task existing = new Task("Cũ", "Mô tả cũ");
        existing.setId(1L);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(existing));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskResponse response = taskService.updateTask(1L, new TaskRequest("Mới", "Mô tả mới"));

        assertThat(response.title()).isEqualTo("Mới");
        assertThat(response.description()).isEqualTo("Mô tả mới");
    }

    @Test
    @DisplayName("Lấy công việc không tồn tại: ném TaskNotFoundException")
    void getTask_notFound_throwsException() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.getTask(99L))
                .isInstanceOf(TaskNotFoundException.class)
                .hasMessageContaining("99");
    }

    @Test
    @DisplayName("Toggle: đảo trạng thái từ chưa hoàn thành sang hoàn thành")
    void toggleTask_flipsCompleted() {
        Task task = new Task("Việc A", null);
        task.setId(1L);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(taskRepository.save(any(Task.class))).thenAnswer(inv -> inv.getArgument(0));

        TaskResponse response = taskService.toggleTask(1L);

        assertThat(response.completed()).isTrue();
    }

    @Test
    @DisplayName("Xóa công việc tồn tại: gọi repository.delete")
    void deleteTask_existing_deletes() {
        Task task = new Task("Việc A", null);
        task.setId(1L);
        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));

        taskService.deleteTask(1L);

        ArgumentCaptor<Task> captor = ArgumentCaptor.forClass(Task.class);
        verify(taskRepository).delete(captor.capture());
        assertThat(captor.getValue().getId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("Xóa công việc không tồn tại: ném TaskNotFoundException")
    void deleteTask_notFound_throwsException() {
        when(taskRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> taskService.deleteTask(99L))
                .isInstanceOf(TaskNotFoundException.class);
    }
}
