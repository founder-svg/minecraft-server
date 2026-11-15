# Contributing to Wixfox Minecraft Network

Thank you for contributing to the **Wixfox Minecraft Network**!

---

## 1. Code of Conduct

All contributors, developers, and administrators are expected to adhere to our team standards of respect, professional communication, and collaborative problem-solving.

---

## 2. Git Workflow & Branching Strategy

We follow a structured Git branching model:

- `main`: Production-ready code only. Changes are deployed to staging/production via GitHub Actions.
- `develop`: Integration branch for tested features.
- `feature/<feature-name>`: Dedicated branches for new features or plugin enhancements.
- `bugfix/<issue-name>`: Dedicated branches for bug fixes.
- `hotfix/<issue-name>`: Emergency production hotfixes directly branched from `main`.

### Pull Request (PR) Requirements
1. Fork or branch from `develop`.
2. Ensure all plugin unit tests and backend tests pass (`mvn test`, `npm test`).
3. Maintain clean, descriptive commit messages following the Conventional Commits specification:
   - `feat: add claim expiration to LandProtection`
   - `fix: resolve race condition in EconomyCore balance transfer`
   - `docs: update deployment guidelines in README`
4. Open a Pull Request against `develop` with a complete description of the changes.

---

## 3. Java & Plugin Guidelines

1. **Target Java Version**: Java 21 LTS.
2. **Asynchronous Execution**: Never perform blocking I/O (database, disk, network HTTP) on the Minecraft main thread. Use `CompletableFuture.runAsync()` or Bukkit scheduler asynchronous tasks.
3. **Paper API**: Favor modern Paper API methods over deprecated Bukkit/Spigot methods (e.g., use Adventure `Component` and `MiniMessage` instead of legacy `§` or `ChatColor` strings).
4. **Error Handling**: Catch and log all database exceptions cleanly without swallowing stack traces or crashing the server thread.

---

## 4. Backend (NestJS) Guidelines

1. Follow NestJS modular design patterns: Controller -> Service -> Repository.
2. Strictly validate all incoming HTTP payloads using `class-validator` and `class-transformer` DTOs.
3. Keep all administrative actions logged in the `audit_logs` table.

---

## 5. Testing

- Run plugin unit tests:
  ```bash
  cd plugins
  mvn clean test
  ```
- Run backend unit tests:
  ```bash
  cd backend
  npm run test
  ```
- Validate Docker build:
  ```bash
  docker compose config
  ```
