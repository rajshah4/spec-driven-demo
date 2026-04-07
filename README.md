# Spec-Driven Development Demo

> **From idea to pull request—automated.**  
> Watch OpenHands turn a GitHub issue into a fully implemented feature through a structured spec-driven workflow.

[![OpenHands Workflow](https://img.shields.io/badge/OpenHands-Enabled-blue)](https://app.all-hands.dev)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🎯 What This Demo Shows

This repository demonstrates **spec-driven development with AI agents**. When you create a GitHub issue describing a feature, OpenHands automatically:

1. **📋 Writes a specification** — Structured requirements, user stories, acceptance criteria
2. **🏗️ Creates an implementation plan** — Architecture decisions, file changes, dependencies
3. **✅ Breaks down tasks** — Ordered, actionable implementation steps
4. **💻 Implements the code** — Opens a draft PR with working code

**You stay in control** — review and approve each step before the agent proceeds.

---

## 🖥️ The Demo App: Payroll Dashboard

A simple employee payroll management system built with **Express.js** and **SQLite**.

### Features
- 👥 View all employees with salary and manager info
- ➕ Add new employees to payroll
- ✏️ Edit employee details (name, title, salary, address, manager)
- 🗑️ Remove employees from the system
- 📊 Dashboard with headcount, total payroll, and average salary

### Screenshot

```
┌─────────────────────────────────────────────────────────────┐
│  🏢 Payroll Dashboard                                       │
├─────────────────────────────────────────────────────────────┤
│  Headcount: 6    Total Payroll: $889,000    Avg: $148,167   │
├─────────────────────────────────────────────────────────────┤
│  Name              │ Title                  │ Salary        │
│  ─────────────────────────────────────────────────────────  │
│  Sophia Carter     │ CEO                    │ $245,000      │
│  Marcus Chen       │ Director of Finance    │ $182,000      │
│  Elena Rodriguez   │ People Ops Manager     │ $154,000      │
│  Priya Patel       │ Senior Accountant      │ $118,000      │
│  Daniel Kim        │ Payroll Specialist     │ $98,000       │
│  Nina Brooks       │ HR Generalist          │ $92,000       │
└─────────────────────────────────────────────────────────────┘
```

### Run Locally

```bash
# Install dependencies
npm install

# Start the app (uses port 3000 by default)
npm start

# Or specify a custom port
PORT=8080 npm start
```

Then open http://localhost:3000 in your browser.

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Dashboard UI |
| `GET` | `/health` | Health check |
| `GET` | `/api/employees` | List all employees (JSON) |
| `POST` | `/employees` | Add new employee |
| `POST` | `/employees/:id/update` | Update employee |
| `POST` | `/employees/:id/delete` | Delete employee |

---

## 🚀 Try the Workflow

### Step 1: Create an Issue

Go to [Issues → New Issue](../../issues/new) and describe a feature:

```markdown
## Add Employee Search

Add a search box to filter employees by name or title.
Real-time filtering as the user types.
```

### Step 2: Watch the Agent Work

The agent automatically:
- Creates a feature branch
- Writes `spec.json` with requirements
- Posts a comment with a link to track progress

### Step 3: Review and Approve

When the spec is ready, add the `spec-approved` label to trigger planning.

### Step 4: Continue Through the Workflow

| Your Action | Agent Response |
|-------------|----------------|
| Create issue | → Writes specification |
| Add `spec-approved` | → Creates implementation plan |
| Add `plan-approved` | → Breaks down into tasks |
| Add `ready-to-implement` | → Implements & opens PR |

### 💡 Need to Make Changes?

Use the `/revise` command to modify any artifact without skipping ahead:

```
/revise plan: use case-sensitive search instead of case-insensitive
```

| Command | What it updates |
|---------|-----------------|
| `/revise spec: ...` | The specification (spec.json) |
| `/revise plan: ...` | The implementation plan (plan.md) |
| `/revise tasks: ...` | The task breakdown (tasks.md) |

The agent updates the artifact and posts a confirmation—you stay in control of when to proceed.

---

## 📁 Project Structure

```
├── src/
│   ├── server.js      # Express app & routes
│   ├── db.js          # SQLite database & queries
│   └── render.js      # HTML template rendering
│
├── .agents/skills/    # OpenHands skill definitions
│   ├── specify/       # Specification writing
│   ├── plan/          # Implementation planning
│   ├── tasks/         # Task breakdown
│   └── implement/     # Code implementation
│
├── .specify/          # Specification artifacts
│   ├── schema/        # OpenSpec JSON schema
│   └── specs/         # Generated specs per issue
│
└── .github/
    ├── openhands/     # Event router (runner.py)
    └── workflows/     # GitHub Actions
```

---

## ⚙️ Setup Your Own

### Prerequisites
- [OpenHands Cloud](https://app.all-hands.dev) account
- GitHub repository with Actions enabled

### Configuration

1. **Add repository secret**
   ```
   Settings → Secrets → Actions → New secret
   Name: OPENHANDS_API_KEY
   Value: <your API key from app.all-hands.dev/settings/api-keys>
   ```

2. **Labels are pre-configured** — The workflow labels (`spec-approved`, `plan-approved`, `ready-to-implement`) are already set up.

3. **Create an issue** — The workflow triggers automatically!

---

## 🔄 Workflow Diagram

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│    Issue     │────▶│     Spec     │────▶│     Plan     │────▶│    Tasks     │
│   Created    │     │   Created    │     │   Created    │     │   Created    │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                            │                    │                    │
                            ▼                    ▼                    ▼
                     spec-approved        plan-approved       ready-to-implement
                            │                    │                    │
                            ▼                    ▼                    ▼
                     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
                     │    Plan      │     │    Tasks     │     │   Draft PR   │
                     │   Skill      │     │    Skill     │     │   Created    │
                     └──────────────┘     └──────────────┘     └──────────────┘
```


> 💡 **Tip**: Use `/revise spec|plan|tasks: <feedback>` at any point to update artifacts without advancing the workflow.
---

## 📚 Learn More

- [OpenHands Documentation](https://docs.openhands.dev)
- [OpenHands Skills](https://docs.openhands.dev/overview/skills)
- [OpenHands Cloud](https://app.all-hands.dev)

---

## 📄 License

MIT
