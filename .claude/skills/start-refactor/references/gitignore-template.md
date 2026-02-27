# Additional .gitignore Rules

`dotnet new gitignore` covers standard .NET rules. Append the following project-specific exclusions:

```text
# Legacy source (reference only, not part of new project)
legacy-codes/

# Node.js (if JS frontend)
node_modules/
dist/
.env
.env.local

# IDE
.vs/
.vscode/settings.json
*.user
*.suo

# OS
Thumbs.db
.DS_Store
```

## Key Points

- `legacy-codes/` — MUST be excluded; old project is reference only
- `docs/` — MUST be tracked; analysis reports and migration plans are important records
