import os
import re

directories = [
    "encounter-service", "appointment-service", "notification-service",
    "ipd-service", "pharmacy-service", "doctor-service", "patient-service",
    "organization-service", "lab-service", "nursing-service",
    "billing-service", "iam-service"
]

for service_name in directories:
    # Capitalize and clean up service name for the title
    title = service_name.replace("-", " ").title() + " API"
    
    # Find the Application class
    search_path = f"backend/{service_name}/src/main/java"
    for root, dirs, files in os.walk(search_path):
        for file in files:
            if file.endswith("Application.java"):
                file_path = os.path.join(root, file)
                
                with open(file_path, "r") as f:
                    content = f.read()
                    
                if "OpenAPIDefinition" not in content:
                    annotation = f'@io.swagger.v3.oas.annotations.OpenAPIDefinition(info = @io.swagger.v3.oas.annotations.info.Info(title = "{title}", version = "v1"))\n@SpringBootApplication'
                    new_content = content.replace("@SpringBootApplication", annotation)
                    
                    with open(file_path, "w") as f:
                        f.write(new_content)
                    print(f"Updated {file_path} with title: {title}")

