---
name: tasks
description: This skill should be used when the 'plan-approved' label is added to an issue. It breaks down implementation plans into ordered, actionable tasks with dependencies and parallel execution markers.
---

# Tasks Skill

A Technical Lead AI that breaks down implementation plans into actionable tasks.

## Task Overview

1. **Switch to feature branch** - All work happens on the existing feature branch
2. **Read the spec and plan** - Load both `{spec_directory}/spec.json` and `{spec_directory}/plan.md`
3. **Create task breakdown** - Generate ordered tasks with dependencies
4. **Mark parallel tasks** - Identify tasks that can run in parallel

## Branch Management

**IMPORTANT**: All work must be done on the feature branch specified in the context (`feature_branch`).

1. Switch to the existing feature branch:
   ```bash
   git fetch origin
   git checkout {feature_branch}
   git pull origin {feature_branch}
   ```
2. All commits go to this branch
3. Push the branch to origin after committing
4. **Never push directly to main**

## Output Location

Create the tasks file at: `{spec_directory}/tasks.md`

The `spec_directory` and `feature_branch` are provided in the context.

## Tasks Format

Use this format for the tasks.md file:

```markdown
# Task Breakdown: {Feature Title}

> Spec: [spec.json](./spec.json)
> Plan: [plan.md](./plan.md)
> Status: Ready for Implementation

## Prerequisites

- [ ] Prerequisite 1 (if any)

## Phase 1: Foundation

### Task 1.1: {Task Title}
- **File(s):** `path/to/file.ts`
- **Description:** What to do
- **Depends on:** None
- **Parallel:** No

### Task 1.2: {Task Title} [P]
- **File(s):** `path/to/file.ts`
- **Description:** What to do
- **Depends on:** Task 1.1
- **Parallel:** Yes (can run with 1.3)

## Phase 2: Core Implementation

### Task 2.1: {Task Title}
...

## Phase 3: Integration & Testing

### Task 3.1: Write unit tests
...

### Task 3.2: Write integration tests
...

## Checkpoints

- [ ] After Phase 1: Verify foundation is solid
- [ ] After Phase 2: Verify core features work
- [ ] After Phase 3: All tests pass
```

## Rules

- Tasks should be small and focused (< 1 hour of work each)
- Mark parallel tasks with [P]
- Include specific file paths
- Order respects dependencies (models before services, services before endpoints)
- Include testing tasks
- **All work on the feature branch** - never push to main
- Commit the tasks.md file to the feature branch
- Add `tasks-ready` label when done
- When the task step is complete, post a new issue comment with the details from the `Step Details Comment` section.

## Step Details Comment

When the task step is complete, post a new issue comment that includes:

- The branch you worked on: `{feature_branch}`
- The path to `{spec_directory}/tasks.md` as a hyperlink
- Confirmation that `tasks-ready` was added
- The total task count and phase breakdown
- A concise effort estimate
- A bulleted summary of the planned work
- The next step for the user (`ready-to-implement`)

**File Links:** All file paths referenced in the comment must be hyperlinks to their location in the branch using this format:
`https://github.com/{repository}/blob/{feature_branch}/{file_path}`

For example, if `repository` is `acme/demo` and `feature_branch` is `feature/42-add-login`, then `{spec_directory}/tasks.md` should link to:
`https://github.com/acme/demo/blob/feature/42-add-login/.specify/specs/042-add-login/tasks.md`

Example format:

```markdown
## 🧾 Task Step Complete

- Working on branch: `{feature_branch}`
- Created task breakdown at [`{spec_directory}/tasks.md`](https://github.com/{repository}/blob/{feature_branch}/{spec_directory}/tasks.md)
- Added `tasks-ready` label
- **Total tasks:** [X tasks in Y phases]
- **Estimated effort:** [Brief estimate]

## Tasks
- [Task summary]
- [Task summary]

**Next Step:** Review the tasks and add the `ready-to-implement` label to begin implementation.
```
