package com.swarnikacare.doctor.config;

import com.swarnikacare.doctor.entity.Doctor;
import com.swarnikacare.doctor.repository.DoctorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.UUID;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner initDatabase(DoctorRepository repository) {
        return args -> {
            // Check if database is already populated
            if (repository.count() == 0) {
                System.out.println("Seeding database with initial doctors...");

                Doctor d1 = new Doctor();
                d1.setFirstName("Uttpal");
                d1.setLastName("Kant");
                d1.setEmail("uttpal.kant@swarnikacare.com");
                d1.setUserId(UUID.randomUUID().toString());

                Doctor d2 = new Doctor();
                d2.setFirstName("Deepak");
                d2.setLastName("Sharma");
                d2.setEmail("deepak@swarnikacare.com");
                d2.setUserId(UUID.randomUUID().toString());

                Doctor d3 = new Doctor();
                d3.setFirstName("Vibha");
                d3.setLastName("Singh");
                d3.setEmail("vibha@swarnikacare.com");
                d3.setUserId(UUID.randomUUID().toString());

                Doctor d4 = new Doctor();
                d4.setFirstName("Ruchi");
                d4.setLastName("Verma");
                d4.setEmail("ruchi@swarnikacare.com");
                d4.setUserId(UUID.randomUUID().toString());

                Doctor d5 = new Doctor();
                d5.setFirstName("Rajeev");
                d5.setLastName("Kumar");
                d5.setEmail("rajeev@swarnikacare.com");
                d5.setUserId(UUID.randomUUID().toString());

                Doctor d6 = new Doctor();
                d6.setFirstName("Amit");
                d6.setLastName("Mishra");
                d6.setEmail("amit@swarnikacare.com");
                d6.setUserId(UUID.randomUUID().toString());

                repository.saveAll(List.of(d1, d2, d3, d4, d5, d6));
                
                System.out.println("Database seeded successfully.");
            }
        };
    }
}
