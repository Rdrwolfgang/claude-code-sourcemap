import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, parseInt(searchParams.get("pageSize") || "20"));

    const where = q
      ? {
          OR: [
            { firstName: { contains: q } },
            { lastName: { contains: q } },
            { middleName: { contains: q } },
          ],
        }
      : {};

    const [data, total] = await Promise.all([
      prisma.defendant.findMany({
        where,
        include: {
          cases: {
            include: { case: { include: { charges: true } } },
          },
          _count: { select: { cases: true } },
        },
        orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.defendant.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Defendants API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
