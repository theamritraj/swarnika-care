package com.swarnikacare.media.controller;

import com.swarnikacare.media.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "general") String folder,
            @RequestParam(value = "resourceType", defaultValue = "auto") String resourceType) {
        
        try {
            String url = mediaService.uploadFile(file, folder, resourceType);
            Map<String, String> response = new HashMap<>();
            response.put("url", url);
            response.put("message", "File uploaded successfully");
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to upload file: " + e.getMessage());
            return ResponseEntity.internalServerError().body(error);
        }
    }
}
