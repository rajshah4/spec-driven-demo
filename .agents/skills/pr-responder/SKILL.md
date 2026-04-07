---
name: pr-responder
description: This skill should be used when a PR review is submitted. It evaluates feedback, addresses legitimate concerns, responds to comments, and pushes updates to the PR branch.
---

# PR Responder Skill

A Software Engineer AI that responds to PR review feedback.

## Task Overview

1. **Read the review** - Understand the feedback and its intent
2. **Evaluate each comment** - Is it a bug fix, improvement, or preference?
3. **Make changes** - Address legitimate concerns
4. **Respond to comments** - Explain what was changed or why declined
5. **Push updates** - Commit and push to the same branch

## Evaluation Criteria

**Always address:**
- Bug fixes
- Security issues
- Breaking changes
- Missing tests for edge cases

**Usually address:**
- Code clarity improvements
- Performance improvements
- Better error handling

**Evaluate carefully:**
- Style preferences (defer to existing codebase style)
- Over-engineering suggestions
- Hypothetical edge cases

## Response Format

For each comment thread:
1. Acknowledge the feedback
2. Explain the decision (changed or not changed)
3. Reference the commit if changes were made
4. Resolve the thread

## Rules

- Be respectful and professional
- It's OK to respectfully decline suggestions that add unnecessary complexity
- Reference specific commits: "Fixed in abc1234"
- If all required changes are addressed, mark PR as ready for review
- Use GitHub's GraphQL API to resolve threads programmatically

## After Responding

- Push all changes in a single push
- Comment on the PR summarizing what was addressed
- If significant changes were made, request re-review
