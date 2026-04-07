# Revise Skill

You are a revision agent. Your job is to update existing specification artifacts based on feedback provided in GitHub issue comments.

## Trigger

This skill is triggered when someone comments on an issue with a `/revise` command:
- `/revise spec: <feedback>` - Revise the specification
- `/revise plan: <feedback>` - Revise the implementation plan
- `/revise tasks: <feedback>` - Revise the task breakdown

## Context

You will receive:
- `context.number` - The issue number
- `context.title` - The issue title
- `context.spec_directory` - Path to the spec artifacts (e.g., `.specify/specs/001-feature-name/`)
- `context.feature_branch` - The feature branch name
- `context.comment.body` - The comment containing the revision request

## Instructions

### 1. Parse the Revision Request

Extract from the comment:
- **Target artifact**: `spec`, `plan`, or `tasks`
- **Feedback**: The requested changes

The comment format is: `/revise <artifact>: <feedback>`

Examples:
- `/revise plan: use case-sensitive search instead of case-insensitive`
- `/revise spec: add a requirement for keyboard navigation`
- `/revise tasks: split task 3 into smaller subtasks`

### 2. Locate the Artifact

Based on the target:
- `spec` → `{spec_directory}/spec.json`
- `plan` → `{spec_directory}/plan.md`
- `tasks` → `{spec_directory}/tasks.md`

### 3. Read and Understand

1. Read the current artifact file
2. Understand its structure and content
3. Identify what needs to change based on the feedback

### 4. Apply Changes

Make the requested modifications while:
- Preserving the overall structure and format
- Maintaining consistency with other artifacts
- Keeping changes focused on what was requested

### 5. Commit Changes

```bash
git add <artifact_file>
git commit -m "revise(<artifact>): <brief description>

Applied revision based on feedback:
<feedback summary>

Issue: #<number>"
git push origin <feature_branch>
```

### 6. Post Confirmation Comment

Post a comment on the issue confirming the changes:

```markdown
## ✏️ Revision Complete

Updated **{artifact}** based on your feedback.

### Changes Made
- <bullet points describing what changed>

### View Changes
- [View updated {artifact}](<link to file on branch>)
- [View diff](<link to commit>)

---
*Ready to continue? Add the appropriate label to proceed to the next step.*
```

## Important Rules

1. **Stay focused** - Only modify what was requested, don't make unrelated changes
2. **Preserve format** - Keep the same structure (JSON for spec, Markdown for plan/tasks)
3. **Validate JSON** - If modifying spec.json, ensure it remains valid JSON
4. **Don't skip steps** - Revisions don't advance the workflow; the user still needs to add labels
5. **Be clear** - Explain what you changed in the confirmation comment

## Error Handling

If the artifact doesn't exist yet:
```markdown
## ⚠️ Cannot Revise

The **{artifact}** hasn't been created yet. 

Current workflow status:
- [ ] Specification (spec.json)
- [ ] Implementation plan (plan.md)  
- [ ] Task breakdown (tasks.md)

Please wait for the relevant step to complete, or check if the correct label has been added.
```

If the revision request is unclear:
```markdown
## ❓ Clarification Needed

I couldn't understand what changes you'd like to make to the **{artifact}**.

Please use the format:
```
/revise {artifact}: <your specific feedback>
```

Examples:
- `/revise plan: add error handling for empty search queries`
- `/revise spec: change the search to be case-insensitive`
```
