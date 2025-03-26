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

def should_ignore(path, root_pathspec, additional_pathspecs, respect_gitignore=True):
    """Check if a path should be ignored based on gitignore rules.
    
    Args:
        path: Path to check
        root_pathspec: Root .gitignore PathSpec
        additional_pathspecs: Additional .gitignore PathSpecs
        respect_gitignore: Whether to respect gitignore rules
    """
    # Convert to relative path from the root of the project
    rel_path = os.path.relpath(path, start=os.path.dirname(os.path.abspath(__file__)) + '/..')
    
    if respect_gitignore:
        # Check root gitignore
        if root_pathspec.match_file(rel_path):
            return True
        
        # Check directory-specific gitignore files
        for dir_path, pathspec in additional_pathspecs.items():
            if rel_path.startswith(dir_path):
                rel_to_dir = os.path.relpath(rel_path, start=dir_path)
                if pathspec.match_file(rel_to_dir):
                    return True
    
    # Always ignore these files regardless of gitignore setting
    always_ignore_patterns = [
        '*.pyc', '__pycache__', '.git', '.DS_Store', 'node_modules',
        '*.min.js', '*.min.css', '*.map', '*.bundle.js', 'build', 'dist',
        '.next', '.nuxt', '.cache', '.parcel-cache', '.vscode', '.idea'
    ]
    
    # These patterns are only ignored if we're respecting gitignore
    gitignore_patterns = []
    if respect_gitignore:
        gitignore_patterns = [
            'codebase_documentation*.md',
            'codebase_documentation*.txt'
        ]
    
    # Check if file matches any ignore pattern
    for pattern in always_ignore_patterns + gitignore_patterns:
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

def generate_directory_tree(start_path, root_pathspec, additional_pathspecs, indent='', respect_gitignore=True):
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
        
        if should_ignore(item_path, root_pathspec, additional_pathspecs, respect_gitignore):
            continue
        
        if os.path.isdir(item_path):
            tree.append(f"{indent}- [DIR] **{item}/**")
            subtree = generate_directory_tree(item_path, root_pathspec, additional_pathspecs, indent + '  ', respect_gitignore)
            tree.extend(subtree)
        else:
            tree.append(f"{indent}- [FILE] {item}")
    
    return tree

def process_codebase(output_file, root_pathspec, additional_pathspecs, respect_gitignore=True):
    """Process the codebase and write to markdown file."""
    root_dir = os.path.dirname(os.path.abspath(__file__)) + '/..'
    
    with open(output_file, 'w', encoding='utf-8') as f:
        # Write title
        f.write("# Codebase Documentation\n\n")
        
        # Write directory structure
        f.write("## Directory Structure\n\n")
        tree = generate_directory_tree(root_dir, root_pathspec, additional_pathspecs, respect_gitignore=respect_gitignore)
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
                if rel_path in processed_files or should_ignore(file_path, root_pathspec, additional_pathspecs, respect_gitignore):
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
    import argparse
    
    # Set up command line arguments
    parser = argparse.ArgumentParser(description='Generate codebase documentation.')
    parser.add_argument('--commit', action='store_true', help='Stage documentation files for commit')
    parser.add_argument('--include-docs', action='store_true', help='Include documentation files even if in .gitignore')
    parser.add_argument('--output-dir', default='docs', help='Directory to save documentation (default: docs)')
    args = parser.parse_args()
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.join(script_dir, '..')
    
    # Generate timestamp for the filename
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Create output directory if it doesn't exist
    output_dir = os.path.join(root_dir, args.output_dir)
    os.makedirs(output_dir, exist_ok=True)
    
    # Generate both timestamped and standard filenames
    timestamped_file = os.path.join(output_dir, f'codebase_documentation_{timestamp}.txt')
    standard_file = os.path.join(output_dir, 'codebase_documentation.txt')
    
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
    
    # Whether to respect gitignore rules for documentation files
    respect_gitignore = not args.include_docs
    
    # Process the codebase
    process_codebase(timestamped_file, root_pathspec, additional_pathspecs, respect_gitignore=respect_gitignore)
    
    # Create a copy with standard name
    import shutil
    shutil.copy2(timestamped_file, standard_file)
    
    print(f"Codebase documentation generated at: {timestamped_file}")
    print(f"Also copied to: {standard_file}")
    
    # Stage for commit if requested
    if args.commit:
        try:
            import subprocess
            print("Staging documentation files for commit...")
            subprocess.run(["git", "add", "-f", timestamped_file, standard_file], check=True)
            print("Files staged successfully. You can now commit them.")
        except Exception as e:
            print(f"Error staging files: {str(e)}")
            print("You may need to manually run: git add -f docs/codebase_documentation*.txt")

if __name__ == "__main__":
    main() 