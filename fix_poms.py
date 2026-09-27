import sys
from pathlib import Path
import re

files = [
    'backend/appointment-service/pom.xml',
    'backend/notification-service/pom.xml',
    'backend/doctor-service/pom.xml',
    'backend/patient-service/pom.xml',
    'backend/organization-service/pom.xml',
    'backend/iam-service/pom.xml'
]

for file in files:
    path = Path(file)
    if not path.exists():
        continue
    content = path.read_text()
    
    # We added flyway-core and flyway-mysql without versions. Let's remove them again and re-add with versions.
    content = re.sub(r'<dependency>\s*<groupId>org.flywaydb</groupId>.*?</dependency>', '', content, flags=re.DOTALL)
    
    clean_dep = """
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-core</artifactId>
            <version>9.16.3</version>
        </dependency>
        <dependency>
            <groupId>org.flywaydb</groupId>
            <artifactId>flyway-mysql</artifactId>
            <version>9.16.3</version>
        </dependency>
"""
    content = content.replace("</dependencies>", clean_dep + "</dependencies>")
    path.write_text(content)
    print(f"Fixed {file}")
