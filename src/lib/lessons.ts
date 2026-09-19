export interface LessonSection {
  title: string;
  paragraphs: string[];
  code?: {
    comment?: string;
    cmd: string;
    result?: string;
  };
  mutedNote?: string;
}

export interface LessonData {
  timeEst: string;
  intro: string;
  sections: LessonSection[];
  callout: {
    emoji: string;
    strong: string;
    text: string;
  };
}

export function getLessonContent(topicTitle: string, description?: string | null): LessonData {
  const lower = (topicTitle || "").toLowerCase();

  if (lower.includes("permission") || lower.includes("chmod") || lower.includes("chown")) {
    return {
      timeEst: "12 min read",
      intro:
        description ||
        "Every file and directory on Linux belongs to someone and carries a set of rules about who can read, write, or run it. Once this clicks, commands like chmod and chown stop feeling like magic incantations.",
      sections: [
        {
          title: "Reading a permissions string",
          paragraphs: [
            "Run `ls -l` in any directory and you'll see a string like `-rwxr-xr--` next to each file. It breaks into four parts: the file type, then three permission groups — owner, group, and everyone else.",
          ],
          code: {
            comment: "# list files with permissions",
            cmd: "$ ls -l notes.sh",
            result: "-rwxr-xr-- 1 dana devs 220 Sep 12 09:14 notes.sh",
          },
          mutedNote:
            "Here, dana (the owner) can read, write, and execute. The devs group can read and execute. Everyone else can only read.",
        },
        {
          title: "Changing permissions with chmod",
          paragraphs: [
            "You can set permissions symbolically or with octal numbers. Symbolic is easier to read when you're starting out:",
          ],
          code: {
            comment: "# give the owner execute permission\n# remove write access for the group",
            cmd: "$ chmod u+x deploy.sh && chmod g-w deploy.sh",
          },
        },
        {
          title: "Changing ownership with chown",
          paragraphs: [
            "Ownership determines whose permission bits actually apply. You'll use this often when moving files between users or preparing a directory for a service to run under.",
          ],
          code: {
            comment: "# change owner and group in one go",
            cmd: "$ sudo chown dana:devs /opt/app",
          },
        },
      ],
      callout: {
        emoji: "🌿",
        strong: "Trail tip:",
        text: "avoid chmod 777 out of habit — it gives everyone full access, including write and execute. Reach for the narrowest permission that gets the job done.",
      },
    };
  }

  if (lower.includes("bash") || lower.includes("shell")) {
    return {
      timeEst: "10 min read",
      intro:
        description ||
        "Bash automation transforms repetitive manual command-line tasks into robust, repeatable production deployment pipelines.",
      sections: [
        {
          title: "The Shebang & Executable Scripts",
          paragraphs: [
            "Every production shell script begins with a shebang line pointing to the bash binary. Always set strict error flags like `set -euo pipefail` to catch unhandled errors early.",
          ],
          code: {
            comment: "#!/usr/bin/env bash\nset -euo pipefail",
            cmd: "$ ./backup.sh --target /var/log",
            result: "[INFO] Successfully archived logs to S3 bucket.",
          },
        },
        {
          title: "Standard Streams & Piping",
          paragraphs: [
            "Piping stdout from one process into stdin of another is the core Unix philosophy for composable infrastructure automation.",
          ],
          code: {
            comment: "# stream logs and filter error occurrences",
            cmd: "$ cat /var/log/nginx/error.log | grep '500' | wc -l",
            result: "42",
          },
        },
      ],
      callout: {
        emoji: "⚡",
        strong: "Production Rule:",
        text: "Always quote your variables (\"$TARGET_DIR\") in bash scripts to avoid unexpected word splitting and wildcard expansions.",
      },
    };
  }

  if (lower.includes("systemd") || lower.includes("process")) {
    return {
      timeEst: "14 min read",
      intro:
        description ||
        "Systemd is the init system and service manager for modern Linux distributions, keeping background servers healthy and auto-restarting crashed services.",
      sections: [
        {
          title: "Writing a Systemd Unit File",
          paragraphs: [
            "Unit files live in `/etc/systemd/system/` and define how your app starts, environment variables, restart policies, and run-level dependencies.",
          ],
          code: {
            comment: "# reload systemd daemon after editing unit",
            cmd: "$ sudo systemctl daemon-reload && sudo systemctl restart api.service",
            result: "● api.service - Core API Server\n   Active: active (running)",
          },
        },
        {
          title: "Inspecting Live Logs with Journalctl",
          paragraphs: [
            "Journald collects logs across all services. Tail logs in real-time with `-f` and filter by specific unit name.",
          ],
          code: {
            comment: "# tail logs in real time",
            cmd: "$ journalctl -u api.service -f -n 50",
          },
        },
      ],
      callout: {
        emoji: "🛡️",
        strong: "High Availability:",
        text: "Set Restart=on-failure and RestartSec=5s in your unit [Service] block so production daemons automatically recover after crashes.",
      },
    };
  }

  if (lower.includes("docker") || lower.includes("container")) {
    return {
      timeEst: "15 min read",
      intro:
        description ||
        "Containers package your application code together with its runtime, dependencies, and OS libraries, guaranteeing consistent behavior across all machines.",
      sections: [
        {
          title: "Multi-Stage Dockerfile Optimization",
          paragraphs: [
            "Multi-stage builds separate the build tooling from the lean production runtime, slashing final image sizes from gigabytes down to tens of megabytes.",
          ],
          code: {
            comment: "# build optimized container image",
            cmd: "$ docker build -t web-app:v1 .",
            result: "[+] Building 4.2s (12/12) FINISHED => sha256:8f2a... 48MB",
          },
        },
        {
          title: "Running Containers with Volume & Port Bindings",
          paragraphs: [
            "Map external host ports to internal container ports and attach persistent storage volumes.",
          ],
          code: {
            comment: "# run detached container with port mapping",
            cmd: "$ docker run -d -p 3000:3000 --name web web-app:v1",
            result: "d840b192e47a544c9b91...",
          },
        },
      ],
      callout: {
        emoji: "📦",
        strong: "Security Tip:",
        text: "Never run container workloads as the root user. Add USER node or USER nonroot before your ENTRYPOINT instruction.",
      },
    };
  }

  if (lower.includes("kubernetes") || lower.includes("k8s") || lower.includes("pod")) {
    return {
      timeEst: "18 min read",
      intro:
        description ||
        "Kubernetes automates the deployment, scaling, load balancing, and self-healing of containerized applications across clustered infrastructure.",
      sections: [
        {
          title: "Declarative Deployments & ReplicaSets",
          paragraphs: [
            "Define the desired state of your application in YAML. Kubernetes continually reconciles real-world state against your declarative spec.",
          ],
          code: {
            comment: "# apply deployment configuration",
            cmd: "$ kubectl apply -f deployment.yaml",
            result: "deployment.apps/api-server created\nservice/api-service configured",
          },
        },
        {
          title: "Inspecting Pod Health & Logs",
          paragraphs: [
            "Use kubectl get pods and kubectl describe pod to inspect event logs, image pull statuses, and readiness probes.",
          ],
          code: {
            comment: "# check rollout status across cluster",
            cmd: "$ kubectl rollout status deployment/api-server",
            result: "deployment \"api-server\" successfully rolled out",
          },
        },
      ],
      callout: {
        emoji: "☸️",
        strong: "Cluster Best Practice:",
        text: "Always configure resources.requests and resources.limits so the Kubernetes scheduler can distribute pods evenly without CPU throttling.",
      },
    };
  }

  if (lower.includes("terraform") || lower.includes("iac")) {
    return {
      timeEst: "16 min read",
      intro:
        description ||
        "Infrastructure as Code lets you provision and manage cloud infrastructure using declarative configuration files rather than manual cloud console clicks.",
      sections: [
        {
          title: "The Plan & Apply Lifecycle",
          paragraphs: [
            "Terraform calculates execution plans showing exactly what resources will be created, updated, or destroyed before making any live cloud changes.",
          ],
          code: {
            comment: "# generate execution plan",
            cmd: "$ terraform plan -out=tfplan",
            result: "Plan: 3 to add, 0 to change, 0 to destroy.",
          },
        },
        {
          title: "Remote State & State Locking",
          paragraphs: [
            "Store your terraform.tfstate in remote cloud storage (like AWS S3) with DynamoDB state locking to prevent concurrent modifications.",
          ],
          code: {
            comment: "# apply planned changes",
            cmd: "$ terraform apply tfplan",
            result: "Apply complete! Resources: 3 added, 0 changed, 0 destroyed.",
          },
        },
      ],
      callout: {
        emoji: "🏗️",
        strong: "Safety First:",
        text: "Always store sensitive variables in .tfvars files that are strictly excluded from version control via .gitignore.",
      },
    };
  }

  if (lower.includes("react") || lower.includes("hook") || lower.includes("component") || lower.includes("jsx")) {
    return {
      timeEst: "14 min read",
      intro:
        description ||
        "React revolutionized web interfaces by modeling user experience as a pure function of state. Component architecture lets you build resilient, reusable design systems.",
      sections: [
        {
          title: "Declarative UI & Hook Primitives",
          paragraphs: [
            "Hooks like `useState` and `useEffect` decouple state logic from class component lifecycles. Always declare immutable state updates to ensure React schedules renders correctly.",
          ],
          code: {
            comment: "// Custom hook for persistent state",
            cmd: "function useLocalStorage<T>(key: string, initial: T) {\n  const [val, setVal] = useState<T>(() => {\n    const saved = localStorage.getItem(key);\n    return saved ? JSON.parse(saved) : initial;\n  });\n  return [val, setVal] as const;\n}",
            result: "// Reusable across any React component",
          },
        },
        {
          title: "Minimizing Unnecessary Re-renders",
          paragraphs: [
            "Use `useMemo` for heavy calculations and `useCallback` when passing callbacks to memoized children wrapped in `React.memo`.",
          ],
        },
      ],
      callout: {
        emoji: "⚛️",
        strong: "React Tip:",
        text: "Never mutate state arrays or objects directly. Always use spread syntax or functional updates like setState(prev => [...prev, newItem]).",
      },
    };
  }

  if (lower.includes("next.js") || lower.includes("server component") || lower.includes("server action")) {
    return {
      timeEst: "15 min read",
      intro:
        description ||
        "Next.js App Router combines React Server Components (RSC) with streaming SSR to eliminate client JavaScript bundles for static or read-heavy pages.",
      sections: [
        {
          title: "Server Components vs Client Components",
          paragraphs: [
            "By default, every page in the App Router is a Server Component. Add `'use client'` only to components that need browser events, useState, or DOM APIs.",
          ],
          code: {
            comment: "// app/dashboard/page.tsx (Server Component)",
            cmd: "export default async function DashboardPage() {\n  const data = await db.query.users.findMany();\n  return <UserTable users={data} />;\n}",
            result: "// Zero JavaScript sent to client bundle for db queries",
          },
        },
        {
          title: "Server Actions for Mutations",
          paragraphs: [
            "Execute server code directly from form submissions with `'use server'` functions, revalidating cache tags with `revalidatePath()`.",
          ],
        },
      ],
      callout: {
        emoji: "⚡",
        strong: "App Router Tip:",
        text: "Keep data fetching on the server. Never pass sensitive database connection strings or secret API keys to Client Components.",
      },
    };
  }

  if (lower.includes("node") || lower.includes("go ") || lower.includes("runtime") || lower.includes("api") || lower.includes("graphql") || lower.includes("rest")) {
    return {
      timeEst: "13 min read",
      intro:
        description ||
        "High-performance backend systems require predictable concurrency models, non-blocking I/O, and strict API contracts.",
      sections: [
        {
          title: "Non-Blocking I/O & Concurrency",
          paragraphs: [
            "Asynchronous event loops (Node.js) or lightweight green threads (Go goroutines) handle tens of thousands of concurrent client connections with minimal memory overhead.",
          ],
          code: {
            comment: "// High-performance concurrent worker in Go",
            cmd: "func worker(jobs <-chan int, results chan<- int) {\n    for n := range jobs {\n        results <- n * 2\n    }\n}",
            result: "// Goroutines use only 2KB memory stack",
          },
        },
        {
          title: "Idempotency & HTTP Conventions",
          paragraphs: [
            "Always honor standard HTTP methods: GET and HEAD must be safe; PUT and DELETE must be idempotent. Protect POST operations with Idempotency-Key headers.",
          ],
        },
      ],
      callout: {
        emoji: "🚀",
        strong: "Backend Tip:",
        text: "Always enforce request validation at the API gateway layer using schemas like Zod or JSON Schema before handing requests to internal business logic.",
      },
    };
  }

  if (lower.includes("sql") || lower.includes("postgres") || lower.includes("database") || lower.includes("redis") || lower.includes("prisma") || lower.includes("drizzle")) {
    return {
      timeEst: "14 min read",
      intro:
        description ||
        "Databases are the foundation of all enterprise IT systems. Mastering schema normalization, indexes, and caching strategies prevents catastrophic latency under load.",
      sections: [
        {
          title: "B-Tree Indexes & EXPLAIN ANALYZE",
          paragraphs: [
            "Indexes transform O(N) sequential table scans into O(log N) tree traversals. Always inspect your query plans with EXPLAIN ANALYZE to verify index utilization.",
          ],
          code: {
            comment: "# analyze query performance in PostgreSQL",
            cmd: "EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'user@roadmap.ai';",
            result: "Index Scan using idx_users_email on users (cost=0.28..8.29 rows=1)",
          },
        },
        {
          title: "In-Memory Caching (Redis Cache-Aside)",
          paragraphs: [
            "Cache frequently read queries in Redis with a TTL (Time To Live). When a write occurs, invalidate or update the corresponding Redis key immediately.",
          ],
        },
      ],
      callout: {
        emoji: "💾",
        strong: "Database Tip:",
        text: "Never add an index without profiling. Indexes speed up SELECT queries but impose a write and storage penalty on every INSERT, UPDATE, and DELETE.",
      },
    };
  }

  if (lower.includes("ai") || lower.includes("machine learning") || lower.includes("pytorch") || lower.includes("llm") || lower.includes("rag") || lower.includes("vector") || lower.includes("transformer")) {
    return {
      timeEst: "16 min read",
      intro:
        description ||
        "Modern AI and Machine Learning systems bridge the gap between mathematical model training and scalable production inference APIs.",
      sections: [
        {
          title: "Tensors, Vectorization & Embeddings",
          paragraphs: [
            "Dense vector embeddings convert unstructured text, images, and audio into high-dimensional geometric vectors where semantic similarity corresponds to cosine distance.",
          ],
          code: {
            comment: "# PyTorch tensor computation on GPU/CUDA",
            cmd: "import torch\nx = torch.randn(1024, 768, device='cuda')\nweights = torch.nn.Linear(768, 256, device='cuda')\noutput = weights(x)",
            result: "Tensor shape: torch.Size([1024, 256])",
          },
        },
        {
          title: "Retrieval-Augmented Generation (RAG)",
          paragraphs: [
            "Ground LLM generations in verified enterprise documentation by querying vector databases (Pinecone, ChromaDB) and inserting retrieved context into system prompts.",
          ],
        },
      ],
      callout: {
        emoji: "🧠",
        strong: "AI / ML Tip:",
        text: "To eliminate LLM hallucinations in production, combine dense vector search with hybrid BM25 keyword matching and strict RAG rerankers.",
      },
    };
  }

  if (lower.includes("security") || lower.includes("owasp") || lower.includes("crypto") || lower.includes("penetration") || lower.includes("nmap") || lower.includes("xss") || lower.includes("injection")) {
    return {
      timeEst: "15 min read",
      intro:
        description ||
        "Cybersecurity is not an afterthought — it is an active defense discipline applied across networks, web applications, and identity systems.",
      sections: [
        {
          title: "Preventing Injection & Access Control Flaws",
          paragraphs: [
            "Never concatenate raw user input into SQL queries or shell commands. Parameterized queries and strict CSP headers eliminate the vast majority of OWASP vulnerabilities.",
          ],
          code: {
            comment: "# scan target for open service vulnerabilities safely",
            cmd: "$ nmap -sV -sC -p 22,80,443,8080 target.local",
            result: "PORT 443/tcp OPEN ssl/http nginx 1.24.0",
          },
        },
        {
          title: "Zero Trust & Principle of Least Privilege",
          paragraphs: [
            "Never trust internal network boundaries. Authenticate and authorize every single request between microservices with mutual TLS (mTLS) and short-lived tokens.",
          ],
        },
      ],
      callout: {
        emoji: "🛡️",
        strong: "Security Tip:",
        text: "Store passwords exclusively using adaptive, salted hashing functions like bcrypt or Argon2 with adequate work factors, never MD5 or SHA-256.",
      },
    };
  }

  if (lower.includes("system design") || lower.includes("scalability") || lower.includes("kafka") || lower.includes("load balanc") || lower.includes("distributed") || lower.includes("sharding")) {
    return {
      timeEst: "16 min read",
      intro:
        description ||
        "System design is the art of balancing trade-offs between latency, throughput, consistency, availability, and cost when scaling across multiple machines.",
      sections: [
        {
          title: "CAP Theorem & Partition Tolerance",
          paragraphs: [
            "In any distributed network, network partitions (P) are inevitable. Systems must choose between strong consistency (C) or high availability (A) during network splits.",
          ],
          code: {
            comment: "# Kafka partition consumer configuration",
            cmd: "$ kafka-consumer-groups.sh --bootstrap-server localhost:9092 --describe --group order-processors",
            result: "GROUP: order-processors | TOPIC: orders | PARTITIONS: 12 | LAG: 0",
          },
        },
        {
          title: "Decoupling with Message Streaming",
          paragraphs: [
            "Using durable, distributed logs like Apache Kafka prevents slow downstream services from crashing high-throughput ingestion pipelines.",
          ],
        },
      ],
      callout: {
        emoji: "🌐",
        strong: "Architecture Tip:",
        text: "Design every consumer to be idempotent. In distributed systems, network retries mean messages will eventually be delivered more than once.",
      },
    };
  }

  // General fallback lesson for any other topic
  return {
    timeEst: "12 min read",
    intro:
      description ||
      "Master the fundamental principles, architectural concepts, and practical commands required for this engineering milestone.",
    sections: [
      {
        title: "Key Concepts & Workflow",
        paragraphs: [
          description || "This milestone teaches you how to implement and operate modern cloud infrastructure.",
          "Understanding the underlying mechanics and failure modes is essential before automating this in production environments.",
        ],
        code: {
          comment: `# verify component status\n$ ${topicTitle.toLowerCase().replace(/[^a-z0-9]/g, "-")} --version`,
          cmd: `$ check-status --verbose`,
          result: "[OK] Verified and ready for deployment.",
        },
      },
      {
        title: "Practical Implementation",
        paragraphs: [
          "Follow standard industry practices and documentation guidelines to test each component locally before promoting to staging.",
        ],
      },
    ],
    callout: {
      emoji: "💡",
      strong: "Pro Tip:",
      text: "Practice by applying this milestone's concepts directly in a local VM or sandbox before integrating into automated CI/CD pipelines.",
    },
  };
}
