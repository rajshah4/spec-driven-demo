# OpenSpec Development with OpenHands

A GitHub-native workflow for automating the journey from issue to draft PR using OpenHands Cloud agents and structured OpenSpec artifacts.

## Quick Start

### Prerequisites

1. An OpenHands Cloud account and API key
2. A GitHub repository with Actions enabled
3. Repository secrets configured

### Setup

1. **Add required repository secret**
   - Go to **Settings -> Secrets and variables -> Actions**
   - Add `OPENHANDS_API_KEY` with your OpenHands Cloud API key

2. **Create required labels**

   | Label | Color | Description |
   |-------|-------|-------------|
   | `spec-approved` | `#0E8A16` | Spec is approved, ready for planning |
   | `plan-approved` | `#0E8A16` | Plan is approved, ready for task breakdown |
   | `ready-to-implement` | `#0E8A16` | Tasks approved, ready for implementation |
   | `needs-clarification` | `#FBCA04` | Needs more information |
   | `spec-ready` | `#1D76DB` | Spec draft is ready for review |
   | `plan-ready` | `#1D76DB` | Plan draft is ready for review |
   | `tasks-ready` | `#1D76DB` | Tasks draft is ready for review |

3. **Enable workflows**
   - `.github/workflows/openhands-agent.yml` routes issue/label/review events to skills
   - `.github/workflows/validate-openspec.yml` validates `spec.json` artifacts

4. **Use the workflow**
   - Create an issue with your feature idea
   - Agent creates `spec.json` -> adds `spec-ready`
   - Review and add `spec-approved`
   - Agent creates `plan.md` -> adds `plan-ready`
   - Review and add `plan-approved`
   - Agent creates `tasks.md` -> adds `tasks-ready`
   - Review and add `ready-to-implement`
   - Agent implements and opens a draft PR

## Local Demo (Live Run)

Use these commands to demo the app and OpenSpec validation locally.

### 1) Install dependencies

```bash
npm install
```

### 2) Validate OpenSpec artifacts

```bash
npm run validate:openspec
```

Expected output includes:

```text
Validated 1 OpenSpec file(s) successfully.
```

### 3) Start the payroll dashboard

```bash
PORT=13001 npm start
```

### 4) Verify health endpoint

```bash
curl http://127.0.0.1:13001/health
```

Expected response on fresh data:

```json
{"status":"ok","employeeCount":6}
```

### 5) Verify employee API

```bash
curl http://127.0.0.1:13001/api/employees
```

Expected response: JSON with `employees` and `summary` keys.

### 6) Open UI

Visit `http://127.0.0.1:13001/` in your browser.

## Features

### Feature Branch Workflow

All work for an issue happens on a dedicated feature branch (never directly on `main`):

1. New issue creates a branch: `feature/{issue_number}-{slug}`
2. Spec, plan, task artifacts, and implementation commits go to that branch
3. Implementation opens a draft PR into `main`
4. Main remains protected by review

### Step Comments

When a new issue is opened or a label triggers a workflow step, the agent posts an acknowledgement comment:

> OK, working on `spec`. [Track my progress here](conversation link).

After each step completes (`spec`, `plan`, `task`, `implement`), the agent posts a new issue comment with step details and next steps.

## Project Structure

```text
.agents/
└── skills/
    ├── specify/SKILL.md
    ├── plan/SKILL.md
    ├── tasks/SKILL.md
    ├── implement/SKILL.md
    └── pr-responder/SKILL.md

.github/
├── workflows/
│   ├── openhands-agent.yml
│   └── validate-openspec.yml
└── openhands/
    └── runner.py

.specify/
├── memory/
│   └── constitution.md
├── schema/
│   └── spec.schema.json
└── specs/
    └── <issue-number>-<feature>/
        ├── spec.json
        ├── plan.md
        └── tasks.md

scripts/
└── validate-openspec.js
```

## Workflow Steps

| Step | Trigger | Skill | Output |
|------|---------|-------|--------|
| 1. Specify | Issue opened | `specify` | `.specify/specs/<id>/spec.json` |
| 2. Plan | `spec-approved` label | `plan` | `.specify/specs/<id>/plan.md` |
| 3. Tasks | `plan-approved` label | `tasks` | `.specify/specs/<id>/tasks.md` |
| 4. Implement | `ready-to-implement` label | `implement` | Draft PR |
| 5. Refine | PR review submitted | `pr-responder` | Updated PR |

## Customization

### Skills

Skills are stored in `.agents/skills/` using the [OpenHands Skills format](https://docs.openhands.dev/overview/skills).

### Constitution

The constitution in `.specify/memory/constitution.md` defines non-negotiable engineering and process rules.

## Learn More

- OpenHands Skills: https://docs.openhands.dev/overview/skills
- Spec Kit / OpenSpec methodology: https://github.com/github/spec-kit
