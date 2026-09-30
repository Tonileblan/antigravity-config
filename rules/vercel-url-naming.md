# 🌐 Vercel Naming Conventions

## Objective
Establish strict naming conventions for Vercel projects, deployments, and domains to ensure clean, professional, and readable URLs.

## Rules for Vercel URLs
Whenever you (the agent) create a new project, assign an alias, or deploy an application via Vercel, you MUST adhere to the following URL naming conventions:

1. **Prioritize Short, Single-Word Names**: Use clean names like `Nombre.vercel.app` (e.g., `Bikeflow.vercel.app` or `Memberout.vercel.app`).
2. **Avoid Hyphenation**: Do NOT use multi-word hyphenated names if possible (e.g., avoid `mi-proyecto-super-chulo.vercel.app` or `nombre-nombre-nombre.vercel.app`).
3. **Avoid Random Suffixes**: Ensure the assigned Vercel URL does not contain random alphanumeric suffixes unless absolutely necessary to avoid conflicts.
4. **PascalCase / CamelCase Allowed**: If multiple words are necessary for uniqueness, combine them without hyphens using PascalCase or camelCase (e.g., `FlowGirl.vercel.app`), but single words or simple brand names are strongly preferred.

**Agent Actionable Item**: Before calling `create_project`, `create_deployment` or `assign_alias` tools in Vercel, validate the `name` or `alias` string against these rules. If the user provides a hyphenated or long name, automatically simplify it to a clean brand name before executing the creation.
