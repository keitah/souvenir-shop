package com.example.shop.auth;

import com.example.shop.user.User;
import com.example.shop.user.UserRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class AuthController {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtService jwtService;

    public AuthController(
            UserRepository users,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authManager,
            JwtService jwtService
    ) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.authManager = authManager;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody @Valid RegisterRequest req) {
        if (users.findByUsername(req.username()).isPresent()) {
            return ResponseEntity.badRequest().body("Username already taken");
        }

        User user = new User();
        user.setUsername(req.username());
        user.setPassword(passwordEncoder.encode(req.password()));
        user.setRoles(Set.of("ROLE_USER"));

        users.save(user);
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest req) {
        var authToken = new UsernamePasswordAuthenticationToken(
                req.username(), req.password());
        authManager.authenticate(authToken);

        var user = users.findByUsername(req.username())
                .orElseThrow();

        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
