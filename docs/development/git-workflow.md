# Next360 — Git Workflow

## Branch Strategy

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code. Protected, requires PR. |
| `develop` | Integration branch. Features merge here first. |
| `feature/*` | New features (e.g., `feature/seller-dashboard`) |
| `bugfix/*` | Bug fixes (e.g., `bugfix/cart-stock-validation`) |
| `hotfix/*` | Urgent production fixes (branch from `main`) |

## Workflow

1. Create feature branch from `develop`
2. Implement changes with meaningful commits
3. Open PR to `develop`
4. CI must pass
5. Code review required
6. Merge to `develop`
7. `develop` → `main` for releases (manual approval)
