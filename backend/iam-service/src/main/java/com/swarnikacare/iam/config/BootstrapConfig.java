package com.swarnikacare.iam.config;

import com.swarnikacare.iam.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class BootstrapConfig {
    
    private static final Logger log = LoggerFactory.getLogger(BootstrapConfig.class);

    @Value("${bootstrap.admin.email}")
    private String adminEmail;

    @Bean
    public CommandLineRunner initSuperAdmin(UserService userService) {
        return args -> {
            try {
                if (adminEmail != null && !adminEmail.isEmpty()) {
                    userService.createSuperAdmin(adminEmail);
                    log.info("Super Admin bootstrap completed for email: {}", adminEmail);
                }
            } catch (Exception e) {
                log.warn("Super Admin bootstrap issue: {}", e.getMessage());
            }
        };
    }
}
