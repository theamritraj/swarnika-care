package com.swarnikacare.appointment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

import org.springframework.scheduling.annotation.EnableAsync;

@io.swagger.v3.oas.annotations.OpenAPIDefinition(info = @io.swagger.v3.oas.annotations.info.Info(title = "Appointment Service API", version = "v1"))
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@EnableAsync
public class AppointmentServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(AppointmentServiceApplication.class, args);
    }
}
