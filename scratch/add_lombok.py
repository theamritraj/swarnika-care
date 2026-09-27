import glob
import os

lombok_xml = """
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
"""

for pom_file in glob.glob('backend/*/pom.xml'):
    with open(pom_file, 'r') as f:
        content = f.read()
    
    if '<artifactId>lombok</artifactId>' not in content:
        content = content.replace('</dependencies>', lombok_xml + '    </dependencies>')
        with open(pom_file, 'w') as f:
            f.write(content)
        print(f"Added Lombok to {pom_file}")
    else:
        print(f"Lombok already in {pom_file}")
