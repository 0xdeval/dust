# Contributing to Dust

Thank you for considering contributing to **Dust**! We welcome all kinds of contributions including bug fixes, new features, documentation improvements, and more.

## 🚀 Getting Started

1. **Fork the repository** to your GitHub account
2. **Clone your fork** locally:

   ```bash
   git clone https://github.com/YOUR_USERNAME/dust.git
   cd dust
   ```

3. **Install dependencies**:

   ```bash
   bun install
   ```

4. **Create a branch** for your changes:

   ```bash
   git checkout -b feature/my-feature
   ```

## 📦 Development Workflow

- Make your changes in a new branch
- Ensure your code is clean:

  ```bash
  bun run lint
  bun run test
  ```

- Commit your changes
- Push your branch to your fork
- Submit a Pull Request (PR) to the main repository

## 📝 Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) standard:

```
type(scope): short description
```

**Examples:**

- `feat(ui): add dark mode toggle`
- `fix(swap): resolve rounding issue with token amounts`
- `docs(readme): update installation guide`

Common `type` values:

- `feat`: a new feature
- `fix`: a bug fix
- `docs`: documentation changes
- `style`: code formatting
- `refactor`: code restructuring
- `test`: adding or updating tests
- `chore`: other changes like tooling or CI config

## 🌿 Branching Strategy

We use a simplified branching model:

- `main`: production-ready code
- `dev`: active development
- `feature/*`: new features
- `fix/*`: bug fixes

Create your feature or fix branches from `dev` and target your PRs into `dev` unless otherwise instructed.

## ✅ Pull Request Checklist

Before opening a PR:

- [ ] All tests pass (`bun run test`)
- [ ] Code is linted (`bun run lint`)
- [ ] Feature or fix is well-documented
- [ ] Screenshots or preview GIFs added (if applicable)

## 💬 Questions or Help?

Feel free to open an issue for support or clarification. We’d love to help you contribute!

Thanks for making **Dust** better! ✨
