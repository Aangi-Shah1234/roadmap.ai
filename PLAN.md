# Roadmap AI - Project Plan

## 1. Project Overview
A full-stack **Roadmap Website** (like roadmap.sh) featuring:
- Interactive visual flowchart roadmaps with milestone-based learning tracks.
- **Learners**: Can sign up, log in, view roadmaps, mark topics as completed, and track progress.
- **Admin**: Can log in and manage subjects (DevOps, Cloud Engineering, etc.), milestones, topics, and resources.

---

## 2. Finalized Scope & Choices

| Area | Decision |
|---|---|
| **Roadmap Structure** | Visual milestone-based tracks (DevOps: Linux ➔ Networking ➔ Git ➔ Docker ➔ K8s ➔ Terraform; Cloud: AWS ➔ EC2 ➔ VPC ➔ RDS ➔ Serverless) |
| **Node Content** | Title + Description + Resource links (docs, tutorials) + Completion status |
| **Learner Auth** | Email + Password signup and login |
| **Learner Features** | Personal dashboard with enrolled tracks and progress completion bars |
| **Admin Auth** | Simple single-admin login (`admin@roadmap.ai`) |
| **Admin Features** | Dedicated portal (`/admin`) to add/edit/reorder subjects, milestones, and topics |
| **Database** | SQLite locally (`roadmap.db`) & Turso in production via Drizzle ORM |
| **Deployment** | Phase 1: Vercel with GitHub Actions CI/CD<br>Phase 2: Docker + Terraform + AWS EC2 |

---

## 3. Two-Phase Execution Plan

### Phase 1: Full-Stack Web App & Vercel Deployment
1. **Next.js & Styling**: App Router, TypeScript, Tailwind CSS, Lucide icons.
2. **Database Layer**: Drizzle ORM + SQLite, seed initial DevOps & Cloud Engineering tracks.
3. **Authentication**: Email/Password auth with sessions for Learners and Admin.
4. **Visual Canvas**: React Flow (`@xyflow/react`) + Dagre auto-layout for milestone roadmaps.
5. **Topic Drawer**: Click node to open resources, explanations, and mark complete.
6. **Admin Panel**: Manage subjects, milestones, and topics.
7. **CI/CD Pipeline**: GitHub Actions workflow for linting, type-checking, and build validation.

### Phase 2: Docker, Terraform & AWS EC2 Deployment
1. **Dockerization**: Multi-stage production `Dockerfile` and `docker-compose.yml`.
2. **Terraform IaC**: Automated AWS VPC, Security Group, and EC2 instance provisioning.
3. **EC2 Deployment**: Docker Compose execution on AWS EC2.

---

## 4. Current Status
- [x] Initial plan defined.
- [x] Requirements gathered & submitted.
- [ ] Bootstrap Next.js project with Tailwind CSS & dependencies.
- [ ] Configure Drizzle ORM schema & seed database.
- [ ] Implement Auth (Learner & Admin).
- [ ] Build React Flow roadmap viewer & Admin portal.
