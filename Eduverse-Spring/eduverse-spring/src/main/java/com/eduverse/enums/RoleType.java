package com.eduverse.enums;

public enum RoleType {
    ADMIN(1),
    HOD(2),
    TEACHER(3),
    SUPERADMIN(4);

    private final int value;

    RoleType(int value) {
        this.value = value;
    }

    public int getValue() {
        return value;
    }
}
