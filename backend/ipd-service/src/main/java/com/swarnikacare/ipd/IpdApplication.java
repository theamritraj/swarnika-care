package com.swarnikacare.ipd;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@io.swagger.v3.oas.annotations.OpenAPIDefinition(info = @io.swagger.v3.oas.annotations.info.Info(title = "Ipd Service API", version = "v1"))
@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class IpdApplication {
    public static void main(String[] args) {
        SpringApplication.run(IpdApplication.class, args);
    }
}