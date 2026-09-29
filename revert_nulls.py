import os

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    if '@SuppressWarnings("null")\n' in content:
        new_content = content.replace('@SuppressWarnings("null")\n', '')
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Reverted: {filepath}")

for root, dirs, files in os.walk('backend'):
    for file in files:
        if file.endswith('.java'):
            process_file(os.path.join(root, file))
