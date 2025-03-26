#!/usr/bin/env python3
import os
import fnmatch
import pathlib
import re
import datetime
from pathspec import PathSpec
from pathspec.patterns import GitWildMatchPattern

def read_gitignore(gitignore_path):
    """Read gitignore file and return a PathSpec object."""
    if not os.path.exists(gitignore_path):
        return PathSpec([])
    
    with open(gitignore_path, 'r', encoding='utf-8') as f:
        gitignore_content = f.read()
    
    return PathSpec.from_lines(GitWildMatchPattern, gitignore_content.splitlines())

def is_binary_file(file_path):
    """Check if a file is binary."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            f.read(1024)
        return False
    except UnicodeDecodeError:
        return True

def should_ignore(path, root_pathspec, additional_pathspecs):
    """Check if a path should be ignored based on gitignore rules."""
    # Convert to relative path from the root of the project
    rel_path = os.path.relpath(path, start=os.path.dirname(os.path.abspath(__file__)) + '/..')
    
    # Check root gitignore
    if root_pathspec.match_file(rel_path):
        return True
    
    # Check directory-specific gitignore files
    for dir_path, pathspec in additional_pathspecs.items():
        if rel_path.startswith(dir_path):
            rel_to_dir = os.path.relpath(rel_path, start=dir_path)
            if pathspec.match_file(rel_to_dir):
                return True
    
    # Common patterns to ignore
    ignore_patterns = [
        '*.pyc', '__pycache__', '.git', '.DS_Store', 'node_modules',
        '*.min.js', '*.min.css', '*.map', '*.bundle.js', 'build', 'dist',
        '.next', '.nuxt', '.cache', '.parcel-cache', '.vscode', '.idea',
        'codebase_documentation*.md'  # Ignore any output file with the codebase_documentation prefix
    ]
    
    for pattern in ignore_patterns:
        if fnmatch.fnmatch(os.path.basename(path), pattern):
            return True
    
    return False

def get_file_extension(file_path):
    """Get the file extension for markdown code block formatting."""
    ext = os.path.splitext(file_path)[1].lower()[1:]
    
    # Map extensions to markdown code block language identifiers
    extension_map = {
        'js': 'javascript',
        'jsx': 'jsx',
        'ts': 'typescript',
        'tsx': 'tsx',
        'py': 'python',
        'rb': 'ruby',
        'java': 'java',
        'c': 'c',
        'cpp': 'cpp',
        'cs': 'csharp',
        'go': 'go',
        'rs': 'rust',
        'php': 'php',
        'html': 'html',
        'css': 'css',
        'scss': 'scss',
        'sass': 'sass',
        'less': 'less',
        'json': 'json',
        'md': 'markdown',
        'yml': 'yaml',
        'yaml': 'yaml',
        'xml': 'xml',
        'sql': 'sql',
        'sh': 'bash',
        'bash': 'bash',
        'bat': 'batch',
        'ps1': 'powershell',
        'dockerfile': 'dockerfile',
        'gitignore': 'gitignore',
        'env': 'env',
        'txt': 'text',
    }
    
    return extension_map.get(ext, '')

def generate_directory_tree(start_path, root_pathspec, additional_pathspecs, indent=''):
    """Generate a markdown representation of the directory tree."""
    tree = []
    
    # Get all items in the directory
    try:
        items = sorted(os.listdir(start_path))
    except (PermissionError, FileNotFoundError):
        return []
    
    for item in items:
        item_path = os.path.join(start_path, item)
        rel_path = os.path.relpath(item_path, start=os.path.dirname(os.path.abspath(__file__)) + '/..')
        
        if should_ignore(item_path, root_pathspec, additional_pathspecs):
            continue
        
        if os.path.isdir(item_path):
            tree.append(f"{indent}- [DIR] **{item}/**")
            subtree = generate_directory_tree(item_path, root_pathspec, additional_pathspecs, indent + '  ')
            tree.extend(subtree)
        else:
            tree.append(f"{indent}- [FILE] {item}")
    
    return tree

def process_codebase(output_file, root_pathspec, additional_pathspecs):
    """Process the codebase and write to markdown file."""
    root_dir = os.path.dirname(os.path.abspath(__file__)) + '/..'
    
    with open(output_file, 'w', encoding='utf-8') as f:
        # Write title
        f.write("# Codebase Documentation\n\n")
        
        # Write directory structure
        f.write("## Directory Structure\n\n")
        tree = generate_directory_tree(root_dir, root_pathspec, additional_pathspecs)
        f.write('\n'.join(tree))
        f.write('\n\n')
        
        # Write file contents
        f.write("## File Contents\n\n")
        
        # Keep track of processed files to avoid duplicates
        processed_files = set()
        
        for root, dirs, files in os.walk(root_dir):
            # Process each file
            for file in sorted(files):
                file_path = os.path.join(root, file)
                rel_path = os.path.relpath(file_path, start=root_dir)
                
                # Skip if already processed or should be ignored
                if rel_path in processed_files or should_ignore(file_path, root_pathspec, additional_pathspecs):
                    continue
                
                processed_files.add(rel_path)
                
                if is_binary_file(file_path):
                    continue
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as file_content:
                        content = file_content.read()
                    
                    # Write file header
                    f.write(f"### {rel_path}\n\n")
                    
                    # Write file content with appropriate syntax highlighting
                    extension = get_file_extension(file_path)
                    f.write(f"```{extension}\n")
                    f.write(content)
                    if not content.endswith('\n'):
                        f.write('\n')
                    f.write("```\n\n")
                except Exception as e:
                    f.write(f"### {rel_path}\n\n")
                    f.write(f"Error reading file: {str(e)}\n\n")

def main():
    """Main function to generate the markdown file."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.join(script_dir, '..')
    
    # Generate timestamp for the filename
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = os.path.join(root_dir, f'codebase_documentation_{timestamp}.md')
    
    # Read root gitignore
    root_gitignore = os.path.join(root_dir, '.gitignore')
    root_pathspec = read_gitignore(root_gitignore)
    
    # Find and read additional gitignore files
    additional_pathspecs = {}
    for root, dirs, files in os.walk(root_dir):
        if '.gitignore' in files and root != root_dir:
            rel_dir = os.path.relpath(root, start=root_dir)
            gitignore_path = os.path.join(root, '.gitignore')
            additional_pathspecs[rel_dir] = read_gitignore(gitignore_path)
    
    # Process the codebase
    process_codebase(output_file, root_pathspec, additional_pathspecs)
    print(f"Codebase documentation generated at: {output_file}")

if __name__ == "__main__":
    main() 