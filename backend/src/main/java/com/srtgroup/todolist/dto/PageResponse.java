package com.srtgroup.todolist.dto;

import org.springframework.data.domain.Page;

import java.util.List;

/**
 * Kết quả phân trang trả về cho client với cấu trúc ổn định,
 * không phụ thuộc vào cách serialize mặc định của Spring Data Page.
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last
) {
    public static <T> PageResponse<T> from(Page<T> page) {
        return new PageResponse<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast()
        );
    }
}
