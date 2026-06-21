import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const type = searchParams.get("type") || "cases";
  const format = searchParams.get("format") || "csv";

  try {
    if (type === "cases") {
      const cases = await prisma.case.findMany({
        include: {
          judge: { select: { name: true, division: true, court: true } },
          charges: true,
          defendants: { include: { defendant: { select: { firstName: true, lastName: true } } }, take: 1 },
        },
        orderBy: { filedDate: "desc" },
        take: 1000,
      });

      if (format === "csv") {
        const headers = ["Case Number", "Filed Date", "Court", "Status", "Judge", "Defendant", "Primary Charge", "Severity", "Disposition", "Bond Amount", "DA Office"];
        const rows = cases.map((c) => {
          const charge = c.charges[0];
          const def = c.defendants[0]?.defendant;
          return [
            c.caseNumber,
            formatDate(c.filedDate),
            c.court,
            c.status,
            c.judge?.name || "Unassigned",
            def ? `${def.firstName} ${def.lastName}` : "Unknown",
            charge?.description || "",
            charge?.severity || "",
            charge?.disposition || "Pending",
            charge?.bondAmount?.toString() || "",
            c.daOffice || "",
          ].map((v) => `"${v}"`).join(",");
        });

        const csv = [headers.join(","), ...rows].join("\n");
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="shelby-cases-${new Date().toISOString().slice(0, 10)}.csv"`,
          },
        });
      }
    }

    if (type === "judges") {
      const judges = await prisma.judge.findMany({
        include: { _count: { select: { cases: true } } },
        orderBy: [{ court: "asc" }, { division: "asc" }],
      });

      if (format === "csv") {
        const headers = ["Name", "Court", "Division", "Party", "Active", "Total Cases", "Appointed Date"];
        const rows = judges.map((j) => [
          j.name, j.court, j.division, j.party || "", j.isActive ? "Yes" : "No",
          j._count.cases.toString(), formatDate(j.appointedDate),
        ].map((v) => `"${v}"`).join(","));

        const csv = [headers.join(","), ...rows].join("\n");
        return new NextResponse(csv, {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="shelby-judges-${new Date().toISOString().slice(0, 10)}.csv"`,
          },
        });
      }
    }

    return NextResponse.json({ error: "Invalid export parameters" }, { status: 400 });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
