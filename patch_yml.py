import sys
from pathlib import Path

files = [
    'backend/doctor-service/src/main/resources/application.yml',
    'backend/patient-service/src/main/resources/application.yml',
    'backend/appointment-service/src/main/resources/application.yml',
    'backend/notification-service/src/main/resources/application.yml',
    'backend/iam-service/src/main/resources/application.yml',
    'backend/organization-service/src/main/resources/application.yml'
]

for file in files:
    path = Path(file)
    if not path.exists():
        continue
    content = path.read_text()
    
    # replace ddl-auto
    content = content.replace('ddl-auto: update', 'ddl-auto: validate')
    
    # add flyway
    baseline_version = "2" if "doctor-service" in file else "1"
    
    flyway_config = f"""
  flyway:
    enabled: true
    baseline-on-migrate: true
    baseline-version: {baseline_version}
"""
    # Insert under spring:
    if "flyway:" not in content:
        content = content.replace("spring:\n", f"spring:\n{flyway_config}")
    
    path.write_text(content)
    print(f"Patched {file}")
