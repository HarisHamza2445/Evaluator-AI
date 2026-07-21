import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const comparisons = await prisma.comparison.findMany({
    where: { userId: (session.user as { id?: string }).id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(comparisons);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { agentIds, name } = await req.json();

  if (!agentIds || !Array.isArray(agentIds) || agentIds.length < 2) {
    return NextResponse.json({ error: "Need at least 2 agents" }, { status: 400 });
  }

  const comparison = await prisma.comparison.create({
    data: {
      userId: (session.user as { id?: string }).id!,
      agentIds: JSON.stringify(agentIds),
      name: name || "My Comparison",
    },
  });

  return NextResponse.json(comparison, { status: 201 });
}
