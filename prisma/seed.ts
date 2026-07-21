import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // clean slate
  await prisma.requestLog.deleteMany();
  await prisma.comparison.deleteMany();
  await prisma.agent.deleteMany();
  await prisma.user.deleteMany();

  // demo admin + regular user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const userPassword = await bcrypt.hash("user123", 10);

  await prisma.user.createMany({
    data: [
      {
        name: "Haris Hamza Ali",
        email: "harishamzaali@gmail.com",
        password: adminPassword,
        role: "admin",
      },
      {
        name: "Alex Rivera",
        email: "alex@evaluator.ai",
        password: userPassword,
        role: "user",
      },
    ],
  });

  // seed agents
  const agents = await prisma.agent.createManyAndReturn({
    data: [
      {
        name: "Astra Insights Engine",
        provider: "DeepMinds Co.",
        category: "Data & Analysis",
        description:
          "Advanced predictive analysis agent designed for high-frequency market data and consumer sentiment tracking. Now with v4.2 latency improvements.",
        rating: 4.9,
        perfScore: 99.2,
        pricing: 0.45,
        contextWindow: 200000,
        latency: 112,
        successRate: 99.9,
        tokensPerSec: 920,
        icon: "query_stats",
        tier: "platinum",
      },
      {
        name: "PolyGlot Stream",
        provider: "NeuralText Labs",
        category: "Content Creation",
        description:
          "Real-time localization and translation for live customer support channels with sub-100ms latency.",
        rating: 4.9,
        perfScore: 94.8,
        pricing: 0.12,
        contextWindow: 128000,
        latency: 88,
        successRate: 99.2,
        tokensPerSec: 780,
        icon: "translate",
        tier: "gold",
      },
      {
        name: "MarketSentinel",
        provider: "QuantEdge",
        category: "Data & Analysis",
        description:
          "Autonomous trading signals and anomaly detection for DeFi and traditional markets.",
        rating: 4.7,
        perfScore: 91.2,
        pricing: 0.22,
        contextWindow: 64000,
        latency: 145,
        successRate: 98.5,
        tokensPerSec: 610,
        icon: "trending_up",
        tier: "standard",
      },
      {
        name: "Guardian Compliance",
        provider: "SecureOS",
        category: "Customer Ops",
        description:
          "Automated GDPR and SOC2 continuous monitoring and reporting for cloud infrastructure.",
        rating: 5.0,
        perfScore: 98.5,
        pricing: 0.31,
        contextWindow: 128000,
        latency: 201,
        successRate: 99.8,
        tokensPerSec: 430,
        icon: "shield_lock",
        tier: "enterprise",
      },
      {
        name: "Workflow Architect",
        provider: "Evaluator AI Native",
        category: "Development",
        description:
          "Optimization engine that automatically restructures agent chains for maximum efficiency.",
        rating: 4.6,
        perfScore: 93.1,
        pricing: 0.08,
        contextWindow: 200000,
        latency: 320,
        successRate: 97.4,
        tokensPerSec: 840,
        icon: "schema",
        tier: "standard",
      },
      {
        name: "CodeForge Pro",
        provider: "DevOps AI",
        category: "Development",
        description:
          "Intelligent code generation, review, and refactoring agent trained on 200B tokens of open-source repositories.",
        rating: 4.8,
        perfScore: 96.3,
        pricing: 0.18,
        contextWindow: 200000,
        latency: 265,
        successRate: 98.9,
        tokensPerSec: 760,
        icon: "code",
        tier: "gold",
      },
      {
        name: "SupportBot Ultra",
        provider: "CX Dynamics",
        category: "Customer Ops",
        description:
          "24/7 customer support agent with sentiment awareness, escalation logic, and CRM integration out of the box.",
        rating: 4.5,
        perfScore: 89.7,
        pricing: 0.06,
        contextWindow: 64000,
        latency: 178,
        successRate: 99.1,
        tokensPerSec: 520,
        icon: "support_agent",
        tier: "standard",
      },
      {
        name: "VectorDraft Pro",
        provider: "VisualAI Labs",
        category: "Content Creation",
        description:
          "Specialist in visual asset generation for technical documentation with consistent brand adherence.",
        rating: 4.7,
        perfScore: 92.4,
        pricing: 0.25,
        contextWindow: 32000,
        latency: 890,
        successRate: 97.6,
        tokensPerSec: 180,
        icon: "brush",
        tier: "gold",
      },
    ],
  });

  // seed request logs
  const statuses = ["success", "success", "success", "timeout", "error"];
  const endpoints = [
    "/v1/chat/completions",
    "/v1/embeddings",
    "/v1/completions",
  ];
  const models = [
    "GPT-4o",
    "Claude 3.5 Sonnet",
    "Llama 3.1 405B",
    "Ada-002",
    "Gemini Pro",
  ];

  const logsData = Array.from({ length: 50 }, (_, i) => {
    const agent = agents[Math.floor(Math.random() * agents.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const latency =
      status === "timeout"
        ? 2000 + Math.floor(Math.random() * 1000)
        : 50 + Math.floor(Math.random() * 400);

    return {
      agentId: agent.id,
      endpoint: endpoints[Math.floor(Math.random() * endpoints.length)],
      model: models[Math.floor(Math.random() * models.length)],
      latency,
      tokens: 100 + Math.floor(Math.random() * 5000),
      status,
      timestamp: new Date(Date.now() - i * 1000 * 60 * 3),
    };
  });

  await prisma.requestLog.createMany({ data: logsData });

  console.log("✅ Database seeded successfully");
  console.log("📧 Admin login: harishamzaali@gmail.com / admin123");
  console.log("📧 User login:  alex@evaluator.ai / user123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
