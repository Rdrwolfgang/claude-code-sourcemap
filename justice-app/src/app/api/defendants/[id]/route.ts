import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const defendant = await prisma.defendant.findUnique({
      where: { id },
      include: {
        cases: {
          include: {
            case: {
              include: {
                judge: true,
                charges: true,
                hearings: { orderBy: { hearingDate: "asc" } },
              },
            },
          },
          orderBy: { case: { filedDate: "desc" } },
        },
      },
    });

    if (!defendant) {
      return NextResponse.json({ error: "Defendant not found" }, { status: 404 });
    }

    return NextResponse.json(defendant);
  } catch (error) {
    console.error("Defendant detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
