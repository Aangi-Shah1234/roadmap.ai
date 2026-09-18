# DevOps Engineering Skill & Standards

## Purpose
Sets rigorous standards for containerization, continuous integration, infrastructure as code, and cloud deployment.

## Core Rules & Patterns
1. **Containerization (Docker)**:
   - Use multi-stage Docker builds (`deps` ➔ `builder` ➔ `runner`) to minimize final image footprint (< 150MB).
   - Never run containers as root; define dedicated system user (`nextjs:nodejs` UID 1001).
   - Leverage `.dockerignore` to exclude `.git`, `node_modules`, and local SQLite `.db` caches.
2. **CI/CD Automation (GitHub Actions)**:
   - Run type checks (`npm run typecheck`), automated tests (`npm test`), and production build verification (`npm run build`) on every push and PR.
   - Cache `node_modules` between pipeline runs using `actions/setup-node`.
3. **Infrastructure as Code (Terraform)**:
   - Keep Terraform configurations declarative, modular, and parameterized via `variables.tf`.
   - Provision isolated VPC networks with distinct public/private subnets and tight Security Group ingress rules (restrict to ports 22, 80, 443, 3000).
   - Automate server initialization via cloud-init / `user_data` scripts.
