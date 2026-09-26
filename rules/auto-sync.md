---
title: Antigravity Cross-Machine Auto-Sync Rule
trigger: always_on
---

# 🔄 Antigravity Cross-Machine Configuration & Skill Sync

## Objective
Ensure that whenever Antigravity is active on either macOS or Windows, skills, MCP tools, and custom configurations are synchronized with the central repository (`https://github.com/Tonileblan/antigravity-config`).

## Sync Protocol
1. **Startup Check:**
   - On session start or before configuring new tools, ensure the local configuration is up-to-date with `origin/main`.
   - On macOS: Runs `~/Proyectos/antigravity-config/install.sh` if new skills are detected.
   - On Windows: Runs `C:\Proyectos\antigravity-config\install.ps1` if new skills are detected.

2. **Skill Propagation:**
   - Whenever a new skill or rule is added or modified during a session, commit and push to `antigravity-config` so the other machine receives the update immediately.
