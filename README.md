# Roadmap AI

An interactive web application designed to help anyone learn modern software engineering skills step by step.

- **Live Website (Production):** https://roadmap-ai-aashah.onslate.in
- **Repository:** https://github.com/Aangi-Shah1234/roadmap.ai

---

## About the Project

Learning technology can be overwhelming because beginners often don't know what to learn first, what to skip, or what order makes sense. Roadmap AI solves this problem by providing structured, easy-to-follow learning roadmaps across eight key technical fields:

- DevOps Engineering
- Cloud Architecture (AWS)
- Frontend Development
- Backend Development
- Full Stack Development
- AI & Machine Learning
- Cybersecurity & Ethical Hacking
- System Design & Architecture

Each track is broken down into clear milestones and bite-sized topics. Users can read focused concepts, explore curated tutorials and documentation, check off topics as they learn, and save their progress to their account.

---

## How Zoho Catalyst is Used

This application is built and hosted entirely on **Zoho Catalyst**, taking advantage of three core platform services:

### 1. Catalyst Slate (Full-Stack Hosting)
The application is built with Next.js 16 and deployed using Catalyst Slate. Slate handles:
- Server-side rendering (SSR) and client-side routing.
- Serverless API route execution (`/api/auth/*`, `/api/roadmaps/*`, `/api/progress`).
- Automatic scaling based on incoming traffic with global CDN delivery.

### 2. Catalyst Data Store (Cloud Database)
All persistent application data is stored in Catalyst Data Store across five relational tables:
- `Users`: Stores user accounts, hashed passwords, and roles (learner or admin).
- `Subjects`: Stores the 8 learning roadmaps, descriptions, categories, and icons.
- `Milestones`: Stores the sequential learning stages within each roadmap.
- `Topics`: Stores individual concept lessons, summaries, and external documentation links.
- `User_Progress`: Stores which topics each user has completed so progress persists across sessions.

### 3. Catalyst Pipelines (CI/CD Automation)
The project uses `catalyst-pipelines.yaml` to run an automated CI/CD pipeline inside Catalyst DevOps. Whenever new code is pushed to GitHub:
- Dependencies are installed in a clean cloud runner.
- The 16-check automated test suite runs in an isolated sandbox environment.
- The Next.js production build is verified before changes can be released.

---

## Tech Stack

- **Framework:** Next.js 16 (App Router), React 19
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4 (with light and dark mode support)
- **Cloud Platform:** Zoho Catalyst (Slate, Data Store, Pipelines)
- **Authentication:** JSON Web Tokens (JWT via `jose`) with `bcryptjs` password hashing and HttpOnly cookies
- **Testing:** Automated verification suite (`tests/verify-api.ts`)

---

## Project Structure

```text
roadmap-ai/
├── src/
│   ├── app/                 # Next.js App Router pages and API routes
│   │   ├── api/             # Backend API handlers (auth, roadmaps, progress)
│   │   ├── roadmap/[slug]/  # Interactive roadmap and lesson viewer
│   │   ├── dashboard/       # User dashboard and progress overview
│   │   ├── login/           # User sign-in page
│   │   └── page.tsx         # Homepage
│   ├── components/          # Reusable UI components (Navbar, Modals, Cards)
│   ├── db/                  # Database schemas, seeding scripts, and helpers
│   └── lib/                 # Auth utilities and lesson content
├── tests/
│   └── verify-api.ts        # 16-step automated verification test suite
├── .catalyst/               # Catalyst Slate deployment configuration
├── catalyst.json            # Project-level Catalyst configuration
└── catalyst-pipelines.yaml  # DevOps CI/CD pipeline definition
```

---

## Running Locally

### 1. Clone the repository
```bash
git clone https://github.com/Aangi-Shah1234/roadmap.ai.git
cd roadmap.ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run the automated tests
```bash
npm test
```
This runs the 16 automated tests to verify user authentication, tracks, milestones, and topic data.

### 4. Start the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deployment

### Deploying to Zoho Catalyst Slate

To deploy updates directly to Catalyst Slate from the command line:

```bash
# Deploy to Development environment
catalyst deploy slate roadmap-ai -ni

# Deploy to Production environment
catalyst deploy slate roadmap-ai --production -ni
```

---

## License

This project is open source and available under the MIT License.
