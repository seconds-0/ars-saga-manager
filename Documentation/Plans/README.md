# Plans Directory

This directory contains work plans for the Ars Saga Manager project, organized by status and type.

## Organization

### Active Work
- **Bugs/**: Plans for fixing active bugs
- **Features/**: Plans for implementing new features

### Archived Work
- **Finished-Plans/**: Completed work plans (archived for reference)

## When to Move to Finished-Plans

A plan should be moved to the Finished-Plans directory when:
1. The work described in the plan has been fully implemented
2. All tests related to the plan are passing
3. The feature or bug fix has been merged to the main branch

## Plan File Format

All plan files should follow the standard format:

```markdown
# [PlanID-Description]

## Problem Statement
Clear description of the problem to solve or feature to implement.

## Components Involved
List of components, files, or systems affected.

## Implementation Checklist
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

## Status
One of: [Not Started, In Progress, Completed, Blocked]

## Notes
Implementation details, challenges, and context.
```