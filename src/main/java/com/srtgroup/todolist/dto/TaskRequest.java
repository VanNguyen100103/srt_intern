package com.srtgroup.todolist.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Dữ liệu đầu vào khi tạo mới hoặc cập nhật công việc.
 * Validation được kiểm tra tự động qua @Valid ở Controller.
 */
public record TaskRequest(

        @NotBlank(message = "Tiêu đề không được để trống")
        @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
        String title,

        @Size(max = 2000, message = "Mô tả không được vượt quá 2000 ký tự")
        String description
) {
}
