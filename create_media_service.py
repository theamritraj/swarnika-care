import os
from pathlib import Path

BASE_DIR = "backend/media-service"
SRC_MAIN_JAVA = f"{BASE_DIR}/src/main/java/com/swarnikacare/media"
SRC_MAIN_RES = f"{BASE_DIR}/src/main/resources"

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        f.write(content.strip() + "\n")

# 1. pom.xml
pom_xml = """<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    <groupId>com.swarnikacare</groupId>
    <artifactId>media-service</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>media-service</name>
    <description>Media and File Upload Service for Swarnika Care</description>
    <properties>
        <java.version>17</java.version>
        <spring-cloud.version>2023.0.1</spring-cloud.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>
        <!-- Cloudinary -->
        <dependency>
            <groupId>com.cloudinary</groupId>
            <artifactId>cloudinary-http44</artifactId>
            <version>1.36.0</version>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
    </dependencies>
    <dependencyManagement>
        <dependencies>
            <dependency>
                <groupId>org.springframework.cloud</groupId>
                <artifactId>spring-cloud-dependencies</artifactId>
                <version>${spring-cloud.version}</version>
                <type>pom</type>
                <scope>import</scope>
            </dependency>
        </dependencies>
    </dependencyManagement>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
"""
write_file(f"{BASE_DIR}/pom.xml", pom_xml)

# 2. application.yml
app_yml = """server:
  port: 8094

spring:
  application:
    name: media-service
  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 50MB

eureka:
  client:
    serviceUrl:
      defaultZone: ${EUREKA_URI:http://localhost:8761/eureka}
  instance:
    preferIpAddress: true

cloudinary:
  cloud-name: eb6pvtx2
  api-key: "526279599924919"
  api-secret: Q3hoRxcN8nUtOeZWgQuHMoT_HfQ

app:
  security:
    enabled: true
jwt:
  secret: 404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
"""
write_file(f"{SRC_MAIN_RES}/application.yml", app_yml)

# 3. Main Class
main_class = """package com.swarnikacare.media;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class MediaServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(MediaServiceApplication.class, args);
    }
}
"""
write_file(f"{SRC_MAIN_JAVA}/MediaServiceApplication.java", main_class)

# 4. CloudinaryConfig
cloud_config = """package com.swarnikacare.media.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud-name}")
    private String cloudName;

    @Value("${cloudinary.api-key}")
    private String apiKey;

    @Value("${cloudinary.api-secret}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloudName);
        config.put("api_key", apiKey);
        config.put("api_secret", apiSecret);
        return new Cloudinary(config);
    }
}
"""
write_file(f"{SRC_MAIN_JAVA}/config/CloudinaryConfig.java", cloud_config)

# 5. MediaService
media_service = """package com.swarnikacare.media.service;

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
        String publicId = UUID.randomUUID().toString() + "_" + (originalFilename != null ? originalFilename.replaceAll("[^a-zA-Z0-9\\\\.\\\\-]", "_") : "file");
        
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
"""
write_file(f"{SRC_MAIN_JAVA}/service/MediaService.java", media_service)

# 6. MediaController
media_controller = """package com.swarnikacare.media.controller;

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
"""
write_file(f"{SRC_MAIN_JAVA}/controller/MediaController.java", media_controller)

# 7. Add media-service to root pom.xml
def add_module_to_root_pom():
    root_pom_path = "backend/pom.xml"
    if not os.path.exists(root_pom_path):
        return
    with open(root_pom_path, "r") as f:
        content = f.read()
    
    if "<module>media-service</module>" not in content:
        content = content.replace("</modules>", "    <module>media-service</module>\n    </modules>")
        with open(root_pom_path, "w") as f:
            f.write(content)

add_module_to_root_pom()

print("Media Service generated successfully!")
