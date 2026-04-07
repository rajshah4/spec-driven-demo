#!/usr/bin/env python3
"""
OpenHands Agent Runner - Routes GitHub events to appropriate skills.

This script:
1. Parses the GitHub event to determine which skill to invoke
2. Constructs a self-contained prompt with full context
3. Creates an OpenHands Cloud conversation to execute the skill
4. Posts a step-specific acknowledgement comment with the conversation URL
5. Lets the agent add separate follow-up comments with step results
"""

import json
import os
import sys
import time
from pathlib import Path

import httpx

# ============================================================================
# CONFIGURATION
# ============================================================================

# Skills are stored in .agents/skills/ directory (Agent Skills format)
REPO_ROOT = Path(__file__).parent.parent.parent
SKILLS_DIR = REPO_ROOT / ".agents" / "skills"
OPENHANDS_API_URL = "https://app.all-hands.dev/api/v1"
GITHUB_API_URL = "https://api.github.com"

# Routing rules: (event_name, action, label, skill_name)
# label=None means "no specific label required"
# For labeled events, only the newly added label triggers the skill
ROUTING_RULES = [
    # Step 1: New issue -> SPECIFY (create spec)
    ("issues", "opened", None, "specify"),
    
    # Step 2: Spec approved -> PLAN (create technical plan)
    ("issues", "labeled", "spec-approved", "plan"),
    
    # Step 3: Plan approved -> TASKS (break down into tasks)
    ("issues", "labeled", "plan-approved", "tasks"),
    
    # Step 4: Ready to implement -> IMPLEMENT (write code)
    ("issues", "labeled", "ready-to-implement", "implement"),
    
    # Step 5: PR review -> respond to feedback
    ("pull_request_review", "submitted", None, "pr-responder"),
    
    # Revision command: /revise spec|plan|tasks: <feedback>
    # Handled specially in determine_skill() - checks comment body
    ("issue_comment", "created", None, "revise"),
]

# Comment prefixes that trigger specific skills
COMMENT_TRIGGERS = {
    "/revise": "revise",
}


# ============================================================================
# OPENHANDS CLOUD CLIENT
# ============================================================================

class GitHubClient:
    """Minimal client for GitHub API operations."""
    
    def __init__(self, token: str):
        self.token = token
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Accept": "application/vnd.github.v3+json",
            "Content-Type": "application/json",
        }
    
    def create_issue_comment(self, repo: str, issue_number: int, body: str) -> dict:
        """Create a comment on an issue."""
        resp = httpx.post(
            f"{GITHUB_API_URL}/repos/{repo}/issues/{issue_number}/comments",
            headers=self.headers,
            json={"body": body},
            timeout=30,
        )
        resp.raise_for_status()
        return resp.json()
    

class OpenHandsCloudWorkspace:
    """Minimal client for creating OpenHands Cloud conversations."""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
    
    def create_conversation(
        self,
        initial_message: str,
        repository: str,
        branch: str = "main",
        title: str | None = None,
    ) -> dict:
        """Start a new OpenHands Cloud conversation.

        POST /api/v1/app-conversations is asynchronous and returns a start-task
        object whose `id` is the start_task_id, not the conversation ID.
        We poll the start-task until `app_conversation_id` is populated.
        """
        payload = {
            "initial_message": {
                "role": "user",
                "content": [{"type": "text", "text": initial_message}],
                "run": True,
            },
            "selected_repository": repository,
            "selected_branch": branch,
        }
        if title:
            payload["title"] = title

        resp = httpx.post(
            f"{OPENHANDS_API_URL}/app-conversations",
            headers=self.headers,
            json=payload,
            timeout=120,
        )
        resp.raise_for_status()
        result = resp.json()

        # Dump the full response so we can see exactly what the API returns.
        print(f"POST /app-conversations full response:\n{json.dumps(result, indent=2)}")

        # If app_conversation_id is already in the response, we're done.
        if result.get("app_conversation_id"):
            return result

        # The API returned a start-task object (async creation).
        # Poll GET /app-conversations/start-tasks?ids= until status == READY.
        # Per official docs: 5-second intervals, up to 60 attempts (5 minutes).
        start_task_id = result["id"]
        print(f"Async creation (start_task_id={start_task_id}), polling for READY status...")

        for attempt in range(60):
            time.sleep(5)
            try:
                r = httpx.get(
                    f"{OPENHANDS_API_URL}/app-conversations/start-tasks",
                    headers=self.headers,
                    params={"ids": start_task_id},
                    timeout=30,
                )
                print(f"  poll attempt {attempt+1}: status={r.status_code} body={r.text[:400]}")
                r.raise_for_status()
                tasks = r.json()
                if tasks and tasks[0].get("status") == "READY":
                    conversation_id = tasks[0].get("app_conversation_id")
                    print(f"  Conversation READY after {(attempt+1)*5}s: {conversation_id}")
                    return tasks[0]
                elif tasks and tasks[0].get("status") == "ERROR":
                    print(f"  Start task ERROR: {tasks[0].get('error', 'unknown')}")
                    break
            except Exception as e:
                print(f"  poll attempt {attempt+1} error: {e}")

        print("WARNING: Could not resolve app_conversation_id; falling back to start_task_id")
        return result

    def get_conversation_url(self, conversation_id: str) -> str:
        return f"https://app.all-hands.dev/conversations/{conversation_id}"


# ============================================================================
# SKILL & CONTEXT HELPERS
# ============================================================================

def load_skill(skill_name: str) -> str:
    """Load skill prompt from SKILL.md file (Agent Skills format)."""
    skill_path = SKILLS_DIR / skill_name / "SKILL.md"
    if not skill_path.exists():
        raise FileNotFoundError(f"Skill not found: {skill_path}")
    return skill_path.read_text()


def load_constitution() -> str | None:
    """Load project constitution if it exists."""
    constitution_path = Path(".specify/memory/constitution.md")
    if constitution_path.exists():
        return constitution_path.read_text()
    return None


def get_spec_directory(issue_number: int, issue_title: str) -> str:
    """Generate spec directory path from issue number and title."""
    slug = sanitize_title(issue_title)
    return f".specify/specs/{issue_number:03d}-{slug}"


def sanitize_title(title: str, max_length: int = 50) -> str:
    """Sanitize a title for use in branch names or directory names."""
    slug = title.lower()
    slug = "".join(c if c.isalnum() or c == " " else "" for c in slug)
    slug = "-".join(slug.split())[:max_length]
    return slug


def get_feature_branch(issue_number: int, issue_title: str) -> str:
    """Generate feature branch name from issue number and title."""
    slug = sanitize_title(issue_title, max_length=30)
    return f"feature/{issue_number}-{slug}"


# ============================================================================
# EVENT ROUTING
# ============================================================================

def determine_skill(event_name: str, action: str, event_label: str | None, labels: list[str], comment_body: str | None = None) -> str | None:
    """Determine which skill to run based on the event."""
    
    # Special handling for issue comments - check for command triggers
    if event_name == "issue_comment" and action == "created" and comment_body:
        comment_lower = comment_body.strip().lower()
        for trigger, skill in COMMENT_TRIGGERS.items():
            if comment_lower.startswith(trigger):
                return skill
        # No matching trigger found for this comment
        return None
    
    for rule_event, rule_action, rule_label, skill in ROUTING_RULES:
        if event_name != rule_event or action != rule_action:
            continue
        
        # Skip issue_comment rules here (handled above)
        if rule_event == "issue_comment":
            continue
        
        # For labeled events, check if the newly added label matches
        if rule_label is not None:
            if event_label == rule_label:
                return skill
        else:
            # No label required
            return skill
    
    return None


def build_context(event: dict, event_name: str) -> dict:
    """Extract relevant context from GitHub event."""
    repo = event.get("repository", {}).get("full_name", "")
    
    if event_name in ("issues", "issue_comment"):
        issue = event.get("issue", {})
        issue_number = issue.get("number")
        issue_title = issue.get("title", "feature")
        
        context = {
            "type": "issue",
            "number": issue_number,
            "title": issue_title,
            "body": issue.get("body"),
            "url": issue.get("html_url"),
            "labels": [l.get("name") for l in issue.get("labels", [])],
            "repository": repo,
            "spec_directory": get_spec_directory(issue_number, issue_title),
            "feature_branch": get_feature_branch(issue_number, issue_title),
        }
        
        # Include comment if this is a comment event
        if event_name == "issue_comment":
            comment = event.get("comment", {})
            context["comment"] = {
                "body": comment.get("body"),
                "user": comment.get("user", {}).get("login"),
            }
        
        return context
    
    elif event_name == "pull_request_review":
        pr = event.get("pull_request", {})
        review = event.get("review", {})
        return {
            "type": "pull_request_review",
            "pr_number": pr.get("number"),
            "pr_title": pr.get("title"),
            "pr_body": pr.get("body"),
            "pr_url": pr.get("html_url"),
            "pr_branch": pr.get("head", {}).get("ref"),
            "review_body": review.get("body"),
            "review_state": review.get("state"),
            "repository": repo,
        }
    
    return {"repository": repo}


# ============================================================================
# PROMPT CONSTRUCTION
# ============================================================================

def build_prompt(skill_content: str, context: dict, constitution: str | None) -> str:
    """Combine skill instructions with event context and constitution."""
    context_json = json.dumps(context, indent=2)
    
    parts = ["# Agent Instructions\n"]
    
    # Include constitution if available
    if constitution:
        parts.append("## Project Constitution (Non-Negotiable Principles)\n")
        parts.append(constitution)
        parts.append("\n---\n")
    
    # Skill instructions
    parts.append("## Task Instructions\n")
    parts.append(skill_content)
    parts.append("\n---\n")
    
    # Context
    parts.append("## Context\n")
    parts.append("The following GitHub event triggered this task:\n")
    parts.append(f"```json\n{context_json}\n```\n")
    parts.append("\nExecute the task instructions using this context. Be thorough and complete the task.")
    
    return "\n".join(parts)


# ============================================================================
# STEP COMMENTS
# ============================================================================

STEP_DISPLAY_NAMES = {
    "specify": "spec",
    "plan": "plan",
    "tasks": "task",
    "implement": "implement",
    "revise": "revision",
}


def get_step_display_name(skill_name: str) -> str:
    """Get the user-facing name for a workflow step."""
    return STEP_DISPLAY_NAMES.get(skill_name, skill_name)


def create_step_started_comment(
    github: GitHubClient,
    repo: str,
    issue_number: int,
    conversation_url: str,
    skill_name: str,
) -> dict:
    """Create a step-specific acknowledgement comment on the issue."""
    step_name = get_step_display_name(skill_name)
    body = f"OK, working on `{step_name}`. [Track my progress here]({conversation_url})."
    return github.create_issue_comment(repo, issue_number, body)


# ============================================================================
# MAIN
# ============================================================================

def main():
    # Load environment
    api_key = os.environ.get("OPENHANDS_API_KEY")
    if not api_key:
        print("ERROR: OPENHANDS_API_KEY not set")
        sys.exit(1)
    
    github_token = os.environ.get("GITHUB_TOKEN")
    if not github_token:
        print("WARNING: GITHUB_TOKEN not set, step comments disabled")
    
    event_name = os.environ.get("EVENT_NAME", "")
    event_action = os.environ.get("EVENT_ACTION", "")
    event_label = os.environ.get("EVENT_LABEL", "")  # The label that was just added
    event_payload = json.loads(os.environ.get("EVENT_PAYLOAD", "{}"))
    
    print(f"Event: {event_name}, Action: {event_action}, Label: {event_label}")
    
    # Extract context
    context = build_context(event_payload, event_name)
    labels = context.get("labels", [])
    
    # Get comment body if this is a comment event
    comment_body = context.get("comment", {}).get("body") if context.get("comment") else None
    
    # Determine skill based on event, label, and comment content
    skill_name = determine_skill(event_name, event_action, event_label or None, labels, comment_body)
    if not skill_name:
        print("No matching skill for this event. Skipping.")
        sys.exit(0)
    
    print(f"Selected skill: {skill_name}")
    
    # Load skill and constitution
    skill_content = load_skill(skill_name)
    constitution = load_constitution()
    
    # Determine branch - ALL issue-related work happens on feature branches
    # Only PR reviews use the existing PR branch
    if context.get("feature_branch"):
        # Issue-related work: specs, plans, tasks, and implementation all go to feature branch
        branch = context["feature_branch"]
    elif context.get("pr_branch"):
        # PR review: use the existing PR branch
        branch = context["pr_branch"]
    else:
        branch = "main"
    
    # Check if this needs a step-started comment (new issue, label-triggered, or /revise command)
    is_new_issue = event_name == "issues" and event_action == "opened"
    is_label_triggered = event_action == "labeled" and event_label
    is_command_triggered = event_name == "issue_comment" and skill_name in COMMENT_TRIGGERS.values()
    needs_step_comment = is_new_issue or is_label_triggered or is_command_triggered
    
    issue_number = context.get("number")
    repo = context.get("repository", "")
    
    # Build prompt with full context
    prompt = build_prompt(skill_content, context, constitution)
    
    # Create OpenHands conversation
    workspace = OpenHandsCloudWorkspace(api_key)
    
    result = workspace.create_conversation(
        initial_message=prompt,
        repository=repo,
        branch=branch,
        title=f"[{skill_name}] #{context.get('number', '')} {context.get('title', context.get('pr_title', 'Task'))}",
    )
    
    conversation_id = result.get("app_conversation_id") or result.get("id")
    conversation_url = workspace.get_conversation_url(conversation_id)
    
    print(f"OpenHands conversation started: {conversation_url}")
    print(f"Working on branch: {branch}")
    
    # Create a step-started comment for new issues and label-triggered events
    if github_token and needs_step_comment and issue_number and repo:
        try:
            github = GitHubClient(github_token)
            comment = create_step_started_comment(github, repo, issue_number, conversation_url, skill_name)
            print(f"Created step comment: {comment.get('id')}")
        except Exception as e:
            print(f"WARNING: Failed to create step comment: {e}")
    
    # Output for GitHub Actions
    github_output = os.environ.get("GITHUB_OUTPUT")
    if github_output:
        with open(github_output, "a") as f:
            f.write(f"conversation_url={conversation_url}\n")
            f.write(f"skill={skill_name}\n")


if __name__ == "__main__":
    main()
