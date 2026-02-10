package com.eduverse.models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "EmailVerifications")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailVerification {
    @Id
    @Column(length = 100)
    private String email;

    @Column(nullable = false, length = 10)
    private String otpCode;

    @Column(nullable = false)
    private LocalDateTime expiry;

    @Builder.Default
    private boolean isVerified = false;

    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
}
