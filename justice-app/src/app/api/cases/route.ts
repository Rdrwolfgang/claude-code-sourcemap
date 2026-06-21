import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q") || "";
    const court = searchParams.get("court") || "";
    const judgeId = searchParams.get("judge") || "";
    const severity = searchParams.get("severity") || "";
    const outcome = searchParams.get("outcome") || "";
    const isViolent = searchParams.get("isViolent") || "";
    const highProfile = searchParams.get("highProfile") === "true";
    const year = searchParams.get("year") || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const pageSize = Math.min(50, parseInt(searchParams.get("pageSize") || "20"));
    const sortBy = searchParams.get("sortBy") || "filedDate";
    const sortDir = (searchParams.get("sortDir") || "desc") as "asc" | "desc";

    const where: Record<string, unknown> = {};

    if (q) {
      where.OR = [
        { caseNumber: { contains: q, mode: undefined } },
        { prosecutorName: { contains: q, mode: undefined } },
        { notes: { contains: q, mode: undefined } },
      ];
    }

    if (court) where.court = { contains: court, mode: undefined };
    if (judgeId) where.judgeId = judgeId;
    if (highProfile) where.isHighProfile = true;
    if (year) {
      const y = parseInt(year);
      where.filedDate = {
        gte: new Date(`${y}-01-01`),
        lt: new Date(`${y + 1}-01-01`),
      };
    }

    const chargeWhere: Record<string, unknown> = {};
    if (severity) chargeWhere.severity = severity;
    if (outcome) chargeWhere.disposition = outcome;
    if (isViolent === "true") chargeWhere.isViolent = true;

    if (Object.keys(chargeWhere).length > 0) {
      where.charges = { some: chargeWhere };
    }

    const orderBy: Record<string, string> = {};
    if (sortBy === "filedDate") orderBy.filedDate = sortDir;
    else if (sortBy === "caseNumber") orderBy.caseNumber = sortDir;
    else if (sortBy === "status") orderBy.status = sortDir;

    const [data, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          judge: { select: { id: true, name: true, division: true, court: true } },
          charges: true,
          defendants: { include: { defendant: { select: { id: true, firstName: true, lastName: true } } }, take: 3 },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.case.count({ where }),
    ]);

    return NextResponse.json({
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    });
  } catch (error) {
    console.error("Cases API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
