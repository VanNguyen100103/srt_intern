package com.srtgroup.todolist.dto;

import com.srtgroup.todolist.model.Task;

import java.time.Instant;

/**
 * Dữ liệu trả về cho client, tách biệt với Entity để dễ bảo trì.
 */
public record TaskResponse(
        Long id,
        String title,
        String description,
        boolean completed,
        Instant createdAt,
        Instant updatedAt
) {
    public static TaskResponse from(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.isCompleted(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
