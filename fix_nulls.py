import os
import re

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    # Check if we already have it
    if '@SuppressWarnings("null")' in content:
        return

    # Regex to find the class or interface declaration
    # We look for public class, class, interface, enum, record
    pattern = re.compile(r'^((?:public\s+|abstract\s+|final\s+)*(?:class|interface|record)\s+\w+.*)$', re.MULTILINE)
    
    # We replace the first match only
    match = pattern.search(content)
    if match:
        new_content = content[:match.start()] + '@SuppressWarnings("null")\n' + content[match.start():]
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Fixed: {filepath}")

for root, dirs, files in os.walk('backend'):
    for file in files:
        if file.endswith('.java'):
            process_file(os.path.join(root, file))
