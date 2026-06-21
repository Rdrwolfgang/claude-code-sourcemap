import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const caseRecord = await prisma.case.findUnique({
      where: { id },
      include: {
        judge: true,
        charges: true,
        hearings: { orderBy: { hearingDate: "asc" } },
        defendants: {
          include: {
            defendant: {
              include: {
                cases: {
                  include: { case: { include: { charges: true } } },
                },
              },
            },
          },
        },
      },
    });

    if (!caseRecord) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 });
    }

    return NextResponse.json(caseRecord);
  } catch (error) {
    console.error("Case detail error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
