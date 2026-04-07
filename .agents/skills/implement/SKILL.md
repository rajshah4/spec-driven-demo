---
name: implement
description: This skill should be used when the 'ready-to-implement' label is added to an issue. It implements features by executing the task list from the spec files on the existing feature branch, and opening a draft PR to main.
---

# Implement Skill

A Software Engineer AI that implements features by executing a task list.

## Task Overview

1. **Switch to feature branch** - All work happens on the existing feature branch
2. **Read all spec files** - Load spec.json, plan.md, and tasks.md from `{spec_directory}/`
3. **Execute tasks in order** - Follow the task list, respecting dependencies
4. **Write tests** - Include tests as specified in the tasks
5. **Create draft PR** - Open PR from feature branch to main

## Branch Management

**IMPORTANT**: All work must be done on the feature branch specified in the context (`feature_branch`).

1. Switch to the existing feature branch (already contains specs, plans, tasks):
   ```bash
   git fetch origin
   git checkout {feature_branch}
   git pull origin {feature_branch}
   ```
2. All implementation commits go to this branch
3. Push the branch to origin after committing
4. **Never push directly to main** - create a PR instead

## Execution Process

For each task:
1. Read the task description and file paths
2. Implement the changes
3. Run any relevant tests
4. Commit with a clear message referencing the task

## Rules

- **Use the existing feature branch** - do not create a new branch
- Follow existing code style and patterns
- Make atomic commits (one task = one commit when possible)
- Run tests before creating PR
- Create PR as DRAFT from `{feature_branch}` to `main`
- PR title: `feat: {Issue Title} (#{issue_number})`
- PR body should:
  - Link to the issue: `Closes #{issue_number}`
  - Summarize changes
  - Link to spec files
  - Include a checklist of completed tasks

## After Implementation

- Post a new issue comment with implementation details and the PR link
- Add `implementation-complete` label to the issue

## Step Details Comment

When the implementation step is complete, post a new issue comment that includes:

- The branch you worked on: `{feature_branch}`
- A concise summary of the implementation
- The tests you ran and their results
- The draft PR link
- Confirmation that `implementation-complete` was added
- Any notable follow-up items or reviewer callouts

**File Links:** All file paths referenced in the comment must be hyperlinks to their location in the branch using this format:
`https://github.com/{repository}/blob/{feature_branch}/{file_path}`

For example, if `repository` is `acme/demo` and `feature_branch` is `feature/42-add-login`, then a file like `src/auth/login.ts` should link to:
`https://github.com/acme/demo/blob/feature/42-add-login/src/auth/login.ts`

Example format:

```markdown
## 🧾 Implement Step Complete

- Working on branch: `{feature_branch}`
- **Implementation summary:** [Brief summary]
- **Files changed:** [List key files as hyperlinks, e.g., [`src/auth/login.ts`](https://github.com/{repository}/blob/{feature_branch}/src/auth/login.ts)]
- **Tests:** [List tests and outcomes]
- **Draft PR:** [Link]
- Added `implementation-complete` label

**Next Step:** Review the draft PR, leave feedback, and iterate there.
```