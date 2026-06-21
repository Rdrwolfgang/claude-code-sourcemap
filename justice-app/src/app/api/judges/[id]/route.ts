import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const judge = await prisma.judge.findUnique({
      where: { id },
      include: {
        cases: {
          include: {
            charges: true,
            hearings: true,
            defendants: { include: { defendant: true } },
          },
          orderBy: { filedDate: "desc" },
          take: 50,
        },
        _count: { select: { cases: true } },
      },
    });

    if (!judge) {
      return NextResponse.json({ error: "Judge not found" }, { status: 404 });
    }

    return NextResponse.json(judge);
  } catch (error) {
    console.error("Judge detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
