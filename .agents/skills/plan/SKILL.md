---
name: plan
description: This skill should be used when the 'spec-approved' label is added to an issue. It creates technical implementation plans from approved specifications, analyzing the codebase and designing the architecture.
---

# Plan Skill

A Software Architect AI that creates technical implementation plans from specifications.

## Task Overview

1. **Switch to feature branch** - All work happens on the existing feature branch
2. **Read the spec** - Load `{spec_directory}/spec.json`
3. **Analyze the codebase** - Understand existing architecture, frameworks, patterns
4. **Research if needed** - For rapidly changing frameworks, verify current best practices
5. **Create the plan** - Write a technical implementation plan

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

Create the plan file at: `{spec_directory}/plan.md`

The `spec_directory` and `feature_branch` are provided in the context.

## Plan Format

Use this format for the plan.md file:

```markdown
# Implementation Plan: {Feature Title}

> Spec: [spec.json](./spec.json)
> Status: Draft

## Technical Approach

High-level description of the implementation approach.

## Technology Stack

- **Framework:** (existing or recommended)
- **Database:** (if applicable)
- **Libraries:** List key libraries/dependencies
- **Patterns:** Design patterns to use

## Architecture

### Components

1. **Component A** - Description and responsibility
2. **Component B** - Description and responsibility

### Data Model

Describe any new models, schemas, or data structures.

### API Contracts

Define any new endpoints or interfaces.

## File Changes

### New Files
- `path/to/new/file.ts` - Purpose

### Modified Files
- `path/to/existing/file.ts` - What changes

## Integration Points

How this integrates with existing code.

## Testing Strategy

- Unit tests for ...
- Integration tests for ...

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Risk 1 | How to address |

## Dependencies

External dependencies or prerequisites.
```

## Rules

- Read the existing codebase before making tech decisions
- Align with existing patterns and conventions
- Be specific about file paths and component names
- **All work on the feature branch** - never push to main
- Commit the plan.md file to the feature branch
- Add `plan-ready` label when done
- When the plan step is complete, post a new issue comment with the details from the `Step Details Comment` section

## Step Details Comment

When the plan step is complete, post a new issue comment that includes:

- The branch you worked on: `{feature_branch}`
- The path to `{spec_directory}/plan.md` as a hyperlink
- Confirmation that `plan-ready` was added
- A brief summary of the technical approach
- The key components or files affected
- The next step for the user (`plan-approved`)

**File Links:** All file paths referenced in the comment must be hyperlinks to their location in the branch using this format:
`https://github.com/{repository}/blob/{feature_branch}/{file_path}`

For example, if `repository` is `acme/demo` and `feature_branch` is `feature/42-add-login`, then `{spec_directory}/plan.md` should link to:
`https://github.com/acme/demo/blob/feature/42-add-login/.specify/specs/042-add-login/plan.md`

Example format:

```markdown
## 🧾 Plan Step Complete

- Working on branch: `{feature_branch}`
- Created implementation plan at [`{spec_directory}/plan.md`](https://github.com/{repository}/blob/{feature_branch}/{spec_directory}/plan.md)
- Added `plan-ready` label
- **Technical approach:** [Brief summary of the approach]
- **Key components:** [List main components/changes]

**Next Step:** Review the plan and add the `plan-approved` label to proceed to task breakdown.
```
