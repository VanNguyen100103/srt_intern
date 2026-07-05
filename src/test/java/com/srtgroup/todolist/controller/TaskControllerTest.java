package com.srtgroup.todolist.controller;

import com.srtgroup.todolist.dto.TaskRequest;
import com.srtgroup.todolist.dto.TaskResponse;
import com.srtgroup.todolist.exception.TaskNotFoundException;
import com.srtgroup.todolist.service.TaskService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Test tầng web (Controller) — mock tầng Service.
 */
@WebMvcTest(TaskController.class)
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private TaskService taskService;

    private TaskResponse sampleTask() {
        return new TaskResponse(1L, "Học Spring Boot", "Ôn tập JPA", false,
                LocalDateTime.now(), LocalDateTime.now());
    }

    @Test
    @DisplayName("POST /api/tasks với dữ liệu hợp lệ trả về 201")
    void createTask_valid_returns201() throws Exception {
        when(taskService.createTask(any(TaskRequest.class))).thenReturn(sampleTask());

        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"Học Spring Boot\",\"description\":\"Ôn tập JPA\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.title").value("Học Spring Boot"));
    }

    @Test
    @DisplayName("POST /api/tasks với tiêu đề trống trả về 400 kèm thông báo lỗi")
    void createTask_blankTitle_returns400() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"title\":\"   \"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Dữ liệu không hợp lệ"))
                .andExpect(jsonPath("$.errors.title").exists());
    }

    @Test
    @DisplayName("POST /api/tasks với body không phải JSON trả về 400")
    void createTask_malformedJson_returns400() throws Exception {
        mockMvc.perform(post("/api/tasks")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{khong-phai-json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Dữ liệu gửi lên không đúng định dạng JSON"));
    }

    @Test
    @DisplayName("GET /api/tasks/{id} không tồn tại trả về 404")
    void getTask_notFound_returns404() throws Exception {
        when(taskService.getTask(99L)).thenThrow(new TaskNotFoundException(99L));

        mockMvc.perform(get("/api/tasks/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404));
    }

    @Test
    @DisplayName("GET /api/tasks/{id} với id không phải số trả về 400")
    void getTask_invalidId_returns400() throws Exception {
        mockMvc.perform(get("/api/tasks/abc"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("PATCH /api/tasks/{id}/toggle trả về công việc đã đổi trạng thái")
    void toggleTask_returnsUpdatedTask() throws Exception {
        TaskResponse toggled = new TaskResponse(1L, "Học Spring Boot", null, true,
                LocalDateTime.now(), LocalDateTime.now());
        when(taskService.toggleTask(1L)).thenReturn(toggled);

        mockMvc.perform(patch("/api/tasks/1/toggle"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.completed").value(true));
    }

    @Test
    @DisplayName("DELETE /api/tasks/{id} thành công trả về 204")
    void deleteTask_returns204() throws Exception {
        mockMvc.perform(delete("/api/tasks/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("DELETE /api/tasks/{id} không tồn tại trả về 404")
    void deleteTask_notFound_returns404() throws Exception {
        doThrow(new TaskNotFoundException(99L)).when(taskService).deleteTask(eq(99L));

        mockMvc.perform(delete("/api/tasks/99"))
                .andExpect(status().isNotFound());
    }
}
