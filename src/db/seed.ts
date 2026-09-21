import { db, createTablesIfNotExist } from "./index";
import { users, subjects, milestones, topics, userProgress } from "./schema";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function seed(clearExisting = true) {
  console.log("🌱 Seeding database...");

  // Ensure all tables are created first
  await createTablesIfNotExist();

  if (clearExisting) {
    // Clear existing data in reverse order of foreign keys
    await db.delete(userProgress);
    await db.delete(topics);
    await db.delete(milestones);
    await db.delete(subjects);
    await db.delete(users);
  }

  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", 10);
  const learnerPasswordHash = await bcrypt.hash("LearnerPassword123!", 10);

  const learnerId = crypto.randomUUID();

  await db.insert(users).values([
    {
      id: crypto.randomUUID(),
      name: "Admin User",
      email: "admin@roadmap.ai",
      password: adminPasswordHash,
      role: "admin",
      createdAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      name: "Aangi Shah",
      email: "aangi3shah@gmail.com",
      password: adminPasswordHash,
      role: "admin",
      createdAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      name: "Alexa",
      email: "alexa@gmail.com",
      password: adminPasswordHash,
      role: "admin",
      createdAt: new Date(),
    },
    {
      id: learnerId,
      name: "Demo Learner",
      email: "learner@roadmap.ai",
      password: learnerPasswordHash,
      role: "learner",
      createdAt: new Date(),
    },
  ]);

  console.log("✓ Users seeded (admin@roadmap.ai, aangi3shah@gmail.com, alexa@gmail.com, learner@roadmap.ai)");

  // 2. DevOps Subject
  const devopsId = crypto.randomUUID();
  await db.insert(subjects).values({
    id: devopsId,
    title: "DevOps Engineering",
    slug: "devops",
    description: "Step-by-step roadmap from Linux and Networking to Docker, Kubernetes, CI/CD, and Terraform.",
    icon: "Terminal",
    category: "DevOps",
    createdAt: new Date(),
  });

  // DevOps Milestones and Topics
  const devopsMilestonesData = [
    {
      title: "Linux & OS Fundamentals",
      description: "Master Linux terminal commands, permissions, filesystem, and bash automation.",
      level: "Beginner" as const,
      topics: [
        {
          title: "Bash Scripting & Shell Basics",
          description: "Write shell scripts, handle pipes, redirects, variables, and automated cron jobs.",
          resources: JSON.stringify([
            { title: "Linux Command Line Guide", url: "https://linuxjourney.com/", type: "doc" },
            { title: "Bash Scripting Tutorial", url: "https://www.shellscript.sh/", type: "tutorial" },
          ]),
        },
        {
          title: "File Permissions & Ownership (chmod/chown)",
          description: "Understand read, write, execute permissions, SUID, SGID, and sudo privileges.",
          resources: JSON.stringify([
            { title: "Linux File Permissions Explained", url: "https://www.redhat.com/sysadmin/linux-file-permissions-explained", type: "doc" },
          ]),
        },
        {
          title: "Systemd & Process Management",
          description: "Inspect running processes (ps, top, htop) and manage system services with systemctl.",
          resources: JSON.stringify([
            { title: "Systemd Service Essentials", url: "https://systemd.io/", type: "doc" },
          ]),
        },
      ],
    },
    {
      title: "Networking Fundamentals",
      description: "Understand how computers communicate across local networks and the internet.",
      level: "Beginner" as const,
      topics: [
        {
          title: "TCP/IP & OSI Model",
          description: "Learn layer 3 (IP) and layer 4 (TCP/UDP) protocols, packet routing, and subnetting.",
          resources: JSON.stringify([
            { title: "Cloudflare Networking Fundamentals", url: "https://www.cloudflare.com/learning/network-layer/what-is-the-network-layer/", type: "doc" },
          ]),
        },
        {
          title: "DNS, HTTP/HTTPS & SSL/TLS",
          description: "How domain names resolve to IPs, HTTP request/response cycle, and SSL certificate handshakes.",
          resources: JSON.stringify([
            { title: "How DNS Works Comic", url: "https://howdns.works/", type: "doc" },
          ]),
        },
        {
          title: "SSH & Firewall Configuration",
          description: "Public/private key authentication, SSH config, UFW, and iptables rules.",
          resources: JSON.stringify([
            { title: "SSH Keys Guide", url: "https://docs.github.com/en/authentication/connecting-to-github-with-ssh", type: "doc" },
          ]),
        },
      ],
    },
    {
      title: "Version Control (Git & GitHub)",
      description: "Collaborative code management, branching strategies, and repository management.",
      level: "Beginner" as const,
      topics: [
        {
          title: "Git Branching, Rebasing & Merging",
          description: "Master commit histories, resolving merge conflicts, and interactive rebase.",
          resources: JSON.stringify([
            { title: "Learn Git Branching Interactively", url: "https://learngitbranching.js.org/", type: "tutorial" },
          ]),
        },
        {
          title: "Git Workflows & Pull Requests",
          description: "GitHub flow, trunk-based development, and code review standards.",
          resources: JSON.stringify([
            { title: "Atlassian Git Workflows", url: "https://www.atlassian.com/git/tutorials/comparing-workflows", type: "doc" },
          ]),
        },
      ],
    },
    {
      title: "Containerization (Docker)",
      description: "Package applications with all their dependencies into lightweight, portable containers.",
      level: "Intermediate" as const,
      topics: [
        {
          title: "Docker Basics: Containers vs VMs",
          description: "Namespaces, cgroups, container lifecycle, and Docker CLI (run, stop, exec, logs).",
          resources: JSON.stringify([
            { title: "Docker Official Get Started", url: "https://docs.docker.com/get-started/", type: "doc" },
          ]),
        },
        {
          title: "Writing Optimized Dockerfiles",
          description: "Multi-stage builds, layer caching, minimizing image size, and non-root users.",
          resources: JSON.stringify([
            { title: "Dockerfile Best Practices", url: "https://docs.docker.com/develop/develop-images/dockerfile_best-practices/", type: "doc" },
          ]),
        },
        {
          title: "Docker Compose & Volumes",
          description: "Orchestrate multi-container applications (frontend, backend, database) with persistent volumes.",
          resources: JSON.stringify([
            { title: "Docker Compose Overview", url: "https://docs.docker.com/compose/", type: "doc" },
          ]),
        },
      ],
    },
    {
      title: "CI/CD Pipelines",
      description: "Automate code integration, automated testing, quality checks, and production deployments.",
      level: "Intermediate" as const,
      topics: [
        {
          title: "GitHub Actions Workflows",
          description: "Write YAML workflows, triggers, matrix builds, secrets management, and reusable actions.",
          resources: JSON.stringify([
            { title: "GitHub Actions Documentation", url: "https://docs.github.com/en/actions", type: "doc" },
          ]),
        },
        {
          title: "Jenkins Pipelines & Automated Testing",
          description: "Jenkinsfile pipelines, build artifacts, test automation, and webhook triggers.",
          resources: JSON.stringify([
            { title: "Jenkins User Handbook", url: "https://www.jenkins.io/doc/book/", type: "doc" },
          ]),
        },
      ],
    },
    {
      title: "Container Orchestration (Kubernetes)",
      description: "Manage container clusters at scale with automated deployment, scaling, and self-healing.",
      level: "Advanced" as const,
      topics: [
        {
          title: "Kubernetes Architecture & Pods",
          description: "Control plane components (API server, etcd, scheduler), worker nodes, and Pod definitions.",
          resources: JSON.stringify([
            { title: "Kubernetes Official Concepts", url: "https://kubernetes.io/docs/concepts/", type: "doc" },
          ]),
        },
        {
          title: "Deployments, Services & Ingress",
          description: "Rolling updates, ClusterIP, NodePort, LoadBalancer services, and Ingress routing.",
          resources: JSON.stringify([
            { title: "Kubernetes Services & Networking", url: "https://kubernetes.io/docs/concepts/services-networking/", type: "doc" },
          ]),
        },
        {
          title: "ConfigMaps, Secrets & Helm Charts",
          description: "Decouple configuration from code and package K8s manifests using Helm package manager.",
          resources: JSON.stringify([
            { title: "Helm Documentation", url: "https://helm.sh/docs/", type: "doc" },
          ]),
        },
      ],
    },
    {
      title: "Infrastructure as Code (Terraform)",
      description: "Provision and manage cloud infrastructure safely and predictably using declarative code.",
      level: "Advanced" as const,
      topics: [
        {
          title: "HCL Syntax, Providers & State Files",
          description: "HashiCorp Configuration Language, state locking with S3/DynamoDB, terraform plan and apply.",
          resources: JSON.stringify([
            { title: "Terraform Intro Tutorial", url: "https://developer.hashicorp.com/terraform/tutorials", type: "tutorial" },
          ]),
        },
        {
          title: "Provisioning AWS EC2 & VPC with Terraform",
          description: "Write reusable modules to deploy compute instances, security groups, and public subnets.",
          resources: JSON.stringify([
            { title: "Terraform AWS Provider Docs", url: "https://registry.terraform.io/providers/hashicorp/aws/latest/docs", type: "doc" },
          ]),
        },
      ],
    },
  ];

  let firstTopicIdForProgress = "";

  for (let mIndex = 0; mIndex < devopsMilestonesData.length; mIndex++) {
    const mData = devopsMilestonesData[mIndex];
    const milestoneId = crypto.randomUUID();

    await db.insert(milestones).values({
      id: milestoneId,
      subjectId: devopsId,
      title: mData.title,
      description: mData.description,
      order: mIndex + 1,
      level: mData.level,
      createdAt: new Date(),
    });

    for (let tIndex = 0; tIndex < mData.topics.length; tIndex++) {
      const tData = mData.topics[tIndex];
      const topicId = crypto.randomUUID();
      if (!firstTopicIdForProgress) firstTopicIdForProgress = topicId;

      await db.insert(topics).values({
        id: topicId,
        milestoneId,
        title: tData.title,
        description: tData.description,
        resources: tData.resources,
        order: tIndex + 1,
        createdAt: new Date(),
      });
    }
  }

  // 3. Cloud Engineering Subject
  const cloudId = crypto.randomUUID();
  await db.insert(subjects).values({
    id: cloudId,
    title: "Cloud Engineering (AWS)",
    slug: "cloud",
    description: "Master AWS Core Services, EC2 Compute, VPC Networking, S3 Storage, RDS Databases, and Serverless.",
    icon: "Cloud",
    category: "Cloud",
    createdAt: new Date(),
  });

  const cloudMilestonesData = [
    {
      title: "Cloud Basics & AWS IAM",
      description: "Cloud fundamentals, Shared Responsibility Model, and Identity & Access Management.",
      level: "Beginner" as const,
      topics: [
        {
          title: "AWS Global Infrastructure & IAM Policies",
          description: "Regions, Availability Zones, Users, Groups, Roles, and least-privilege JSON policies.",
          resources: JSON.stringify([
            { title: "AWS IAM Best Practices", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html", type: "doc" },
          ]),
        },
      ],
    },
    {
      title: "Compute Services (AWS EC2)",
      description: "Virtual machines in the cloud, instance types, AMIs, storage volumes, and auto-scaling.",
      level: "Beginner" as const,
      topics: [
        {
          title: "EC2 Instances, Security Groups & Key Pairs",
          description: "Launch Linux instances, configure inbound security group rules, and attach EBS storage.",
          resources: JSON.stringify([
            { title: "Amazon EC2 User Guide", url: "https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html", type: "doc" },
          ]),
        },
      ],
    },
    {
      title: "Cloud Networking (AWS VPC)",
      description: "Build secure, isolated virtual networks in the cloud.",
      level: "Intermediate" as const,
      topics: [
        {
          title: "VPC, Public & Private Subnets, Route Tables & NAT",
          description: "Design multi-tier architectures with Internet Gateways and NAT Gateways for private workloads.",
          resources: JSON.stringify([
            { title: "AWS VPC Guide", url: "https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html", type: "doc" },
          ]),
        },
      ],
    },
    {
      title: "Storage & Databases (S3 & RDS)",
      description: "Object storage and managed relational databases.",
      level: "Intermediate" as const,
      topics: [
        {
          title: "Amazon S3 Bucket Policies & Lifecycle",
          description: "Static website hosting, S3 bucket security, versioning, and lifecycle expiration rules.",
          resources: JSON.stringify([
            { title: "Amazon S3 Documentation", url: "https://docs.aws.amazon.com/s3/", type: "doc" },
          ]),
        },
        {
          title: "Amazon RDS (PostgreSQL / MySQL)",
          description: "Multi-AZ high availability deployments, automated backups, and read replicas.",
          resources: JSON.stringify([
            { title: "Amazon RDS User Guide", url: "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html", type: "doc" },
          ]),
        },
      ],
    },
    {
      title: "Serverless & Modern Cloud",
      description: "Run code and containerized microservices without provisioning servers.",
      level: "Advanced" as const,
      topics: [
        {
          title: "AWS Lambda & API Gateway",
          description: "Event-driven functions, execution roles, cold starts, and REST API triggers.",
          resources: JSON.stringify([
            { title: "AWS Serverless Getting Started", url: "https://aws.amazon.com/serverless/", type: "doc" },
          ]),
        },
      ],
    },
  ];

  for (let mIndex = 0; mIndex < cloudMilestonesData.length; mIndex++) {
    const mData = cloudMilestonesData[mIndex];
    const milestoneId = crypto.randomUUID();

    await db.insert(milestones).values({
      id: milestoneId,
      subjectId: cloudId,
      title: mData.title,
      description: mData.description,
      order: mIndex + 1,
      level: mData.level,
      createdAt: new Date(),
    });

    for (let tIndex = 0; tIndex < mData.topics.length; tIndex++) {
      const tData = mData.topics[tIndex];
      const topicId = crypto.randomUUID();

      await db.insert(topics).values({
        id: topicId,
        milestoneId,
        title: tData.title,
        description: tData.description,
        resources: tData.resources,
        order: tIndex + 1,
        createdAt: new Date(),
      });
    }
  }

  // Helper for seeding new IT tracks
  async function seedTrackHelper(track: {
    title: string;
    slug: string;
    description: string;
    icon: string;
    category: string;
    milestones: {
      title: string;
      description: string;
      level: "Beginner" | "Intermediate" | "Advanced";
      topics: {
        title: string;
        description: string;
        resources: string;
      }[];
    }[];
  }) {
    const subjId = crypto.randomUUID();
    await db.insert(subjects).values({
      id: subjId,
      title: track.title,
      slug: track.slug,
      description: track.description,
      icon: track.icon,
      category: track.category,
      createdAt: new Date(),
    });

    for (let mIdx = 0; mIdx < track.milestones.length; mIdx++) {
      const m = track.milestones[mIdx];
      const mId = crypto.randomUUID();
      await db.insert(milestones).values({
        id: mId,
        subjectId: subjId,
        title: m.title,
        description: m.description,
        order: mIdx + 1,
        level: m.level,
        createdAt: new Date(),
      });

      for (let tIdx = 0; tIdx < m.topics.length; tIdx++) {
        const t = m.topics[tIdx];
        await db.insert(topics).values({
          id: crypto.randomUUID(),
          milestoneId: mId,
          title: t.title,
          description: t.description,
          resources: t.resources,
          order: tIdx + 1,
          createdAt: new Date(),
        });
      }
    }
    console.log(`✓ Seeded IT Track: ${track.title}`);
  }

  // 4. Frontend Engineering Track
  await seedTrackHelper({
    title: "Frontend Engineering",
    slug: "frontend",
    description: "From semantic HTML/CSS and JavaScript to React 19, Next.js App Router, Tailwind, and Web Performance.",
    icon: "Layout",
    category: "Software Engineering",
    milestones: [
      {
        title: "Semantic HTML5 & Modern CSS",
        description: "Modern web fundamentals: semantic accessibility, Flexbox, CSS Grid, and design systems.",
        level: "Beginner",
        topics: [
          {
            title: "Semantic Layouts & Web Accessibility (a11y)",
            description: "Build accessible web applications with semantic tags, ARIA roles, and screen-reader standards.",
            resources: JSON.stringify([
              { title: "MDN HTML Semantics", url: "https://developer.mozilla.org/en-US/docs/Glossary/Semantics", type: "doc" },
              { title: "WebAIM Accessibility Checklist", url: "https://webaim.org/standards/wcag/checklist", type: "doc" }
            ]),
          },
          {
            title: "Modern CSS Grid & Flexbox Mastery",
            description: "Create fluid, responsive multi-column layouts without layout shift using CSS Grid and Flexbox.",
            resources: JSON.stringify([
              { title: "A Complete Guide to Flexbox", url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/", type: "tutorial" },
              { title: "CSS Grid Guide", url: "https://css-tricks.com/snippets/css/complete-guide-grid/", type: "tutorial" }
            ]),
          },
        ],
      },
      {
        title: "Modern JavaScript (ES6+) & TypeScript",
        description: "Master language mechanics, asynchronous control flow, and strict static type systems.",
        level: "Beginner",
        topics: [
          {
            title: "ES6+ Syntax, Async/Await & Event Loop",
            description: "Destructuring, arrow functions, promises, microtasks, and the JavaScript runtime loop.",
            resources: JSON.stringify([
              { title: "JavaScript.info Modern Tutorial", url: "https://javascript.info/", type: "tutorial" }
            ]),
          },
          {
            title: "TypeScript Generics, Interfaces & Discriminated Unions",
            description: "Eliminate runtime errors with type narrowing, generic utility types, and strict TS configs.",
            resources: JSON.stringify([
              { title: "TypeScript Handbook", url: "https://www.typescriptlang.org/docs/handbook/intro.html", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "React 19 & Component Architecture",
        description: "Build reactive, reusable user interfaces using modern hooks, state, and server actions.",
        level: "Intermediate",
        topics: [
          {
            title: "React Hooks (useState, useEffect, useMemo, useCallback)",
            description: "Manage component lifecycles, memoize expensive calculations, and avoid accidental re-renders.",
            resources: JSON.stringify([
              { title: "Official React Documentation", url: "https://react.dev/", type: "doc" }
            ]),
          },
          {
            title: "Custom Hooks & Compound Component Patterns",
            description: "Encapsulate complex UI behaviors into clean, reusable declarative interfaces.",
            resources: JSON.stringify([
              { title: "Patterns.dev React Design Patterns", url: "https://www.patterns.dev/", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Next.js App Router & Server Components",
        description: "Harness hybrid server/client rendering, streaming SSR, and zero-bundle-size server components.",
        level: "Intermediate",
        topics: [
          {
            title: "Server Components vs Client Components ('use client')",
            description: "Architect Next.js applications by keeping data fetching on the server and interactivity on the client.",
            resources: JSON.stringify([
              { title: "Next.js App Router Docs", url: "https://nextjs.org/docs", type: "doc" }
            ]),
          },
          {
            title: "Server Actions, Mutations & Optimistic Updates",
            description: "Mutate backend data seamlessly without dedicated REST endpoints using React Server Actions.",
            resources: JSON.stringify([
              { title: "Next.js Server Actions Guide", url: "https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "State Management & Data Fetching",
        description: "Coordinate client state, cache server data, and handle optimistic mutations cleanly.",
        level: "Advanced",
        topics: [
          {
            title: "TanStack Query (React Query) & SWR Caching",
            description: "Automatic background refetching, query invalidation, and deduplication of network requests.",
            resources: JSON.stringify([
              { title: "TanStack Query Docs", url: "https://tanstack.com/query/latest", type: "doc" }
            ]),
          },
          {
            title: "Zustand & Global State Stores",
            description: "Lightweight, unopinionated client-side state without boilerplate or provider hell.",
            resources: JSON.stringify([
              { title: "Zustand Documentation", url: "https://docs.pmnd.rs/zustand/getting-started/introduction", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Web Performance & Core Web Vitals",
        description: "Benchmark and optimize load speed, Largest Contentful Paint, and bundle footprints.",
        level: "Advanced",
        topics: [
          {
            title: "Core Web Vitals Optimization (LCP, INP, CLS)",
            description: "Minimize cumulative layout shift, optimize critical rendering paths, and preload key fonts.",
            resources: JSON.stringify([
              { title: "Web.dev Core Web Vitals", url: "https://web.dev/vitals/", type: "doc" }
            ]),
          },
        ],
      },
    ],
  });

  // 5. Backend Engineering Track
  await seedTrackHelper({
    title: "Backend Engineering",
    slug: "backend",
    description: "Build high-throughput server systems with Node.js, Go, Python, REST & GraphQL, PostgreSQL, and Caching.",
    icon: "Server",
    category: "Software Engineering",
    milestones: [
      {
        title: "Backend Runtimes & Languages",
        description: "Understand server runtimes, concurrency models, and non-blocking I/O architectures.",
        level: "Beginner",
        topics: [
          {
            title: "Node.js Event Loop & Stream Processing",
            description: "Understand libuv, the event loop phases, backpressure, and piping high-volume file streams.",
            resources: JSON.stringify([
              { title: "Node.js Architecture Guide", url: "https://nodejs.org/en/docs/guides/event-loop-timers-and-nexttick/", type: "doc" }
            ]),
          },
          {
            title: "Go Concurrency with Goroutines & Channels",
            description: "Write high-performance concurrent backend services with Go channels, sync.WaitGroup, and mutexes.",
            resources: JSON.stringify([
              { title: "Tour of Go Concurrency", url: "https://go.dev/tour/concurrency/1", type: "tutorial" }
            ]),
          },
        ],
      },
      {
        title: "API Design (REST & GraphQL)",
        description: "Design intuitive, versioned, and idempotent APIs for clients and third parties.",
        level: "Beginner",
        topics: [
          {
            title: "RESTful Conventions, Idempotency & HTTP Codes",
            description: "Correct usage of GET, POST, PUT, PATCH, DELETE, Idempotency-Key headers, and pagination.",
            resources: JSON.stringify([
              { title: "RESTful API Best Practices", url: "https://restfulapi.net/", type: "doc" }
            ]),
          },
          {
            title: "GraphQL Schemas, Resolvers & DataLoader",
            description: "Solve the N+1 problem with DataLoader, write type-safe queries, and build flexible mutation schemas.",
            resources: JSON.stringify([
              { title: "Official GraphQL Documentation", url: "https://graphql.org/learn/", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Relational Databases & SQL Mastery",
        description: "Schema design, relational constraints, indexing strategies, and ACID compliance.",
        level: "Intermediate",
        topics: [
          {
            title: "PostgreSQL Indexing, B-Trees & Query Optimization",
            description: "Diagnose slow queries using EXPLAIN ANALYZE, B-tree indexes, GIN indexes, and composite keys.",
            resources: JSON.stringify([
              { title: "Use The Index, Luke (SQL Indexing)", url: "https://use-the-index-luke.com/", type: "tutorial" }
            ]),
          },
          {
            title: "Transactions, Isolation Levels & Deadlock Prevention",
            description: "Read Committed, Repeatable Read, and Serializable isolation levels with row-level locking.",
            resources: JSON.stringify([
              { title: "PostgreSQL Transaction Isolation", url: "https://www.postgresql.org/docs/current/transaction-iso.html", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "NoSQL & In-Memory Caching (Redis)",
        description: "Accelerate read throughput and manage distributed ephemeral data.",
        level: "Intermediate",
        topics: [
          {
            title: "Redis Caching Strategies (Cache-Aside, Write-Through)",
            description: "Prevent cache thundering herds, configure TTL eviction, and store structured data in Redis.",
            resources: JSON.stringify([
              { title: "Redis University & Docs", url: "https://redis.io/docs/", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Authentication, Sessions & Security",
        description: "Secure backend services against unauthorized access and common cyber vulnerabilities.",
        level: "Advanced",
        topics: [
          {
            title: "JWT, Refresh Tokens & OAuth 2.0 PKCE",
            description: "Stateless token authentication, token rotation, cryptographic signing, and OAuth 2.0 scopes.",
            resources: JSON.stringify([
              { title: "Auth0 OAuth & JWT Handbook", url: "https://auth0.com/learn", type: "doc" }
            ]),
          },
          {
            title: "Rate Limiting, CORS & Input Sanitization",
            description: "Protect APIs from brute-force DDoS attacks using token bucket rate limiters and strict CORS policies.",
            resources: JSON.stringify([
              { title: "OWASP API Security Top 10", url: "https://owasp.org/www-project-api-security/", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Message Queues & Microservices",
        description: "Decouple backend operations using asynchronous message brokers.",
        level: "Advanced",
        topics: [
          {
            title: "RabbitMQ & Celery / BullMQ Background Jobs",
            description: "Process long-running email, PDF, and image transcoding tasks outside HTTP request cycles.",
            resources: JSON.stringify([
              { title: "RabbitMQ Getting Started", url: "https://www.rabbitmq.com/tutorials", type: "tutorial" }
            ]),
          },
        ],
      },
    ],
  });

  // 6. Full Stack Web Development Track
  await seedTrackHelper({
    title: "Full Stack Development",
    slug: "fullstack",
    description: "End-to-end modern web applications with TypeScript, Next.js, Drizzle/Prisma ORM, PostgreSQL, and Auth.",
    icon: "Layers",
    category: "Software Engineering",
    milestones: [
      {
        title: "Full Stack Architecture Fundamentals",
        description: "Connecting clients, APIs, database layers, and deployment targets cohesively.",
        level: "Beginner",
        topics: [
          {
            title: "Client-Server Data Flow & 3-Tier Architecture",
            description: "How requests move from browser DOM through HTTP/SSR boundaries to database engines.",
            resources: JSON.stringify([
              { title: "Full Stack Open Curriculum", url: "https://fullstackopen.com/en/", type: "tutorial" }
            ]),
          },
        ],
      },
      {
        title: "End-to-End Type Safety with TypeScript",
        description: "Eliminate runtime boundary bugs with shared types and runtime schema validators.",
        level: "Beginner",
        topics: [
          {
            title: "Zod Schema Validation & Type Inference",
            description: "Validate client form payloads and incoming server request bodies with inferred static types.",
            resources: JSON.stringify([
              { title: "Zod Documentation", url: "https://zod.dev/", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Database Modeling with Modern ORMs",
        description: "Declarative schemas, typesafe query builders, and automated database migrations.",
        level: "Intermediate",
        topics: [
          {
            title: "Drizzle ORM & Prisma Schema Migrations",
            description: "Write SQL-like TypeScript queries, handle relations, and execute declarative database migrations.",
            resources: JSON.stringify([
              { title: "Drizzle ORM Documentation", url: "https://orm.drizzle.team/", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Production Authentication & Authorization",
        description: "Implement secure member accounts, session cookies, and role-based permissions.",
        level: "Intermediate",
        topics: [
          {
            title: "Session Cookies, Password Hashing & RBAC",
            description: "Salted bcrypt passwords, cryptographically signed HttpOnly cookies, and member access guards.",
            resources: JSON.stringify([
              { title: "OWASP Session Management", url: "https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Fullstack Testing (Unit, Integration & E2E)",
        description: "Verify every layer of the full stack with automated tests.",
        level: "Advanced",
        topics: [
          {
            title: "Vitest & Playwright End-to-End Testing",
            description: "Run automated browser flows to verify sign-in, user flows, and database mutations in CI.",
            resources: JSON.stringify([
              { title: "Playwright Documentation", url: "https://playwright.dev/", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Containerizing & Deploying Full Stack Apps",
        description: "Multi-stage Docker builds and automated cloud deployments.",
        level: "Advanced",
        topics: [
          {
            title: "Multi-Stage Dockerfiles for Next.js & Fullstack Apps",
            description: "Build tiny production container images and deploy to modern container clouds.",
            resources: JSON.stringify([
              { title: "Next.js with Docker Guide", url: "https://github.com/vercel/next.js/tree/canary/examples/with-docker", type: "doc" }
            ]),
          },
        ],
      },
    ],
  });

  // 7. AI & Machine Learning Track
  await seedTrackHelper({
    title: "AI & Machine Learning",
    slug: "ai-ml",
    description: "Python data science, PyTorch neural networks, Transformers, LLM fine-tuning, Vector DBs, and RAG.",
    icon: "Sparkles",
    category: "Data & AI",
    milestones: [
      {
        title: "Python for Data Science & Mathematics",
        description: "NumPy arrays, vectorization, Pandas DataFrames, and linear algebra foundations.",
        level: "Beginner",
        topics: [
          {
            title: "NumPy Arrays & Vectorized Matrix Computations",
            description: "Eliminate slow Python loops using vectorized C-backed multidimensional array operations.",
            resources: JSON.stringify([
              { title: "NumPy Official Tutorials", url: "https://numpy.org/doc/stable/user/quickstart.html", type: "tutorial" }
            ]),
          },
          {
            title: "Pandas Data Cleaning & Feature Engineering",
            description: "Manipulate structured tabular datasets, handle missing values, and group aggregations.",
            resources: JSON.stringify([
              { title: "10 Minutes to Pandas", url: "https://pandas.pydata.org/docs/user_guide/10min.html", type: "tutorial" }
            ]),
          },
        ],
      },
      {
        title: "Core Machine Learning Foundations",
        description: "Supervised and unsupervised learning, regression, classification, and evaluation metrics.",
        level: "Beginner",
        topics: [
          {
            title: "Scikit-Learn Classifiers, Regressors & Validation",
            description: "Train Random Forests, Gradient Boosters, cross-validate models, and compute F1/ROC-AUC scores.",
            resources: JSON.stringify([
              { title: "Scikit-Learn Documentation", url: "https://scikit-learn.org/stable/", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Deep Learning & Neural Networks (PyTorch)",
        description: "Tensors, computational graphs, backpropagation, and training deep neural nets.",
        level: "Intermediate",
        topics: [
          {
            title: "PyTorch Tensors, Autograd & Custom Modules",
            description: "Build custom nn.Module architectures, compute loss gradients, and optimize with AdamW.",
            resources: JSON.stringify([
              { title: "Deep Learning with PyTorch: A 60 Minute Blitz", url: "https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html", type: "tutorial" }
            ]),
          },
        ],
      },
      {
        title: "Transformers & Large Language Models (LLMs)",
        description: "Self-attention mechanism, Hugging Face transformers, and prompt engineering.",
        level: "Intermediate",
        topics: [
          {
            title: "Self-Attention Architecture & Hugging Face Pipeline",
            description: "How transformers process tokens in parallel, position embeddings, and generating inference.",
            resources: JSON.stringify([
              { title: "Illustrated Transformer by Jay Alammar", url: "https://jalammar.github.io/illustrated-transformer/", type: "tutorial" },
              { title: "Hugging Face Course", url: "https://huggingface.co/course/chapter1/1", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Vector Databases & Retrieval-Augmented Generation (RAG)",
        description: "Connect proprietary data to LLMs using dense vector search and semantic retrieval.",
        level: "Advanced",
        topics: [
          {
            title: "Dense Embeddings, Pinecone / Chroma & LangChain RAG",
            description: "Chunk documents, generate vector embeddings, and retrieve relevant context for LLM generation.",
            resources: JSON.stringify([
              { title: "Pinecone Learning Center", url: "https://www.pinecone.io/learn/", type: "doc" },
              { title: "LangChain Documentation", url: "https://python.langchain.com/", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "MLOps & Production Model Deployment",
        description: "Serve models with high throughput, low latency, and continuous drift monitoring.",
        level: "Advanced",
        topics: [
          {
            title: "FastAPI Model Serving, Docker & vLLM Inference",
            description: "Package model weights into high-throughput inference endpoints with streaming response tokens.",
            resources: JSON.stringify([
              { title: "vLLM Production Serving Guide", url: "https://docs.vllm.ai/", type: "doc" }
            ]),
          },
        ],
      },
    ],
  });

  // 8. Cybersecurity & Ethical Hacking Track
  await seedTrackHelper({
    title: "Cybersecurity & Ethical Hacking",
    slug: "cybersecurity",
    description: "Defend applications and infrastructure: OWASP Top 10, Network Penetration, Cryptography, and Zero Trust.",
    icon: "ShieldCheck",
    category: "Security & Systems",
    milestones: [
      {
        title: "Network Security & Packet Analysis",
        description: "Protocols, port scanning, traffic sniffing, and firewall rules.",
        level: "Beginner",
        topics: [
          {
            title: "Port Scanning with Nmap & Wireshark Packet Inspection",
            description: "Identify open ports, active services, and analyze raw TCP packets during handshakes.",
            resources: JSON.stringify([
              { title: "Nmap Network Scanning Guide", url: "https://nmap.org/book/man.html", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Web Application Security (OWASP Top 10)",
        description: "Exploit and patch the most critical web vulnerabilities found in enterprise apps.",
        level: "Beginner",
        topics: [
          {
            title: "SQL Injection (SQLi), Cross-Site Scripting (XSS) & CSRF",
            description: "Demonstrate attack vectors in sandbox environments and implement parameterized defenses.",
            resources: JSON.stringify([
              { title: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security", type: "tutorial" }
            ]),
          },
        ],
      },
      {
        title: "Cryptography & Public Key Infrastructure",
        description: "Encryption algorithms, digital signatures, certificates, and TLS handshakes.",
        level: "Intermediate",
        topics: [
          {
            title: "Symmetric vs Asymmetric Ciphers (AES, RSA, ECC)",
            description: "Mathematical principles of modern encryption, key exchange, and SSL/TLS certificate chains.",
            resources: JSON.stringify([
              { title: "Crypto101 Free Course", url: "https://www.crypto101.io/", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Ethical Hacking & Penetration Testing",
        description: "Reconnaissance, vulnerability scanning, exploitation, and privilege escalation.",
        level: "Intermediate",
        topics: [
          {
            title: "Burp Suite Interception & Metasploit Framework",
            description: "Intercept and tamper with HTTP requests, inspect session cookies, and automate security auditing.",
            resources: JSON.stringify([
              { title: "Metasploit Unleashed Tutorial", url: "https://www.offsec.com/metasploit-unleashed/", type: "tutorial" }
            ]),
          },
        ],
      },
      {
        title: "Cloud Security & Zero Trust Architecture",
        description: "Harden cloud environments, enforce least privilege, and prevent lateral movement.",
        level: "Advanced",
        topics: [
          {
            title: "IAM Policy Hardening & Zero Trust Network Access",
            description: "Eliminate static access keys, configure temporary STS credentials, and enforce mTLS between microservices.",
            resources: JSON.stringify([
              { title: "NIST Zero Trust Architecture Guide", url: "https://csrc.nist.gov/publications/detail/sp/800-207/final", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Incident Response & SOC Operations",
        description: "Detect active breaches, analyze audit logs, and recover compromised infrastructure.",
        level: "Advanced",
        topics: [
          {
            title: "SIEM Log Analysis (Elasticsearch & Wazuh) & Forensics",
            description: "Correlate security events, detect lateral movement indicators, and execute incident containment runbooks.",
            resources: JSON.stringify([
              { title: "SANS Incident Handler's Handbook", url: "https://www.sans.org/white-papers/33393/", type: "doc" }
            ]),
          },
        ],
      },
    ],
  });

  // 9. System Design & Distributed Systems Track
  await seedTrackHelper({
    title: "System Design & Architecture",
    slug: "system-design",
    description: "Architect massive-scale distributed systems: Load balancing, Caching, DB Sharding, Kafka, and Fault Tolerance.",
    icon: "Compass",
    category: "Security & Systems",
    milestones: [
      {
        title: "Scalability & Distributed System Principles",
        description: "Core mental models for systems serving millions of concurrent requests.",
        level: "Beginner",
        topics: [
          {
            title: "Throughput, Latency, SLA/SLO & The CAP Theorem",
            description: "Consistency vs Availability trade-offs, network partitions, and measuring p95/p99 latency percentiles.",
            resources: JSON.stringify([
              { title: "System Design Primer by Donne Martin", url: "https://github.com/donnemartin/system-design-primer", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Load Balancing & Traffic Routing",
        description: "Distribute incoming traffic across server pools reliably.",
        level: "Beginner",
        topics: [
          {
            title: "Layer 4 vs Layer 7 Load Balancing & Consistent Hashing",
            description: "TCP vs HTTP load balancing, consistent hashing rings for caching tiers, and sticky sessions.",
            resources: JSON.stringify([
              { title: "Nginx Load Balancing Guide", url: "https://docs.nginx.com/nginx/admin-guide/load-balancer/", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Distributed Caching & Content Delivery Networks",
        description: "Sub-millisecond data retrieval and global edge delivery.",
        level: "Intermediate",
        topics: [
          {
            title: "Redis Cluster Topologies & Cache Invalidation Strategies",
            description: "Master Cache-Aside, Write-Through, Write-Back, and solve cache stampede with distributed mutexes.",
            resources: JSON.stringify([
              { title: "High Scalability Distributed Caching", url: "http://highscalability.com/", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Database Partitioning & Sharding",
        description: "Scaling relational and document databases past single-node limits.",
        level: "Intermediate",
        topics: [
          {
            title: "Horizontal Database Sharding, Replication & Split-Brain",
            description: "Partition keys, cross-shard queries, primary-replica replication lag, and quorum consensus.",
            resources: JSON.stringify([
              { title: "Designing Data-Intensive Applications (Kleppmann)", url: "https://dataintensive.net/", type: "doc" }
            ]),
          },
        ],
      },
      {
        title: "Distributed Messaging & Event Streaming (Kafka)",
        description: "High-throughput asynchronous communication between microservices.",
        level: "Advanced",
        topics: [
          {
            title: "Apache Kafka Topics, Partitions, Consumer Groups & Durability",
            description: "Commit logs, ordered partition processing, at-least-once vs exactly-once semantics, and compaction.",
            resources: JSON.stringify([
              { title: "Confluent Kafka Architecture Guide", url: "https://developer.confluent.io/what-is-apache-kafka/", type: "tutorial" }
            ]),
          },
        ],
      },
      {
        title: "Resilience, Fault Tolerance & Disaster Recovery",
        description: "Survive datacenter outages and cascade failures gracefully.",
        level: "Advanced",
        topics: [
          {
            title: "Circuit Breakers, Bulkheads & Active-Active Multi-Region",
            description: "Prevent cascading failures with exponential backoff, jitter, circuit breakers, and geo-replicated architectures.",
            resources: JSON.stringify([
              { title: "AWS Well-Architected Reliability Pillar", url: "https://docs.aws.amazon.com/wellarchitected/latest/reliability-pillar/", type: "doc" }
            ]),
          },
        ],
      },
    ],
  });

  // Pre-seed 1 completed topic for the demo learner so progress bars show up
  if (firstTopicIdForProgress) {
    await db.insert(userProgress).values({
      id: crypto.randomUUID(),
      userId: learnerId,
      topicId: firstTopicIdForProgress,
      completed: 1,
      completedAt: new Date(),
    });
  }

  console.log("✅ Database seeded successfully with all Whole-IT tracks!");
}

if (process.argv[1]?.includes("seed")) {
  seed().catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  });
}
