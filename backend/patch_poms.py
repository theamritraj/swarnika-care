import os
import re

def patch_pom(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Add Lombok dependency if not present
    lombok_dep = """
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <version>1.18.30</version>
            <optional>true</optional>
        </dependency>"""
    
    if '<artifactId>lombok</artifactId>' not in content:
        content = re.sub(r'(<dependencies>)', r'\1' + lombok_dep, content)

    # Add annotationProcessorPaths for Lombok if maven-compiler-plugin exists but without paths
    annotation_processor = """
                    <annotationProcessorPaths>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                            <version>1.18.30</version>
                        </path>
                    </annotationProcessorPaths>"""

    plugin_pattern = re.compile(r'(<artifactId>maven-compiler-plugin</artifactId>\s*<configuration>)')
    
    if 'annotationProcessorPaths' not in content:
        if plugin_pattern.search(content):
            content = plugin_pattern.sub(r'\1' + annotation_processor, content)
        else:
            # Add plugin entirely if missing
            plugin_block = f"""
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>{annotation_processor}
                </configuration>
            </plugin>"""
            content = re.sub(r'(<plugins>)', r'\1' + plugin_block, content)
            
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Patched {filepath}")

def main():
    base_dir = '/Users/amritraj/Desktop/Amrit Raj/Projects/swarnika-care/backend'
    for root, dirs, files in os.walk(base_dir):
        if 'pom.xml' in files:
            patch_pom(os.path.join(root, 'pom.xml'))

if __name__ == '__main__':
    main()
