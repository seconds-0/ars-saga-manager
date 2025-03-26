#!/usr/bin/env python3
"""
Script to generate a text file containing the entire codebase contents.
This creates a comprehensive documentation of the codebase, respecting .gitignore rules
unless specifically overridden with the --include-docs flag.
"""
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

def process_codebase(output_file, root_pathspec, additional_pathspecs, respect_gitignore=True, 
                 timeout_seconds=180, skip_large_files=False, max_file_size=1024*1024):
    """Process the codebase and write to text file.
    
    Args:
        output_file: Path to the output file
        root_pathspec: Root .gitignore PathSpec
        additional_pathspecs: Additional .gitignore PathSpecs
        respect_gitignore: Whether to respect gitignore rules
        timeout_seconds: Maximum time in seconds to allow for processing
        skip_large_files: Whether to skip files larger than max_file_size
        max_file_size: Maximum file size in bytes (default 1MB)
    
    Returns:
        Tuple of (success, message)
    """
    import time
    import sys
    import platform
    
    # Simple timeout approach that works on all platforms
    start_time = time.time()
    end_time_limit = start_time + timeout_seconds
    
    root_dir = os.path.dirname(os.path.abspath(__file__)) + '/..'
    file_count = 0
    large_file_count = 0
    processed_size = 0
    skipped_size = 0
    
    try:
        with open(output_file, 'w', encoding='utf-8') as f:
            # Write title
            f.write("# Codebase Documentation\n\n")
            print("Generating directory tree...")
            
            # Check for timeout
            if time.time() > end_time_limit:
                return (False, f"Timeout exceeded while generating directory tree")
            
            # Write directory structure
            f.write("## Directory Structure\n\n")
            tree = generate_directory_tree(root_dir, root_pathspec, additional_pathspecs, respect_gitignore=respect_gitignore)
            f.write('\n'.join(tree))
            f.write('\n\n')
            
            # Write file contents
            f.write("## File Contents\n\n")
            
            # Keep track of processed files to avoid duplicates
            processed_files = set()
            
            print("Beginning file processing...")
            progress_interval = 50  # Show progress every 50 files
            check_timeout_interval = 20  # Check for timeout every 20 files
            
            for root, dirs, files in os.walk(root_dir):
                # Skip node_modules entirely - it's huge and unnecessary
                if 'node_modules' in root:
                    continue
                
                # Check for timeout periodically
                if time.time() > end_time_limit:
                    return (False, f"Processing timed out after {timeout_seconds} seconds. Processed {file_count} files ({processed_size/1024:.1f} KB) so far.")
                    
                # Process each file
                for file in sorted(files):
                    file_path = os.path.join(root, file)
                    rel_path = os.path.relpath(file_path, start=root_dir)
                    
                    # Skip if already processed or should be ignored
                    if rel_path in processed_files or should_ignore(file_path, root_pathspec, additional_pathspecs, respect_gitignore):
                        continue
                    
                    # Check for timeout every few files
                    if file_count % check_timeout_interval == 0 and time.time() > end_time_limit:
                        return (False, f"Processing timed out after {timeout_seconds} seconds. Processed {file_count} files ({processed_size/1024:.1f} KB) so far.")
                    
                    # Handle large files
                    try:
                        file_size = os.path.getsize(file_path)
                        if skip_large_files and file_size > max_file_size:
                            large_file_count += 1
                            skipped_size += file_size
                            f.write(f"### {rel_path}\n\n")
                            f.write(f"File skipped (too large): {file_size/1024:.1f} KB\n\n")
                            continue
                    except Exception:
                        pass
                    
                    processed_files.add(rel_path)
                    file_count += 1
                    
                    # Show progress
                    if file_count % progress_interval == 0:
                        elapsed = time.time() - start_time
                        remaining = end_time_limit - time.time()
                        print(f"Processed {file_count} files ({processed_size/1024:.1f} KB) in {elapsed:.1f} seconds... (timeout in {remaining:.1f}s)")
                    
                    if is_binary_file(file_path):
                        continue
                    
                    try:
                        with open(file_path, 'r', encoding='utf-8') as file_content:
                            content = file_content.read()
                        
                        processed_size += len(content)
                        
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
        
        end_time = time.time()
        total_time = end_time - start_time
        
        # Add stats about large files if relevant
        large_files_info = ""
        if skip_large_files and large_file_count > 0:
            large_files_info = f" (skipped {large_file_count} large files totaling {skipped_size/1024/1024:.1f} MB)"
            
        return (True, f"Successfully processed {file_count} files ({processed_size/1024:.1f} KB) in {total_time:.1f} seconds{large_files_info}")
    
    except Exception as e:
        elapsed = time.time() - start_time
        return (False, f"Error processing codebase after {elapsed:.1f} seconds: {str(e)}")

def main():
    """Main function to generate the codebase text file."""
    import argparse
    import sys
    import shutil
    
    # Set up command line arguments
    parser = argparse.ArgumentParser(description='Generate complete codebase text file.')
    parser.add_argument('--commit', action='store_true', help='Stage generated files for commit')
    parser.add_argument('--include-docs', action='store_true', help='Include documentation files even if in .gitignore')
    parser.add_argument('--output-dir', default='docs', help='Directory to save output (default: docs)')
    parser.add_argument('--timeout', type=int, default=120, help='Timeout in seconds (default: 120)')
    parser.add_argument('--skip-copy', action='store_true', help='Skip creating the non-timestamped copy')
    parser.add_argument('--skip-large-files', action='store_true', help='Skip files larger than specified max size')
    parser.add_argument('--max-file-size', type=int, default=1024*1024, 
                      help='Maximum file size in bytes (default: 1MB)')
    args = parser.parse_args()
    
    print(f"Starting code-to-text conversion with a {args.timeout} second timeout...")
    if args.skip_large_files:
        print(f"Will skip files larger than {args.max_file_size/1024/1024:.1f}MB")
    
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
    
    print("Reading .gitignore files...")
    
    # Read root gitignore
    root_gitignore = os.path.join(root_dir, '.gitignore')
    root_pathspec = read_gitignore(root_gitignore)
    
    # Find and read additional gitignore files
    additional_pathspecs = {}
    for root, dirs, files in os.walk(root_dir):
        # Skip node_modules entirely to save time
        if 'node_modules' in dirs:
            dirs.remove('node_modules')
            
        if '.gitignore' in files and root != root_dir:
            rel_dir = os.path.relpath(root, start=root_dir)
            gitignore_path = os.path.join(root, '.gitignore')
            additional_pathspecs[rel_dir] = read_gitignore(gitignore_path)
    
    # Whether to respect gitignore rules for documentation files
    respect_gitignore = not args.include_docs
    
    # Process the codebase with timeout
    print(f"Processing codebase (timeout: {args.timeout}s)...")
    success, message = process_codebase(
        timestamped_file, 
        root_pathspec, 
        additional_pathspecs, 
        respect_gitignore=respect_gitignore,
        timeout_seconds=args.timeout,
        skip_large_files=args.skip_large_files,
        max_file_size=args.max_file_size
    )
    
    if success:
        print(f"✅ {message}")
        
        # Create a copy with standard name if not skipping
        if not args.skip_copy:
            shutil.copy2(timestamped_file, standard_file)
            print(f"✅ Copied to: {standard_file}")
        
        print(f"✅ Codebase text file generated at: {timestamped_file}")
        
        # Stage for commit if requested
        if args.commit:
            try:
                import subprocess
                print("Staging text files for commit...")
                files_to_add = [timestamped_file]
                if not args.skip_copy:
                    files_to_add.append(standard_file)
                    
                subprocess.run(["git", "add", "-f"] + files_to_add, check=True)
                print("✅ Files staged successfully. You can now commit them.")
            except Exception as e:
                print(f"❌ Error staging files: {str(e)}")
                print("You may need to manually run: git add -f docs/codebase_documentation*.txt")
        
        print("✅ All done!")
    else:
        print(f"❌ {message}")
        print("You may need to increase the timeout with --timeout or optimize the script.")
        sys.exit(1)

if __name__ == "__main__":
    main() 