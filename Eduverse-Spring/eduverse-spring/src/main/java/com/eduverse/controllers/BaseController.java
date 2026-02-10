package com.eduverse.controllers;

import com.eduverse.security.services.UserDetailsImpl;
import org.springframework.security.core.context.SecurityContextHolder;

public abstract class BaseController {

    protected Integer getCurrentUserId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        return userDetails.getId();
    }

    protected Integer getCurrentCollegeId() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        return userDetails.getCollegeId();
    }

    protected String getCurrentRole() {
        UserDetailsImpl userDetails = (UserDetailsImpl) SecurityContextHolder.getContext().getAuthentication()
                .getPrincipal();
        return userDetails.getRole();
    }
}
