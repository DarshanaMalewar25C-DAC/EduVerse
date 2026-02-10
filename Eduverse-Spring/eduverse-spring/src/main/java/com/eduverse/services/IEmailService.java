package com.eduverse.services;

import java.util.concurrent.CompletableFuture;

public interface IEmailService {
    CompletableFuture<Void> sendEmailAsync(String to, String subject, String body);
}
