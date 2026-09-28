import os

services = [
    "billing-service",
    "doctor-service",
    "organization-service",
    "pharmacy-service",
    "encounter-service",
    "appointment-service",
    "patient-service",
    "nursing-service",
    "notification-service",
    "lab-service"
]

base_path = "/Users/amritraj/Desktop/Amrit Raj/Projects/swarnika-care/backend"
template = """package com.swarnikacare.{service}.security;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpServletRequest;

@Component
public class FeignClientInterceptor implements RequestInterceptor {
    @Override
    public void apply(RequestTemplate template) {
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (attributes != null) {
            HttpServletRequest request = attributes.getRequest();
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null) {
                template.header("Authorization", authHeader);
            }
        }
    }
}
"""

for service in services:
    service_name = service.split("-")[0]
    pkg_path = f"{base_path}/{service}/src/main/java/com/swarnikacare/{service_name}/security"
    os.makedirs(pkg_path, exist_ok=True)
    file_path = f"{pkg_path}/FeignClientInterceptor.java"
    content = template.replace("{service}", service_name)
    with open(file_path, "w") as f:
        f.write(content)
    print(f"Wrote {file_path}")
