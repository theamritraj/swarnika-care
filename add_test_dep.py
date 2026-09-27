import sys
from pathlib import Path

pom_file = 'backend/organization-service/pom.xml'
path = Path(pom_file)
content = path.read_text()

test_dep = """
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
"""

# add it before the first </dependencies> tag
content = content.replace("</dependencies>", test_dep + "</dependencies>", 1)
path.write_text(content)
print("Added test dependency to organization-service")
