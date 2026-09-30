package com.swarnikacare.media.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MediaService {

    private final Cloudinary cloudinary;

    public String uploadFile(MultipartFile file, String folder, String resourceType) throws IOException {
        String originalFilename = file.getOriginalFilename();
        String publicId = UUID.randomUUID().toString() + "_" + (originalFilename != null ? originalFilename.replaceAll("[^a-zA-Z0-9\\.\\-]", "_") : "file");
        
        Map<String, Object> params = ObjectUtils.asMap(
                "folder", folder != null ? "swarnikacare/" + folder : "swarnikacare/general",
                "public_id", publicId,
                "resource_type", resourceType != null ? resourceType : "auto"
        );

        log.info("Uploading file to Cloudinary: folder={}, resourceType={}", folder, resourceType);
        Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), params);
        
        return uploadResult.get("secure_url").toString();
    }
    
    public void deleteFile(String publicId, String resourceType) throws IOException {
        Map<String, Object> params = ObjectUtils.asMap("resource_type", resourceType != null ? resourceType : "auto");
        cloudinary.uploader().destroy(publicId, params);
    }
}
