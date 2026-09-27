import os
import re

def refactor_java_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Skip if already has Lombok annotations to avoid duplication
    if '@Getter' in content and '@Setter' in content:
        return

    # Check if this is an Entity or DTO (has class definition and fields)
    if 'class ' not in content:
        return
        
    # We'll use a safer regex approach
    # Remove simple getters: public Type getXyz() { return xyz; }
    # Remove simple setters: public void setXyz(Type xyz) { this.xyz = xyz; }
    # Also multi-line ones
    
    getter_pattern = re.compile(r'^\s*public\s+[\w<>, \[\]]+\s+get[A-Z]\w*\s*\(\)\s*\{[^}]*return[^}]*\}\s*$', re.MULTILINE)
    setter_pattern = re.compile(r'^\s*public\s+void\s+set[A-Z]\w*\s*\([^)]+\)\s*\{[^}]*=[^}]*\}\s*$', re.MULTILINE)
    
    # Also match default empty constructors: public ClassName() {}
    class_name_match = re.search(r'class\s+(\w+)', content)
    if not class_name_match:
        return
    class_name = class_name_match.group(1)
    
    constructor_pattern = re.compile(r'^\s*public\s+' + class_name + r'\s*\(\)\s*\{\s*\}\s*$', re.MULTILINE)

    # Perform substitutions
    new_content = getter_pattern.sub('', content)
    new_content = setter_pattern.sub('', new_content)
    new_content = constructor_pattern.sub('', new_content)
    
    # Clean up multiple empty lines
    new_content = re.sub(r'\n\s*\n\s*\n', '\n\n', new_content)

    if new_content == content:
        # No getters/setters were removed, no need to add Lombok
        return

    # Add Lombok imports and annotations
    # Find the class declaration to inject annotations just above it
    class_decl_pattern = re.compile(r'^([ \t]*)(public\s+class\s+\w+.*)$', re.MULTILINE)
    
    annotations = "@Getter\n@Setter\n@NoArgsConstructor\n"
    if '@Entity' in new_content:
        # Already has annotations, let's just insert before the class
        pass
        
    new_content = class_decl_pattern.sub(lambda m: m.group(1) + annotations + m.group(2), new_content)
    
    # Add imports if not present
    imports = "import lombok.Getter;\nimport lombok.Setter;\nimport lombok.NoArgsConstructor;\n"
    # Find last import
    last_import_match = list(re.finditer(r'^import .*;$', new_content, re.MULTILINE))
    if last_import_match:
        last_import = last_import_match[-1]
        insert_pos = last_import.end()
        new_content = new_content[:insert_pos] + '\n' + imports + new_content[insert_pos:]
    else:
        # Insert after package
        pkg_match = re.search(r'^package .*;$', new_content, re.MULTILINE)
        if pkg_match:
            insert_pos = pkg_match.end()
            new_content = new_content[:insert_pos] + '\n\n' + imports + new_content[insert_pos:]

    with open(filepath, 'w') as f:
        f.write(new_content)
    print(f"Refactored {filepath}")

def main():
    base_dir = '/Users/amritraj/Desktop/Amrit Raj/Projects/swarnika-care/backend'
    for root, dirs, files in os.walk(base_dir):
        # Only target entity and dto folders
        if '/entity' in root or '/dto' in root or '/model' in root:
            for file in files:
                if file.endswith('.java'):
                    refactor_java_file(os.path.join(root, file))

if __name__ == '__main__':
    main()
