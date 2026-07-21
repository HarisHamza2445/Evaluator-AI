import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const agents = await prisma.agent.findMany({
    where: {
      ...(category && category !== "All Agents" ? { category } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { provider: { contains: search } },
              { description: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { perfScore: "desc" },
  });

  return NextResponse.json(agents);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { name, provider, category, description, rating, perfScore, pricing, contextWindow, latency, successRate, tokensPerSec, icon, tier } = body;

  if (!name || !provider || !category || !description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const agent = await prisma.agent.create({
    data: {
      name, provider, category, description,
      rating: Number(rating) || 4.5,
      perfScore: Number(perfScore) || 90,
      pricing: Number(pricing) || 0.01,
      contextWindow: Number(contextWindow) || 128000,
      latency: Number(latency) || 300,
      successRate: Number(successRate) || 99,
      tokensPerSec: Number(tokensPerSec) || 500,
      icon: icon || "robot_2",
      tier: tier || "standard",
    },
  });

  return NextResponse.json(agent, { status: 201 });
}
