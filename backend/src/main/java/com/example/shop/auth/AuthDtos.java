package com.example.shop.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

record RegisterRequest(
        @NotBlank
        @Email
        String username,

        @NotBlank
        @Size(min = 6, message = "Пароль должен быть не менее 6 символов")
        String password
) { }

record LoginRequest(
        @NotBlank String username,
        @NotBlank String password
) { }

record AuthResponse(
        String accessToken
) { }
