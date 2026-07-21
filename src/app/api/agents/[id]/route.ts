import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const agent = await prisma.agent.findUnique({ where: { id } });
  if (!agent) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(agent);
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  const agent = await prisma.agent.update({
    where: { id },
    data: {
      name: body.name,
      provider: body.provider,
      category: body.category,
      description: body.description,
      rating: Number(body.rating),
      perfScore: Number(body.perfScore),
      pricing: Number(body.pricing),
      contextWindow: Number(body.contextWindow),
      latency: Number(body.latency),
      successRate: Number(body.successRate),
      tokensPerSec: Number(body.tokensPerSec),
      icon: body.icon,
      tier: body.tier,
    },
  });

  return NextResponse.json(agent);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role?: string })?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await prisma.agent.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
