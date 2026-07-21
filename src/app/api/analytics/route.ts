import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const [totalLogs, successLogs, recentLogs, agents] = await Promise.all([
    prisma.requestLog.count(),
    prisma.requestLog.count({ where: { status: "success" } }),
    prisma.requestLog.findMany({
      orderBy: { timestamp: "desc" },
      take: 20,
      include: { agent: { select: { name: true } } },
    }),
    prisma.agent.findMany({
      select: { name: true, tokensPerSec: true, latency: true },
    }),
  ]);

  const latencyAvg =
    recentLogs.length > 0
      ? Math.round(
          recentLogs.reduce((sum, l) => sum + l.latency, 0) / recentLogs.length
        )
      : 0;

  const tokensPerSec =
    agents.length > 0
      ? Math.round(
          agents.reduce((sum, a) => sum + a.tokensPerSec, 0) / agents.length
        )
      : 0;

  const successRate =
    totalLogs > 0
      ? Number(((successLogs / totalLogs) * 100).toFixed(1))
      : 99.9;

  return NextResponse.json({
    totalRequests: totalLogs,
    avgLatency: latencyAvg,
    tokensPerSec,
    successRate,
    recentLogs,
  });
}

export async function POST() {
  try {
    // 1. Get a random active agent
    const agents = await prisma.agent.findMany();
    if (agents.length === 0) {
      return NextResponse.json({ error: "No agents available to simulate traffic." }, { status: 400 });
    }

    const randomAgent = agents[Math.floor(Math.random() * agents.length)];

    // 2. Compute randomized telemetry parameters based on speed/quality
    const latencyError = Math.floor(Math.random() * 160) - 80; // random latency delta
    const actualLatency = Math.max(25, randomAgent.latency + latencyError);

    const endpoints = ["/api/v1/chat/completions", "/api/v1/embeddings", "/api/v1/extract", "/api/v1/evaluateSpec"];
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];

    // Determine status based on agent successRate
    const randSuccess = Math.random() * 100;
    let status = "success";
    if (randSuccess > randomAgent.successRate) {
      status = Math.random() > 0.5 ? "error" : "timeout";
    }

    const tokens = Math.floor(Math.random() * 3200) + 120;

    // 3. Save simulated transaction telemetry
    const newLog = await prisma.requestLog.create({
      data: {
        agentId: randomAgent.id,
        endpoint,
        model: randomAgent.name,
        latency: actualLatency,
        tokens,
        status,
        timestamp: new Date(),
      },
      include: { agent: { select: { name: true } } },
    });

    return NextResponse.json(newLog);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
