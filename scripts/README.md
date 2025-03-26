# Codebase to Markdown Converter

This script converts the entire codebase into a single markdown file while respecting gitignore rules.

## Features

- Generates a complete directory structure visualization
- Includes all code files with proper syntax highlighting
- Respects .gitignore rules (both root and directory-specific)
- Skips binary files
- Organizes content with proper markdown headers

## Requirements

- Python 3.6+
- pathspec package

## Installation

Install the required dependencies:

```bash
pip install -r requirements.txt
```

## Usage

Run the script from the scripts directory:

```bash
python generate_codebase_markdown.py
```

Or from the project root:

```bash
python scripts/generate_codebase_markdown.py
```

The script will generate a file named `codebase_documentation.md` in the project root directory.

## Output Format

The generated markdown file will have the following structure:

````
# Codebase Documentation

## Directory Structure
- 📁 **directory1/**
  - 📄 file1.js
  - 📄 file2.js
  - 📁 **subdirectory/**
    - 📄 file3.js
- 📁 **directory2/**
  - 📄 file4.js

## File Contents

### directory1/file1.js

```javascript
// File content here
````

### directory1/file2.js

```javascript
// File content here
```

// And so on...
