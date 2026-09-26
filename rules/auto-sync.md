---
title: Antigravity Cross-Machine Auto-Sync Rule
trigger: always_on
---

# 🔄 Antigravity Cross-Machine Configuration & Skill Sync

## Objective
Ensure seamless parity between macOS and Windows environments across skills, MCP servers, and project repositories.

## 1. Global Customizations & Skills Sync (`antigravity-config`)
- **Startup Check:** On session start, verify and pull the latest changes from `https://github.com/Tonileblan/antigravity-config`.
- **Platform Execution:**
  - On macOS: Runs `install.sh` if new skills/rules are detected.
  - On Windows: Runs `install.ps1` if new skills/rules are detected.
- **Skill Propagation:** Whenever a new skill or rule is modified or added, commit and push to `antigravity-config` automatically so the other machine receives it.

## 2. Active Project Workspace Sync (Code & Canvas Designs)
- **Pre-Flight Check:** Whenever a task or conversation starts inside a project repository (e.g. `Control61-Web`, `Bicicletas-Puertanueva`, etc.):
  - Check if remote tracking branch (`origin/main`) has newer commits.
  - Perform a fast fast-forward pull so the workspace is 100% updated with changes made on the other machine.
- **Auto-Commit & Push:** When completing significant milestones (like UI suites, `.pen` canvas changes, or feature implementations), propose or push changes to keep the remote branch up-to-date.
