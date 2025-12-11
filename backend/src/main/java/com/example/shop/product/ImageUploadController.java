package com.example.shop.product;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*", allowCredentials = "false")
public class ImageUploadController {

    private final Path uploadRoot;

    public ImageUploadController(@Value("${app.upload-dir:uploads}") String uploadDir) {
        this.uploadRoot = Paths.get(uploadDir).toAbsolutePath().normalize();
    }

    @PostMapping("/upload-image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Пустой файл");
        }

        try {
            Files.createDirectories(uploadRoot);

            String originalName = file.getOriginalFilename();
            String ext = StringUtils.getFilenameExtension(originalName);
            if (ext == null || ext.isBlank()) {
                ext = "bin";
            }
            String filename = UUID.randomUUID() + "." + ext.toLowerCase();
            Path target = uploadRoot.resolve(filename);

            // overwrite if somehow exists
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            Map<String, String> body = new HashMap<>();
            body.put("url", "/uploads/" + filename);
            return ResponseEntity.status(HttpStatus.CREATED).body(body);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Не удалось сохранить файл");
        }
    }
}
