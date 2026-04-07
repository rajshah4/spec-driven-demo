---
name: specify
description: This skill should be used when a new issue is opened and needs a functional specification. It transforms rough feature ideas into detailed spec.json documents with user stories, requirements, and acceptance criteria, while also posting clarifying questions.
---

# Specify Skill

A Product Manager AI that transforms rough ideas into detailed functional specifications.

## Task Overview

1. **Create feature branch** - All work happens on a feature branch, never directly on main
2. **Read the issue** - Understand what the user wants to build and why
3. **Explore the codebase** - Understand existing patterns, architecture, and conventions
4. **Create the spec** - Write an initial specification draft based on available information
5. **Post final comment** - When the spec step is complete, post the `Step Details Comment`

## Branch Management

**IMPORTANT**: All work must be done on the feature branch specified in the context (`feature_branch`).

1. Create the feature branch from main if it doesn't exist:
   ```bash
   git checkout -b {feature_branch} main
   ```
2. All commits go to this branch
3. Push the branch to origin after committing
4. **Never push directly to main**

## Output Location

Create the specification file at: `{spec_directory}/spec.json`

The `spec_directory` and `feature_branch` are provided in the context.

## Specification Format

Create `spec.json` as structured JSON that matches `.specify/schema/spec.schema.json`.

```json
{
  "version": "1.0",
  "feature": "{Issue Title}",
  "issue": {
    "number": {issue_number},
    "title": "{Issue Title}",
    "url": "{issue_url}"
  },
  "problem_statement": "What problem does this solve and why is it needed?",
  "user_stories": [
    {
      "as_a": "persona",
      "i_want": "functionality",
      "so_that": "benefit"
    }
  ],
  "requirements": {
    "must_have": ["Requirement 1"],
    "should_have": ["Requirement 2"],
    "nice_to_have": ["Requirement 3"]
  },
  "acceptance_criteria": ["Verify ..."],
  "out_of_scope": ["Not included ..."],
  "open_questions": ["Any unresolved question?"]
}
```

## Rules

- Focus on WHAT and WHY, not HOW (no tech stack decisions)
- Preserve the original issue content
- Be explicit about what's in scope vs out of scope
- **All work on the feature branch** - never push to main
- Commit the spec.json file to the feature branch
- Add `spec-ready` label when done

## Step Details Comment

When the spec step is complete, post a new issue comment with the details of the step. Include:

- A link to the conversation (a link can be found in the previous comment)
- The feature branch you used
- The path to `{spec_directory}/spec.json` as a hyperlink
- Confirmation that `spec-ready` was added
- A concise summary of the spec scope
- The clarifying questions that still need answers, if any
- The next step for the user (`spec-approved`)

**File Links:** All file paths referenced in the comment must be hyperlinks to their location in the branch using this format:
`https://github.com/{repository}/blob/{feature_branch}/{file_path}`

For example, if `repository` is `acme/demo` and `feature_branch` is `feature/42-add-login`, then `{spec_directory}/spec.json` should link to:
`https://github.com/acme/demo/blob/feature/42-add-login/.specify/specs/042-add-login/spec.json`

Example format:

```markdown
## 🧾 Spec Step Complete

- Created feature branch: `{feature_branch}`
- Created specification at [`{spec_directory}/spec.json`](https://github.com/{repository}/blob/{feature_branch}/{spec_directory}/spec.json)
- Added `spec-ready` label
- **Scope summary:** [Brief summary]

## ❓ Open Questions

- [Question 1]
- [Question 2]

Provide your responses: {link to conversation}

**Next Step:** Review the spec, answer any open questions, then add the `spec-approved` label to proceed to planning.
```

## Responding to Feedback

If users provide responses in the conversation:
1. Update the spec.json file based on their feedback
2. Commit the changes to the feature branch
3. Post a new issue comment summarizing what changed and any remaining open questions