# 8centrik Git Workflow & Branching Strategy

## Overview
This document outlines the Git workflow for the 8centrik health application, designed to align with our Docker 3-container architecture (Production, Staging, MCP Server).

## Repository
- **GitHub Repository**: https://github.com/DMAC-builds/8centrik.git
- **Organization**: DMAC-builds
- **Project**: 8centrik (formerly v0-healthapp)

---

## Branching Strategy

### Branch Structure
We use a **Git Flow-inspired** branching strategy aligned with our container architecture:

```
main (production-ready)
├── staging (pre-production testing)
└── development (active development)
    ├── feature/feature-name
    ├── bugfix/bug-description
    └── hotfix/critical-fix
```

### Branch Definitions

#### `main` (Production)
- **Purpose**: Production-ready code deployed to `v0-dev-container` (Port 3000)
- **Protection**: Protected branch, requires PR approval
- **Deploys to**: Production Docker container
- **Merge from**: `staging` branch only (after thorough testing)
- **Never commit directly**: Always merge via pull request

#### `staging` (Pre-Production)
- **Purpose**: Pre-production testing environment for `v0-app-staging` (Port 3002)
- **Protection**: Requires PR review
- **Deploys to**: Staging Docker container
- **Merge from**: `development` branch and hotfixes
- **Testing**: Full integration testing, user acceptance testing
- **Merge to**: `main` after successful testing

#### `development` (Active Development)
- **Purpose**: Integration branch for ongoing development
- **Merge from**: Feature branches, bugfix branches
- **Merge to**: `staging` when ready for testing
- **Testing**: Unit tests, basic integration tests
- **Convention**: Latest development work integrates here first

#### Feature Branches
- **Naming**: `feature/descriptive-feature-name`
- **Created from**: `development`
- **Merged to**: `development`
- **Lifespan**: Short-lived (delete after merge)
- **Examples**:
  - `feature/kroger-cart-integration`
  - `feature/meal-plan-ai-enhancement`
  - `feature/user-authentication-flow`

#### Bugfix Branches
- **Naming**: `bugfix/issue-description`
- **Created from**: `development`
- **Merged to**: `development`
- **Examples**:
  - `bugfix/rls-policy-user-activities`
  - `bugfix/oauth-token-refresh`

#### Hotfix Branches
- **Naming**: `hotfix/critical-issue`
- **Created from**: `main` (for production issues)
- **Merged to**: `main`, `staging`, AND `development`
- **Use case**: Critical production bugs requiring immediate fix
- **Examples**:
  - `hotfix/security-vulnerability-patch`
  - `hotfix/database-connection-failure`

---

## Workflow Procedures

### Standard Development Flow

1. **Create Feature Branch**
   ```bash
   git checkout development
   git pull origin development
   git checkout -b feature/your-feature-name
   ```

2. **Develop & Commit**
   ```bash
   # Make changes
   git add .
   git commit -m "feat: descriptive commit message"
   ```

3. **Push to Remote**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **Open Pull Request**
   - Create PR from `feature/your-feature-name` → `development`
   - Add description, link issues
   - Request review

5. **Merge to Development**
   - After approval, merge PR
   - Delete feature branch

6. **Promote to Staging**
   ```bash
   git checkout staging
   git pull origin staging
   git merge development
   git push origin staging
   ```

7. **Deploy & Test Staging**
   - Deploy to staging container (Port 3002)
   - Run full test suite
   - Perform user acceptance testing

8. **Promote to Production**
   ```bash
   git checkout main
   git pull origin main
   git merge staging
   git push origin main
   ```

### Hotfix Flow (Production Emergency)

1. **Create Hotfix from Main**
   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-issue
   ```

2. **Fix & Test**
   ```bash
   # Make fix
   git add .
   git commit -m "hotfix: critical issue description"
   ```

3. **Merge to Main (Fast)**
   ```bash
   git checkout main
   git merge hotfix/critical-issue
   git push origin main
   ```

4. **Backport to Staging & Development**
   ```bash
   git checkout staging
   git merge hotfix/critical-issue
   git push origin staging
   
   git checkout development
   git merge hotfix/critical-issue
   git push origin development
   ```

5. **Delete Hotfix Branch**
   ```bash
   git branch -d hotfix/critical-issue
   git push origin --delete hotfix/critical-issue
   ```

---

## Commit Message Conventions

Use **Conventional Commits** format for clarity and automation:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code formatting (no logic change)
- `refactor`: Code restructuring (no feature/bug change)
- `test`: Adding/updating tests
- `chore`: Build process, dependencies, tooling
- `perf`: Performance improvements
- `ci`: CI/CD configuration changes

### Examples
```bash
git commit -m "feat(kroger): add OAuth token refresh mechanism"
git commit -m "fix(auth): resolve RLS policy violation on user_activities"
git commit -m "docs(readme): update Docker container setup instructions"
git commit -m "chore(deps): upgrade Next.js to 15.2.4"
```

---

## Docker Container Alignment

### Production Container (Port 3000)
- **Branch**: `main`
- **Container**: `v0-dev-container`
- **Purpose**: Live production application
- **Deployment**: Manual or CI/CD from `main` branch

### Staging Container (Port 3002)
- **Branch**: `staging`
- **Container**: `v0-app-staging`
- **Purpose**: Pre-production testing and validation
- **Deployment**: From `staging` branch

### MCP Server (Port 3001)
- **Branch**: Follows main app branch (same codebase)
- **Container**: `kroger-mcp-server-final`
- **Directory**: `/mcp-kroger-server`
- **Purpose**: Kroger API integration service (shared across environments)

---

## Pull Request Guidelines

### PR Template Checklist
- [ ] Descriptive title following commit conventions
- [ ] Clear description of changes and motivation
- [ ] Link to related issues/tickets
- [ ] Tests added/updated (if applicable)
- [ ] Documentation updated (if applicable)
- [ ] No merge conflicts with target branch
- [ ] CI/CD checks pass
- [ ] Reviewed and approved by team member

### Review Process
1. **Self-review**: Review your own changes before requesting review
2. **Automated checks**: Ensure linting, type checking, tests pass
3. **Peer review**: At least one approval required
4. **Address feedback**: Respond to all comments
5. **Merge**: Use "Squash and merge" for feature branches

---

## CI/CD Integration (Future)

### Planned Automation
- **On push to `development`**: Run tests, lint, type check
- **On PR to `staging`**: Deploy to staging container, run integration tests
- **On merge to `main`**: Deploy to production container, run smoke tests
- **On tag creation**: Create GitHub release with changelog

### GitHub Actions Triggers (To Be Implemented)
```yaml
# .github/workflows/main.yml (example)
on:
  push:
    branches: [main, staging, development]
  pull_request:
    branches: [main, staging]
```

---

## Best Practices

### Do's ✅
- Pull latest changes before creating new branches
- Write clear, descriptive commit messages
- Keep feature branches small and focused
- Test locally before pushing
- Rebase feature branches to keep history clean
- Delete branches after merging
- Use `.env.example` files (commit these, NOT `.env`)

### Don'ts ❌
- Never commit `.env` files with secrets
- Don't commit `node_modules/` or build artifacts
- Don't force push to `main` or `staging`
- Don't merge without PR review
- Don't commit directly to `main` or `staging`
- Don't leave stale branches undeleted

---

## Environment Variables & Secrets

### Git Repository (Commit These)
- `.env.example` - Template with placeholder values
- `docker-compose.yml` - Container orchestration config
- `Dockerfile` - Container build instructions

### Never Commit (In .gitignore)
- `.env` - Actual secrets and API keys
- `.env.local` - Local development overrides
- `mcp-kroger-server/.env` - MCP server secrets
- Any file containing `KROGER_CLIENT_SECRET`, database passwords, etc.

### Managing Secrets
1. Store secrets in `.env` files (gitignored)
2. Document required variables in `.env.example`
3. Use GitHub Secrets for CI/CD
4. Rotate credentials regularly

---

## Troubleshooting Git Issues

### Reset Local Branch to Remote
```bash
git fetch origin
git reset --hard origin/main
```

### Undo Last Commit (Keep Changes)
```bash
git reset --soft HEAD~1
```

### Resolve Merge Conflicts
```bash
git checkout development
git pull origin development
git checkout your-branch
git merge development
# Resolve conflicts in editor
git add .
git commit -m "chore: resolve merge conflicts with development"
```

### View Commit History
```bash
git log --oneline --graph --decorate --all
```

---

## Tags & Releases

### Semantic Versioning
Use semver format: `vMAJOR.MINOR.PATCH`

```bash
# Create tag
git tag -a v1.0.0 -m "Release version 1.0.0: Initial production release"
git push origin v1.0.0

# List tags
git tag -l

# Delete tag
git tag -d v1.0.0
git push origin --delete v1.0.0
```

### Release Notes
Create GitHub releases from tags with:
- Version number
- Release date
- New features
- Bug fixes
- Breaking changes
- Contributors

---

## Team Collaboration

### Code Review Focus
- Correctness and logic
- Performance implications
- Security concerns
- Code readability and maintainability
- Test coverage
- Documentation completeness

### Communication
- Use PR comments for code-specific discussions
- Link relevant issues and documentation
- Tag team members for specific reviews
- Update PR descriptions as scope changes

---

## Quick Reference Commands

```bash
# Clone repository
git clone https://github.com/DMAC-builds/8centrik.git

# Check current branch and status
git status
git branch -a

# Create and switch to new branch
git checkout -b feature/new-feature

# Stage and commit changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/new-feature

# Pull latest changes
git pull origin development

# Switch branches
git checkout staging

# Merge branch
git merge feature/new-feature

# View remote repositories
git remote -v

# Sync fork (if applicable)
git fetch upstream
git merge upstream/main
```

---

## Support & Questions

For questions about this workflow:
1. Check this document first
2. Review recent PRs for examples
3. Ask in team chat/Slack
4. Consult Git documentation: https://git-scm.com/doc

---

**Last Updated**: January 2025  
**Maintained By**: DMAC-builds team
