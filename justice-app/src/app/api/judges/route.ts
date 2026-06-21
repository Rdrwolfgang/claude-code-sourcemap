import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q") || "";
    const court = searchParams.get("court") || "";

    const where: Record<string, unknown> = {};
    if (q) where.name = { contains: q };
    if (court) where.court = { contains: court };

    const judges = await prisma.judge.findMany({
      where,
      include: {
        _count: { select: { cases: true } },
        cases: {
          include: {
            charges: true,
          },
        },
      },
      orderBy: [{ court: "asc" }, { division: "asc" }],
    });

    // Compute stats for each judge
    const judgesWithStats = judges.map((judge) => {
      const cases = judge.cases;
      const allCharges = cases.flatMap((c) => c.charges);
      const closedCases = cases.filter((c) => c.status === "Closed" || c.status === "Appealed");
      const openCases = cases.filter((c) => c.status === "Open" || c.status === "Pending");
      const violentCases = cases.filter((c) => c.charges.some((ch) => ch.isViolent));

      const bonds = allCharges.filter((ch) => ch.bondAmount != null).map((ch) => ch.bondAmount as number);
      const avgBond = bonds.length > 0 ? bonds.reduce((a, b) => a + b, 0) / bonds.length : 0;

      const chargesWithDisp = allCharges.filter((ch) => ch.disposition && ch.disposition !== "Pending");
      const guiltyPleas = chargesWithDisp.filter((ch) => ch.disposition === "Guilty Plea" || ch.disposition === "Guilty").length;
      const dismissed = chargesWithDisp.filter((ch) => ch.disposition === "Dismissed").length;
      const nolles = chargesWithDisp.filter((ch) => ch.disposition === "Nolle Pros").length;
      const releases = chargesWithDisp.filter((ch) =>
        ch.bondType === "OR Release" || ch.bondType === "Reduced Bond"
      ).length;

      return {
        ...judge,
        cases: undefined,
        stats: {
          totalCases: cases.length,
          openCases: openCases.length,
          closedCases: closedCases.length,
          violentCases: violentCases.length,
          averageBondAmount: Math.round(avgBond),
          releaseRate: chargesWithDisp.length > 0 ? (releases / chargesWithDisp.length) * 100 : 0,
          guiltyPleaRate: chargesWithDisp.length > 0 ? (guiltyPleas / chargesWithDisp.length) * 100 : 0,
          dismissalRate: chargesWithDisp.length > 0 ? (dismissed / chargesWithDisp.length) * 100 : 0,
          nolleRate: chargesWithDisp.length > 0 ? (nolles / chargesWithDisp.length) * 100 : 0,
        },
      };
    });

    return NextResponse.json({ data: judgesWithStats, total: judgesWithStats.length });
  } catch (error) {
    console.error("Judges API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
