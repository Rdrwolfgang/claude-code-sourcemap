import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [
      casesByYear,
      chargesByType,
      dispositionBreakdown,
      bondBreakdown,
      judgeVolume,
      violentByJudge,
    ] = await Promise.all([
      // Cases filed per year
      prisma.case.groupBy({
        by: ["filedDate"],
        _count: { id: true },
        where: { filedDate: { not: null } },
        orderBy: { filedDate: "asc" },
      }),

      // Charges by severity
      prisma.charge.groupBy({
        by: ["severity"],
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),

      // Disposition breakdown
      prisma.charge.groupBy({
        by: ["disposition"],
        _count: { id: true },
        where: { disposition: { not: null } },
        orderBy: { _count: { id: "desc" } },
      }),

      // Bond type breakdown
      prisma.charge.groupBy({
        by: ["bondType"],
        _avg: { bondAmount: true },
        _count: { id: true },
        where: { bondType: { not: null } },
      }),

      // Cases per judge (top 15)
      prisma.judge.findMany({
        include: { _count: { select: { cases: true } } },
        where: { isActive: true },
        orderBy: { cases: { _count: "desc" } },
        take: 15,
      }),

      // Violent cases per judge
      prisma.judge.findMany({
        include: {
          cases: {
            where: { charges: { some: { isViolent: true } } },
            include: { charges: { where: { isViolent: true } } },
          },
        },
        where: { isActive: true },
        take: 15,
      }),
    ]);

    // Aggregate cases by year
    const yearCounts: Record<string, number> = {};
    for (const row of casesByYear) {
      if (!row.filedDate) continue;
      const y = new Date(row.filedDate).getFullYear().toString();
      yearCounts[y] = (yearCounts[y] || 0) + row._count.id;
    }
    const casesByYearData = Object.entries(yearCounts)
      .map(([year, count]) => ({ year, count }))
      .sort((a, b) => a.year.localeCompare(b.year));

    const chargesByTypeData = chargesByType.map((r) => ({
      name: r.severity,
      value: r._count.id,
    }));

    const dispositionData = dispositionBreakdown
      .filter((r) => r.disposition)
      .map((r) => ({ name: r.disposition!, value: r._count.id }));

    const bondData = bondBreakdown.map((r) => ({
      name: r.bondType!,
      count: r._count.id,
      avgAmount: Math.round(r._avg.bondAmount ?? 0),
    }));

    const judgeVolumeData = judgeVolume.map((j) => ({
      name: j.name.split(" ").pop()!, // Last name only for chart
      fullName: j.name,
      court: j.court,
      cases: j._count.cases,
    }));

    const violentByJudgeData = violentByJudge
      .map((j) => ({
        name: j.name.split(" ").pop()!,
        fullName: j.name,
        violentCases: j.cases.length,
      }))
      .sort((a, b) => b.violentCases - a.violentCases)
      .slice(0, 10);

    return NextResponse.json({
      casesByYear: casesByYearData,
      chargesBySeverity: chargesByTypeData,
      dispositions: dispositionData,
      bondTypes: bondData,
      judgeVolume: judgeVolumeData,
      violentCasesByJudge: violentByJudgeData,
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
