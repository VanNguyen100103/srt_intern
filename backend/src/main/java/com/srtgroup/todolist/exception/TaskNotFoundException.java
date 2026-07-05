package com.srtgroup.todolist.exception;

public class TaskNotFoundException extends RuntimeException {

    public TaskNotFoundException(Long id) {
        super("Không tìm thấy công việc với id = " + id);
    }
}
