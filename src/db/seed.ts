import { db } from "./index";
import { users, subjects, milestones, topics, userProgress } from "./schema";
import bcrypt from "bcryptjs";
import crypto from "crypto";

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data in reverse order of foreign keys
  await db.delete(userProgress);
  await db.delete(topics);
  await db.delete(milestones);
  await db.delete(subjects);
  await db.delete(users);

  // 1. Create Users
  const adminPasswordHash = await bcrypt.hash("AdminPassword123!", 10);
  const learnerPasswordHash = await bcrypt.hash("LearnerPassword123!", 10);

  const adminId = crypto.randomUUID();
  const learnerId = crypto.randomUUID();

  await db.insert(users).values([
    {
      id: adminId,
      name: "Admin User",
      email: "admin@roadmap.ai",
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

  console.log("✓ Users seeded (admin@roadmap.ai, learner@roadmap.ai)");

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

  console.log("✅ Database seeded successfully!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
